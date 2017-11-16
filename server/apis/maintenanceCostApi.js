var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var maintenanceColl = require('./../models/schemas').MaintenanceCostColl;
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');

var MaintenanceCost = function () {
};

MaintenanceCost.prototype.addMaintenance = function (jwt, maintenanceDetails, callback) {
    var result = {};
    if (!_.isObject(maintenanceDetails) || _.isEmpty(maintenanceDetails)) {
        result.status = false;
        result.message = "Please fill all the required maintenance cost details";
        callback(result);
    } else if (!maintenanceDetails.vehicleNumber || !_.isString(maintenanceDetails.vehicleNumber)) {
        result.status = false;
        result.message = "Please provide valid vehicle number";
        callback(result);
    } else if (!maintenanceDetails.description || !_.isString(maintenanceDetails.description)) {
        result.status = false;
        result.message = "Please provide valid repair type";
        callback(result);
    } else if (!maintenanceDetails.cost || _.isNaN(maintenanceDetails.cost)) {
        result.status = false;
        result.message = "Please provide valid cost";
        callback(result);
    } else {

        maintenanceDetails.createdBy = jwt.id;
        maintenanceDetails.updatedBy = jwt.id;
        maintenanceDetails.accountId = jwt.accountId;

        var maintenanceDoc = new maintenanceColl(maintenanceDetails);

        maintenanceDoc.save(function (err) {
            if (err) {
                result.status = false;
                result.message = "Error while adding expenses Cost, try Again";
                callback(result);
            } else {
                result.status = true;
                result.message = "expenses Cost Added Successfully";
                callback(result);
            }
        });
    }
};

MaintenanceCost.prototype.getMaintenanceCosts = function (params, jwt, callback) {
    console.log('params==>',params, jwt);
    var result = {};
    if (!params.page) {
        params.page = 1;
    } else if (!_.isNumber(Number(params.page))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }

    var skipNumber = (params.page - 1) * params.size;
    async.parallel({
        mCosts: function (mCostsCallback) {
            var limit = params.size? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) :{};
            maintenanceColl
                .find({'accountId': jwt.accountId})
                .sort({createdAt: 1})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                //.populate('maintenanceCostId')
                .lean()
                .exec(function (err, mCosts) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Helpers.populateNameInUsersColl(mCosts, "createdBy", function (response) {
                                createdbyCallback(response.err, response.documents);
                            });
                        },
                        partyName: function (truckscallback) {
                            Helpers.populateNameInTrucksColl(mCosts, 'vehicleNumber', function (response) {
                                truckscallback(response.err, response.documents);
                            })
                        },
                        expenseType: function (expensecallback) {
                            Helpers.populateNameInExpenseColl(mCosts, 'expenseType', function (response) {
                                expensecallback(response.err, response.documents);
                            })
                        }
                    }, function (populateErr, populateResults) {
                        mCostsCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            maintenanceColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving expenses Costs';
            callback(retObj);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.maintanenceCosts = results.mCosts.createdbyname;
            callback(result);
        }
    });
};

MaintenanceCost.prototype.getAllAccountMaintenanceCosts = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    maintenanceColl
        .find({accountId: jwt.accountId})
        // .sort({createdAt: 1})
        // .populate('maintenanceCostId')
        .lean()
        .exec(function (err, mCosts) {
            async.parallel({
                createdbyname: function (createdbyCallback) {
                    Helpers.populateNameInUsersColl(mCosts, "createdBy", function (response) {
                        createdbyCallback(response.err, response.documents);
                    });
                },
                truckNo: function (truckscallback) {
                    Helpers.populateNameInTrucksColl(mCosts, 'vehicleNumber', function (response) {
                        truckscallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Error retrieving expenses Costs');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.message = 'Success';
                    retObj.maintanenceCosts = mCosts;
                    callback(retObj);
                }
            });
        });
};

MaintenanceCost.prototype.getAll = function (jwt, req, callback) {
    var result = {};
    maintenanceColl.find({}, function (err, maintenanceRecords) {

        if (err) {
            result.status = false;
            result.message = 'Error getting expenses Records';
            callback(result);
        } else {
            Helpers.populateNameInUsersColl(maintenanceRecords, "createdBy", function (response) {
                if (response.status) {
                    result.status = true;
                    result.message = 'Success';
                    result.details = response.documents;
                    callback(result);
                } else {
                    result.status = false;
                    result.message = 'Error getting expenses Records';
                    callback(result);
                }
            });
        }
    });
};

MaintenanceCost.prototype.findMaintenanceRecord = function (maintenanceId, callback) {
    var result = {};
    maintenanceColl.findOne({_id: maintenanceId}, function (err, record) {
        if (err) {
            result.status = false;
            result.message = "Error while finding expenses Record, try Again";
            callback(result);
        } else if (record) {
            result.status = true;
            result.message = "expenses Record found successfully";
            result.trip = record;
            callback(result);
        } else {
            result.status = false;
            result.message = "expenses Record is not found!";
            callback(result);
        }
    });
};

MaintenanceCost.prototype.updateMaintenanceCost = function (jwt, Details, callback) {
    var result = {};
    maintenanceColl.findOneAndUpdate({_id: Details._id},
        {
            $set: {
                "updatedBy": jwt.id,
                "vehicleNumber": Details.vehicleNumber,
                "description": Details.description,
                "expenseType": Details.expenseType,
                "cost": Details.cost,
                "date": Details.date
            }
        },
        {new: true},
        function (err, Details) {
            if (err) {
                result.status = false;
                result.message = "Error while updating expenses Cost Record, try Again";
                callback(result);
            } else if (Details) {
                result.status = true;
                result.message = "expenses Cost updated successfully";
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding expenses Record";
                callback(result);
            }
        });
};

MaintenanceCost.prototype.deleteMaintenanceRecord = function (maintenanceId, callback) {
    var result = {};
    maintenanceColl.remove({_id: maintenanceId}, function (err, returnValue) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting expenses Record';
            callback(result);
        } else if (returnValue.result.n === 0) {
            result.status = false;
            result.message = 'Error deleting expenses Record';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};
MaintenanceCost.prototype.countMaintenance = function (jwt, callback) {
    var result = {};
    maintenanceColl.count({'accountId':jwt.accountId},function (err, data) {
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
module.exports = new MaintenanceCost();