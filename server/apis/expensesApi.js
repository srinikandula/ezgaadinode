var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
const ObjectId = mongoose.Types.ObjectId;
var expenseColl = require('./../models/schemas').ExpenseCostColl;
var expenseMasterColl = require('./../models/schemas').expenseMasterColl;
var trucksCollection = require('./../models/schemas').TrucksColl;

var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');

var Utils = require('./utils');

var Expenses = function () {
};

Expenses.prototype.addExpense = function (jwt, expenseDetails, callback) {
    var result = {};
    if (!_.isObject(expenseDetails) || _.isEmpty(expenseDetails)) {
        result.status = false;
        result.message = "Please fill all the required expense cost details";
        callback(result);
    } else if (!expenseDetails.vehicleNumber || !_.isString(expenseDetails.vehicleNumber)) {
        result.status = false;
        result.message = "Please provide valid vehicle number";
        callback(result);
    } else if (!expenseDetails.expenseType || !_.isString(expenseDetails.expenseType)) {
        result.status = false;
        result.message = "Please provide Expense Type";
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

Expenses.prototype.getExpenseCosts = function (jwt,params, callback) {
    var result = {};
    if (!params.page) {
        params.page = 1;
    }
    else if (!_.isNumber(Number(params.page))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }

    var skipNumber = (params.page - 1) * params.size;
    async.parallel({
        mCosts: function (mCostsCallback) {
            var limit = params.size? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) :{createdAt: -1};
            expenseColl
                .find({'accountId': jwt.accountId})
                //.sort({createdAt: 1})
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

Expenses.prototype.getAllAccountExpenseCosts = function (jwt, callback) {
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

Expenses.prototype.getAll = function (jwt, req, callback) {
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

Expenses.prototype.findExpenseRecord = function (expenseId, callback) {
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

Expenses.prototype.updateExpenseCost = function (jwt, Details, callback) {
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

Expenses.prototype.deleteExpenseRecord = function (expenseId, callback) {
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
Expenses.prototype.countExpense = function (jwt, callback) {
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

/**
 * Find total of expenses in the account
 * @param jwt
 * @param callback
 */
Expenses.prototype.findTotalExpenses = function (jwt, callback) {
    expenseColl.aggregate({ $match: {"accountId":ObjectId(jwt.accountId)}},
        { $group: { _id : null , totalExpenses : { $sum: "$cost" }} },
        function (error, result) {
            var retObj = {
                status: false,
                messages: []
            };
            if(error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
            } else {
                retObj.status = true;
                if(result.length > 0){
                    retObj.totalExpenses= result[0].totalExpenses;
                } else{
                    retObj.totalExpenses= 0;
                }

            }
            callback(retObj)
        });
};

/**
 * Find expenses totals by vehicles grouped by expense type
 *
 * @param jwt
 * @param callback
 */
Expenses.prototype.findExpensesByVehicles =  function(jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        expenses: function(expensesCallback) {
            expenseColl.aggregate({ $match: {"accountId":ObjectId(jwt.accountId)}},
                { $group: { _id : {"vehicleNumber": "$vehicleNumber","expenseType":"$expenseType" },
                    totalExpenses : { $sum: "$cost" }} },function (error, expensesResult) {
                    expensesCallback(error, expensesResult);
                });
        },
        expenseTypes: function(expenseTypesCallback){
            expenseMasterColl.find({"accountId":jwt.accountId}, function(error , expenseTypeResults){
                expenseTypesCallback(error, expenseTypeResults);
            });
        },
        truckRegNumbers: function(expenseTypesCallback){
            trucksCollection.find({"accountId":jwt.accountId},{"registrationNo":1}, function(error , expenseTypeResults){
                expenseTypesCallback(error, expenseTypeResults);
            });
        }

    },function (error, expensesAndTypes) {
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            var expenses = expensesAndTypes.expenses;
            //build vehicle expenses map
            var expenseTypes = _.object(_.map(expensesAndTypes.expenseTypes, function(expenseType) {
                return [expenseType._id, expenseType.expenseName];
            }));
            var truckRegNumbers = _.object(_.map(expensesAndTypes.truckRegNumbers, function(truck) {
                return [truck._id, truck.registrationNo];
            }));
            /**
             * {
                      "expenseTypes": [
                        {
                          "_id": "5a0d7af1ac20f331fa21f717",
                          "updatedAt": "2017-11-16T11:48:01.885Z",
                          "createdAt": "2017-11-16T11:48:01.885Z",
                          "expenseName": "Diesel",
                          "createdBy": "5a0ab6d1a5708b26b19cc170",
                          "updatedBy": "5a0ab6d1a5708b26b19cc170",
                          "accountId": "5a0ab6c9a5708b26b19cc16f",
                          "__v": 0
                        },
                        {
                          "_id": "5a12e83dc0b585b615aee162",
                          "updatedAt": "2017-11-20T14:35:41.798Z",
                          "createdAt": "2017-11-20T14:35:41.798Z",
                          "expenseName": "Toll",
                          "createdBy": "5a0ab6d1a5708b26b19cc170",
                          "updatedBy": "5a0ab6d1a5708b26b19cc170",
                          "accountId": "5a0ab6c9a5708b26b19cc16f",
                          "__v": 0
                        }
                      ],
                      "expenses": [
                        {
                          "_id": {
                            "vehicelNumber": "5a0d775eac20f331fa21f716",
                            "expenseType": "5a0d7af1ac20f331fa21f717"
                          },
                          "totalExpenses": 3000
                        },
                        {
                          "_id": {
                            "vehicelNumber": "5a0d76a1ac20f331fa21f715",
                            "expenseType": "5a12e83dc0b585b615aee162"
                          },
                          "totalExpenses": 300
                        },
                        {
                          "_id": {
                            "vehicelNumber": "5a0d76a1ac20f331fa21f715",
                            "expenseType": "5a0d7af1ac20f331fa21f717"
                          },
                          "totalExpenses": 2000
                        }
                      ]
                    }
             * @type {{}}
             */
            var vehicleExpenses = {};
            for(var i=0; i< expenses.length;i++) {
                var vehicleId = expenses[i]._id.vehicleNumber;
                if(!vehicleExpenses[vehicleId]) {
                    vehicleExpenses[vehicleId] = {"id": vehicleId,expenses:{},"regNumber":truckRegNumbers[vehicleId]};

                }
                var vehicle = vehicleExpenses[vehicleId];
                if(!vehicle.expenses[expenses[i]._id.expenseType]) {
                    var expenseTotal = {"expenseTotal":expenses[i].totalExpenses};
                    expenseTotal["name"] = expenseTypes[expenses[i]._id.expenseType];
                    vehicle.expenses[expenses[i]._id.expenseType] = expenseTotal;
                } else {
                    var expense =  vehicle.expenses[expenses[i]._id.expenseType];
                    expense["expenseTotal"] += expenses[i].totalExpenses;
                }
            }
            var results =[];
            var totalDieselExpense = 0;
            var totaltollExpense = 0;
            var totalmExpense = 0;
            var totalmisc = 0;
            for(id in vehicleExpenses) {
                var vehicleExpense = vehicleExpenses[id];
                vehicleExpense.exps = [];
                var resultExpense = {"dieselExpense":0, "tollExpense":0, "mExpense":0, "misc":0};
                for(e in vehicleExpense.expenses) {
                    var vExpense = vehicleExpense.expenses[e];
                    //console.log(vExpense);
                    if(vExpense["name"] == "Diesel"){
                        resultExpense["dieselExpense"] += vExpense.expenseTotal;
                        totalDieselExpense = totalDieselExpense + resultExpense["dieselExpense"];
                    } else if(vExpense["name"] == "Toll"){
                        resultExpense["tollExpense"] += vExpense.expenseTotal;
                        totaltollExpense = totaltollExpense + resultExpense["tollExpense"];
                    } else if(vExpense["name"] == "Maintenance"){
                        resultExpense["mExpense"] += vExpense.expenseTotal;
                        totalmExpense = totalmExpense + resultExpense["mExpense"];
                    } else {
                        resultExpense["misc"] += vExpense.expenseTotal;
                        totalmisc = totalmisc + resultExpense["misc"];
                    }
                }
                vehicleExpense.exps.push(resultExpense);

                delete vehicleExpense.expenses;
                results.push(vehicleExpenses[id]);
            }
            retObj.expenses = results;
            retObj.totalExpenses = {totalDieselExpense:totalDieselExpense,totaltollExpense:totaltollExpense,totalmExpense:totalmExpense,totalmisc:totalmisc};
            callback(retObj);
        }
    });
}
/**
 * Find expenses for a vehicle
 * @param jwt
 * @param vehicleId
 * @param callback
 */

Expenses.prototype.findExpensesForVehicle = function (jwt, vehicleId, callback) {
    var result = {};
    var totalDieselExpense = 0;
    var totaltollExpense = 0;
    var totalmExpense = 0;
    var totalmisc = 0;
    expenseColl.find({'accountId':jwt.accountId,"vehicleNumber":vehicleId },function (err, expenses) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            callback(result);
        } else {
            Utils.populateNameInExpenseColl(expenses, 'expenseType', function(results){
                result.status = true;
                result.expenses = results.documents;
                console.log(result.expenses.length);
                for(var i = 0; i < result.expenses.length;i++) {
                    if(result.expenses[i].attrs.expenseName === 'Diesel') {
                        totalDieselExpense = totalDieselExpense + result.expenses[i].cost;
                    } else if(result.expenses[i].attrs.expenseName === 'Toll') {
                        totaltollExpense = totaltollExpense + result.expenses[i].cost;
                    } else if(result.expenses[i].attrs.expenseName === 'Maintenance') {
                        totalmExpense = totalmExpense + result.expenses[i].cost;
                    } else {
                        totalmisc = totalmisc + result.expenses[i].cost;
                    }
                }
                result.totalExpenses = {totalDieselExpense:totalDieselExpense,totaltollExpense:totaltollExpense,totalmExpense:totalmExpense,totalmisc:totalmisc};
                callback(result);
            });
        }
    })
};
/*
* Retrieve expenseType and truckName based on truck
* */
Expenses.prototype.findVehicleExpenses = function (jwt, vehicleId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseColl.find({accountId: jwt.accountId, vehicleNumber:vehicleId}, function (err, expenses) {
        //console.log(expenses);
        if (err) {
            retObj.messages.push('Error getting Expenses');
            callback(retObj);
        } else {
            async.parallel({
                expenseType: function (createdbyCallback) {
                    Helpers.populateNameInExpenseColl(expenses, "expenseType", function (response) {
                        createdbyCallback(response.err, response.documents);
                    });
                },
                truckName: function (truckscallback) {
                    Helpers.populateNameInTrucksColl(expenses, 'vehicleNumber', function (response) {
                        truckscallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
                //console.log("populateResults : ",populateResults);
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Error retrieving data');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.message = 'Success';
                    retObj.expenses = expenses;
                    callback(retObj);
                }
            });
            /*Utils.populateNameInTrucksColl(expenses,"vehicleNumber",function(tripDocuments){
                retObj.status = true;
                retObj.expenses= tripDocuments.documents;
                callback(retObj)
            });*/
            /*retObj.status = true;
            retObj.messages.push('Success');
            retObj.expenses = expenses;
            callback(retObj);*/
        }
    });
};

module.exports = new Expenses();