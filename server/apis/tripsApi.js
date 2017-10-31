var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var TripCollection = require('./../models/schemas').TripCollection;
var config = require('./../config/config');
var Helpers = require('./utils');
var Trips = function () {};

Trips.prototype.addTrip = function (jwt, tripDetails, callback) {
    var result = {};
    tripDetails = Helpers.removeEmptyFields(tripDetails);
    if (!_.isObject(tripDetails) || _.isEmpty(tripDetails)) {
        result.status = false;
        result.message = "Please fill all the required trip details";
        callback(result);
    } else if(!tripDetails.date){
        result.status = false;
        result.message = "Please add date";
        callback(result);
    } else if(!tripDetails.registrationNo){
        result.status = false;
        result.message = "Please add Registration No";
        callback(result);
    } else if(!tripDetails.driver){
        result.status = false;
        result.message = "Please add driver";
        callback(result);
    } else if(!tripDetails.bookedFor){
        result.status = false;
        result.message = "Please add bookedFor";
        callback(result);
    } else if(!tripDetails.freightAmount){
        result.status = false;
        result.message = "Please add Freight Amount";
        callback(result);
    } else if(!tripDetails.advance){
        result.status = false;
        result.message = "Please add Advance";
        callback(result);
    }  else if(!tripDetails.balance){
        result.status = false;
        result.message = "Please add Balance";
        callback(result);
    }  else if(!tripDetails.tripLane){
        result.status = false;
        result.message = "Please add Trip Lane";
        callback(result);
    }  else {
        tripDetails.createdBy = jwt.id;
        tripDetails.updatedBy = jwt.id;
        tripDetails.accountId = jwt.accountId;
        var tripDoc = new TripCollection(tripDetails);
        tripDoc.save(function (err) {
            console.log(err);
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

Trips.prototype.findTrip = function (jwt, tripId, callback) {
    var result = {};
    TripCollection.findOne({_id:tripId, accountId:jwt.accountId}, function (err, trip) {
        if(err) {
            result.status = false;
            result.message = "Error while finding trip, try Again";
            callback(result);
        } else if(trip) {
            result.status = true;
            result.message = "Trip found successfully";
            result.trip = trip;
            callback(result);
        } else {
            result.status = false;
            result.message = "Trip is not found!";
            callback(result);
        }
    });
};

Trips.prototype.updateTrip = function (jwt, tripDetails, callback) {
    var result = {};
    tripDetails = Helpers.removeEmptyFields(tripDetails);
    TripCollection.findOneAndUpdate({_id:tripDetails._id},
        {$set:tripDetails},
        {new: true}, function (err, trip) {
        console.log(err);
            if(err) {
                result.status = false;
                result.message = "Error while updating Trip, try Again";
                result.error = err;
                callback(result);
            } else if(trip) {
                result.status = true;
                result.message = "Trip updated successfully";
                result.trip = trip;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding trip";
                callback(result);
            }
        });
};

Trips.prototype.getAll = function (jwt, req, callback) {
    var result = {};
    TripCollection.find({},(function (err, trips) {
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

Trips.prototype.deleteTrip = function (tripId, callback) {
    var result = {};
    TripCollection.find({_id:tripId},function (err) {
        if (err) {
            result.status = false;
            result.message = 'No Trips Found';
            callback(result);
        } else {
            TripCollection.remove({_id: tripId}, function (err) {
                if (err) {
                    result.status = false;
                    result.message = 'Error deleting trip';
                    callback(result);
                } else {
                    result.status = true;
                    result.message = 'Success';
                    callback(result);
                }
            })
        }
    })
};

module.exports = new Trips();