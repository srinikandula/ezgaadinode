var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var NotificationColl = require("../models/schemas").NotificationColl;
var Utils = require("../apis/utils");

var Notifications = function () {
};

/* Author : Sravan G*/
Notifications.prototype.getNotifications = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    NotificationColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_notifications_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_notifications, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages = "No truck types found";
                analyticsService.create(req, serviceActions.get_notifications_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
};

/*author : Sravan G*/
Notifications.prototype.totalNumOfNotifications = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    NotificationColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting Notification Count');
            analyticsService.create(req, serviceActions.count_notifications_err, {
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
            console.log("Couht", retObj.data);
            analyticsService.create(req, serviceActions.count_notifications, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

module.exports = new Notifications();


