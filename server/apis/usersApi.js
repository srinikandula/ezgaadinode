var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var UsersColl = require('./../models/schemas').UsersColl;

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Users = function () {
};

Users.prototype.addUser = function (jwt, regDetails, callback) {
    var retObj = {};
    var errors = [];
    if (!_.isObject(regDetails) || _.isEmpty(regDetails)) {
        errors.push("Please fill all the required details");
    }
    if (!regDetails.firstName || !_.isString(regDetails.firstName)) {
        errors.push("Please provide valid first name");
    }
    if (!regDetails.lastName || !_.isString(regDetails.lastName)) {
        errors.push("Please provide valid last name");
    }
    if (!Utils.isEmail(regDetails.email)) {
        errors.push("Please provide valid email");
    }
    if (!regDetails.role) {
        errors.push("Please provide role");
    }
    // if (!regDetails.accountId || !_.isString(regDetails.accountId)) {
    //     errors.push("Please provide accountId");
    // }
    if (!regDetails.userName || !_.isString(regDetails.userName)) {
        errors.push("Please provide user name");
    }
    if (!regDetails.password) {
        errors.push("Please provide valid password");
    }
    if (errors.length) {
        retObj.status = false;
        retObj.message = errors;
        callback(retObj);
    } else {
        UsersColl.findOne({userName: regDetails.userName}, function (err, user) {
            if (err) {
                retObj.status = false;
                retObj.message = ["Error, try again!"];
                callback(retObj);
            } else if (user) {
                retObj.status = false;
                retObj.message = ["User already exists"];
                callback(retObj);
            } else {
                regDetails.createdBy = jwt.id;
                regDetails.updatedBy = jwt.id;
                regDetails.accountId = jwt.accountId;
                var insertDoc = new UsersColl(regDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = ["Error, try Again"];
                        callback(retObj);
                    } else {
                        console.log("inserted");
                        retObj.status = true;
                        retObj.message = ["Successfully Added"];
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Users.prototype.login = function (userName, accountName, password, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!_.isString(userName)) {
        retObj.messages.push('Please provide the username');
    }

    if (!_.isString(accountName)) {
        retObj.messages.push('Please provide account name');
    }

    if (!Utils.isValidPassword(password)) {
        retObj.messages.push('Please provide valid password');
    }

    if (retObj.messages.length) {
        return callback(retObj);
    } else {
        var query = {
            userName: userName
        };

        UsersColl
            .findOne(query)
            .populate('accountId')
            .exec(function (err, user) {
                console.log(err, user);
                if (err) {
                    retObj.messages.push('Error finding user');
                    callback(retObj);
                } else if (!user) {
                    retObj.messages.push("User doesn't exist");
                    callback(retObj);
                } else if ((user.password === password) && user.accountId && (user.accountId.name === accountName)) {
                    jwt.sign({
                        id: user._id,
                        accountId: user.accountId._id,
                        name: user.firstName,
                        email: user.email,
                        role: user.role
                    }, config.jwt.secret, config.jwt.options, function (err, token) {
                        if (err) {
                            retObj.messages.push('Please try again');
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages = ["Success"];
                            retObj.role = user.role;
                            retObj.token = token;
                            retObj.firstName = user.firstName;
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push("Invalid Credentials");
                    callback(retObj);
                }
            });
    }
};

Users.prototype.update = function (jwt, user, callback) {
    // console.log('user',user);
    var result = {};
    user = Utils.removeEmptyFields(user);
    user.updatedBy = jwt.id;
    user.accountId = jwt.accountId;
    UsersColl.findOneAndUpdate({_id: user._id}, {$set: user}).exec(function (err, savedUser) {
        console.log('err', err);
        console.log('savedUser', savedUser);
        if (err) {
            result.status = false;
            result.message = ["Error, updating user"];
            callback(result);
        } else if (savedUser) {
            result.status = true;
            result.message = ["User updated successfully"];
            callback(result);
        } else {
            result.status = false;
            result.message = ["Error, finding user"];
            callback(result);
        }

    });
};

Users.prototype.getAccountUsers = function (id, callback) {
    var result = {};
    UsersColl.find({accountId: id}, function (err, accountUsers) {
        if (err) {
            result.status = false;
            result.message = 'Error getting users';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.details = accountUsers;
            callback(result);
        }
    });
};

Users.prototype.getAllUsers = function (pageNumber, callback) {
    var result = {};
    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }
    var skipNumber = (pageNumber - 1) * pageLimits.usersPaginationLimit;
    async.parallel({
        users: function (accountsCallback) {
            UsersColl
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.usersPaginationLimit)
                .lean()
                .exec(function (err, users) {
                    Utils.populateNameInUsersColl(users, "createdBy", function (response) {
                        if (response.status) {
                            accountsCallback(err, response.documents);
                        } else {
                            accountsCallback(err, null);
                        }
                    });
                    // accountsCallback(err, users);
                });
        },
        count: function (countCallback) {
            UsersColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.users = results.users;
            callback(result);
        }
    });
};

Users.prototype.getUser = function (id, callback) {
    var result = {};
    UsersColl.findOne({_id: id}, function (err, user) {
        if (err) {
            result.status = false;
            result.message = 'Error getting user';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.user = user;
            // console.log('user',result);
            callback(result);
        }
    });
};

Users.prototype.getUserNames = function (ids, callback) {
    var result = {};
    UsersColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
        if (err) {
            result.status = false;
            result.message = 'Error getting user names';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.userNames = userNames;
            // console.log('user',result);
            callback(result);
        }
    });
};

Users.prototype.deleteUSer = function (id, callback) {
    console.log('id', id);
    var result = {};
    UsersColl.remove({_id: id}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting user';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};

module.exports = new Users();