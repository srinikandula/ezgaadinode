var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
var AccountsCollection = require('./../models/schemas').AccountsColl;

log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});
var config = require('./../config/config');

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


module.exports = new Groups();