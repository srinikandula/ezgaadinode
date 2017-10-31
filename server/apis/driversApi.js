var _ = require('underscore');
var async = require('async');

var DriversColl = require('./../models/schemas').DriversColl;
var TrucksColl = require('./../models/schemas').TrucksColl;

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Drivers = function () {
};

Drivers.prototype.addDriver = function (jwtObj, driverInfo, callback) {
    var retObj = {};
    var errors = [];
    driverInfo = Utils.removeEmptyFields(driverInfo);
    if (!driverInfo.fullName || !_.isString(driverInfo.fullName)) {
        errors.push('Invalid full name');
    }

    if (!driverInfo.truckId || !Utils.isValidObjectId(driverInfo.truckId)) {
        errors.push('Invalid truckId');
    }

    if (!driverInfo.mobile || !Utils.isValidPhoneNumber(driverInfo.mobile)) {
        errors.push('Mobile number should be of ten digits');
    }

    if (!driverInfo.licenseValidity) {
        errors.push('Invalid license validity date, format should be in YYYY-MM-DD');
    }

    if (isNaN(Number(driverInfo.salary))) {
        errors.push('Invalid salary, should be a number');
    }

    if (errors.length) {
        retObj.status = false;
        retObj.message = errors;
        callback(retObj);
    } else {
        driverInfo.createdBy = jwtObj.id;
        driverInfo.accountId = jwtObj.accountId;
        driverInfo.mobile = Number(driverInfo.mobile);
        var today = new Date();
        driverInfo.driverId = "DR"+parseInt((Math.random()*100000)); // Need to fix this
        delete driverInfo.joiningDate;
        //check if there is a driver with matching mobile number or fullName in the account
        DriversColl.find({accountId :driverInfo.accountId,$or:[{"mobile":driverInfo.mobile},{"fullName":driverInfo.fullName}]}, function (err, drivers) {
            if (err) {
                retObj.status = false;
                retObj.message = ['Error fetching accounts'];
                callback(retObj);
            } else if (drivers && drivers.length > 0) {
                retObj.status = false;
                var duplicateFound = _.find(drivers, function (driver) {return driver.mobile === driverInfo.mobile;});
                if(duplicateFound){
                    var error = " Mobile number is used by other driver in the account";
                    retObj.message = retObj.message ?retObj.message+ error: error;
                }
                duplicateFound = _.find(drivers, function (driver) {return driver.fullName === driverInfo.fullName;})
                if(duplicateFound){
                    var error = " DUPLICATE!! Please choose a different name for the driver";
                    retObj.message = retObj.message ?retObj.message+ error: error;
                }
                callback(retObj);
            } else {
                var driverDoc = new DriversColl(driverInfo);
                driverDoc.save(driverInfo, function (err, newDoc) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = 'Error saving driver';
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.message = 'Success';
                        retObj.driver = newDoc;
                        //add changes to truck assginment to the driver
                        callback(retObj);
                    }
                });
            }
        });
    }
};


Drivers.prototype.getDriverByPageNumber = function (pageNum, callback) {
    var retObj = {};
    if (!pageNum) {
        pageNum = 1;
    } else if (isNaN(Number(pageNum))) {
        retObj.status = false;
        retObj.message = 'Invalid page number';
        return callback(retObj);
    }

    var skipNumber = (pageNum - 1) * pageLimits.driverPaginationLimit;
    async.parallel({
        drivers: function (driversCallback) {
            DriversColl
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.driverPaginationLimit)
                .populate('truckId')
                .lean()
                .exec(function (err, drivers) {
                    Utils.populateNameInUsersColl(drivers, "createdBy", function (response) {
                        if(response.status) {
                            driversCallback(err, response.documents);
                        } else {
                            driversCallback(err, null);
                        }
                    });
                    // driversCallback(err, drivers);
                });
        },
        count: function (countCallback) {
            DriversColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.message = 'Error retrieving accounts';
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.message = 'Success';
            retObj.count = results.count;
            retObj.drivers = results.drivers;
            callback(retObj);
        }
    });
};

Drivers.prototype.getDriverDetails = function (driverId, callback) {
    var retObj = {};
    if (!Utils.isValidObjectId(driverId)) {
        retObj.status = false;
        retObj.message = 'Invalid driverId';
        callback(retObj);
    } else {
        DriversColl.findOne({_id: driverId}, function (err, driver) {
            if (err) {
                retObj.status = false;
                retObj.message = 'Error retrieving driver';
                callback(retObj);
            } else if (driver) {
                retObj.status = true;
                retObj.message = 'Success';
                retObj.driver = driver;
                callback(retObj);
            } else {
                retObj.status = false;
                retObj.message = 'Driver with Id doesn\'t exist';
                callback(retObj);
            }
        });
    }
};

Drivers.prototype.updateDriver = function (jwtObj, driverInfo, callback) {
    var retObj = {};
    var errors = [];

    if (!driverInfo._id) {
        retObj.status = false;
        retObj.message = 'Invalid driverId';
        callback(retObj);
    } else {
        driverInfo.updatedBy = jwtObj.id;
        driverInfo.mobile = Number(driverInfo.mobile);
        DriversColl.find({
            accountId: driverInfo.accountId,
            _id: {$ne: driverInfo._id},
            $or: [{"mobile":driverInfo.mobile},{"fullName":driverInfo.fullName}]
        }, function (err, drivers) {
            console.log('driverLenth=>', drivers.length);
            if (err) {
                retObj.status = false;
                retObj.message = ['Error fetching accounts'];
                callback(retObj);
            } else if (!drivers.length) { // if no driver is found with the same phone number or full name
                DriversColl.findOneAndUpdate({_id: driverInfo._id}, driverInfo, {new: true}, function (err, oldDriver) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = 'Error saving driver';
                        callback(retObj);
                    } else if (oldDriver) {
                        retObj.status = true;
                        retObj.message = 'Success';
                        retObj.driver = oldDriver;
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.message = 'Driver does\'t exist';
                        callback(retObj);
                    }
                });
            } else {
                retObj.status = false;
                var duplicateFound = _.find(drivers, function (driver) {return driver.mobile === driverInfo.mobile;});
                if(duplicateFound){
                    var error = " Mobile number is used by other driver in the account";
                    retObj.message = retObj.message ?retObj.message+ error: error;
                }
                duplicateFound = _.find(drivers, function (driver) {return driver.fullName === driverInfo.fullName;})
                if(duplicateFound){
                    var error = " DUPLICATE!! Please choose a different name for the driver";
                    retObj.message = retObj.message ?retObj.message+ error: error;
                }
                callback(retObj);
            }
        });
    }
};

Drivers.prototype.getAllDrivers = function (callback) {
    var result = {};
    DriversColl.find({}, function (err, drivers) {
        if (err) {
            result.status = false;
            result.message = 'Error getting trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.drivers = drivers;
            callback(result);
        }
    });
};

Drivers.prototype.getAccountDrivers = function (accountId, callback) {
    var result = {};
    DriversColl.find({accountId:accountId}, function (err, drivers) {
        if (err) {
            result.status = false;
            result.message = 'Error getting account trucks';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.drivers = drivers;
            callback(result);
        }
    });
};

Drivers.prototype.deleteDriver = function (driverId, callback) {
    var result = {};
    DriversColl.remove({_id: driverId}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting Driver';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            callback(result);
        }
    });
};

module.exports = new Drivers();