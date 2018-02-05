var async = require('async');
var _ = require('underscore');
var Utils = require('./../apis/utils');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var AccountsColl = require("../models/schemas").AccountsColl;

var Users = function () {
};

/*Author : SVPrasadK*/
Users.prototype.getUser = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.params;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (!params.contactName) {
            condition = {accountId: req.jwt.accountId}
        } else {
            condition = {accountId: req.jwt.accountId, role: {$regex: '.*' + params.role + '.*'}}
        }

        async.parallel({
            Users: function (usersCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, users) {
                        Utils.populateNameInUsersColl(users, "createdBy", function (response) {
                            if (response.status) {
                                usersCallback(err, response.documents);
                            } else {
                                usersCallback(err, null);
                            }
                        });
                    });
            },
            count: function (countCallback) {
                AccountsColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving user');
                analyticsService.create(req, serviceActions.get_user_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = docs.count;
                retObj.userId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.Users;
                analyticsService.create(req, serviceActions.get_user, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

/*Author : SVPrasadK*/
Users.prototype.addUser = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var userInfo = req.body;

    if (!userInfo.firstName || !_.isString(userInfo.firstName)) {
        retObj.messages.push('Invalid First Name');
    }
    if (!userInfo.lastName || !_.isString(userInfo.lastName)) {
        retObj.messages.push('Invalid Last Name');
    }
    if (!userInfo.password) {
        retObj.messages.push('Invalid Password');
    }
    if (!userInfo.confirmPassword) {
        retObj.messages.push('Invalid Confirm Password');
    }
    if (!userInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!userInfo.contactPhone || !_.isNumber(userInfo.contactPhone)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!userInfo.adminRoleId) {
        retObj.messages.push('Invalid Role');
    }
    if (!userInfo.franchiseId) {
        retObj.messages.push('Invalid Franchise');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_user_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        AccountsColl.findOne({email: userInfo.email}, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Error retrieving user');
                analyticsService.create(req, serviceActions.add_user_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                retObj.messages.push('User already exists');
                analyticsService.create(req, serviceActions.add_user_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                userInfo.createdBy = req.jwt.id;
                userInfo.accountId = req.jwt.id;
                userInfo.userName = userInfo.email;
                userInfo.contactName = userInfo.firstName + ' ' + userInfo.lastName;
                (new AccountsColl(userInfo)).save(function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error saving user');
                        analyticsService.create(req, serviceActions.add_user_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        userInfo.userId = doc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.add_user, {
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

/*Author : SVPrasadK*/
Users.prototype.getUserDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var UserId = req.query.userId;

    if (!Utils.isValidObjectId(UserId)) {
        retObj.messages.push('Invalid user id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_user_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({"_id": ObjectId(UserId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving user');
                analyticsService.create(req, serviceActions.get_user_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_user, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('user with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_user_err, {
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

/*Author : SVPrasadK*/
Users.prototype.updateUser = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var userInfo = req.body;

    if (!Utils.isValidObjectId(userInfo.userId)) {
        retObj.messages.push('Invalid user Id');
    }
    if (!userInfo.firstName || !_.isString(userInfo.firstName)) {
        retObj.messages.push('Invalid First Name');
    }
    if (!userInfo.lastName || !_.isString(userInfo.lastName)) {
        retObj.messages.push('Invalid Last Name');
    }
    if (!userInfo.password) {
        retObj.messages.push('Invalid Password');
    }
    if (!userInfo.confirmPassword) {
        retObj.messages.push('Invalid Confirm Password');
    }
    if (!userInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!userInfo.contactPhone || !_.isNumber(userInfo.contactPhone)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!userInfo.adminRoleId) {
        retObj.messages.push('Invalid Role');
    }
    if (!userInfo.franchiseId) {
        retObj.messages.push('Invalid Franchise');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_user_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({
            _id: userInfo.userId,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_user_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                userInfo.updatedBy = req.jwt.id;
                userInfo.contactName = userInfo.firstName + ' ' + userInfo.lastName;
                userInfo.userName = userInfo.email;
                AccountsColl.findOneAndUpdate({_id: userInfo.userId}, {$set: userInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the user');
                        analyticsService.create(req, serviceActions.update_user_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else if (doc) {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.update_user, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('User with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_user_err, {
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
                retObj.messages.push('User with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_user_err, {
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

/*Author : SVPrasadK*/
Users.prototype.deleteUser = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var UserId = req.body.userId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(UserId)) {
        retObj.messages.push('Invalid user id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_user_err, {
            body: JSON.stringify(req.params),
            UserId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.remove({_id: UserId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting user');
                analyticsService.create(req, serviceActions.delete_user_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting user');
                analyticsService.create(req, serviceActions.delete_user_err, {
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

module.exports = new Users();