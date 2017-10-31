var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var TripLanesCollection = require('./../models/schemas').TripLanesCollection;
var config = require('./../config/config');
var Helpers = require('./utils');
var UsersAPI = require('./usersApi');
var pageLimits = require('./../config/pagination');

var TripLanes = function () {
};

TripLanes.prototype.addTripLane = function (jwt, tripLaneDetails, callback) {
    var result = {};
    if (!_.isObject(tripLaneDetails) || _.isEmpty(tripLaneDetails)) {
        result.status = false;
        result.message = "Please fill all the required trip Lane details";
        callback(result);
    } else if (!tripLaneDetails.name) {
        result.status = false;
        result.message = "Please enter trip name";
        callback(result);
    }
    else if (!tripLaneDetails.from) {
        result.status = false;
        result.message = "Please enter from location";
        callback(result);
    } else if (!tripLaneDetails.name) {
        result.status = false;
        result.message = "Please enter to location";
        callback(result);
    } else if (!tripLaneDetails.estimatedDistance) {
        result.status = false;
        result.message = "Please enter Estimated Distance";
        callback(result);
    }
    else {
        tripLaneDetails.createdBy = jwt.id;
        tripLaneDetails.updatedBy = jwt.id;
        tripLaneDetails.accountId = jwt.accountId;
        var tripLaneDoc = new TripLanesCollection(tripLaneDetails);
        tripLaneDoc.save(function (err) {
            if (err) {
                result.status = false;
                result.message = "Error while adding trip lanes, try Again";
                callback(result);
            } else {
                result.status = true;
                result.message = "Trip Lanes Added Successfully";
                callback(result);
            }
        });
    }
};

TripLanes.prototype.updateTripLane = function (jwt, tripLaneDetails, callback) {
    var result = {};
    TripLanesCollection.findOneAndUpdate({_id: tripLaneDetails._id},
        {
            $set: {
                "name": tripLaneDetails.name,
                "from": tripLaneDetails.from,
                "to": tripLaneDetails.to,
                "estimatedDistance": tripLaneDetails.estimatedDistance,
                "updatedBy": jwt.id
            }
        },
        {new: true}, function (err, tripLane) {
            if (err) {
                result.status = false;
                result.message = "Error while updating Trip Lane, try Again";
                result.error = err;
                callback(result);
            } else if (tripLane) {
                result.status = true;
                result.message = "Trip Lane updated successfully";
                result.tripLane = tripLane;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding trip lane";
                callback(result);
            }
        });
};

TripLanes.prototype.getAllTripLanes = function (callback) {
    var result = {};
    TripLanesCollection.find({}, function (err, triplanes) {
        if (err) {
            result.status = false;
            result.message = "Error while retrieving Trip Lanes, try Again";
            callback(result);
        } else {
            result.status = true;
            result.message = "Success";
            result.tripLanes = triplanes;
            callback(result);
        }
    })
};

TripLanes.prototype.getTripLanes = function (jwt, req, pageNumber, callback) {
    var result = {};
    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }
    var skipNumber = (pageNumber - 1) * pageLimits.triplanesPaginationLimit;
    async.parallel({
        triplanes: function (accountsCallback) {
            TripLanesCollection
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.triplanesPaginationLimit)
                .lean()
                .exec(function (err, triplanes) {
                    Helpers.populateNameInUsersColl(triplanes, "createdBy", function (response) {
                        if(response.status) {
                            accountsCallback(err, response.documents);
                        } else {
                            accountsCallback(err, null);
                        }
                    });
                });
        },
        count: function (countCallback) {
            TripLanesCollection.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.tripLanes = results.triplanes;
            callback(result);
        }
    });
};

TripLanes.prototype.findTripLane = function (jwt, tripLaneId, callback) {
    var result = {};
    TripLanesCollection.findOne({_id: tripLaneId, accountId: jwt.accountId}, function (err, tripLane) {
        if (err) {
            result.status = false;
            result.message = "Error while finding trip lane, try Again";
            callback(result);
        } else if (tripLane) {
            result.status = true;
            result.message = "Trip Lane found successfully";
            result.tripLane = tripLane;
            callback(result);
        } else {
            result.status = false;
            result.message = "Trip Lane is not found!";
            callback(result);
        }
    });
};

TripLanes.prototype.deleteTripLane = function (tripLaneId, callback) {
    var result = {};
    TripLanesCollection.find({_id: tripLaneId}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'No Trip Lanes Found';
            callback(result);
        } else {
            TripLanesCollection.remove({_id: tripLaneId}, function (err) {
                if (err) {
                    result.status = false;
                    result.message = 'Error deleting trip lanes';
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


module.exports = new TripLanes();