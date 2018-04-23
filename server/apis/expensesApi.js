var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
const ObjectId = mongoose.Types.ObjectId;
var expenseColl = require('./../models/schemas').ExpenseCostColl;
var expenseMasterColl = require('./../models/schemas').expenseMasterColl;
var erpPaymentsColl = require('./../models/schemas').erpPaymentsColl;
var expenseMasterApi = require('./expenseMasterApi');
var trucksCollection = require('./../models/schemas').TrucksColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var PartyCollection = require('./../models/schemas').PartyCollection;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');

var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');
var Utils = require('./utils');

var Expenses = function () {
};

function value(x) {
    if (!x || '') {
        return '---';
    } else {
        return x;
    }
}

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}

function save(expenseDetails, result, req, callback) {
    var expenseDoc = new expenseColl(expenseDetails);
    expenseDoc.save(function (err, expense) {

        if (err) {
            result.status = false;
            result.messages.push("Error while adding expenses Cost, try Again");
            analyticsService.create(req, serviceActions.add_expense_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: result.messages
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = true;
            result.messages.push("expenses Cost Added Successfully");
            result.expenses = expense;
            analyticsService.create(req, serviceActions.add_expense, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        }
    });
}

function saveExpense(expenseDetails, jwt, result, req, callback) {
    if (expenseDetails.expenseType === 'others' && expenseDetails.expenseName) {
        expenseMasterApi.addExpenseType(jwt, {"expenseName": expenseDetails.expenseName}, req, function (eTResult) {
            if (eTResult.status) {
                expenseDetails.expenseType = eTResult.newDoc._id.toString();
                save(expenseDetails, result, req, callback);
            } else {
                result.status = false;
                result.messages.push("Expense already exists or Error creating new expense type");
                analyticsService.create(req, serviceActions.add_expense_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: result.messages
                }, function (response) {
                });
                callback(result);
            }
        });
    } else {
        save(expenseDetails, result, req, callback);
    }
}

Expenses.prototype.addExpense = function (jwt, expenseDetails, req, callback) {
    var result = {
        status: false,
        messages: []
    };
    if (!_.isObject(expenseDetails) || _.isEmpty(expenseDetails)) {
        result.status = false;
        result.messages.push("Please fill all the required expense details");
        callback(result);
    } else if (!expenseDetails.vehicleNumber) {
        result.status = false;
        result.messages.push("Please provide valid vehicle number");
        callback(result);
    } else if (!expenseDetails.expenseType || !_.isString(expenseDetails.expenseType)) {
        result.status = false;
        result.messages.push("Please provide Expense Type");
        callback(result);
    } else if (expenseDetails.expenseType === 'others' && !expenseDetails.expenseName) {
        result.status = false;
        result.messages.push("Enter other expenseType");
        callback(result);
    } else if (!expenseDetails.mode) {
        result.status = false;
        result.messages.push("Please Select Cash or Credit");
        callback(result);
    } else if (!expenseDetails.partyId && expenseDetails.mode === 'Credit') {
        result.status = false;
        result.messages.push("Please Select Party");
        callback(result);
    } else if (expenseDetails.mode === 'Cash' && (!expenseDetails.cost || _.isNaN(expenseDetails.cost))) {
        result.status = false;
        result.messages.push("Please provide Total Expense Amount");
        callback(result);
    } else if (expenseDetails.mode === 'Credit' && (!expenseDetails.totalAmount || _.isNaN(expenseDetails.totalAmount))) {
        result.status = false;
        result.messages.push("Please enter Total Expense Amount");
        callback(result);
    } else if (expenseDetails.mode === 'Credit' && _.isNaN(expenseDetails.paidAmount)) {

        result.status = false;
        result.messages.push("Invalid Paid Amount");
        callback(result);
    } else {
        expenseDetails.createdBy = jwt.id;
        expenseDetails.updatedBy = jwt.id;
        expenseDetails.accountId = jwt.accountId;
        if (expenseDetails.mode === 'Cash') {
            expenseDetails.totalAmount = 0;
        } else {
            expenseDetails.cost = 0;
        }
        saveExpense(expenseDetails, jwt, result, req, callback);
    }
};

function updateExpense(expense, jwt, req, callback) {
    var result = {
        status: false,
        messages: []
    };
    expenseColl.findOneAndUpdate({_id: expense._id},
        {
            $set: {
                "updatedBy": jwt.id,
                "vehicleNumber": expense.vehicleNumber,
                "description": expense.description,
                "expenseType": expense.expenseType,
                "cost": expense.cost,
                "mode": expense.mode,
                "partyId": expense.partyId,
                "totalAmount": expense.totalAmount,
                "paidAmount": expense.paidAmount,
                "date": expense.date
            }
        },
        {new: true},
        function (err, expenseDoc) {
            if (err) {
                result.status = false;
                result.messages.push("Error while updating expenses Cost Record, try Again");
                analyticsService.create(req, serviceActions.update_expense_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: result.message
                }, function (response) {
                });
                callback(result);
            } else if (expenseDoc) {
                result.status = true;
                result.expense = expenseDoc;
                result.messages.push("expenses Cost updated successfully");
                analyticsService.create(req, serviceActions.update_expense, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(result);
            } else {
                result.status = false;
                result.messages.push("Error, finding expenses Record");
                analyticsService.create(req, serviceActions.update_expense_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: result.message
                }, function (response) {
                });
                callback(result);
            }
        });
}

