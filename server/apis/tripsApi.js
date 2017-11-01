var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var TripCollection = require('./../models/schemas').TripCollection;
var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
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
    } else if(!_.isNumber(tripDetails.freightAmount)){
        result.status = false;
        result.message = "Please add Freight Amount";
        callback(result);
    } else if(!_.isNumber(tripDetails.advance)){
        result.status = false;
        result.message = "Please add Advance";
        callback(result);
    }  else if(!_.isNumber(tripDetails.balance)){
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

Trips.prototype.getAll = function (jwt, req, pageNumber, callback) {
    var result = {};
    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }
    var skipNumber = (pageNumber - 1) * pageLimits.tripsPaginationLimit;
    async.parallel({
        trips: function (tripsCallback) {
            TripCollection
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.tripsPaginationLimit)
                .lean()
                .exec(function (err, trips) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Helpers.populateNameInUsersColl(trips, "createdBy", function (response) {
                                createdbyCallback(response.err,response.documents);
                            });
                        },
                        driversname: function (driversnameCallback) {
                            Helpers.populateNameInDriversCollmultiple(trips, 'driver', 'fullName', function (response) {
                                driversnameCallback(response.err, response.documents);
                            });
                        },
                        bookedfor: function (bookedforCallback) {
                            Helpers.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                                bookedforCallback(response.err, response.documents);
                            });
                        },
                        triplane: function (triplaneCallback) {
                            Helpers.populateNameInTripLaneColl(trips, 'tripLane', function (response) {
                                triplaneCallback(response.err, response.documents);
                            });
                        },
                        truckNo: function (truckscallback) {
                            Helpers.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                                truckscallback(response.err, response.documents);
                            })
                        }
                    }, function (populateErr, populateResults) {
                        tripsCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            TripCollection.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        console.log(err);
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.trips = results.trips.createdbyname; //as trips is callby reference
            callback(result);
        }
    });
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