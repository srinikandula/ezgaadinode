var async = require('async');
var _ = require('underscore');

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var AccountsColl = require('./../models/schemas').AccountsColl;
var UsersColl = require('./../models/schemas').UsersColl;

var Accounts = function () {
};

Accounts.prototype.addAccount = function (jwtObj, accountInfo, callback) {
    var retObj = {};

    if (!accountInfo.name || !_.isString(accountInfo.name)) {
        retObj.status = false;
        retObj.message = 'Invalid account name';
        callback(retObj);
    } else if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.status = false;
        retObj.message = 'Invalid user name';
        callback(retObj);
    } else if (!Utils.isValidPassword(accountInfo.password)) {
        retObj.status = false;
        retObj.message = 'Invalid password';
        callback(retObj);
    } else if (!Utils.isValidPhoneNumber(accountInfo.contact)) {
        retObj.status = false;
        retObj.message = 'Invalid contact number';
        callback(retObj);
    } else if (!accountInfo.address || !_.isString(accountInfo.address)) {
        retObj.status = false;
        retObj.message = 'Invalid Address';
        callback(retObj);
    } else {
        AccountsColl.findOne({name: accountInfo.name}, function (err, account) {
            if (err) {
                retObj.status = false;
                retObj.message = 'Error fetching account';
                callback(retObj);
            } else if (account) {
                retObj.status = false;
                retObj.message = 'Account with the name already exists';
                callback(retObj);
            } else {
                UsersColl.findOne({userName: accountInfo.userName}, function (err, user) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = 'Error fetching account';
                        callback(retObj);
                    } else if (user) {
                        retObj.status = false;
                        retObj.message = 'Username already exists';
                        callback(retObj);
                    } else {
                        accountInfo.createdBy = jwtObj.id;
                        (new AccountsColl(accountInfo)).save(function (err, savedAcc) {
                            if (err) {
                                retObj.status = false;
                                retObj.message = 'Error saving account';
                                callback(retObj);
                            } else {
                                accountInfo.accountId = savedAcc._id;
                                (new UsersColl(accountInfo)).save(function (err) {
                                    if (err) {
                                        retObj.status = false;
                                        retObj.message = 'Error saving user';
                                        callback(retObj);
                                    } else {
                                        retObj.status = true;
                                        retObj.message = 'Success';
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
    var retObj = {};
    if (!pageNum) {
        pageNum = 1;
    } else if (!_.isNumber(Number(pageNum))) {
        retObj.status = false;
        retObj.message = 'Invalid page number';
        return callback(retObj);
    }

    var skipNumber = (pageNum - 1) * pageLimits.accountPaginationLimit;
    async.parallel({
        accounts: function (accountsCallback) {
            AccountsColl
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.accountPaginationLimit)
                .lean()
                .exec(function (err, accounts) {
                    accountsCallback(err, accounts);
                });
        },
        count: function (countCallback) {
            AccountsColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.message = 'Error retrieving accounts';
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.message = 'Success';
            retObj.count = results.count;
            retObj.accounts = results.accounts;
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountDetails = function (accountId, callback) {
    var retObj = {};
    if (!Utils.isValidObjectId(accountId)) {
        retObj.status = false;
        retObj.message = 'Invalid accountId';
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: accountId}, function (err, account) {
            if (err) {
                retObj.status = false;
                retObj.message = 'Error retrieving account';
                callback(retObj);
            } else if (account) {
                retObj.status = true;
                retObj.message = 'Success';
                retObj.account = account;
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.message = 'Account with Id doesn\'t exist';
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccount = function (accountInfo, callback) {
    var retObj = {};
    if (!Utils.isValidObjectId(accountInfo._id)) {
        retObj.status = false;
        retObj.message = 'Invalid account Id';
        callback(retObj);
    } else {
        accountInfo.abc = '';
        accountInfo = Utils.removeEmptyFields(accountInfo);
        AccountsColl.findOneAndUpdate({_id: accountInfo._id}, {$set: accountInfo}, function (err, oldAcc) {
            if (err) {
                retObj.status = false;
                retObj.message = 'Error updating the account';
                callback(retObj);
            } else if (oldAcc) {
                retObj.status = true;
                retObj.message = 'Success';
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.message = 'Account doesn\'t exist';
                callback(retObj);
            }
        });
    }
};

module.exports = new Accounts();