Expenses.prototype.updateExpenseCost = function (jwt, expense, req, callback) {
    var giveAccess = false;
    var result = {
        status: false,
    };
    if (jwt.type === "account" && expense.accountId === jwt.accountId) {
        giveAccess = true;
    } else if (jwt.type === "group" && expense.createdBy === jwt.id) {
        giveAccess = true;
    } else {
        result.status = false;
        result.messages.push("Unauthorized access");
        callback(result);
    }
    if (giveAccess) {
        if (expense.mode === 'Cash') {
            expense.totalAmount = 0;
        } else {
            expense.cost = 0;
        }
        if (expense.expenseType === 'others' && expense.expenseName) {
            expenseMasterApi.addExpenseType(jwt, {"expenseName": expense.expenseName}, req, function (eTResult) {
                if (eTResult.status) {
                    expense.expenseType = eTResult.newDoc._id.toString();

                    updateExpense(expense, jwt, req, callback);
                } else {
                    result.status = false;
                    result.messages.push("Unauthorized access or Error creating new expense type");
                    callback(result);
                }
            });
        } else {
            updateExpense(expense, jwt, req, callback);
        }
    }
};

function getExpenseCosts(condition, jwt, params, callback) {
    var result = {};
    var skipNumber = (params.page - 1) * params.size;
    async.parallel({
        mCosts: function (mCostsCallback) {
            var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
            expenseColl
                .find(condition)
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .populate({path:"partyId",select:'name'})
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
            expenseColl.count({}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        var result = {};
        if (err) {
            result.status = false;
            result.message = 'Error retrieving expenses Costs';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.userId = jwt.id;
            result.userType = jwt.type;
            result.count = results.count;
            var i = 0;
            async.map(results.mCosts.createdbyname, function (expense, expCall) {

                if (expense.mode === 'Cash') {
                    results.mCosts.createdbyname[i].totalAmount = expense.cost;
                }
                i++;
                expCall(null);
            }, function (err) {
                if (err) {
                    result.status = false;
                    result.message = 'Error retrieving expenses Costs';
                    callback(result);
                } else {
                    result.expenses = results.mCosts.createdbyname;
                    callback(result);

                }
            })

        }
    });
}

Expenses.prototype.getExpenseCosts = function (jwt, params, req, callback) {
    var result = {};
    if (!params.page) {
        params.page = 1;
    }
    var condition = {};
    if (params.fromDate && params.toDate && params.regNumber) {
        trucksCollection.find({registrationNo: new RegExp("^" + params.regNumber, "i")}, function (err, truckData) {
            if (err) {
                result.status = false;
                result.message = 'Error retrieving expenses Costs';
                analyticsService.create(req, serviceActions.get_all_expenses_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: result.messages
                }, function (response) {
                });
                callback(result);
            } else if (truckData) {
                var ids = _.pluck(truckData, "_id");
                getExpenseCosts({
                    'accountId': jwt.accountId,
                    date: {
                        $gte: new Date(params.fromDate),
                        $lte: new Date(params.toDate),
                    },
                    'vehicleNumber': {$in: ids}
                }, jwt, params, function (response) {
                    if (response.status) {
                        analyticsService.create(req, serviceActions.get_all_expenses, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: true,
                        }, function (response) {
                        });
                    } else {
                        analyticsService.create(req, serviceActions.get_all_expenses_err, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: false,
                            messages: result.messages
                        }, function (response) {
                        });
                    }
                    callback(response);
                })
            } else {
                result.status = true;
                result.message = 'Success';
                result.count = 0;
                result.expenses = [];
                analyticsService.create(req, serviceActions.get_all_expenses, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: true,
                }, function (response) {
                });
                callback(result);
            }
        })
    } else if (params.fromDate && params.toDate) {
        condition = {
            "accountId": ObjectId(jwt.accountId), date: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate),
            }
        };
        getExpenseCosts(condition, jwt, params, function (response) {
            if (response.status) {
                analyticsService.create(req, serviceActions.get_all_expenses, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: true,
                }, function (response) {
                });
            } else {
                analyticsService.create(req, serviceActions.get_all_expenses_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: result.messages
                }, function (response) {
                });
            }
            callback(response);
        })
    } else if (params.regNumber) {
        trucksCollection.find({registrationNo: new RegExp("^" + params.regNumber, "i")}, function (err, truckData) {
            if (err) {
                result.status = false;
                result.message = 'Error retrieving expenses Costs';
                analyticsService.create(req, serviceActions.get_all_expenses_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: result.messages
                }, function (response) {
                });
                callback(result);
            } else if (truckData) {
                var ids = _.pluck(truckData, "_id");
                getExpenseCosts({
                    'accountId': jwt.accountId,
                    'vehicleNumber': {$in: ids}
                }, jwt, params, function (response) {
                    if (response.status) {
                        analyticsService.create(req, serviceActions.get_all_expenses, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: true,
                        }, function (response) {
                        });
                    } else {
                        analyticsService.create(req, serviceActions.get_all_expenses_err, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: false,
                            messages: result.messages
                        }, function (response) {
                        });
                    }
                    callback(response);
                })
            } else {
                result.status = true;
                result.message = 'Success';
                result.count = 0;
                result.expenses = [];
                analyticsService.create(req, serviceActions.get_all_expenses, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: true,
                }, function (response) {
                });
                callback(result);
            }
        })
    } else {
        getExpenseCosts({'accountId': jwt.accountId}, jwt, params, function (response) {
            if (response.status) {
                analyticsService.create(req, serviceActions.get_all_expenses, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: true,
                }, function (response) {
                });
            } else {
                analyticsService.create(req, serviceActions.get_all_expenses_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: result.messages
                }, function (response) {
                });
            }
            callback(response);
        })


    }

};

