var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var UsersColl = require('./../models/schemas').UsersColl;

var config = require('./../config/config');
var Helpers = require('./utils');

var Users = function () {
};

Users.prototype.adduser = function (jwt, regDetails, callback) {
    var retObj = {};
    if (!_.isObject(regDetails) || _.isEmpty(regDetails)) {
        retObj.status = false;
        retObj.message = "Please fill all the required details";
        callback(retObj);
    } else if (!regDetails.firstName || !_.isString(regDetails.firstName)) {
        retObj.status = false;
        retObj.message = "Please provide valid first name";
        callback(retObj);
    } else if (!regDetails.lastName || !_.isString(regDetails.lastName)) {
        retObj.status = false;
        retObj.message = "Please provide valid last name";
        callback(retObj);
    } else if (!retObj.role) {
        retObj.status = false;
        retObj.message = "Please provide role";
        callback(retObj);
    } else if (!retObj.accountId || !_.isString(regDetails.accountId)) {
        retObj.status = false;
        retObj.message = "Please provide accountId";
        callback(retObj);
    } else if (!regDetails.password) {
        retObj.status = false;
        retObj.message = "Please provide valid password";
        callback(retObj);
    } else if (!retObj.updatedBy) {
        retObj.status = false;
        retObj.message = "Please provide updatedBy field";
        callback(retObj);
    } else if (!retObj.createdBy) {
        retObj.status = false;
        retObj.message = "Please provide createdBy field";
        callback(retObj);
    } else {
        UsersColl.findOne({username: regDetails.username}, function (err, user) {
            if (err) {
                retObj.status = false;
                retObj.message = "Error, try again!";
                callback(retObj);
            } else if (user) {
                retObj.status = false;
                retObj.message = "User already exists";
                callback(retObj);
            } else {
                regDetails.createdBy = jwt.id;
                regDetails.updatedBy = jwt.id;
                regDetails.accountId =   jwt.accountId;
                var insertDoc = new UsersColl(regDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = "Error, try Again";
                        callback(retObj);
                    } else {
                        console.log("inserted");
                        retObj.status = true;
                        retObj.message = "Successfully Added";
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Users.prototype.login = function (userName, accountName, password, callback) {
    var result = {};
    if (!_.isString(userName)) {
        result.status = false;
        result.message = 'Please type the username';
        callback(result);
    } else if (!_.isString(accountName)) {
        result.status = false;
        result.message = 'Please type the account name';
        callback(result);
    } else if (!_.isString(password) || !password.length) {
        result.status = false;
        result.message = 'Please type the password';
        callback(result);
    } else {
        var query = {
            userName: userName
        };
        UsersColl
            .findOne(query)
            .populate('accountId')
            .exec(function (err, user) {
                if (err) {
                    result.status = false;
                    result.message = "Error, try again!";
                    callback(result);
                } else if (!user) {
                    result.status = false;
                    result.message = "User doesn't exist";
                    callback(result);
                } else if ((user.password === password) && user.accountId && (user.accountId.name === accountName)) {
                    jwt.sign({
                        id: user._id,
                        accountId:user.accountId,
                        name: user.firstName,
                        email: user.email,
                        role: user.role
                    }, config.jwt.secret, config.jwt.options, function (err, token) {
                        if (err) {
                            result.status = false;
                            result.message = 'Please try again';
                            callback(result);
                        } else {
                            result.status = true;
                            result.message = "Success";
                            result.role = user.role;
                            result.token = token;
                            result.firstName = user.firstName;
                            callback(result);
                        }
                    });
                } else {
                    result.status = false;
                    result.message = "Invalid Credentials";
                    callback(result);
                }
            });
    }
};

Users.prototype.update = function (jwt, user, callback) {
    var result = {};
    UsersColl.findOne({userName: user.userName}).exec(function (err, savedUser) {
        if (err) {
            result.status = false;
            result.message = "Error, finding user";
            callback(result);
        } else if (!savedUser) {
            result.status = false;
            result.message = "User doesn't exist";
            callback(result);
        } else {
            savedUser.firstName = user.firstName || savedUser.firstName;
            savedUser.lastName = user.lastName || savedUser.lastName;
            savedUser.role = user.role || savedUser.role;
            savedUser.accountId = user.accountId || savedUser.accountId;
            savedUser.password = user.password || savedUser.password;
            savedUser.updatedBy = jwt.id;
            UsersColl(savedUser).save(function (err) {
                if (err) {
                    result.status = false;
                    result.message = 'Error updating user';
                    callback(result);
                } else {
                    result.status = true;
                    result.message = 'Success';
                    callback(result);
                }
            });
        }

    });
};

Users.prototype.getAccountUsers = function (id, callback) {
    var result = {};
    UsersColl.find({accountId:id},function (err, accountUsers) {
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

Users.prototype.deleteUSer = function (id, callback) {
    console.log('id',id);
    var result = {};
    UsersColl.remove({_id:id}, function (err) {
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