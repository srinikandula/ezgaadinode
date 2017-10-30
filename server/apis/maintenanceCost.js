var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var maintenanceColl = require('./../models/schemas').MaintenanceCostColl;
var config = require('./../config/config');
var Helpers = require('./utils');

var MaintenanceCost = function () {
};

MaintenanceCost.prototype.addMaintenance = function (jwt, maintenanceDetails, callback) {
    var result = {};
    if (!_.isObject(maintenanceDetails) || _.isEmpty(maintenanceDetails)) {
        result.status = false;
        result.message = "Please fill all the required maintenance cost details";
        callback(result);
    } else if (!maintenanceDetails.vehicleNumber || !_.isString(maintenanceDetails.vehicleNumber)) {
        result.status = false;
        result.message = "Please provide valid vehicle number";
        callback(result);
    } else if (!maintenanceDetails.description || !_.isString(maintenanceDetails.description)) {
        result.status = false;
        result.message = "Please provide valid repair type";
        callback(result);
    } else if (!maintenanceDetails.cost || _.isNaN(maintenanceDetails.cost)) {
        result.status = false;
        result.message = "Please provide valid model and year";
        callback(result);
    } else {

        maintenanceDetails.createdBy = jwt.id;
        maintenanceDetails.updatedBy =  jwt.id;
        maintenanceDetails.accountId =  jwt.accountId;

        var maintenanceDoc = new maintenanceColl(maintenanceDetails);

        maintenanceDoc.save(function (err) {
            if (err) {
                result.status = false;
                result.message = "Error while adding Maintenance Cost, try Again";
                callback(result);
            } else {
                result.status = true;
                result.message = "Maintenance Cost Added Successfully";
                callback(result);
            }
        });
    }
};

MaintenanceCost.prototype.getAll = function (jwt, req, callback) {
    var result = {};
    maintenanceColl.find({}, function (err, maintenanceRecords) {
        if (err) {
            result.status = false;
            result.message = 'Error getting Maintenance Records';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.details = maintenanceRecords;
            callback(result);
        }
    });
};

MaintenanceCost.prototype.findMaintenanceRecord = function ( maintenanceId, callback) {
    var result = {};
    maintenanceColl.findOne({_id:maintenanceId}, function (err, record) {
        if(err) {
            result.status = false;
            result.message = "Error while finding Maintenance Record, try Again";
            callback(result);
        } else if(record) {
            result.status = true;
            result.message = "Maintenance Record found successfully";
            result.trip = record;
            callback(result);
        } else {
            result.status = false;
            result.message = "Maintenance Record is not found!";
            callback(result);
        }
    });
};

MaintenanceCost.prototype.updateMaintenanceCost = function (jwt, Details, callback) {
    var result = {};
    maintenanceColl.findOneAndUpdate({_id:Details._id},
        {$set:{
            "updatedBy":jwt.id,
            "vehicleNumber": Details.vehicleNumber,
            "repairType": Details.repairType,
            "cost": Details.cost,
            "date": Details.date
        }},
        {new: true},
        function (err, Details) {
            if(err) {
                result.status = false;
                result.message = "Error while updating Maintenance Cost Record, try Again";
                callback(result);
            }else if(Details) {
                result.status = true;
                result.message = "Maintenance Cost updated successfully";
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding Maintenance Record";
                callback(result);
            }
        });
};

MaintenanceCost.prototype.deleteMaintenanceRecord = function (maintenanceId, callback) {
    var result = {};
    maintenanceColl.remove({_id:maintenanceId}, function (err, returnValue) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting Maintenance Record';
            callback(result);
        }else if (returnValue.result.n === 0) {
            result.status = false;
            result.message = 'Error deleting Maintenance Record';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};

module.exports = new MaintenanceCost();