Expenses.prototype.getAllAccountExpenseCosts = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseColl
        .find({accountId: jwt.accountId})
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
                    analyticsService.create(req, serviceActions.get_all_acc_expenses_err, {
                        accountId: req.jwt.id,
                        success: false,
                        messages: result.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.message = 'Success';
                    retObj.maintanenceCosts = mCosts;
                    analyticsService.create(req, serviceActions.get_all_acc_expenses, {
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
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

Expenses.prototype.findExpenseRecord = function (jwt, expenseId, req, callback) {
    var result = {};
    var condition = {};
    if (jwt.type === "account") {
        condition = {_id: expenseId, 'accountId': jwt.accountId};
    } else {
        condition = {_id: expenseId, 'createdBy': jwt.id};
    }
    expenseColl.findOne(condition, function (err, record) {
        if (err) {
            result.status = false;
            result.message = "Error while finding expenses Record, try Again";
            analyticsService.create(req, serviceActions.find_expense_by_id_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: result.message
            }, function (response) {
            });
            callback(result);
        } else if (record) {
            result.status = true;
            result.message = "expenses Record found successfully";
            result.expense = record;
            analyticsService.create(req, serviceActions.find_expense_by_id, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = false;
            result.message = "Unauthorized access or expenses Record is not found!";
            analyticsService.create(req, serviceActions.find_expense_by_id_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: result.message
            }, function (response) {
            });
            callback(result);
        }
    });
};


Expenses.prototype.deleteExpenseRecord = function (jwt, expenseId, req, callback) {
    var result = {
        status: false,
        messages: []
    };
    var condition = {};
    var giveAccess = false;
    if (jwt.type === "account") {
        condition = {_id: expenseId, accountId: jwt.accountId};
        giveAccess = true;
    } else if (jwt.type === "group") {
        condition = {_id: expenseId, createdBy: jwt.id};
        giveAccess = true;
    } else {
        result.status = false;
        result.messages.push("Unauthorized access");
        analyticsService.create(req, serviceActions.del_expense_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: result.message
        }, function (response) {
        });
        callback(result);
    }

    if (giveAccess) {
        expenseColl.remove(condition, function (err, returnValue) {
            if (err) {
                result.status = false;
                result.messages.push('Error deleting expenses Record');
                analyticsService.create(req, serviceActions.del_expense_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: result.message
                }, function (response) {
                });
                callback(result);
            } else if (returnValue.result.n === 0) {
                result.status = false;
                result.messages.push('Unauthorized access or Error deleting expenses Record');
                analyticsService.create(req, serviceActions.del_expense, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(result);
            } else {
                result.status = true;
                result.messages.push('Success');
                analyticsService.create(req, serviceActions.del_expense_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: result.message
                }, function (response) {
                });
                callback(result);
            }
        });
    }
};
Expenses.prototype.countExpense = function (jwt, req, callback) {
    var result = {
        status: false,
        messages: []
    };
    expenseColl.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_expense_err, {
                accountId: req.jwt.id,
                success: false,
                messages: result.message
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.count = data;
            analyticsService.create(req, serviceActions.count_expense, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        }
    })
};

