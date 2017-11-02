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
    var retObj = {
        status: false,
        messages: []
    };

    if (!_.isObject(regDetails) || _.isEmpty(regDetails)) {
        retObj.messages.push("Please fill all the required details");
    }

    if (!regDetails.firstName || !_.isString(regDetails.firstName)) {
        retObj.messages.push("Please provide valid first name");
    }

    if (!regDetails.lastName || !_.isString(regDetails.lastName)) {
        retObj.messages.push("Please provide valid last name");
    }

    if (!Utils.isEmail(regDetails.email)) {
        retObj.messages.push("Please provide valid email");
    }

    if (!regDetails.role) {
        retObj.messages.push("Please provide role");
    }

    if (!regDetails.userName || !_.isString(regDetails.userName)) {
        retObj.messages.push("Please provide user name");
    }

    if (!regDetails.password) {
        retObj.messages.push("Please provide valid password");
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        UsersColl.findOne({userName: regDetails.userName}, function (err, user) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (user) {
                retObj.messages.push("User already exists");
                callback(retObj);
            } else {
                regDetails.createdBy = jwt.id;
                regDetails.updatedBy = jwt.id;
                regDetails.accountId = jwt.accountId;

                var insertDoc = new UsersColl(regDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.messages.push("Error, try Again");
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Successfully Added");
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
                            retObj.messages.push("Success");
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
    var retObj = {
        status: false,
        messages: []
    };

    user = Utils.removeEmptyFields(user);
    user.updatedBy = jwt.id;
    user.accountId = jwt.accountId;

    UsersColl.findOneAndUpdate({_id: user._id}, {$set: user}).exec(function (err, savedUser) {
        if (err) {
            retObj.messages.push("Error, updating user");
            callback(retObj);
        } else if (savedUser) {
            retObj.status = true;
            retObj.messages.push("User updated successfully");
            callback(retObj);
        } else {
            retObj.messages.push("Error, finding user");
            callback(retObj);
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
    var retObj = {
        status: false,
        messages: []
    };

    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        retObj.messages.push('Invalid page number');
        return callback(retObj);
    }

    var skipNumber = (pageNumber - 1) * pageLimits.usersPaginationLimit;
    async.parallel({
        users: function (usersCallback) {
            UsersColl
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.usersPaginationLimit)
                .lean()
                .exec(function (err, users) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Utils.populateNameInUsersColl(users, "createdBy", function (response) {
                                createdbyCallback(response.err,response.documents);
                            });
                        },
                        rolesNames: function (rolesCallback) {
                            Utils.populateNameInRolesColl(users, "role", function (response) {
                                rolesCallback(response.err,response.documents);
                            });
                        }
                        // rolesname:
                    }, function (populateErr, populateResults) {
                        usersCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            UsersColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving users');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.users = results.users.createdbyname;
            callback(retObj);
        }
    });
};

Users.prototype.getUser = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    UsersColl.findOne({_id: id}, function (err, user) {
        if (err) {
            retObj.messages.push('Error getting user');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.user = user;
            callback(retObj);
        }
    });
};

Users.prototype.deleteUSer = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    UsersColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error deleting user');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
};

module.exports = new Users();