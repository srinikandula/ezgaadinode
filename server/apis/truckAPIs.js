"use strict";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');


var TrucksColl = require('./../models/schemas').TrucksColl;
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');


var Trucks = function () {
};

Trucks.prototype.addTruck = function (jwt, truckDetails, callback) {
    // console.log(typeof truckDetails.fitnessExpiry);
    // truckDetails.fitnessExpiry = new Date(truckDetails.fitnessExpiry);
    // console.log(typeof truckDetails.fitnessExpiry,truckDetails.fitnessExpiry);
    // truckDetails.insuranceExpiry = new Date(truckDetails.insuranceExpiry);
    // truckDetails.permitExpiry = new Date(truckDetails.permitExpiry);
    // truckDetails.pollutionExpiry = new Date(truckDetails.pollutionExpiry);
    // truckDetails.taxDueDate = new Date(truckDetails.taxDueDate);
    // console.log(truckDetails);

    var retObj = {
        status: false,
        messages: []
    };

    if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
        retObj.messages.push("Please fill all the required truck details");
    }

    if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
        retObj.messages.push("Please provide valid registration number");
    }

    if (!truckDetails.truckType || !_.isString(truckDetails.truckType)) {
        retObj.messages.push("Please provide valid Truck type");
    }


    if(retObj.messages.length) {
        callback(retObj);
    } else {
        TrucksColl.find({registrationNo: truckDetails.registrationNo}, function (err, truck) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (truck && truck.length > 0) {
                retObj.messages.push("Truck already exists");
                callback(retObj);
            } else {
                if (jwt.type === "account"){
                    truckDetails.createdBy = jwt.id;
                    truckDetails.accountId = jwt.accountId;
                }
                else {
                    truckDetails.createdBy = jwt.id;
                    truckDetails.groupId = jwt.id;
                    truckDetails.accountId = jwt.accountId;
                }
                truckDetails = Helpers.removeEmptyFields(truckDetails);
                var truckDoc = new TrucksColl(truckDetails);
                truckDoc.save(function (err, truck) {
                    if (err) {
                        retObj.messages.push("Error while adding truck, try Again");
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Truck Added Successfully");
                        retObj.truck = truck;
                        Helpers.cleanUpTruckDriverAssignment(jwt, truck._id, truck.driverId);
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Trucks.prototype.findTruck = function (jwt, truckId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TrucksColl.findOne({_id: truckId, accountId: jwt.accountId}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error while finding truck, try Again");
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.messages.push("Truck found successfully");
            retObj.truck = truck;
            callback(retObj);
        } else {
            retObj.messages.push("Truck is not found!");
            callback(retObj);
        }
    });
};

Trucks.prototype.updateTruck = function (jwt, truckDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    truckDetails = Helpers.removeEmptyFields(truckDetails);
    truckDetails.updatedBy = jwt.id;
    TrucksColl.findOneAndUpdate({_id: truckDetails._id},
        {
            $set: truckDetails
        },
        {new: true}, function (err, truck) {
            if (err) {
                retObj.messages.push("Error while updating truck, try Again");
                callback(retObj);
            } else if (truck) {
                retObj.status = true;
                retObj.messages.push("Truck updated successfully");
                retObj.truck = truck;
                Helpers.cleanUpTruckDriverAssignment(jwt, truck._id.toString(), truck.driverId)
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.messages.push("Error, finding truck");
                callback(retObj);
            }
        });
};
// Trucks.prototype.updateTruckGroupId = function (truckId, groupId, callback) {
//     var retObj = {
//         status: false,
//         messages: []
//     };
//     TrucksColl.findOneAndUpdate({_id: truckId},{$set: {"groupId": groupId}},{new: true}, function (err, truck) {
//             if (err) {
//                 retObj.messages.push("Error while updating truck, try Again");
//                 callback(retObj);
//             } else if (truck) {
//                 retObj.status = true;
//                 retObj.messages.push("Truck updated successfully");
//                 retObj.truck = truck;
//                 callback(retObj);
//             } else {
//                 retObj.status = false;
//                 retObj.message.push("Error, finding truck");
//                 callback(retObj);
//             }
//         });
// };


Trucks.prototype.getTrucks = function (jwt, pageNumber, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!pageNumber) {
        pageNumber = 1;
    }
    var skipNumber = (pageNumber - 1) * pageLimits.trucksPaginationLimit;
    if(jwt.type === "account"){
        async.parallel({
            trucks: function (trucksCallback) {
                TrucksColl
                    .find({accountId: jwt.accountId})
                    .sort({createdAt: 1})
                    .skip(skipNumber)
                    .limit(pageLimits.trucksPaginationLimit)
                    .lean()
                    .exec(function (err, trucks) {
                        async.parallel({
                            createdbyname: function (createdbyCallback) {
                                Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                    createdbyCallback(createdby.err,createdby.documents);
                                });
                            },
                            driversname: function (driversnameCallback) {
                                Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName','mobile'], function (driver) {
                                    driversnameCallback(driver.err, driver.documents);
                                });
                            }
                        },function (populateErr, populateResults) {
                            trucksCallback(populateErr, populateResults);
                        });
                    })
            },
            count: function (countCallback) {
                TrucksColl.count({accountId: jwt.accountId}, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, results) {
            if (err) {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = results.count;
                retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                callback(retObj);
            }
        });}
        else {
        async.parallel({
            trucks: function (trucksCallback) {
                TrucksColl
                    .find({accountId: jwt.accountId, groupId: jwt.id})
                    .sort({createdAt: 1})
                    .skip(skipNumber)
                    .limit(pageLimits.trucksPaginationLimit)
                    .lean()
                    .exec(function (err, trucks) {
                        async.parallel({
                            createdbyname: function (createdbyCallback) {
                                Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                    createdbyCallback(createdby.err,createdby.documents);
                                });
                            },
                            driversname: function (driversnameCallback) {
                                Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName','mobile'], function (driver) {
                                    driversnameCallback(driver.err, driver.documents);
                                });
                            }
                        },function (populateErr, populateResults) {
                            trucksCallback(populateErr, populateResults);
                        });
                    })
            },
            count: function (countCallback) {
                TrucksColl.count({accountId: jwt.accountId, groupId: jwt.groupId}, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, results) {
            if (err) {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = results.count;
                retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                callback(retObj);
            }
        });
    }
};



Trucks.prototype.getUnAssignedTrucks = function (jwt,callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TrucksColl.find({$or:[{groupId: jwt.groupId},{groupId:{ $exists: false}}],accountId: jwt.accountId},function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            callback(retObj);
        }
    });
};

Trucks.prototype.getAllAccountTrucks = function (accountId,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.find({accountId:accountId},{updatedAt:0,createdAt:0},function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            callback(retObj);
        } else {
            async.parallel({
                createdbyname: function (createdbyCallback) {
                    Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                        createdbyCallback(createdby.err,createdby.documents);
                    });
                },
                driversname: function (driversnameCallback) {
                    Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName','mobile'], function (driver) {
                        driversnameCallback(driver.err, driver.documents);
                    });
                }
            },function (populateErr, populateResults) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.trucks = trucks;
                callback(retObj);
            });
            // Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
            //     retObj.status = true;
            //     retObj.messages.push('Success');
            //     retObj.trucks = trucks;
            //     callback(retObj);
            // });
        }
    });
};

Trucks.prototype.deleteTruck = function (truckId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TrucksColl.remove({_id: truckId}, function (err) {
        if (err) {
            retObj.messages.push('Error deleting truck');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
};

module.exports = new Trucks();