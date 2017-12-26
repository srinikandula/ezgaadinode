var async = require('async');
var _ = require('underscore');

var Utils = require('./utils');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
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

    if (!accountInfo.password || accountInfo.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be atleast 5 characters');
    }

    if (!accountInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        AccountsColl.findOne({userName: accountInfo.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account with same userName already exists');
                callback(retObj);
            } else {
                accountInfo.createdBy = jwtObj.id;
                accountInfo.type = "account";
                (new AccountsColl(accountInfo)).save(function (err, savedAcc) {
                    if (err) {
                        retObj.messages.push('Error saving account');
                        callback(retObj);
                    } else {
                        accountInfo.accountId = savedAcc._id;
                        accountInfo.type = "account";
                        retObj.status = true;
                        retObj.messages.push('Success');
                        callback(retObj);
                        /*(new GroupsColl(accountInfo)).save(function (err) {
                            if (err) {
                                retObj.messages.push('Error saving user');
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('Success');
                                callback(retObj);
                            }
                        });*/

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
    var query = {};
    if(params.filter && params.filter.trim().length > 0){
        query = {"userName":{$regex: params.filter.trim()}};
    }
    async.parallel({
        accounts: function (accountsCallback) {
            AccountsColl
                .find(query)
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
            AccountsColl.count(query, function (err, count) {
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

    AccountsColl.find({}, {name: 1}, function (err, accounts) {
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
        AccountsColl.findOne({"_id": ObjectId(accountId)}, function (err, account) {
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
    if (!Utils.isValidObjectId(accountInfo.profile._id)) {
        retObj.messages.push('Invalid account Id');
    }

    if (accountInfo.oldPassword) {
        if (!accountInfo.newPassword) {
            retObj.messages.push('Please Provide New Password');
        }
        if (accountInfo.confirmPassword !== accountInfo.newPassword) {
            retObj.messages.push('Passwords Not Matched');
        }
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        if(accountInfo.oldPassword) {
            AccountsColl.findOne({_id: accountInfo.profile._id,password: accountInfo.oldPassword}, function (err, oldAcc) {
                if (err) {
                    retObj.messages.push('Please Try Again');
                    callback(retObj);
                } else if (oldAcc) {
                    accountInfo.profile.password=accountInfo.newPassword;
                    updateAccounts(jwtObj, accountInfo, callback)
                } else {
                    retObj.messages.push('Invalid Password');
                    callback(retObj);
                }
            });
        } else {
            updateAccounts(jwtObj, accountInfo, callback)
        }
    }
};

function updateAccounts (jwtObj, accountInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    accountInfo.updatedBy = jwtObj.id;
    AccountsColl.findOneAndUpdate({_id: accountInfo.profile._id}, {$set: accountInfo.profile}, function (err, oldAcc) {
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

Accounts.prototype.countAccountGroups = function (jwt, callback) {
    var result = {};
    AccountsColl.count({"accountId": ObjectId(jwt.accountId),"type":"group"},function (err, data) {
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

Accounts.prototype.userProfile = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    async.parallel({
        profile: function(profileCallback) {
            Accounts.prototype.getAccountDetails(jwt.id,function (response) {
                profileCallback(response.error, response.account);
            });
        },
        accountGroupsCount:function(accountGroupCountCallback) {
            Accounts.prototype.countAccountGroups(jwt,function (response) {
                accountGroupCountCallback(response.error, response.count);
            });
        },
        accountTrucksCount:function(accountTrucksCountCallback) {
            Trucks.countTrucks(jwt,function (response) {
                accountTrucksCountCallback(response.error, response.count);
            });
        },
    },function (error, userProfileContent) {
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.result = userProfileContent;
            callback(retObj);
        }
    });
}

Accounts.prototype.addAccountGroup = function (jwtObj, accountGroupInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountGroupInfo.userName) {
        retObj.messages.push('Invalid User Name');
    }

    if (!accountGroupInfo.password) {
        retObj.messages.push('Invalid password');
    }

    if (!accountGroupInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        AccountsColl.findOne({userName: accountGroupInfo.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account Group with same userName already exists');
                callback(retObj);
            } else {
                accountGroupInfo.createdBy = jwtObj.id;
                accountGroupInfo.accountId = jwtObj.id;
                (new AccountsColl(accountGroupInfo)).save(function (err, savedAcc) {
                    if (err) {
                        retObj.messages.push('Error saving account');
                        callback(retObj);
                    } else {
                        accountGroupInfo.accountId = savedAcc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.accountGroup=savedAcc;
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Accounts.prototype.getAllAccountGroup = function (jwt,callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({"type":"group","accountId":jwt.id}).populate('accountId').exec(function (err, accountGroup) {
        if (err) {
            retObj.messages.push('Error retrieving accounts group');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.accountGroup = accountGroup;
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountGroup = function (accountGroupId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(accountGroupId)) {
        retObj.messages.push('Invalid accountGroupId');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        AccountsColl.findOne({"_id": ObjectId(accountGroupId)}).lean().exec(function (err, accountGroup) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                callback(retObj);
            } else if (accountGroup) {
                retObj.status = true;
                retObj.messages.push('Success');
                accountGroup.confirmPassword=accountGroup.password;
                retObj.accountGroup = accountGroup;
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccountGroup = function (jwtObj, accountGroupInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!Utils.isValidObjectId(accountGroupInfo._id)) {
        retObj.messages.push('Invalid account Group Id');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        accountGroupInfo.updatedBy = jwtObj.id;
        AccountsColl.findOneAndUpdate({_id: accountGroupInfo._id}, {$set: accountGroupInfo}, function (err, oldAcc) {
            if (err) {
                retObj.messages.push('Error updating the account group');
                callback(retObj);
            } else if (oldAcc) {
                retObj.status = true;
                retObj.messages.push('Success');
                callback(retObj);
            } else {
                retObj.messages.push('Account Group doesn\'t exist');
                callback(retObj);
            }
        });
    }
};

module.exports = new Accounts();