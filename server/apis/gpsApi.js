var _ = require('underscore');
var async = require('async');

var GpsColl = require('./../models/schemas').GpsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var GpsColl = require('./../models/schemas').GpsColl;

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Gps = function () {
};

Gps.prototype.AddDevicePositions = function (position, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    position.location = {};
    position.location.coordinates = [position.longitude, position.latitude];
    var positionDoc = new GpsColl(position);
    positionDoc.save(function (err) {
        if (err) {
            retObj.messages.push('Error saving position');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
};

Gps.prototype.gpsTrackingByMapView = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null}}
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}}
    }

    TrucksColl.find(condition).populate({path: "deviceId", select: 'deviceId'}).exec(function (err, trucksData) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (trucksData) {

            var deviceList = _.pluck(_.pluck(trucksData, "deviceId"), "deviceId");
            GpsColl.aggregate([
                    {$match: {uniqueId: {$in: deviceList}}},
                    /*{"$sort": {"createdAt": -1}},*/
                    {
                        $group: {
                            _id: "$uniqueId",
                            latitude: {$last: "$latitude"},
                            longitude: {$last: "$longitude"},
                            altitude: {$last: "$altitude"},
                            name:{$last: "$name"}

                        }
                    }],
                function (err, devices) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        callback(retObj);
                    } else if (devices) {
                        retObj.status = true;
                        retObj.data = devices;
                        retObj.messages.push("success");
                        callback(retObj);
                    } else {
                        retObj.messages.push("Please try again");
                        callback(retObj);
                    }
                });

        } else {
            retObj.messages.push("Please try again");
            callback(retObj);
        }
    })

};

module.exports = new Gps();