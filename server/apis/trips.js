var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var TripCollection = require('./../models/schemas').TripCollection;
var config = require('./../config/config');
var Helpers = require('./utils');
var Trips = function () {};

Trips.prototype.addTrip = function (jwt, tripDetails, callback) {
    var result = {};
    if (!_.isObject(tripDetails) || _.isEmpty(tripDetails)) {
        result.status = false;
        result.message = "Please fill all the required trip details";
        callback(result);
    } else {
        tripDetails.createdBy = jwt.id;
        tripDetails.updatedBy = jwt.id;
        tripDetails.accountId = jwt.accountId;
        var tripDoc = new TripCollection(tripDetails);
        tripDoc.save(function (err) {
            if (err) {
                result.status = false;
                result.message = "Error while adding trip, try Again";
                callback(result);
            } else {
                result.status = true;
                result.message = "Trip Added Successfully";
                callback(result);
            }
        });
    }
};

Trips.prototype.getAll = function (jwt, req, callback) {
    var result = {};
    TripCollection.find({}, (function (err, trips) {
        if (err) {
            result.status = false;
            result.message = "Error while finding trips, try Again";
            callback(result);
        } else {
            result.status = true;
            result.message = "Trips found Successfully";
            result.trips = trips;
            callback(result);
        }
    }));
};

module.exports = new Trips();