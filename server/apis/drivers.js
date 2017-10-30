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

    if (!_.isObject(driverInfo.salary) || isNaN(Number(driverInfo.salary.value))) {
        errors.push('Invalid salary, should be a number');
    }

    if (errors.length) {
        retObj.status = false;
        retObj.message = errors;
        callback(retObj);
    } else {
        driverInfo.createdBy = jwtObj.id;

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
                                    callback(retObj);
                                }
                            });
                        } else {
                            var mobileIndex = _.findIndex(drivers, {mobile: driverInfo.mobile});
                            var fullNameIndex = _.findIndex(drivers, {fullName: driverInfo.fullName});

                            if (mobileIndex > -1) {
                                errors.push('Mobile number already exists with that accountId');
                            }

                            if (fullNameIndex > -1) {
                                errors.push('Driver name already exists');
                            }

                            if (errors.length) {
                                retObj.status = false;
                                retObj.message = errors;
                                callback(retObj);
                            } else {
                                DriversColl.update({truckId: driverInfo.truckId}, driverInfo, {upsert: true}, function (err) {
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
                    driversCallback(err, drivers);
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

Drivers.prototype.updateDriver = function (jwtObj, driver, callback) {
    var retObj = {};
    var errors = [];

    if (!driver._id) {
        retObj.status = false;
        retObj.message = 'Invalid driverId';
        callback(retObj);
    } else {
        driver.updatedBy = jwtObj.id;

        DriversColl.find({
            accountId: driver.accountId,
            _id: {$ne: driver._id}
        }, function (err, drivers) {
            console.log('driverLenth=>', drivers.length);
            if (err) {
                retObj.status = false;
                retObj.message = ['Error fetching accounts'];
                callback(retObj);
            } else if (!drivers.length) {
                DriversColl.findOneAndUpdate({_id: driver._id}, driver, function (err, oldDriver) {
                    console.log('--->', err);
                    if (err) {
                        retObj.status = false;
                        retObj.message = ['Error saving driver'];
                        callback(retObj);
                    } else if (oldDriver) {
                        retObj.status = true;
                        retObj.message = ['Success'];
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.message = ['Driver does\'t exist'];
                        callback(retObj);
                    }
                });
            } else {
                var mobileIndex = _.findIndex(drivers, {mobile: Number(driver.mobile)});
                var fullNameIndex = _.findIndex(drivers, {fullName: driver.fullName});

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
                    driver = Utils.removeEmptyFields(driver);
                    DriversColl.findOneAndUpdate({_id: driver._id}, {$set: driver}, function (err) {
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