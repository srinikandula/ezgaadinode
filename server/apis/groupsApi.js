var async = require('async');
var _ = require('underscore');

var Utils = require('./utils');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var pageLimits = require('./../config/pagination');
var GroupsColl = require('./../models/schemas').GroupsColl;
var analyticsService = require('./../apis/analyticsApi');

var serviceActions = require('./../constants/constants');

var Groups = function () {
};

Groups.prototype.addAccountGroup = function (jwtObj, accountGroupInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountGroupInfo.groupName) {
        retObj.messages.push('Invalid Group Name');
    }

  /*  if (!accountGroupInfo.password) {
        retObj.messages.push('Invalid password');
    }

    if (!accountGroupInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }
*/
    if (accountGroupInfo.truckIds.length <= 0) {
        retObj.messages.push('Please select at least one truck');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        GroupsColl.findOne({groupName: accountGroupInfo.groupName,accountId:jwtObj.accountId}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                analyticsService.create(req, serviceActions.add_acc_grp_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account Group with same Group Name already exists');
                analyticsService.create(req, serviceActions.add_acc_grp_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                accountGroupInfo.createdBy = jwtObj.id;
                accountGroupInfo.accountId = jwtObj.accountId;
                (new GroupsColl(accountGroupInfo)).save(function (err, savedAcc) {
                    if (err) {
                        console.log("log err",err)
                        retObj.messages.push('Error saving account'+JSON.stringify(err.message));
                        analyticsService.create(req, serviceActions.add_acc_grp_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        accountGroupInfo.accountId = savedAcc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.accountGroup = savedAcc;
                        analyticsService.create(req, serviceActions.add_acc_grp, {
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
Groups.prototype.getAllAccountGroups = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var query = {"accountId": jwt.accountId};
    async.parallel({
        accountGroup: function (accountGroupCallback) {
            GroupsColl
                .find(query)
                .populate("accountId")
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, accounts) {
                    accountGroupCallback(err, accounts);
                });
        },
        count: function (countCallback) {
            GroupsColl.count(query, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_all_acc_grps_err, {
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
            retObj.count = results.count;
            retObj.accountGroup = results.accountGroup;
            analyticsService.create(req, serviceActions.get_all_acc_grps, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};
Groups.prototype.countAccountGroups = function (jwt, req, callback) {
    var result = {};
    GroupsColl.count({"accountId": ObjectId(jwt.accountId)}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req, serviceActions.count_acc_grps_err, {
                accountId: req.jwt.id,
                success: false,
                messages: result.messages
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req, serviceActions.count_acc_grps, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        }
    })
};

Groups.prototype.getAccountGroup = function (accountGroupId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(accountGroupId)) {
        retObj.messages.push('Invalid accountGroupId');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_acc_grp_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        GroupsColl.findOne({"_id": ObjectId(accountGroupId)}).lean().exec(function (err, accountGroup) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                analyticsService.create(req, serviceActions.get_acc_grp_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (accountGroup) {
                retObj.status = true;
                retObj.messages.push('Success');
                accountGroup.confirmPassword = accountGroup.password;
                retObj.accountGroup = accountGroup;
                analyticsService.create(req, serviceActions.get_acc_grp, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_acc_grp_err, {
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

Groups.prototype.updateAccountGroup = function (jwtObj, accountGroupInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!Utils.isValidObjectId(accountGroupInfo._id)) {
        retObj.messages.push('Invalid account Group Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_acc_grp_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        accountGroupInfo.updatedBy = jwtObj.id;
        GroupsColl.findOneAndUpdate({_id: accountGroupInfo._id}, {$set: accountGroupInfo}, function (err, oldAcc) {
            if (err) {
                retObj.messages.push('Error updating the account group');
                analyticsService.create(req, serviceActions.update_acc_grp_err, {
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
                analyticsService.create(req, serviceActions.update_acc_grp, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account Group doesn\'t exist');
                analyticsService.create(req, serviceActions.update_acc_grp_err, {
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
};
module.exports = new Groups();