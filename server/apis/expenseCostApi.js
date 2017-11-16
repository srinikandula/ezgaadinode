var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var expenseColl = require('./../models/schemas').ExpenseCostColl;
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');

var ExpenseCost = function () {
};

ExpenseCost.prototype.addExpense = function (jwt, expenseDetails, callback) {
    var result = {};
    if (!_.isObject(expenseDetails) || _.isEmpty(expenseDetails)) {
        result.status = false;
        result.message = "Please fill all the required expense cost details";
        callback(result);
    } else if (!expenseDetails.vehicleNumber || !_.isString(expenseDetails.vehicleNumber)) {
        result.status = false;
        result.message = "Please provide valid vehicle number";
        callback(result);
    } else if (!expenseDetails.description || !_.isString(expenseDetails.description)) {
        result.status = false;
        result.message = "Please provide valid repair type";
        callback(result);
    } else if (!expenseDetails.cost || _.isNaN(expenseDetails.cost)) {
        result.status = false;
        result.message = "Please provide valid cost";
        callback(result);
    } else {

        expenseDetails.createdBy = jwt.id;
        expenseDetails.updatedBy = jwt.id;
        expenseDetails.accountId = jwt.accountId;

        var expenseDoc = new expenseColl(expenseDetails);

        expenseDoc.save(function (err) {
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

ExpenseCost.prototype.getExpenseCosts = function (params, jwt, callback) {
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
            expenseColl
                .find({'accountId': jwt.accountId})
                .sort({createdAt: 1})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                //.populate('expenseCostId')
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
            expenseColl.count(function (err, count) {
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

ExpenseCost.prototype.getAllAccountExpenseCosts = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseColl
        .find({accountId: jwt.accountId})
        // .sort({createdAt: 1})
        // .populate('expenseCostId')
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

ExpenseCost.prototype.getAll = function (jwt, req, callback) {
    var result = {};
    expenseColl.find({}, function (err, expenseRecords) {

        if (err) {
            result.status = false;
            result.message = 'Error getting expenses Records';
            callback(result);
        } else {
            Helpers.populateNameInUsersColl(expenseRecords, "createdBy", function (response) {
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

ExpenseCost.prototype.findExpenseRecord = function (expenseId, callback) {
    var result = {};
    expenseColl.findOne({_id: expenseId}, function (err, record) {
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

ExpenseCost.prototype.updateExpenseCost = function (jwt, Details, callback) {
    var result = {};
    expenseColl.findOneAndUpdate({_id: Details._id},
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

ExpenseCost.prototype.deleteExpenseRecord = function (expenseId, callback) {
    var result = {};
    expenseColl.remove({_id: expenseId}, function (err, returnValue) {
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
ExpenseCost.prototype.countExpense = function (jwt, callback) {
    var result = {};
    expenseColl.count({'accountId':jwt.accountId},function (err, data) {
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
module.exports = new ExpenseCost();