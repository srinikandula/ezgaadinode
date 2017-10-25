var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var UsersColl = require('./../models/schemas').UsersColl;

var config = require('./../config/config');
var Helpers = require('./utils');

var Users = function () {
};

Users.prototype.signup = function (regDetails, callback) {
    console.log('regDetails', regDetails);
    var retObj = {};
    if (!_.isObject(regDetails) || _.isEmpty(regDetails)) {
        retObj.status = false;
        retObj.message = "Please fill all the required details";
        callback(retObj);
    } else if (!regDetails.firstName || !_.isString(regDetails.firstName)) {
        retObj.status = false;
        retObj.message = "Please provide valid firstName";
        callback(retObj);
    } else if (!regDetails.lastName || !_.isString(regDetails.lastName)) {
        retObj.status = false;
        retObj.message = "Please provide valid firstName";
        callback(retObj);
    } else if (!Helpers.isEmail(regDetails.email)) {
        retObj.status = false;
        retObj.message = "Please provide valid Email.";
        callback(retObj);
    } else if (!regDetails.password || !_.isString(regDetails.password)) {
        retObj.status = false;
        retObj.message = "Please provide valid passwords";
        callback(retObj);
    } else if (!Helpers.ispassword(regDetails.password)) {
        retObj.status = false;
        retObj.message = "Password length should be minimum 6";
        callback(retObj);
    } else if (regDetails.password !== regDetails.confirmPassword) {
        retObj.status = false;
        retObj.message = "Passwords are not matching";
        callback(retObj);
    } else {
        UsersColl.findOne({email: regDetails.email}, function (err, user) {
            if (err) {
                retObj.status = false;
                retObj.message = "Error, try again!";
                callback(retObj);
            } else if (user) {
                retObj.status = false;
                retObj.message = "User already exists";
                callback(retObj);
            } else {
                var insertDoc = new UsersColl(regDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = "Error, try Again";
                        callback(retObj);
                    } else {
                        console.log("inserted");
                        retObj.status = true;
                        retObj.message = "Successfully Registered";
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

Users.prototype.update =function (user, callback) {
    var result = {};
    UsersColl.findOne({username: user.username}).exec(function (err, savedUser) {
        if (err) {
            result.status = false;
            result.message = "Error, finding user";
            callback(result);
        } else if (!savedUser) {
            result.status = false;
            result.message = "User doesn't exist";
            callback(result);
        } else {
            /*
            firstName: String,
            lastName: String,
            role: String,
            accountId: {
                type: ObjectId, ref: 'accounts'
            },
            userName: {
                type: String,
                index: true,
                unique: true
            },
            password: String,
            updatedBy: String,
            createdBy: String,
            attrs: {}
             */
            savedUser.firstName = user.firstName || savedUser.firstName;
            savedUser.lastName = user.lastName || savedUser.lastName;
            savedUser.role = user.role || savedUser.role;
            savedUser.accountId = user.accountId || savedUser.accountId;
            savedUser.password = user.password || savedUser.password;
            //savedUser.updatedBy = ??
        }

    });
}

module.exports = new Users();