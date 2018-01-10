var _ = require('underscore');
var async = require('async');

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
        if(err) {
            retObj.messages.push('Error saving position');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
};

module.exports = new Gps();