var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
var AccountsCollection = require('./../models/schemas').AccountsColl;
var OtpColl = require('./../models/schemas').OtpColl;

log4js.configure(__dirname + '/../config/log4js_config.json', { reloadSecs: 60 });
var config = require('./../config/config');

var config_msg91 = config.msg91;
console.log('sds',config);
var msg91 = require("msg91")(config_msg91.auth_Key, config_msg91.sender_id, config_msg91.route);

var Groups = function () {
};

Groups.prototype.login = function (userName, password, contactPhone, callback) {
    logger.info("logging in user:" + userName);
    var retObj = {
        status: false,
        messages: []
    };

    if (!userName) {
        retObj.messages.push('Please provide the Username');
    }

    if (!password) {
        retObj.messages.push('Please provide valid Password');
    }

    if (!contactPhone) {
        retObj.messages.push('Please provide Mobile Number');
    }

    if (retObj.messages.length) {
        return callback(retObj);
    } else {
        var query = {
            userName: userName,
            password: password,
            contactPhone: parseInt(contactPhone),
        };
        AccountsCollection
            .findOne(query)
            .exec(function (err, user) {
                if (err) {
                    retObj.messages.push('Error finding user');
                    callback(retObj);
                } else if (!user) {
                    retObj.messages.push("User doesn't exist");
                    callback(retObj);
                } else if ((user.password === password)) {
                    jwt.sign({
                        id: user._id,
                        accountId: user._id,
                        userName: user.userName,
                        contactPhone: user.contactPhone,
                        type: user.type
                    }, config.jwt.secret, config.jwt.options, function (err, token, options) {
                        if (err) {
                            retObj.messages.push('Please try again');
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj._id = user._id;
                            retObj.token = token;
                            retObj.userName = userName;
                            retObj.gpsEnabled = user.gpsEnabled;
                            retObj.erpEnabled = user.erpEnabled;
                            retObj.loadEnabled = user.loadEnabled;
                            retObj.editAccounts = user.editAccounts;
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

Groups.prototype.forgotPassword = function (contactPhone, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!contactPhone || !/^\d{10}$/.test(contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else {
        AccountsCollection.findOne({ contactPhone: contactPhone }, function (err, data) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Error finding user");
                callback(retObj);
            } else if (data) {
                var d = new Date();
                d.setMinutes(d.getMinutes() + 6);
                var otp = Math.floor(100000 + Math.random() * 9000);
                var otpCollection = new OtpColl({
                    otp: otp,
                    contactPhone: contactPhone,
                    accountId: data._id,
                    expaireIn: new Date(d) - 0
                });
                otpCollection.save(function (err, otpData) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push("Error finding user");
                        callback(retObj);
                    } else if (otpData) {
                        var message = 'Hi, ' + data.userName + ' \n Your one time password for EasyGaadi is : ' + otp;
                        msg91.send(contactPhone, message, function (err, response) {
                            if (err) {
                                retObj.status = false;
                                retObj.messages.push("Error finding user");
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push("OTP sent successfully");
                                retObj.otp = otp;
                                callback(retObj);
                            }
                        });

                    } else {
                        retObj.status = false;
                        retObj.messages.push("Error finding user");
                        callback(retObj);
                    }
                })

            } else {
                retObj.status = false;
                retObj.messages = "Phone number not found";
                callback(retObj);
            }

        })
    }
};

Groups.prototype.verifyOtp = function (body, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!body.contactPhone || !/^\d{10}$/.test(body.contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else if (!body.otp) {
        retObj.status = false;
        retObj.messages.push("Please enter OTP");
        callback(retObj);
    } else {
        OtpColl.findOne({ contactPhone: body.contactPhone, otp: body.otp }, function (err, data) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Error while verifying OTP");
                callback(retObj);
            } else if (data) {
                retObj.status = true;
                retObj.messages.push("OTP verified successfully");
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.messages.push("Please enter valid OTP");
                callback(retObj);
            }
        })
    }
}

Groups.prototype.resetPasword = function (body, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!body.contactPhone || !/^\d{10}$/.test(body.contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else if (!body.password) {
        retObj.status = false;
        retObj.messages.push("Please enter password");
        callback(retObj);
    } else {
        AccountsCollection.findOneAndUpdate(
            { contactPhone: body.contactPhone },{password: body.password}, function (err, data) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push("Error while reset password");
                    callback(retObj);
                } else if (data) {
                    OtpColl.findOneAndRemove({ contactPhone: body.contactPhone }, function (err, otpData) {
                        if (err) {
                            retObj.status = false;
                            retObj.messages.push("Error while reset password");
                            callback(retObj);
                        } else if (otpData) {
                            retObj.status = true;
                            retObj.messages.push("Your Password reseted sucessfully");
                            callback(retObj);
                        } else {
                            retObj.status = false;
                            retObj.messages.push("Error while reset password");
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = false;
                    retObj.messages.push("Error while reset password");
                    callback(retObj);
                }
            })

    }
}
module.exports = new Groups();