"use strict";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var TrucksColl = require('./../models/schemas').TrucksColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var TrucksTypesColl=require('./../models/schemas').TrucksTypesColl;
var LoadRequestColl = require("../models/schemas").adminLoadRequestColl;
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');
var notificationService = require('./../apis/notifications');
var Utils = require('./utils');

var Trucks = function () {
};

Trucks.prototype.addTruck = function (jwt, truckDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (jwt.type === "account") {
        if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
            retObj.messages.push("Please fill all the required truck details");
        }

        if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
            retObj.messages.push("Please provide valid registration number");
        }

        if (!truckDetails.truckType) {
            retObj.messages.push("Please provide valid Truck type");
        }


        if (retObj.messages.length) {
            analyticsService.create(req,serviceActions.add_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            TrucksColl.find({registrationNo: truckDetails.registrationNo}, function (err, truck) {
                if (err) {
                    retObj.messages.push("Error, try again!");
                    analyticsService.create(req,serviceActions.add_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                } else if (truck && truck.length > 0) {
                    retObj.messages.push("Truck already exists");
                    analyticsService.create(req,serviceActions.add_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                } else {
                    truckDetails.createdBy = jwt.id;
                    truckDetails.accountId = jwt.id;
                    truckDetails = Helpers.removeEmptyFields(truckDetails);
                    var truckDoc = new TrucksColl(truckDetails);
                    truckDoc.save(function (err, truck) {
                        if (err) {
                            retObj.messages.push("Error while adding truck, try Again");
                            analyticsService.create(req,serviceActions.add_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push("Truck Added Successfully");
                            retObj.truck = truck;
                            Helpers.assignTruckTypeToAccount({accountId:jwt.accountId,truckType:truckDetails.truckTypeId});
                            Helpers.cleanUpTruckDriverAssignment(jwt, truck._id, truck.driverId);
                            analyticsService.create(req,serviceActions.add_tru,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                            callback(retObj);
                        }
                    });
                }
            });
        }
    } else {
        retObj.status = false;
        retObj.messages.push("Unauthorized access");
        analyticsService.create(req,serviceActions.add_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }
};

Trucks.prototype.findTruck = function (jwt, truckId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TrucksColl.findOne({_id: truckId}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error while finding truck, try Again");
            analyticsService.create(req,serviceActions.fin_tru_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.userId=jwt.id;
            retObj.userType=jwt.type;
            retObj.messages.push("Truck found successfully");
            retObj.truck = truck;
            analyticsService.create(req,serviceActions.fin_tru,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.messages.push("Truck is not found!");
            analyticsService.create(req,serviceActions.fin_tru_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
};


Trucks.prototype.assignTrucks = function (jwt, groupId, truckIds,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.update({_id: {$in: truckIds}}, {$set: {groupId: groupId}}, {multi: true}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error While updating Details");
            analyticsService.create(req,serviceActions.assign_trus_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.messages.push("Truck Has successfully Assigned");
            retObj.truck = truck;
            analyticsService.create(req,serviceActions.assign_trus,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.messages.push("No Truck Found For the Given Registration ID");
            analyticsService.create(req,serviceActions.assign_trus_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });

};

Trucks.prototype.unAssignTrucks = function (jwt, truckIds,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.update({_id: {$in: truckIds}}, {$set: {groupId: null}}, {multi: true}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error While updating Details");
            analyticsService.create(req,serviceActions.unassign_trus_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.messages.push("Truck Has successfully Assigned");
            retObj.truck = truck;
            analyticsService.create(req,serviceActions.unassign_trus,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.messages.push("No Truck Found For the Given Registration ID");
            analyticsService.create(req,serviceActions.unassign_trus_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
};


Trucks.prototype.updateTruck = function (jwt, truckDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    truckDetails = Helpers.removeEmptyFields(truckDetails);
    truckDetails.updatedBy = jwt.id;
    // delete truckDetails.attrs.latestLocation;
    TrucksColl.findOneAndUpdate({_id: truckDetails._id},
        {
            $set: truckDetails
        },
        {new: true}, function (err, truck) {
            if (err) {
                retObj.messages.push("Error while updating truck, try Again");
                analyticsService.create(req,serviceActions.update_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (truck) {
                retObj.status = true;
                retObj.messages.push("Truck updated successfully");
                retObj.truck = truck;
                Helpers.assignTruckTypeToAccount({accountId:jwt.accountId,truckType:truckDetails.truckTypeId});
                Helpers.cleanUpTruckDriverAssignment(jwt, truck._id.toString(), truck.driverId);
                analyticsService.create(req,serviceActions.update_tru,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.messages.push("Error, finding truck");
                analyticsService.create(req,serviceActions.update_tru_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
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


Trucks.prototype.getTrucks = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (!params.page) {
        params.page = 1;
    }

    if (jwt.type === "account") {
        if (!params.truckName) {
            condition = {accountId: jwt.accountId}
        } else {
            condition = {accountId: jwt.accountId, registrationNo:new RegExp("^" + params.truckName, "i")}
        }
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
        async.parallel({
            trucks: function (trucksCallback) {
                TrucksColl
                    .find(condition)
                    //.populate('latestLocation')
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, trucks) {
                        async.parallel({
                            createdbyname: function (createdbyCallback) {
                                Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                    createdbyCallback(createdby.err, createdby.documents);
                                });
                            },
                            driversname: function (driversnameCallback) {
                                Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
                                    driversnameCallback(driver.err, driver.documents);
                                });
                            }
                        }, function (populateErr, populateResults) {
                            // console.log(populateResults);
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
                analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = results.count;
                retObj.userId=jwt.id;
                retObj.userType=jwt.type;
                retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                analyticsService.create(req,serviceActions.retrieve_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    }
    else {
        AccountsColl.findOne({_id: jwt.id}, function (err, accountData) {
            if (err) {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            } else if (accountData) {
                if (accountData.truckIds.length > 0) {
                    if (!params.truckName) {
                        condition = {_id: {$in: accountData.truckIds}}
                    } else {
                        condition = {registrationNo: {$regex: '.*' + params.truckName + '.*'}}
                    }
                    async.parallel({

                        trucks: function (trucksCallback) {
                            TrucksColl
                                .find(condition)
                                .sort({createdAt: 1})
                                .skip(skipNumber)
                                .limit(pageLimits.trucksPaginationLimit)
                                .lean()
                                .exec(function (err, trucks) {
                                    async.parallel({
                                        createdbyname: function (createdbyCallback) {
                                            Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                                createdbyCallback(createdby.err, createdby.documents);
                                            });
                                        },
                                        driversname: function (driversnameCallback) {
                                            Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
                                                driversnameCallback(driver.err, driver.documents);
                                            });
                                        }
                                    }, function (populateErr, populateResults) {
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
                            analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            retObj.count = results.count;
                            retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                            analyticsService.create(req,serviceActions.retrieve_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push('There is no assigned trucks');
                    analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                }
            } else {
                retObj.messages.push('Error retrieving trucks');
                analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });


    }
};


Trucks.prototype.getUnAssignedTrucks = function (jwt, gId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    //group == currentgroupId or group === null
    //db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )
    TrucksColl.find({
        $or: [{groupId: gId}, {groupId: {$exists: false}}],
        accountId: jwt.accountId
    }, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.unnassigned_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.unnassigned_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};
Trucks.prototype.getAllAccountTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl
        .find({accountId: jwt.accountId}).sort({createdAt: -1}).exec(function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.all_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            async.parallel({
                createdbyname: function (createdbyCallback) {
                    Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                        createdbyCallback(createdby.err, createdby.documents);
                    });
                },
                driversname: function (driversnameCallback) {
                    Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
                        driversnameCallback(driver.err, driver.documents);
                    });
                }
            }, function (populateErr, populateResults) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.trucks = trucks;
                analyticsService.create(req,serviceActions.all_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
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

Trucks.prototype.getAllTrucksOfAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.find({accountId: req.params.truckId}, {registrationNo: 1, fitnessExpiry:1, insuranceExpiry:1, 'attrs.latestLocation.address': 1}, function (errtrucks, trucks) {
        if(errtrucks) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.all_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.all_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    })
};

Trucks.prototype.deleteTruck = function (jwt, truckId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (jwt.type === 'account') {
        TrucksColl.remove({_id: truckId}, function (err) {
            if (err) {
                retObj.messages.push('Error deleting truck');
                analyticsService.create(req,serviceActions.del_tru_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                analyticsService.create(req,serviceActions.del_tru,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    } else {
        retObj.status = false;
        retObj.messages.push("Unauthorized access");
        analyticsService.create(req,serviceActions.del_tru_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }
};

Trucks.prototype.findExpiryCount = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            analyticsService.create(req,serviceActions.find_exprd_trus_err,{body:JSON.stringify(req.params),accountId:jwt.accountId,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (erpSettings) {
            var today = new Date();
            //var dateplus30 = new Date(today.setDate(today.getDate() + 30));
            var dateplus30 = Helpers.getErpSettingsForTruckExpiry(erpSettings.expiry).condition;
            async.parallel({
                fitnessExpiryCount: function (fitnessExpiryCallback) {
                    TrucksColl.count({
                        accountId: jwt.accountId,
                        fitnessExpiry: dateplus30
                    }, function (err, expiryCount) {
                        fitnessExpiryCallback(err, expiryCount);
                    });
                }, permitExpiryCount: function (permitExpiryCallback) {
                    TrucksColl.count({
                        accountId: jwt.accountId,
                        permitExpiry: dateplus30
                    }, function (err, expiryCount) {
                        permitExpiryCallback(err, expiryCount);
                    });
                }, insuranceExpiryCount: function (insuranceExpiryCallback) {
                    TrucksColl.count({
                        accountId: jwt.accountId,
                        insuranceExpiry: dateplus30
                    }, function (err, expiryCount) {
                        insuranceExpiryCallback(err, expiryCount);
                    });
                }, pollutionExpiryCount: function (pollutionExpiryCallback) {
                    TrucksColl.count({
                        accountId: jwt.accountId,
                        pollutionExpiry: dateplus30
                    }, function (err, expiryCount) {
                        pollutionExpiryCallback(err, expiryCount);
                    });
                }, taxExpiryCount: function (taxExpiryCallback) {
                    TrucksColl.count({
                        accountId: jwt.accountId,
                        taxDueDate: dateplus30
                    }, function (err, expiryCount) {
                        taxExpiryCallback(err, expiryCount);
                    });
                }
            }, function (populateErr, populateResults) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.expiryCount = populateResults;
                analyticsService.create(req,serviceActions.find_exprd_trus,{body:JSON.stringify(req.params),accountId:jwt.accountId,success:true},function(response){ });
                callback(retObj);
            });
        }
    });
};

Trucks.prototype.findExpiryTrucks = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var registrationNo = "";
    var fitnessExpiry = "--";
    var permitExpiry = "--";
    var insuranceExpiry = "--";
    var pollutionExpiry = "--";
    var taxDueDate = "--";
    var data = [];
    var condition = {};
    var dateplus30 = "";
    ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            analyticsService.create(req,serviceActions.find_exprd_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:true,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (erpSettings) {

            var erp = Helpers.getErpSettingsForTruckExpiry(erpSettings.expiry);
            dateplus30 = erp.condition;

            if (!params.regNumber) {
                condition = {
                    accountId: mongoose.Types.ObjectId(jwt.accountId),
                    $or: [{fitnessExpiry: dateplus30},
                        {permitExpiry: dateplus30},
                        {insuranceExpiry: dateplus30},
                        {pollutionExpiry: dateplus30},
                        {taxDueDate: dateplus30},
                        {fitnessExpiry: dateplus30}]
                }
            } else {

                condition = {
                    accountId: mongoose.Types.ObjectId(jwt.accountId),
                    _id: mongoose.Types.ObjectId(params.regNumber),
                    $or: [{fitnessExpiry: dateplus30},
                        {permitExpiry: dateplus30},
                        {insuranceExpiry: dateplus30},
                        {pollutionExpiry: dateplus30},
                        {taxDueDate: dateplus30},
                        {fitnessExpiry: dateplus30}]
                }
            }
            TrucksColl.aggregate([{
                $match: condition
            },
                {
                    $project: {
                        registrationNo: 1,
                        fitnessExpiry: 1,
                        permitExpiry: 1,
                        insuranceExpiry: 1,
                        pollutionExpiry: 1,
                        taxDueDate: 1,
                    }
                }, {"$sort": {createdAt: -1}},

            ], function (populateErr, populateResults) {
             if (erp.type === 'custom') {
                    for (var i = 0; i < populateResults.length; i++) {
                        if (populateResults[i].fitnessExpiry <= erp.toDate && populateResults[i].fitnessExpiry >= erp.fromDate) {
                            fitnessExpiry = populateResults[i].fitnessExpiry;
                        } else {
                            fitnessExpiry = "--";
                        }
                        if (populateResults[i].permitExpiry <= erp.toDate && populateResults[i].permitExpiry >= erp.fromDate) {
                            permitExpiry = populateResults[i].permitExpiry;
                        } else {
                            permitExpiry = "--";
                        }
                        if (populateResults[i].insuranceExpiry <= erp.toDate && populateResults[i].insuranceExpiry >= erp.fromDate) {
                            insuranceExpiry = populateResults[i].insuranceExpiry;
                        } else {
                            insuranceExpiry = "--";
                        }
                        if (populateResults[i].pollutionExpiry <= erp.toDate && populateResults[i].pollutionExpiry >= erp.fromDate) {
                            pollutionExpiry = populateResults[i].pollutionExpiry;
                        } else {
                            pollutionExpiry = "--";
                        }
                        if (populateResults[i].taxDueDate <= erp.toDate && populateResults[i].taxDueDate >= erp.fromDate) {
                            taxDueDate = populateResults[i].taxDueDate;
                        } else {
                            taxDueDate = "--";
                        }
                        data.push({
                            registrationNo: populateResults[i].registrationNo,
                            fitnessExpiry: fitnessExpiry,
                            permitExpiry: permitExpiry,
                            insuranceExpiry: insuranceExpiry,
                            pollutionExpiry: pollutionExpiry,
                            taxDueDate: taxDueDate
                        });
                    }
                } else {
                    for (var i = 0; i < populateResults.length; i++) {
                        if (populateResults[i].fitnessExpiry <= erp.date) {
                            fitnessExpiry = populateResults[i].fitnessExpiry;
                        } else {
                            fitnessExpiry = "--";
                        }
                        if (populateResults[i].permitExpiry <= erp.date) {
                            permitExpiry = populateResults[i].permitExpiry;
                        } else {
                            permitExpiry = "--";
                        }
                        if (populateResults[i].insuranceExpiry <= erp.date) {
                            insuranceExpiry = populateResults[i].insuranceExpiry;
                        } else {
                            insuranceExpiry = "--";
                        }
                        if (populateResults[i].pollutionExpiry <= erp.date) {
                            pollutionExpiry = populateResults[i].pollutionExpiry;
                        } else {
                            pollutionExpiry = "--";
                        }
                        if (populateResults[i].taxDueDate <= erp.date) {
                            taxDueDate = populateResults[i].taxDueDate;
                        } else {
                            taxDueDate = "--";
                        }
                        data.push({
                            registrationNo: populateResults[i].registrationNo,
                            fitnessExpiry: fitnessExpiry,
                            permitExpiry: permitExpiry,
                            insuranceExpiry: insuranceExpiry,
                            pollutionExpiry: pollutionExpiry,
                            taxDueDate: taxDueDate
                        });
                    }
                }

                retObj.status = true;
                retObj.messages.push('Success');
                retObj.expiryTrucks = data;
                analyticsService.create(req,serviceActions.find_exprd_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                callback(retObj);
            });

        } else {
            retObj.status = false;
            retObj.messages.push("Please try again");
            analyticsService.create(req,serviceActions.find_exprd_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:true,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
    /* var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30)); */

};

Trucks.prototype.fitnessExpiryTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, fitnessExpiry: {$lte: dateplus30}}, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.fitness_expry_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.fitness_expry_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Trucks.prototype.permitExpiryTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, permitExpiry: {$lte: dateplus30}}, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.permit_expry_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.permit_expry_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Trucks.prototype.insuranceExpiryTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, insuranceExpiry: {$lte: dateplus30}}, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.insurance_expry_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.insurance_expry_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Trucks.prototype.pollutionExpiryTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, pollutionExpiry: {$lte: dateplus30}}, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.pollution_expry_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.pollution_expry_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Trucks.prototype.taxExpiryTrucks = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, taxDueDate: {$lte: dateplus30}}, function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
            analyticsService.create(req,serviceActions.tax_expry_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            analyticsService.create(req,serviceActions.tax_expry_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Trucks.prototype.countTrucks = function (jwt,req, callback) {
    var result = {};
    TrucksColl.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req,serviceActions.trus_count_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:result.messages},function(response){ });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req,serviceActions.trus_count,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            callback(result);
        }
    })
};

Trucks.prototype.getAllTrucksForFilter = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if(jwt.type === 'account') {
        condition = {'accountId': jwt.accountId};
        getAllTrucksForFilterCondition(condition,req,callback);
    } else {
        AccountsColl.findOne({'_id': jwt.id},{truckIds: 1}, function (err, groupTrucks) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('Error getting Trucks From Group');
                analyticsService.create(req,serviceActions.get_all_trus_for_filter_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if(groupTrucks){
                retObj.status = true;
                retObj.messages.push('Success');
                condition = {'_id':{"$in":groupTrucks.truckIds}};
                getAllTrucksForFilterCondition(condition,req,callback);
                analyticsService.create(req,serviceActions.get_all_trus_for_filter,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
            } else {
                retObj.status = false;
                retObj.messages.push('No Trucks Found For Group');
                analyticsService.create(req,serviceActions.get_all_trus_for_filter_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });
    }
};

function getAllTrucksForFilterCondition(condition,req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.find(condition,{registrationNo:1,tonnage:1}, function (err, data) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error getting Trucks');
            analyticsService.create(req,serviceActions.get_all_trus_for_filter_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if(data){
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = data;
            analyticsService.create(req,serviceActions.get_all_trus_for_filter,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.status = false;
            retObj.messages.push('No Trucks Found');
            analyticsService.create(req,serviceActions.get_all_trus_for_filter_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    })
}

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}

Trucks.prototype.downloadExpiryDetailsByTruck = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    Trucks.prototype.findExpiryTrucks(jwt, params,req, function (expairResponse) {
        if (expairResponse.status) {
            var output = [];
            for (var i = 0; i < expairResponse.expiryTrucks.length; i++) {
                output.push({
                    Registration_No: expairResponse.expiryTrucks[i].registrationNo,
                    Fitness_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].fitnessExpiry),
                    Permit_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].permitExpiry),
                    Tax_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].taxDueDate),
                    Insurance_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].insuranceExpiry),
                    Pollution_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].pollutionExpiry)
                })
                if (i === expairResponse.expiryTrucks.length - 1) {
                    retObj.status = true;
                    retObj.data = output;
                    analyticsService.create(req,serviceActions.exprd_tru_det_dwnld,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                }
            }
        } else {
            analyticsService.create(req,serviceActions.exprd_tru_det_dwnld_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false},function(response){ });
            callback(expairResponse);
        }
    })


}


Trucks.prototype.shareExpiredDetailsViaEmail = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Helpers.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req,serviceActions.exprd_tru_det_email_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        Trucks.prototype.findExpiryTrucks(jwt, params,req, function (expairResponse) {
            if (expairResponse.status) {
                var output = [];
                if (expairResponse.expiryTrucks.length) {
                    for (var i = 0; i < expairResponse.expiryTrucks.length; i++) {
                        output.push({
                            Registration_No: expairResponse.expiryTrucks[i].registrationNo,
                            Fitness_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].fitnessExpiry),
                            Permit_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].permitExpiry),
                            Tax_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].taxDueDate),
                            Insurance_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].insuranceExpiry),
                            Pollution_Expiry: dateToStringFormat(expairResponse.expiryTrucks[i].pollutionExpiry)
                        })
                        if (i === expairResponse.expiryTrucks.length - 1) {
                            var emailparams = {
                                templateName: 'sharesExpairyDetailsByTruck',
                                subject: "Easygaadi Expiry Details",
                                to: params.email,
                                data: {
                                    expiryTrucks: output
                                }
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    retObj.status = true;
                                    retObj.messages.push('Expiry details shared successfully');
                                    analyticsService.create(req,serviceActions.exprd_tru_det_email,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                                    callback(retObj);
                                } else {
                                    analyticsService.create(req,serviceActions.exprd_tru_det_email_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                                    callback(emailResponse);
                                }
                            });
                        }
                    }
                } else {
                    retObj.status = false;
                    retObj.messages.push('No records found');
                    analyticsService.create(req,serviceActions.exprd_tru_det_email_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                }

            } else {
                callback(expairResponse);
            }
        })
    }
}

Trucks.prototype.getTrucksByPopulate = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (!params.page) {
        params.page = 1;
    }

    if (jwt.type === "account") {
        if (!params.truckName) {
            condition = {accountId: jwt.accountId}
        } else {
            condition = {accountId: jwt.accountId, registrationNo: {$regex: '.*' + params.truckName + '.*'}}
        }
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
        async.parallel({
            trucks: function (trucksCallback) {
                TrucksColl
                    .find(condition)
                    .sort(sort)
                    .populate('latestLocation')
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, trucks) {
                        async.parallel({
                            createdbyname: function (createdbyCallback) {
                                Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                    createdbyCallback(createdby.err, createdby.documents);
                                });
                            },
                            driversname: function (driversnameCallback) {
                                Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
                                    driversnameCallback(driver.err, driver.documents);
                                });
                            }
                        }, function (populateErr, populateResults) {
                            // console.log(populateResults);
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
                console.log("Error--->", err);
                retObj.messages.push('Error retrieving trucks');
                analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = results.count;
                retObj.userId=jwt.id;
                retObj.userType=jwt.type;
                retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                analyticsService.create(req,serviceActions.retrieve_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    }
    else {
        AccountsColl.findOne({_id: jwt.id}, function (err, accountData) {
            if (err) {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            } else if (accountData) {
                if (accountData.truckIds.length > 0) {
                    if (!params.truckName) {
                        condition = {_id: {$in: accountData.truckIds}}
                    } else {
                        condition = {registrationNo: {$regex: '.*' + params.truckName + '.*'}}
                    }
                    async.parallel({

                        trucks: function (trucksCallback) {
                            TrucksColl
                                .find(condition)
                                .sort({createdAt: 1})
                                .skip(skipNumber)
                                .limit(pageLimits.trucksPaginationLimit)
                                .lean()
                                .exec(function (err, trucks) {
                                    async.parallel({
                                        createdbyname: function (createdbyCallback) {
                                            Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                                                createdbyCallback(createdby.err, createdby.documents);
                                            });
                                        },
                                        driversname: function (driversnameCallback) {
                                            Helpers.populateNameInDriversCollmultiple(trucks, 'driverId', ['fullName', 'mobile'], function (driver) {
                                                driversnameCallback(driver.err, driver.documents);
                                            });
                                        }
                                    }, function (populateErr, populateResults) {
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
                            analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            retObj.count = results.count;
                            retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                            analyticsService.create(req,serviceActions.retrieve_trus,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push('There is no assigned trucks');
                    analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                }
            } else {
                retObj.messages.push('Error retrieving trucks');
                analyticsService.create(req,serviceActions.retrieve_trus_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });


    }
};


Trucks.prototype.getTruckTypes=function (req,callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TrucksTypesColl.find({status:true},{title:1,tonnes:1},function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_types_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages.push("Success");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_types, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No truck types found");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_types_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
};

Trucks.prototype.lookingForLoad = function (body,req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!body.sourceAddress) {
        retObj.messages.push("Please select source address");
    }
    if(!body.destinationAddress){
        retObj.messages.push("Please select destination address");
    }
    if(!body.truckType){
        retObj.messages.push("Please select truck type");
    }
    if(!body.registrationNo){
        retObj.messages.push("Please enter truck registration number");
    }
    if(!body.pricePerTon){
        retObj.messages.push("Please enter price per ton");
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_load_request_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }else{
        var params = req.body;
        // params.createdBy = req.jwt.id;
        params.sourceAddress = body.sourceAddress;
        params.destination=[];
        params.destination[0] ={destinationAddress: body.destinationAddress, price:body.pricePerTon};
        params.truckType = body.truckType;
        params.registrationNo = body.registrationNo;
        params.dateAvailable = body.dateAvailable;
        var loadRequest = new LoadRequestColl(params);
        loadRequest.save(function (err, doc) {
            if (err) {
                retObj.status=false;
                retObj.messages.push('Error while saving load request data');
                callback(retObj);
            } else {
                TrucksColl.update({registrationNo:body.registrationNo},{$set:{lookingForLoad:true}},function (err,truck) {
                    if(err){
                        retObj.status=false;
                        retObj.messages.push('Error while updating truck');
                        callback(retObj);
                    }else{
                        retObj.status=true;
                        retObj.messages.push('Saved load request successfully');
                        notificationService.sendPushNotifications({title:'New Load Request',message:params.registrationNo+' is looking for load '},function (response) {
                            retObj.messages.push(response.message);
                            callback(retObj);
                        });
                    }
                });
            }
        })
    }
};

Trucks.prototype.getAllTrucksForAccount = function (req,callback) {
    var retObj={status: false,
        messages: []
    };
    var params = req.query;
    console.log(params);
    var skipNumber = params.size ? parseInt(params.size) : 0;
    var sort = {createdAt: -1};
    var condition = {};
    if (params.name) {
        condition = {registrationNo: {$regex: '.*' + params.name + '.*'},accountId:req.jwt.id}
    } else {
        condition = {accountId:req.jwt.id}
    }
    console.log(condition,skipNumber);
    TrucksColl.find(condition,{registrationNo:1,truckType:1}).skip(skipNumber)
        .limit(10).exec(function (err, trucks) {
        if(err){
            retObj.messages.push("Error while fetching trucks");
            callback(retObj);
        }else if(trucks.length){
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = trucks;
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("No trucks found");
            callback(retObj);
        }
    });
};

Trucks.prototype.unCheckLookingForLoad = function (body,req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.update({registrationNo: body.registrationNo}, {$set: {lookingForLoad: false}}, function (err, truck) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error while updating truck');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Unchecked looking for load successfully');
            callback(retObj);
        }
    });
};
Trucks.prototype.shareDetailsViaEmail123 = function (jwt,params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!params.email || !Utils.isEmail(params.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else{
        Trucks.prototype.getTrucks(jwt,params,req,function(response){
            if(response.status){
                var emailparams = {
                    templateName: 'truckDetails',
                    subject: "Truck Details",
                    to: params.email,
                    data:response.trucks
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push(' Details shared successfully');
                        callback(retObj);
                    } else {
                        callback(emailResponse);
                    }
                });
            }else{
                callback(response);
            }
        })
    }
};
Trucks.prototype.downloadDetails = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    // console.log("share details download....");
    Trucks.prototype.getTrucks(jwt, params, req, function (response) {
        // console.log("response....", response);
        if (response.status) {
            var output = [];
            for (var i = 0; i < response.trucks.length; i++) {
                output.push({
                    Reg_No: response.trucks[i].registrationNo,
                    Permit: response.trucks[i].permitExpiry,
                    Pollution: response.trucks[i].pollutionExpiry,
                    Insurance: response.trucks[i].insuranceExpiry,
                    Fitness: response.trucks[i].fitnessExpiry,
                    Tax: response.trucks[i].taxDueDate,
                    Driver: response.trucks[i].attrs.fullName,
                    Mobile: response.trucks[i].attrs.mobile
                });
            }
            retObj.data = output;
            retObj.status = true;
            retObj.messages.push("successful..");
            callback(retObj);
        } else {
            callback(retObj);
        }
    })

};


module.exports = new Trucks();