/**
 * Find total of expenses in the account
 * @param jwt
 * @param callback
 */

Expenses.prototype.findTotalExpenses = function (erpSettingsCondition, req, callback) {
    expenseColl.aggregate({$match: erpSettingsCondition},
        {$group: {_id: null, totalCash: {$sum: "$cost"}, totalCredit: {$sum: "$totalAmount"}}},
        function (error, result) {
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
            } else {
                retObj.status = true;
                if (result.length > 0) {
                    retObj.totalExpenses = result[0].totalCash + result[0].totalCredit;
                } else {
                    retObj.totalExpenses = 0;
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

Expenses.prototype.findExpensesByVehicles = function (jwt, params, req, callback) {
    var condition = {};
    var retObj = {
        status: false,
        messages: []
    };
    if (params.fromDate != '' && params.toDate != '' && params.regNumber != '') {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }, "vehicleNumber": ObjectId(params.regNumber)
            }
        };
        getExpensesByVehicles(jwt, condition, params, req, function (response) {
            callback(response);
        })
    } else if (params.fromDate && params.toDate) {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }
            }
        }
        getExpensesByVehicles(jwt, condition, params, req, function (response) {
            callback(response);
        })
    } else if (params.regNumber) {
        condition = {$match: {"accountId": ObjectId(jwt.accountId), "vehicleNumber": ObjectId(params.regNumber)}}
        getExpensesByVehicles(jwt, condition, params, req, function (response) {
            callback(response);
        })
    } else {
        ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.find_expenses_by_vehs_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (erpSettings) {

                condition = {$match: Utils.getErpSettings(erpSettings.expense, erpSettings.accountId)}
                getExpensesByVehicles(jwt, condition, params, req, function (response) {
                    callback(response);
                })
            } else {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.find_expenses_by_vehs_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });

    }

};
/**
 * Find expenses for a vehicle
 * @param jwt
 * @param vehicleId
 * @param callback
 */

