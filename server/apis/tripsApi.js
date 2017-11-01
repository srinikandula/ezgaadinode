var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var TripCollection = require('./../models/schemas').TripCollection;
var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var Trips = function () {
};

Trips.prototype.addTrip = function (jwt, tripDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    tripDetails = Utils.removeEmptyFields(tripDetails);
    if (!_.isObject(tripDetails) || _.isEmpty(tripDetails)) {
        retObj.messages.push("Please fill all the required trip details");
    }

    if (!tripDetails.date) {
        retObj.messages.push("Please add date");
    }

    if (!tripDetails.registrationNo) {
        retObj.messages.push("Please add Registration No");
    }

    if (!tripDetails.driver) {
        retObj.messages.push("Please add driver");
    }

    if (!tripDetails.bookedFor) {
        retObj.messages.push("Please add bookedFor");
    }

    if (!_.isNumber(tripDetails.freightAmount)) {
        retObj.messages.push("Please add Freight Amount");
    }

    if (!_.isNumber(tripDetails.advance)) {
        retObj.messages.push("Please add Advance");
    }

    if (!_.isNumber(tripDetails.balance)) {
        retObj.messages.push("Please add Balance");
    }

    if (!tripDetails.tripLane) {
        retObj.messages.push("Please add Trip Lane");
    }

    if (!_.isNumber(tripDetails.tripExpenses)) {
        retObj.messages.push('Please add tripExpenses');
    }
    if (!_.isNumber(tripDetails.bookLoad)) {
        retObj.messages.push('Please add bookLoad');
    }
    if (!_.isNumber(tripDetails.dieselAmount)) {
        retObj.messages.push('Please add dieselAmount');
    }
    if (!_.isNumber(tripDetails.tollgateAmount)) {
        retObj.messages.push('Please add tollgateAmount');
    }
    if (!tripDetails.from) {
        retObj.messages.push('Please add from');
    }
    if (!tripDetails.to) {
        retObj.messages.push('Please add to');
    }
    if (!_.isNumber(tripDetails.tonnage)) {
        retObj.messages.push('Please add tonnage');
    }
    if (!_.isNumber(tripDetails.rate)) {
        retObj.messages.push('Please add rate');
    }
    if (!tripDetails.paymentType) {
        retObj.messages.push('Please add paymentType');
    }
    if (!tripDetails.remarks) {
        retObj.messages.push('Please add remarks');
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        tripDetails.createdBy = jwt.id;
        tripDetails.updatedBy = jwt.id;
        tripDetails.accountId = jwt.accountId;

        var tripDoc = new TripCollection(tripDetails);
        tripDoc.save(function (err) {
            if (err) {
                retObj.messages.push("Error while adding trip, try Again");
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.messages.push("Trip Added Successfully");
                callback(retObj);
            }
        });
    }
};

Trips.prototype.findTrip = function (jwt, tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TripCollection.findOne({_id: tripId, accountId: jwt.accountId}, function (err, trip) {
        if (err) {
            retObj.messages.push("Error while finding trip, try Again");
            callback(retObj);
        } else if (trip) {
            retObj.status = true;
            retObj.messages.push("Trip found successfully");
            retObj.trip = trip;
            callback(retObj);
        } else {
            retObj.messages.push("Trip is not found!");
            callback(retObj);
        }
    });
};

Trips.prototype.updateTrip = function (jwt, tripDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    tripDetails = Utils.removeEmptyFields(tripDetails);

    TripCollection.findOneAndUpdate({_id: tripDetails._id},
        {$set: tripDetails},
        {new: true}, function (err, trip) {
            if (err) {
                retObj.messages.push("Error while updating Trip, try Again");
                callback(retObj);
            } else if (trip) {
                retObj.status = true;
                retObj.messages.push("Trip updated successfully");
                retObj.trip = trip;
                callback(retObj);
            } else {
                retObj.messages.push("Error, finding trip");
                callback(retObj);
            }
        });
};

Trips.prototype.getAll = function (jwt, req, pageNumber, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!pageNumber) {
        pageNumber = 1;
    }

    if (!_.isNumber(Number(pageNumber))) {
        retObj.messages.push('Invalid page number');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
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
                                Utils.populateNameInUsersColl(trips, "createdBy", function (response) {
                                    createdbyCallback(response.err, response.documents);
                                });
                            },
                            driversname: function (driversnameCallback) {
                                Utils.populateNameInDriversCollmultiple(trips, 'driver', 'fullName', function (response) {
                                    driversnameCallback(response.err, response.documents);
                                });
                            },
                            bookedfor: function (bookedforCallback) {
                                Utils.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                                    bookedforCallback(response.err, response.documents);
                                });
                            },
                            triplane: function (triplaneCallback) {
                                Utils.populateNameInTripLaneColl(trips, 'tripLane', function (response) {
                                    triplaneCallback(response.err, response.documents);
                                });
                            },
                            truckNo: function (truckscallback) {
                                Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
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
            if (err) {
                retObj.messages.push('Error retrieving users');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.count = results.count;
                retObj.trips = results.trips.createdbyname; //as trips is callby reference
                callback(retObj);
            }
        });
    }
};

Trips.prototype.deleteTrip = function (tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(tripId)) {
        retObj.messages.push('Invalid trip id');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        TripCollection.find({_id: tripId}, function (err) {
            if (err) {
                retObj.messages.push('No Trips Found');
                callback(retObj);
            } else {
                TripCollection.remove({_id: tripId}, function (err) {
                    if (err) {
                        retObj.messages.push('Error deleting trip');
                        callback(retObj);
                    } else {
                        retObj.messages.push('Success');
                        callback(retObj);
                    }
                })
            }
        });
    }
};

module.exports = new Trips();