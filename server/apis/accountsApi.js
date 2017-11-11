var async = require('async');
var _ = require('underscore');

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var AccountsColl = require('./../models/schemas').AccountsColl;
var GroupsColl = require('./../models/schemas').GroupsColl;

var Accounts = function () {
};

Accounts.prototype.addAccount = function (jwtObj, accountInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountInfo.name || !_.isString(accountInfo.name)) {
        retObj.messages.push('Invalid account name');
    }

    if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.messages.push('Invalid user name');
    }

    if (!Utils.isValidPassword(accountInfo.password)) {
        retObj.messages.push('Invalid password');
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

Accounts.prototype.getAccounts = function (pageNum, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!pageNum) {
        pageNum = 1;
    }

    if (!_.isNumber(Number(pageNum))) {
        retObj.messages.push('Invalid page number');
        return callback(retObj);
    }

    var skipNumber = (pageNum - 1) * pageLimits.accountPaginationLimit;
    async.parallel({
        accounts: function (accountsCallback) {
            GroupsColl
                .find({type: "account"})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.accountPaginationLimit)
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

module.exports = new Accounts();