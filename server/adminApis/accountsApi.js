var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var Utils = require('./../apis/utils');
var mongoose = require('mongoose');
var pageLimits = require('./../config/pagination');
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/adminConstants');
var AccountsColl = require('./../models/schemas').AccountsColl;

const ObjectId = mongoose.Types.ObjectId;

var Accounts = function () {
};

Accounts.prototype.totalAccounts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_accounts_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = doc;
            analyticsService.create(req, serviceActions.count_accounts, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Accounts.prototype.getAccounts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.params;

    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var query = {"type": "account"};
    if (params.filter && params.filter.trim().length > 0) {
        query = {"userName": {$regex: params.filter.trim()}};
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
    }, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_accounts_err, {
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
            retObj.count = docs.count;
            retObj.data = docs.accounts;
            analyticsService.create(req, serviceActions.get_accounts, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.addAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body;

    if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.messages.push('Invalid User Name');
    }
    if (!accountInfo.password || accountInfo.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be at least 5 characters');
    }
    if (!accountInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        AccountsColl.findOne({userName: accountInfo.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account with same userName already exists');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                accountInfo.createdBy = req.jwt.id;
                accountInfo.type = "account";
                (new AccountsColl(accountInfo)).save(function (err, savedAcc) {
                    if (err) {
                        retObj.messages.push('Error saving account');
                        analyticsService.create(req, serviceActions.add_account_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        accountInfo.accountId = savedAcc._id;
                        accountInfo.type = "account";
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data=savedAcc;
                        analyticsService.create(req, serviceActions.add_account, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Accounts.prototype.getAccountDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountId = req.query.accountId;

    if (!Utils.isValidObjectId(accountId)) {
        retObj.messages.push('Invalid accountId');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_account_details_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({"_id": ObjectId(accountId)}, function (err, account) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                analyticsService.create(req, serviceActions.get_account_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.data = account;
                analyticsService.create(req, serviceActions.get_account_details, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_account_details_err, {
                    body: JSON.stringify(req.params),
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

Accounts.prototype.updateAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body;
    if (!Utils.isValidObjectId(accountInfo.accountId)) {
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
        analyticsService.create(req, serviceActions.update_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (accountInfo.oldPassword) {
            AccountsColl.findOne({
                _id: accountInfo.accountId,
                password: accountInfo.oldPassword
            }, function (err, oldAcc) {
                if (err) {
                    retObj.messages.push('Please Try Again');
                    analyticsService.create(req, serviceActions.update_account_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (oldAcc) {
                    accountInfo.password = accountInfo.newPassword;
                    updateAccounts(req, callback)
                } else {
                    retObj.messages.push('Invalid Password');
                    analyticsService.create(req, serviceActions.update_account_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            updateAccounts(req, callback)
        }
    }
};

function updateAccounts(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body;
    accountInfo.updatedBy = req.jwt.id;
    AccountsColl.findOneAndUpdate({_id: accountInfo.accountId}, {$set: accountInfo}, function (err, oldAcc) {
        if (err) {
            retObj.messages.push('Error updating the account');
            analyticsService.create(req, serviceActions.update_account_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldAcc) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data=oldAcc;
            analyticsService.create(req, serviceActions.update_account, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('Account doesn\'t exist');
            analyticsService.create(req, serviceActions.update_account_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Accounts.prototype.deleteAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var accountId = req.body.accountId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(accountId)) {
        retObj.messages.push('Invalid account id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req,serviceActions.delete_account_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        AccountsColl.remove({_id: accountId}, function (err,returnValue) {
            if (err) {
                retObj.messages.push('Error deleting account');
                analyticsService.create(req,serviceActions.delete_account_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting account Record');
                analyticsService.create(req, serviceActions.delete_account_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                analyticsService.create(req, serviceActions.delete_account, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
}

module.exports = new Accounts();