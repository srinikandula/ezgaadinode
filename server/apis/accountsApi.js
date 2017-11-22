var async = require('async');
var _ = require('underscore');

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var AccountsColl = require('./../models/schemas').AccountsColl;
var GroupsColl = require('./../models/schemas').GroupsColl;
var Trips = require('./tripsApi');
var Expenses = require('./expensesApi');
var PaymentsReceived = require('./paymentsReceivedAPI');
var Trucks = require('./truckAPIs');

var Accounts = function () {
};

Accounts.prototype.addAccount = function (jwtObj, accountInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.messages.push('Invalid User Name');
    }

    if (!Utils.isValidPassword(accountInfo.password)) {
        retObj.messages.push('Invalid password');
    }

    if (!accountInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        AccountsColl.findOne({name: accountInfo.name}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account with the name already exists');
                callback(retObj);
            } else {
                GroupsColl.findOne({userName: accountInfo.userName}, function (err, user) {
                    if (err) {
                        retObj.messages.push('Error fetching account');
                        callback(retObj);
                    } else if (user) {
                        retObj.messages.push('Username already exists');
                        callback(retObj);
                    } else {
                        accountInfo.createdBy = jwtObj.id;
                        (new AccountsColl(accountInfo)).save(function (err, savedAcc) {
                            if (err) {
                                retObj.messages.push('Error saving account');
                                callback(retObj);
                            } else {
                                accountInfo.accountId = savedAcc._id;
                                accountInfo.type = "account";
                                (new GroupsColl(accountInfo)).save(function (err) {
                                    if (err) {
                                        retObj.messages.push('Error saving user');
                                        callback(retObj);
                                    } else {
                                        retObj.status = true;
                                        retObj.messages.push('Success');
                                        callback(retObj);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

Accounts.prototype.getAccounts = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }


    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {};
    async.parallel({
        accounts: function (accountsCallback) {
            GroupsColl
                .find({type: "account"})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, accounts) {
                    Utils.populateNameInUsersColl(accounts, "createdBy", function (response) {
                        if (response.status) {
                            accountsCallback(err, response.documents);
                        } else {
                            accountsCallback(err, null);
                        }
                    });
                });
        },
        count: function (countCallback) {
            AccountsColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.accounts = results.accounts;
            callback(retObj);
        }
    });
};

Accounts.prototype.getAllAccounts = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };

    GroupsColl.find({type: "account"}, {name: 1}, function (err, accounts) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.accounts = accounts;
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountDetails = function (accountId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(accountId)) {
        retObj.messages.push('Invalid accountId');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        GroupsColl.findOne({_id: accountId,type: "account"}, function (err, account) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                callback(retObj);
            } else if (account) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.account = account;
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccount = function (jwtObj, accountInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(accountInfo._id)) {
        retObj.messages.push('Invalid account Id');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        accountInfo.updatedBy = jwtObj.id;
        accountInfo = Utils.removeEmptyFields(accountInfo);
        GroupsColl.findOneAndUpdate({_id: accountInfo._id, type: "account"}, {$set: accountInfo}, function (err, oldAcc) {
            if (err) {
                retObj.messages.push('Error updating the account');
                callback(retObj);
            } else if (oldAcc) {
                retObj.status = true;
                retObj.messages.push('Success');
                callback(retObj);
            } else {
                retObj.messages.push('Account doesn\'t exist');
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.erpDashBoardContent = function(jwt, callback){
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        expensesTotal: function(expensesTotalCallback) {
            Expenses.findTotalExpenses(jwt,function (response) {
                expensesTotalCallback(response.error, response.totalExpenses);
            });
        },
        totalRevenue:function(totalRevenueCallback) {
            Trips.findTotalRevenue(jwt,function (response) {
                totalRevenueCallback(response.error, response.totalRevenue);
            });
        },
        pendingDue:function(pendingDueCallback) {
            PaymentsReceived.findPendingDueForAccount(jwt,function (response) {
                pendingDueCallback(response.error, response.pendingDue);
            });
        },
        expiring:function(expiringCallback) {
            Trucks.findExpiryCount(jwt,function (response) {
                expiringCallback(response.error, response.expiryCount);
            });
        },
    },function (error, dashboardContent) {
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.result = dashboardContent;
            callback(retObj);
        }
    });
}
Accounts.prototype.countAccounts = function (jwt, callback) {
    var result = {};
    AccountsColl.count(function (err, data) {
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

module.exports = new Accounts();