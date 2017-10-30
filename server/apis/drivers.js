var _ = require('underscore');

var DriversColl = require('./../models/schemas').DriversColl;
var TrucksColl = require('./../models/schemas').TrucksColl;

var Utils = require('./utils');
var Drivers = function () {
};

Drivers.prototype.addDriver = function (driverInfo, callback) {
    var retObj = {};
    var errors = [];
    if (!driverInfo.fullName || !_.isString(driverInfo.fullName)) {
        errors.push('Invalid full name');
    }

    if (!driverInfo.truckId || !Utils.isValidObjectId(driverInfo.truckId)) {
        errors.push('Invalid truckId');
    }

    if (!driverInfo.mobile || !Utils.isValidPhoneNumber(driverInfo.mobile)) {
        errors.push('Mobile number should be of ten digits');
    }

    if (!Utils.isValidDateStr(driverInfo.licenseValidity) || (new Date() > new Date(driverInfo.licenseValidity))) {
        errors.push('Invalid license validity date, format should be in YYYY-MM-DD');
    }

    if (!_.isObject(driverInfo.salary) || isNaN(Number(driverInfo.salary.value))) {
        errors.push('Invalid salary, should be a number');
    }

    if (errors.length) {
        retObj.status = false;
        retObj.message = errors;
        callback(retObj);
    } else {
        driverInfo.licenseValidity = new Date(driverInfo.licenseValidity) - 0;

        TrucksColl.findById(driverInfo.truckId, function (err, truck) {
            if (err) {
                retObj.status = false;
                retObj.message = ['Error fetching truck'];
                callback(retObj);
            } else if (!truck.accountId) {
                retObj.status = false;
                retObj.message = ['No valid account Id for truck'];
                callback(retObj)
            } else {
                driverInfo.accountId = truck.accountId;
                driverInfo.mobile = Number(driverInfo.mobile);
                delete driverInfo.joiningDate;

                DriversColl.find({accountId: driverInfo.accountId}, function (err, drivers) {
                        if (err) {
                            retObj.status = false;
                            retObj.message = ['Error fetching accounts'];
                            callback(retObj);
                        } else if (!drivers.length) {
                            DriversColl.update({truckId: driverInfo.truckId}, driverInfo, {upsert: true}, function (err) {
                                if (err) {
                                    retObj.status = false;
                                    retObj.message = ['Error saving driver'];
                                    callback(retObj);
                                } else {
                                    retObj.status = true;
                                    retObj.message = ['Success'];
                                }
                            });
                        } else {
                            var mobileIndex = _.findIndex(drivers, {mobile: driverInfo.mobile});
                            var fullNameIndex = _.findIndex(drivers, {fullName: driverInfo.fullName});

                            if (mobileIndex > -1) {
                                errors.push('Mobile number already exists with that accountId');
                            }

                            if (fullNameIndex > -1) {
                                errors.push('Full name already exists');
                            }

                            if (errors.length) {
                                retObj.status = false;
                                retObj.message = errors;
                                callback(retObj);
                            } else {
                                DriversColl.update({truckId: driverInfo.truckId}, driverInfo, {upsert:true}, function (err) {
                                    if (err) {
                                        retObj.status = false;
                                        retObj.message = ['Error saving driver'];
                                        callback(retObj);
                                    } else {
                                        retObj.status = true;
                                        retObj.message = ['Success'];
                                        callback(retObj);
                                    }
                                });
                            }
                        }
                    }
                );
            }
        });
    }
};
Drivers.prototype.getAllDrivers = function (callback) {
    var result = {};
    DriversColl.find({},function (err, drivers) {
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

Drivers.prototype.findDriver = function (driverId, callback) {
    var result = {};
    DriversColl.findOne({_id:driverId}, function (err, driver) {
        if (err) {
            result.status = false;
            result.message = "Error while finding driver, try Again";
            callback(result);
        } else if (driver) {
            result.status = true;
            result.message = "Driver found successfully";
            result.driver = driver;
            callback(result);
        } else {
            result.status = false;
            result.message = "Driver is not found!";
            callback(result);
        }
    });
};

Drivers.prototype.updateDriver = function (jwt, driverDetails, callback) {
    var result = {};
    DriversColl.findOneAndUpdate({_id: driverDetails._id},
        {
            $set: {
                "truckId": driverDetails.truckId,
                "updatedBy": jwt.id,
                "licenseValidity": driverDetails.licenseValidity,
                "mobile": driverDetails.mobile,
                "fullName": driverDetails.fullName,
                "salary": { "value": driverDetails.salary.value },
                "joiningDate": driverDetails.joiningDate
            }
        },
        {new: true}, function (err, driver) {
            if (err) {
                result.status = false;
                result.message = "Error while updating driver, try Again";
                callback(result);
            } else if (driver) {
                result.status = true;
                result.message = "Driver updated successfully";
                result.driver = driver;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding driver";
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