Expenses.prototype.findExpensesForVehicle = function (jwt, vehicleId, req, callback) {
    var result = {};
    var totalDieselExpense = 0;
    var totaltollExpense = 0;
    var totalmExpense = 0;
    var totalmisc = 0;
    expenseColl.find({'accountId': jwt.accountId, "vehicleNumber": vehicleId}, function (err, expenses) {
        if (err) {
            result.status = false;
            result.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.find_expenses_by_veh_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: result.message
            }, function (response) {
            });
            callback(result);
        } else {
            Utils.populateNameInExpenseColl(expenses, 'expenseType', function (results) {
                result.status = true;
                result.expenses = results.documents;
                result.total = 0;
                for (var i = 0; i < result.expenses.length; i++) {
                    if (result.expenses[i].mode === 'Cash') {
                        result.total += result.expenses[i].cost;
                    } else {
                        result.total += result.expenses[i].totalAmount;
                        result.expenses[i].cost = result.expenses[i].totalAmount;
                    }

                }

                analyticsService.create(req, serviceActions.find_expenses_by_veh, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(result);
            });
        }
    })
};
/*
* Retrieve expenseType and truckName based on truck
* */
Expenses.prototype.findVehicleExpenses = function (jwt, vehicleId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseColl.find({accountId: jwt.accountId, vehicleNumber: vehicleId}, function (err, expenses) {
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
                },
                supplierName: function (supplierCallback) {
                    Helpers.populatePartyNameInExpenseColl(expenses, 'partyId', function (response) {
                        supplierCallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
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

function getExpensesByVehicles(jwt, condition, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        expenses: function (expensesCallback) {
            expenseColl.aggregate(condition,
                {
                    $group: {
                        _id: {"vehicleNumber": "$vehicleNumber", "expenseType": "$expenseType"},
                        totalCash: {$sum: "$cost"},
                        totalCredit: {$sum: "$totalAmount"}
                    }

                },
                {"$sort": {createdAt: -1}},
                function (error, expensesResult) {
                    expensesCallback(error, expensesResult);
                });
        },
        expenseTypes: function (expenseTypesCallback) {
            expenseMasterColl.find({}, function (error, expenseTypeResults) {
                expenseTypesCallback(error, expenseTypeResults);
            });
        },
        truckRegNumbers: function (expenseTypesCallback) {
            trucksCollection.find({"accountId": jwt.accountId}, {"registrationNo": 1}, function (error, expenseTypeResults) {
                expenseTypesCallback(error, expenseTypeResults);
            });
        }

    }, function (error, expensesAndTypes) {
        if (error) {
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            analyticsService.create(req, serviceActions.find_expenses_by_vehs_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            var expenses = expensesAndTypes.expenses;
            //build vehicle expenses map
            var expenseTypes = _.object(_.map(expensesAndTypes.expenseTypes, function (expenseType) {
                return [expenseType._id, expenseType.expenseName];
            }));
            var truckRegNumbers = _.object(_.map(expensesAndTypes.truckRegNumbers, function (truck) {
                return [truck._id, truck.registrationNo];
            }));
            var vehicleExpenses = {};
            for (var i = 0; i < expenses.length; i++) {
                var vehicleId = expenses[i]._id.vehicleNumber;
                if (!vehicleExpenses[vehicleId]) {
                    vehicleExpenses[vehicleId] = {
                        "id": vehicleId,
                        expenses: {},
                        "regNumber": truckRegNumbers[vehicleId]
                    };

                }
                var vehicle = vehicleExpenses[vehicleId];
                if (!vehicle.expenses[expenses[i]._id.expenseType]) {
                    var expenseTotal = {"expenseTotal": expenses[i].totalCredit + expenses[i].totalCash};
                    expenseTotal["name"] = expenseTypes[expenses[i]._id.expenseType];
                    vehicle.expenses[expenses[i]._id.expenseType] = expenseTotal;
                } else {
                    var expense = vehicle.expenses[expenses[i]._id.expenseType];
                    expense["expenseTotal"] += expenses[i].totalCredit + expenses[i].totalCash;
                }
            }
            var results = [];
            var totalDieselExpense = 0;
            var totaltollExpense = 0;
            var totalmExpense = 0;
            var totalmisc = 0;
            for (id in vehicleExpenses) {
                var vehicleExpense = vehicleExpenses[id];
                vehicleExpense.exps = [];
                var resultExpense = {"dieselExpense": 0, "tollExpense": 0, "mExpense": 0, "misc": 0};
                for (e in vehicleExpense.expenses) {
                    var vExpense = vehicleExpense.expenses[e];

                    if (vExpense["name"].toLowerCase() == "diesel") {
                        resultExpense["dieselExpense"] += vExpense.expenseTotal;
                        totalDieselExpense = totalDieselExpense + resultExpense["dieselExpense"];
                    } else if (vExpense["name"].toLowerCase() == "toll") {
                        resultExpense["tollExpense"] += vExpense.expenseTotal;
                        totaltollExpense = totaltollExpense + resultExpense["tollExpense"];
                    } else if (vExpense["name"].toLowerCase() == "maintenance") {
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
            retObj.totalExpenses = {
                totalDieselExpense: totalDieselExpense,
                totaltollExpense: totaltollExpense,
                totalmExpense: totalmExpense,
                totalmisc: totalmisc
            };
            analyticsService.create(req, serviceActions.find_expenses_by_vehs, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Expenses.prototype.shareExpensesDetailsViaEmail = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req, serviceActions.share_expense_det_by_email_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        Expenses.prototype.findExpensesByVehicles(jwt, params, req, function (expensesResponse) {
            if (expensesResponse.status) {
                var emailparams = {
                    templateName: 'shareExpenseDetailsByVechicle',
                    subject: "Easygaadi Expense Details",
                    to: params.email,
                    data: {
                        expenses: expensesResponse.expenses,
                        totalExpenses: expensesResponse.totalExpenses
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Expenses details shared successfully');
                        analyticsService.create(req, serviceActions.share_expense_det_by_email, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        analyticsService.create(req, serviceActions.share_expense_det_by_email_err, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: emailResponse.messages
                        }, function (response) {
                        });
                        callback(emailResponse);
                    }
                });
            } else {
                analyticsService.create(req, serviceActions.share_expense_det_by_email_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(expensesResponse);
            }
        })
    }

}

Expenses.prototype.downloadExpenseDetailsByVechicle = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    Expenses.prototype.findExpensesByVehicles(jwt, params, req, function (expensesResponse) {
        if (expensesResponse.status) {
            var output = [];
            for (var i = 0; i < expensesResponse.expenses.length; i++) {
                output.push({
                    Registration_No: expensesResponse.expenses[i].regNumber,
                    Diesel: expensesResponse.expenses[i].exps[0].dieselExpense,
                    Toll: expensesResponse.expenses[i].exps[0].tollExpense,
                    Maintenance: expensesResponse.expenses[i].exps[0].mExpense,
                    Miscellaneous: expensesResponse.expenses[i].exps[0].misc
                })
                if (i === expensesResponse.expenses.length - 1) {
                    retObj.status = true;
                    output.push({
                        Registration_No: 'Total',
                        Diesel: expensesResponse.totalExpenses.totalDieselExpense,
                        Toll: expensesResponse.totalExpenses.totaltollExpense,
                        Maintenance: expensesResponse.totalExpenses.totalmExpense,
                        Miscellaneous: expensesResponse.totalExpenses.totalmisc
                    })
                    retObj.data = output;
                    analyticsService.create(req, serviceActions.dwnld_expense_det, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            }
        } else {
            analyticsService.create(req, serviceActions.dwnld_expense_det_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: expensesResponse.messages
            }, function (response) {
            });
            callback(expensesResponse);
        }
    })


}

Expenses.prototype.findPaybleAmountForAccount = function (condition, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        payments:function (paymentsCallback) {
            var paymentsCond = {
                accountId: condition.accountId,
            };
            if (condition.date) {
                paymentsCond.date = condition.date;
            }
            if (condition.partyId) {
                paymentsCond.partyId = condition.partyId;
            }
            erpPaymentsColl.aggregate({$match: paymentsCond},
                {
                    $group: {
                        _id: null,
                        totalPaid: {$sum: "$amount"},
                    }
                },
                function (err, payment) {
                    paymentsCallback(err, payment)
                })
        },
        expenses:function (expensCallback) {
            condition.mode = "Credit";
            expenseColl.aggregate({$match: condition},
                {
                    $group: {
                        _id: null,
                        totalAmount: {$sum: "$totalAmount"},
                    }
                },
                function (err, expense) {
                    expensCallback(err, expense)
                })
        }
    },function (err,results) {
       if(err){
           retObj.status = false;
           retObj.messages.push('Error');
           callback(retObj)
       }else if(results.expenses.totalAmount && results.payments){
           retObj.status = true;
           retObj.messages.push('Success');
           retObj.paybleCount = results.expenses[0].totalAmount - results.payments[0].totalPaid;
           callback(retObj);
       }else if(results.expenses.totalAmount){
           retObj.status = true;
           retObj.messages.push('Success');
           retObj.paybleCount = results.expenses[0].totalAmount;
           callback(retObj);
       }else{
           retObj.status = true;
           retObj.messages.push('Success');
           retObj.paybleCount =0;
           callback(retObj);
       }
    });


};

function getPaybleAmountByParty(condition, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    async.parallel({
        payments: function (paymentsCallback) {
            var paymentsCond = {
                accountId: condition.accountId,
            };
            if (condition.date) {
                paymentsCond.date = condition.date;
            }
            if (condition.partyId) {
                paymentsCond.partyId = condition.partyId;
            }
            erpPaymentsColl.aggregate({$match: paymentsCond},
                {
                    $group: {
                        _id: "$partyId",
                        amount: {$sum: "$amount"}
                    }
                }, {"$sort": {createdAt: -1}},

                function (err, payble) {
                    paymentsCallback(err, payble)
                });
        },
        expenses: function (expensCallback) {
            condition.mode = "Credit";
            expenseColl.aggregate({$match: condition},
                {
                    "$lookup": {
                        "from": "parties",
                        "localField": "partyId",
                        "foreignField": "_id",
                        "as": "partyId"
                    }
                }, {"$unwind": "$partyId"}, {
                    $group: {
                        _id: "$partyId",
                        totalAmount: {$sum: "$totalAmount"},

                    }
                }, {"$sort": {createdAt: -1}},

                function (err, payble) {
                    expensCallback(err, payble);

                });
        }


    }, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error');
            analyticsService.create(req, serviceActions.get_payable_amnt_by_party_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            if (results.expenses.length > 0) {
                var gross = {
                    totalAmount: 0,
                    paidAmount: 0,
                    dueAmount: 0
                };
                async.map(results.expenses, function (expense, expenseCallback) {
                    var payment = _.find(results.payments, function (pay) {
                        return pay._id.toString() == expense._id._id.toString();
                    });
                    if (payment) {
                        expense.paidAmount = payment.amount;
                        expense.dueAmount = expense.totalAmount - expense.paidAmount;
                    }
                    gross.totalAmount += expense.totalAmount;
                    gross.paidAmount += expense.paidAmount;
                    gross.dueAmount += expense.dueAmount;
                    expenseCallback(false);
                }, function (err) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Please try again');
                        analyticsService.create(req, serviceActions.get_payable_amnt_by_party_err, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.paybleAmounts = results.expenses;
                        retObj.gross = gross;
                        analyticsService.create(req, serviceActions.get_payable_amnt_by_party, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                })
            } else {
                retObj.status = false;
                retObj.messages.push('No Expense found');
                analyticsService.create(req, serviceActions.get_payable_amnt_by_party_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }

        }
    });

}

Expenses.prototype.getPaybleAmountByParty = function (jwt, params, req, callback) {
    var condition = {};
    var retObj = {
        status: false,
        messages: []
    };
    if (params.fromDate != '' && params.toDate != '' && params.partyId != '') {
        condition = {
            "accountId": ObjectId(jwt.accountId), date: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate),
            }, "partyId": ObjectId(params.partyId)
        }
        getPaybleAmountByParty(condition, params, req, function (response) {
            callback(response);
        });
    } else if (params.fromDate && params.toDate) {
        condition = {
            "accountId": ObjectId(jwt.accountId), date: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate),
            }
        }
        getPaybleAmountByParty(condition, params, req, function (response) {
            callback(response);
        });
    } else if (params.partyId) {
        condition = {"accountId": ObjectId(jwt.accountId), "partyId": ObjectId(params.partyId)}
        getPaybleAmountByParty(condition, params, req, function (response) {
            callback(response);
        });
    } else {
        ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_payable_amnt_by_party_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (erpSettings) {

                condition = Utils.getErpSettings(erpSettings.expense, erpSettings.accountId)
                getPaybleAmountByParty(condition, params, req, function (response) {
                    callback(response);
                });
            } else {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_payable_amnt_by_party_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }

};

Expenses.prototype.downloadPaybleDetailsByParty = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    Expenses.prototype.getPaybleAmountByParty(jwt, params, req, function (payableResponse) {
        if (payableResponse.status) {
            var output = [];
            for (var i = 0; i < payableResponse.paybleAmounts.length; i++) {
                output.push({
                    Party_Name: payableResponse.paybleAmounts[i]._id.name,
                    Mobile: payableResponse.paybleAmounts[i]._id.contact,
                    Total_Amount: payableResponse.paybleAmounts[i].totalAmount,
                    Paid_Amount: payableResponse.paybleAmounts[i].paidAmount,
                    Due_Amount: payableResponse.paybleAmounts[i].dueAmount
                });
                if (i === payableResponse.paybleAmounts.length - 1) {
                    retObj.status = true;
                    output.push({
                        Party_Name: 'Total',
                        Mobile: '',
                        Total_Amount: payableResponse.gross.totalAmount,
                        Paid_Amount: payableResponse.gross.paidAmount,
                        Payale_Amount: payableResponse.gross.payableAmount,
                        Due_Amount: payableResponse.gross.dueAmount
                    });
                    retObj.data = output;
                    analyticsService.create(req, serviceActions.dwnld_payable_det_by_party, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            }
        } else {
            analyticsService.create(req, serviceActions.dwnld_payable_det_by_party_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: payableResponse.messages
            }, function (response) {
            });
            callback(payableResponse);
        }
    })

}
Expenses.prototype.sharePayableDetailsViaEmail = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req, serviceActions.share_payable_det_by_email_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        Expenses.prototype.getPaybleAmountByParty(jwt, params, req, function (payableResponse) {
            if (payableResponse.status) {
                var emailparams = {
                    templateName: 'sharePayableDetailsByParty',
                    subject: "Easygaadi Payable Details",
                    to: params.email,
                    data: {
                        paybleAmounts: payableResponse.paybleAmounts,
                        gross: payableResponse.gross
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Payable details shared successfully');
                        analyticsService.create(req, serviceActions.share_payable_det_by_email, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        analyticsService.create(req, serviceActions.share_payable_det_by_email_err, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: emailResponse.messages
                        }, function (response) {
                        });
                        callback(emailResponse);
                    }
                });
            } else {
                analyticsService.create(req, serviceActions.share_payable_det_by_email_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: emailResponse.messages
                }, function (response) {
                });
                callback(payableResponse);
            }
        })
    }

};

Expenses.prototype.getPaybleAmountByPartyId = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    if (!jwt.accountId || !ObjectId.isValid(jwt.accountId)) {
        retObj.status = false;
        retObj.message.push("Invalid login");
        analyticsService.create(req, serviceActions.get_payable_amnt_by_party_id_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else if (!params.partyId || !ObjectId.isValid(params.partyId)) {
        retObj.status = false;
        retObj.message.push("Please select valid party");
        analyticsService.create(req, serviceActions.get_payable_amnt_by_party_id_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        async.parallel({
            payments: function (paymentsCallback) {
                erpPaymentsColl.find({
                    accountId: jwt.accountId,
                    partyId: params.partyId
                }, {amount: 1, date: 1, description: 1})
                    .lean().exec(function (err, partyData) {
                    paymentsCallback(err, partyData)
                });
            },
            expense: function (expenseCallback) {
                expenseColl.find({
                    accountId: jwt.accountId,
                    partyId: params.partyId
                }).populate({path: "expenseType", select: "expenseName"}).lean().exec(function (err, partyData) {
                    expenseCallback(err, partyData)
                });
            }
        }, function (err, results) {
            if (err) {
                retObj.status = false;
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.get_payable_amnt_by_party_id_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                if (results.expense.length > 0) {
                    retObj.status = true;
                    retObj.message.push("success");
                    retObj.totalAmount = 0;
                    retObj.totalPaid = 0;
                    retObj.partyData = results.expense.concat(results.payments);
                    for (var i = 0; i < retObj.partyData.length > 0; i++) {
                        if (retObj.partyData[i].amount) {
                            retObj.totalPaid += retObj.partyData[i].amount;
                        }
                        if (retObj.partyData[i].totalAmount) {
                            retObj.totalAmount += retObj.partyData[i].totalAmount;
                        }

                        if (i === retObj.partyData.length - 1) {
                            retObj.partyData = retObj.partyData.sort(function (x, y) {
                                return x.date > y.date ? 1 : -1;
                            });
                            analyticsService.create(req, serviceActions.get_payable_amnt_by_party_id, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    }
                } else {
                    retObj.status = false;
                    retObj.message.push("No Expenses found");
                    analyticsService.create(req, serviceActions.get_payable_amnt_by_party_id_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            }

        });

    }
};
Expenses.prototype.shareDetailsViaEmail = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    // console.log("shareDetailsViaEmail",params);
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.messages.push("Invalid email....");
    } else {
        Expenses.prototype.getExpenseCosts(jwt, params, req, function (response) {
            console.log("response..expenses", response);
            if (response.status) {
                var output = [];
                if (response.expenses.length) {
                    for (var i = 0; i < response.expenses.length; i++) {
                        output.push({
                            date: dateToStringFormat(response.expenses[i].date),
                            vehicleNumber: response.expenses[i].attrs.truckName,
                            expenseType: response.expenses[i].attrs.expenseName,
                            amount: response.expenses[i].cost,
                            mode: response.expenses[i].mode,
                            description: value(response.expenses[i].description)
                        });
                        if (i === response.expenses.length - 1) {
                            var emailparams = {
                                templateName: 'expenseDetails',
                                subject: "Expense Details",
                                to: params.email,
                                data: output
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
                        }
                    }
                } else {
                    retObj.messages.push("No records found....");
                    retObj.status = false;
                    callback(retObj);
                }

            } else {
                callback(response);

            }
        })
    }

};
Expenses.prototype.downloadDetails = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Expenses.prototype.getExpenseCosts(jwt, params, req, function (response) {
        if (response.status) {
            var output = [];
            for (var i = 0; i < response.expenses.length; i++) {
                output.push({
                    Date: dateToStringFormat(response.expenses[i].date),
                    Vehicle_Number: response.expenses[i].attrs.truckName,
                    Expense_Type: response.expenses[i].attrs.expenseName,
                    Amount: response.expenses[i].cost,
                    Mode: response.expenses[i].mode,
                    Description: response.expenses[i].description
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

Expenses.prototype.getPartiesFromExpense=function (req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var jwt=req.jwt;
    if (!jwt.accountId || !ObjectId.isValid(jwt.accountId)) {
        retObj.status = false;
        retObj.messages.push("Invalid Login");
        analyticsService.create(req, serviceActions.get_parties_by_trips_err, {
            body: JSON.stringify(req.query),
            accountId: jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (jwt.type === "account") {
            condition = {accountId: jwt.accountId};
        } else {
            condition = {accountId: jwt.groupAccountId}
        }
        expenseColl.distinct('partyId', condition, function (err, partyIds) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.get_parties_by_expense_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (partyIds.length > 0) {
                PartyCollection.find({_id:{$in:partyIds}}, {name: 1, contact: 1}, function (err, partyList) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.get_parties_by_expense_err, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else if (partyList.length > 0) {
                        retObj.status = true;
                        retObj.partyList = partyList;
                        retObj.messages.push("success");
                        analyticsService.create(req, serviceActions.get_parties_by_expense, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.messages.push("No parties found");
                        analyticsService.create(req, serviceActions.get_parties_by_expense_err, {
                            body: JSON.stringify(req.query),
                            accountId: jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                })

            } else {
                retObj.status = false;
                retObj.messages.push("No parties found");
                analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        })
    }

};
module.exports = new Expenses();