var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var TrucksColl = require('./../models/schemas').TrucksColl;
var config = require('./../config/config');
var Helpers = require('./utils');

Trucks.prototype.addTruck = function (userid, truckDetails, callback) {
    var result = {};
    if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
        result.status = false;
        result.message = "Please fill all the required truck details";
        callback(result);
    } else if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
        result.status = false;
        result.message = "Please provide valid registration number";
        callback(result);
    } else if (!truckDetails.truckType || !_.isString(truckDetails.truckType)) {
        result.status = false;
        result.message = "Please provide valid Truck type";
        callback(result);
    } else if (!truckDetails.modelAndYear || !_.isString(truckDetails.modelAndYear)) {
        result.status = false;
        result.message = "Please provide valid model and year";
        callback(result);
    } else if (!truckDetails.fitnessExpiry) {
        result.status = false;
        result.message = "Please provide valid fitness expiry";
        callback(result);
    } else if (!truckDetails.permitExpiry) {
        result.status = false;
        result.message = "Please provide valid permit expiry";
        callback(result);
    } else if (!truckDetails.insuranceExpiry) {
        result.status = false;
        result.message = "Please provide valid insurance expiry";
        callback(result);
    } else if (!truckDetails.pollutionExpiry) {
        result.status = false;
        result.message = "Please provide valid pollution expiry";
        callback(result);
    } else if (!truckDetails.taxDueDate) {
        result.status = false;
        result.message = "Please provide valid tax duedate";
        callback(result);
    } else if (!truckDetails.accountId) {
        result.status = false;
        result.message = "Please provide valid accountId";
        callback(result);
    } else {
        TrucksColl.find({registrationNo: truckDetails.registrationNo}, function (err, truck) {
            if (err) {
                result.status = false;
                result.message = "Error, try again!";
                callback(result);
            } else if (truck) {
                result.status = false;
                result.message = "Truck already exists";
                callback(result);
            } else {
                truckDetails.createdBy = userid;
                truckDetails.updatedBy = userid;
                var truckDoc = new TrucksColl(truckDetails);
                truckDoc.save(function (err) {
                    if (err) {
                        result.status = false;
                        result.message = "Error while adding truck, try Again";
                        callback(result);
                    } else {
                        result.status = true;
                        result.message = "Truck Added Successfully";
                        callback(result);
                    }
                });
            }
        })
    }
};

Trucks.prototype.updateTruck = function (id, truckDetails, callback) {
    var result = {};
    TrucksColl.findOneAndUpdate({registrationNo: details.registrationNo}, function (err, truck) {
        if (err) {
            result.status = false;
            result.message = "Error while updating truck, try Again";
            callback(result);
        } else if (truck) {
            result.status = true;
            result.message = "Truck updated successfully";
            callback(result);
        } else {
            result.status = false;
            result.message = "Error, finding truck";
            callback(result);
        }
    });
};

Trucks.prototype.getAccountTrucks = function (id, callback) {
    var result = {};
    TrucksColl.find({accountId: id}, function (err, accountTrucks) {
        if (err) {
            result.status = false;
            result.message = 'Error getting trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.details = accountTrucks;
            callback(result);
        }
    });
};

Trucks.prototype.getAllTrucks = function (callback) {
    var result = {};
    TrucksColl.findAll(function (err, accountTrucks) {
        if (err) {
            result.status = false;
            result.message = 'Error getting trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.details = accountTrucks;
            callback(result);
        }
    });
};

Trucks.prototype.deleteTruck = function (id, callback) {
    var result = {};
    TrucksColl.remove({_id: id}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting truck';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};

var Trucks = function () {
};

module.exports = new Trucks();