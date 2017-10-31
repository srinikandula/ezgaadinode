"use strict";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var TrucksColl = require('./../models/schemas').TrucksColl;
var UsersAPI = require('./usersApi');
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');


var Trucks = function () {
};

Trucks.prototype.addTruck = function (jwt, truckDetails, callback) {
    console.log(truckDetails);
    // console.log(typeof truckDetails.fitnessExpiry);
    // truckDetails.fitnessExpiry = new Date(truckDetails.fitnessExpiry);
    // console.log(typeof truckDetails.fitnessExpiry,truckDetails.fitnessExpiry);
    // truckDetails.insuranceExpiry = new Date(truckDetails.insuranceExpiry);
    // truckDetails.permitExpiry = new Date(truckDetails.permitExpiry);
    // truckDetails.pollutionExpiry = new Date(truckDetails.pollutionExpiry);
    // truckDetails.taxDueDate = new Date(truckDetails.taxDueDate);
    // console.log(truckDetails);
    var result = {};
    if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
        result.status = false;
        result.message = "Please fill all the required truck details";
        callback(result);
    } else if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
        result.status = false;
        result.message = "Please provide valid registration number";
        callback(result);
    } else if (!truckDetails.truckType || !_.isString(truckDetails.truckType)) {
        result.status = false;
        result.message = "Please provide valid Truck type";
        callback(result);
    } else {
        TrucksColl.find({registrationNo: truckDetails.registrationNo}, function (err, truck) {
            if (err) {
                result.status = false;
                result.message = "Error, try again!";
                callback(result);
            } else if (truck && truck.length > 0) {
                result.status = false;
                result.message = "Truck already exists";
                callback(result);
            } else {
                truckDetails.createdBy = jwt.id;
                truckDetails.updatedBy = jwt.id;
                truckDetails.accountId = jwt.accountId;
                var truckDoc = new TrucksColl(truckDetails);
                truckDoc.save(function (err, truck) {
                    console.log(err);
                    if (err) {
                        result.status = false;
                        result.message = "Error while adding truck, try Again";
                        callback(result);
                    } else {
                        result.status = true;
                        result.message = "Truck Added Successfully";
                        result.truck = truck;
                        callback(result);
                    }
                });
            }
        })
    }
};

Trucks.prototype.findTruck = function (jwt, truckId, callback) {
    var result = {};
    TrucksColl.findOne({_id: truckId, accountId: jwt.accountId}, function (err, truck) {
        if (err) {
            result.status = false;
            result.message = "Error while finding truck, try Again";
            callback(result);
        } else if (truck) {
            result.status = true;
            result.message = "Truck found successfully";
            result.truck = truck;
            callback(result);
        } else {
            result.status = false;
            result.message = "Truck is not found!";
            callback(result);
        }
    });
};


Trucks.prototype.updateTruck = function (jwt, truckDetails, callback) {
    var result = {};
    TrucksColl.findOneAndUpdate({registrationNo: truckDetails.registrationNo},
        {
            $set: {
                "truckType": truckDetails.truckType,
                "updatedBy": jwt.id,
                "modelAndYear": truckDetails.modelAndYear,
                "registrationNo": truckDetails.registrationNo,
                "driverId": truckDetails.driverId,
                "fitnessExpiry": truckDetails.fitnessExpiry,
                "permitExpiry": truckDetails.permitExpiry,
                "insuranceExpiry": truckDetails.insuranceExpiry,
                "pollutionExpiry": truckDetails.pollutionExpiry,
                "taxDueDate": truckDetails.taxDueDate
            }
        },
        {new: true}, function (err, truck) {
            if (err) {
                result.status = false;
                result.message = "Error while updating truck, try Again";
                callback(result);
            } else if (truck) {
                result.status = true;
                result.message = "Truck updated successfully";
                result.truck = truck;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding truck";
                callback(result);
            }
        });
};

Trucks.prototype.getAccountTrucks = function (accountId, pageNumber, callback) {
    console.log('pageNumber', pageNumber);
    var result = {};
    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }
    var skipNumber = (pageNumber - 1) * pageLimits.trucksPaginationLimit;
    async.parallel({
        trucks: function (accountsCallback) {
            TrucksColl
                .find({accountId: accountId})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.trucksPaginationLimit)
                .lean()
                .exec(function (err, trucks) {
                    Helpers.populateNameInUsersColl(trucks, "createdBy", function (createdby) {
                        if (!createdby.status) {
                            accountsCallback(err, null);
                        } else {
                            Helpers.populateNameInDriversCollmultiple(createdby.documents, 'driverId',
                                'fullName', function (drivername) {
                                if (!drivername.status) {
                                    accountsCallback(err, null);
                                } else {
                                    Helpers.populateNameInDriversCollmultiple(createdby.documents, 'driverId',
                                        'mobile', function (drivermobile) {
                                        if (!drivermobile.status) {
                                            accountsCallback(err, null);
                                        } else {
                                            accountsCallback(err, drivermobile.documents);
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
        },
        count: function (countCallback) {
            TrucksColl.count({accountId: accountId},function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.trucks = results.trucks;
            callback(result);
        }
    });
    // TrucksColl.find({accountId: accountId}, function (err, accountTrucks) {
    //     if (err) {
    //         result.status = false;
    //         result.message = 'Error getting trucks';
    //         callback(result);
    //     } else {
    //         result.status = true;
    //         result.message = 'Success';
    //         result.trucks = accountTrucks;
    //         callback(result);
    //     }
    // });
};

Trucks.prototype.getAllTrucks = function (callback) {
    var result = {};
    TrucksColl.find(function (err, trucks) {
        if (err) {
            result.status = false;
            result.message = 'Error getting trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.trucks = trucks;
            callback(result);
        }
    });
};

Trucks.prototype.deleteTruck = function (truckId, callback) {
    var result = {};
    TrucksColl.remove({_id: truckId}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting truck';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};

module.exports = new Trucks();