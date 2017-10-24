var _ = require('underscore');

var Utils = require('./utils');
var AccountsColl = require('./../models/schemas').AccountsColl;
var UsersColl = require('./../models/schemas').UsersColl;

var Accounts = function () {
};

Accounts.prototype.addAccount = function (jwtObj, accountInfo, callback) {
    var retObj = {};

    if (!_.isString(accountInfo.name)) {
        retObj.status = false;
        retObj.message = 'Invalid account name';
        callback(retObj);
    } else if (!_.isString(accountInfo.userName)) {
        retObj.status = false;
        retObj.message = 'Invalid user name';
        callback(retObj);
    } else if (!Utils.isValidPassword(accountInfo.password)) {
        retObj.status = false;
        retObj.message = 'Invalid password';
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

module.exports = new Accounts();