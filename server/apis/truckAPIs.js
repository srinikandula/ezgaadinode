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


var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');


var Trucks = function () {
};

Trucks.prototype.addTruck = function (jwt, truckDetails, callback) {
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


    if (retObj.messages.length) {
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
                truckDetails.createdBy = jwt.id;
                truckDetails.accountId = jwt.id;
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


Trucks.prototype.assignTrucks = function (jwt, groupId, truckIds, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.update({_id: {$in: truckIds}}, {$set: {groupId: groupId}}, {multi: true}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error While updating Details");
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.messages.push("Truck Has successfully Assigned");
            retObj.truck = truck;
            callback(retObj);
        } else {
            retObj.messages.push("No Truck Found For the Given Registration ID");
            callback(retObj);
        }
    });

};

Trucks.prototype.unAssignTrucks = function (jwt, truckIds, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.update({_id: {$in: truckIds}}, {$set: {groupId: null}}, {multi: true}, function (err, truck) {
        if (err) {
            retObj.messages.push("Error While updating Details");
            callback(retObj);
        } else if (truck) {
            retObj.status = true;
            retObj.messages.push("Truck Has successfully Assigned");
            retObj.truck = truck;
            callback(retObj);
        } else {
            retObj.messages.push("No Truck Found For the Given Registration ID");
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


Trucks.prototype.getTrucks = function (jwt, params, callback) {
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
        });
    }
    else {
        AccountsColl.findOne({_id: jwt.id}, function (err, accountData) {
            if (err) {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            } else if (accountData) {
                if (accountData.truckId.length > 0) {
                    if (!params.truckName) {
                        condition = {_id: {$in: accountData.truckId}}
                    } else {
                        condition = {registrationNo: {$regex: '.*' + params.truckName + '.*'}}
                    }
                    console.log('consdition',condition)
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
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            retObj.count = results.count;
                            retObj.trucks = results.trucks.createdbyname; //trucks is callby reference
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push('There is no assigned trucks');
                    callback(retObj);
                }
            } else {
                retObj.messages.push('Error retrieving trucks');
                callback(retObj);
            }
        });


    }
};


Trucks.prototype.getUnAssignedTrucks = function (jwt, gId, callback) {
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
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trucks = trucks;
            callback(retObj);
        }
    });
};
Trucks.prototype.getAllAccountTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl
        .find({accountId: jwt.accountId}).sort({createdAt: -1}).exec(function (err, trucks) {
        if (err) {
            retObj.messages.push('Error getting trucks');
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

Trucks.prototype.findExpiryCount = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (erpSettings) {
            var today = new Date();
            //var dateplus30 = new Date(today.setDate(today.getDate() + 30));
            var dateplus30 = Helpers.getErpSettingsForTruckExpiry(erpSettings.expiry).condition;
            console.log('datataa', dateplus30)
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
                callback(retObj);
            });
        }
    });
};

Trucks.prototype.findExpiryTrucks = function (jwt, params, callback) {
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
            callback(retObj);
        } else if (erpSettings) {
            if (!params.page) {
                params.page = 1;
            }

            var skipNumber = (params.page - 1) * params.size;
            var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

         var erp = Helpers.getErpSettingsForTruckExpiry(erpSettings.expiry);
            dateplus30=erp.condition;

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
            console.log('sdsds',dateplus30,condition);
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
                }, {"$sort": sort},
                {"$skip": skipNumber},
                {"$limit": limit},
            ], function (populateErr, populateResults) {
                console.log('populateResults',populateResults);
                if(erp.type==='custom'){
                    for (var i = 0; i < populateResults.length; i++) {
                        if (populateResults[i].fitnessExpiry<=erp.toDate && populateResults[i].fitnessExpiry>=erp.fromDate ) {
                            fitnessExpiry = populateResults[i].fitnessExpiry;
                        } else {
                            fitnessExpiry = "--";
                        }
                        if (populateResults[i].permitExpiry<=erp.toDate && populateResults[i].permitExpiry>=erp.fromDate ) {
                            permitExpiry = populateResults[i].permitExpiry;
                        } else {
                            permitExpiry = "--";
                        }
                        if (populateResults[i].insuranceExpiry<=erp.toDate && populateResults[i].insuranceExpiry>=erp.fromDate ) {
                            insuranceExpiry = populateResults[i].insuranceExpiry;
                        } else {
                            insuranceExpiry = "--";
                        }
                        if (populateResults[i].pollutionExpiry<=erp.toDate && populateResults[i].pollutionExpiry>=erp.fromDate ) {
                            pollutionExpiry = populateResults[i].pollutionExpiry;
                        } else {
                            pollutionExpiry = "--";
                        }
                        if (populateResults[i].taxDueDate<=erp.toDate && populateResults[i].taxDueDate>=erp.fromDate ) {
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
                }else{
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
                        if (populateResults[i].pollutionExpiry<= erp.date) {
                            pollutionExpiry = populateResults[i].pollutionExpiry;
                        } else {
                            pollutionExpiry = "--";
                        }
                        if (populateResults[i].taxDueDate<= erp.date) {
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
                callback(retObj);
            });

        } else {
            retObj.status = false;
            retObj.messages.push("Please try again");
            callback(retObj);
        }
    });
    /* var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30)); */

};

Trucks.prototype.fitnessExpiryTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, fitnessExpiry: {$lte: dateplus30}}, function (err, trucks) {
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

Trucks.prototype.permitExpiryTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, permitExpiry: {$lte: dateplus30}}, function (err, trucks) {
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

Trucks.prototype.insuranceExpiryTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, insuranceExpiry: {$lte: dateplus30}}, function (err, trucks) {
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

Trucks.prototype.pollutionExpiryTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, pollutionExpiry: {$lte: dateplus30}}, function (err, trucks) {
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

Trucks.prototype.taxExpiryTrucks = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var today = new Date();
    var dateplus30 = new Date(today.setDate(today.getDate() + 30));

    TrucksColl.find({accountId: jwt.accountId, taxDueDate: {$lte: dateplus30}}, function (err, trucks) {
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

Trucks.prototype.countTrucks = function (jwt, callback) {
    var result = {};
    TrucksColl.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            callback(result);
        }
    })
};

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}

Trucks.prototype.downloadExpiryDetailsByTruck = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    Trucks.prototype.findExpiryTrucks(jwt, params, function (expairResponse) {
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
                    callback(retObj);
                }
            }
        } else {
            callback(expairResponse);
        }
    })


}


Trucks.prototype.shareExpiredDetailsViaEmail = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Helpers.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        callback(retObj);
    } else {
        Trucks.prototype.findExpiryTrucks(jwt, params, function (expairResponse) {
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
                                subject: "Easygaadi Expairy Details",
                                to: params.email,
                                data: {
                                    expiryTrucks: output
                                }
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    retObj.status = true;
                                    retObj.messages.push('Expiry details shared successfully');
                                    callback(retObj);
                                } else {
                                    callback(emailResponse);
                                }
                            });
                        }
                    }
                } else {
                    retObj.status = false;
                    retObj.messages.push('No records found');
                    callback(retObj);
                }

            } else {
                callback(expairResponse);
            }
        })
    }
}
module.exports = new Trucks();