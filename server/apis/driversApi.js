var _ = require('underscore');
var async = require('async');

var DriversColl = require('./../models/schemas').DriversColl;
var TrucksColl = require('./../models/schemas').TrucksColl;

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Drivers = function () {
};

Drivers.prototype.addDriver = function (jwt, driverInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var errors = [];

    driverInfo = Utils.removeEmptyFields(driverInfo);
    if (!driverInfo.fullName || !_.isString(driverInfo.fullName)) {
        retObj.messages.push('Invalid full name');
    }
    /*
    if (!driverInfo.truckId || !Utils.isValidObjectId(driverInfo.truckId)) {
        console.log('----->', driverInfo.truckId);
        retObj.messages.push('Invalid truckId');
    }

    if (!driverInfo.mobile || !Utils.isValidPhoneNumber(driverInfo.mobile)) {
        retObj.messages.push('Mobile number should be of ten digits');
    }

    if (!driverInfo.licenseValidity) {
        retObj.messages.push('Invalid license validity date, format should be in YYYY-MM-DD');
    }

    if (isNaN(Number(driverInfo.salary))) {
        retObj.messages.push('Invalid salary, should be a number');
    }*/

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        if (jwt.type === "account") {
            driverInfo.createdBy = jwt.id;
            driverInfo.accountId = jwt.accountId;
        } else {
            driverInfo.createdBy = jwt.id;
            driverInfo.groupId = jwt.id;
            driverInfo.accountId = jwt.accountId;
        }
        driverInfo.mobile = Number(driverInfo.mobile);
        var today = new Date();
        driverInfo.driverId = "DR" + parseInt((Math.random() * 100000)); // Need to fix this
        delete driverInfo.joiningDate;

        //check if there is a driver with matching mobile number or fullName in the account
        DriversColl.find({
            accountId: driverInfo.accountId,
            $or: [{"mobile": driverInfo.mobile}, {"fullName": driverInfo.fullName}]
        }, function (err, drivers) {
            if (err) {
                retObj.messages.push('Error fetching accounts');
                callback(retObj);
            } else if (drivers && drivers.length > 0) {
                var duplicateFound = _.find(drivers, function (driver) {
                    return driver.mobile === driverInfo.mobile;
                });

                if (duplicateFound) {
                    retObj.messages.push('Mobile number is used by other driver in the account');
                }

                duplicateFound = _.find(drivers, function (driver) {
                    return driver.fullName === driverInfo.fullName;
                });

                if (duplicateFound) {
                    retObj.messages.push(" DUPLICATE!! Please choose a different name for the driver");
                }

                callback(retObj);
            } else {
                var driverDoc = new DriversColl(driverInfo);
                driverDoc.save(driverInfo, function (err, newDoc) {
                    if (err) {
                        retObj.messages.push('Error saving driver');
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.driver = newDoc;
                        Utils.cleanUpTruckDriverAssignment(jwt, newDoc.truckId, newDoc._id);
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Drivers.prototype.getDrivers= function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }
     if (retObj.messages.length) {
        callback(retObj);
    } else {
        if (jwt.type = "account") {
            var skipNumber = (params.page - 1) * params.size;
            var limit = params.size? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) :{};
            async.parallel({
                drivers: function (driversCallback) {
                    DriversColl
                        .find({"accountId": jwt.accountId})
                        .sort(sort)
                        .skip(skipNumber)
                        .limit(limit)
                        .populate('truckId')
                        .lean()
                        .exec(function (err, drivers) {
                            Utils.populateNameInUsersColl(drivers, "createdBy", function (response) {
                                if (response.status) {
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
                    retObj.messages.push('Error retrieving accounts');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = results.count;
                    retObj.drivers = results.drivers;
                    callback(retObj);
                }
            });
        }
        else {
            var skipNumber = (params.page - 1) * params.size;
            async.parallel({
                drivers: function (driversCallback) {
                    DriversColl
                        .find({"accountId": jwt.accountId, "groupId": jwt.id})
                        .sort({createdAt: 1})
                        .skip(skipNumber)
                        .limit(pageLimits.driverPaginationLimit)
                        .populate('truckId')
                        .lean()
                        .exec(function (err, drivers) {
                            Utils.populateNameInUsersColl(drivers, "createdBy", function (response) {
                                if (response.status) {
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
                    retObj.messages.push('Error retrieving accounts');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = results.count;
                    retObj.drivers = results.drivers;
                    callback(retObj);
                }
            });
        }
    }
};

Drivers.prototype.getDriverDetails = function (jwt, driverId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(driverId)) {
        retObj.messages.push('Invalid driverId');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        DriversColl.findOne({_id: driverId, accountId: jwt.accountId}, function (err, driver) {
            if (err) {
                retObj.messages.push('Error retrieving driver');
                callback(retObj);
            } else if (driver) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.driver = driver;
                callback(retObj);
            } else {
                retObj.messages.push('Driver with Id doesn\'t exist');
                callback(retObj);
            }
        });
    }
};

Drivers.prototype.updateDriver = function (jwt, driverInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!driverInfo._id) {
        retObj.messages.push('Invalid driverId');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        driverInfo.updatedBy = jwt.id;
        driverInfo.mobile = Number(driverInfo.mobile);

        DriversColl.find({
            accountId: driverInfo.accountId,
            _id: {$ne: driverInfo._id},
            $or: [{"mobile": driverInfo.mobile}, {"fullName": driverInfo.fullName}]
        }, function (err, drivers) {
            if (err) {
                retObj.messages.push('Error fetching accounts');
                callback(retObj);
            } else if (!drivers.length) { // if no driver is found with the same phone number or full name
                DriversColl.findOneAndUpdate({_id: driverInfo._id}, driverInfo, {new: true}, function (err, oldDriver) {
                    if (err) {
                        retObj.messages.push('Error saving driver');
                        callback(retObj);
                    } else if (oldDriver) {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.driver = oldDriver;
                        Utils.cleanUpTruckDriverAssignment(jwt, oldDriver.truckId, oldDriver._id);
                        callback(retObj);
                    } else {
                        retObj.messages.push('Driver does\'t exist');
                        callback(retObj);
                    }
                });
            } else {
                var duplicateFound = _.find(drivers, function (driver) {
                    return driver.mobile === driverInfo.mobile;
                });

                if (duplicateFound) {
                    retObj.messages.push(" Mobile number is used by other driver in the account");
                }

                duplicateFound = _.find(drivers, function (driver) {
                    return driver.fullName === driverInfo.fullName;
                });

                if (duplicateFound) {
                    retObj.messages.push(" DUPLICATE!! Please choose a different name for the driver")
                }

                callback(retObj);
            }
        });
    }
};


Drivers.prototype.getAccountDrivers = function (accountId, callback) {
    var retObj = {
        status: true,
        messages: []
    };

    DriversColl.find({accountId: accountId}, function (err, drivers) {
        if (err) {
            retObj.messages.push('Error getting account trucks');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.drivers = drivers;
            callback(retObj);
        }
    });
};

Drivers.prototype.deleteDriver = function (driverId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(driverId)) {
        retObj.messages.push('Invalid driver Id');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        DriversColl.remove({_id: driverId}, function (err) {
            if (err) {
                retObj.messages.push('Error deleting Driver');
                callback(retObj);
            } else {
                retObj.messages.push('Success');
                callback(retObj);
            }
        });
    }

};
Drivers.prototype.countDrivers = function (jwt, callback) {
    var result = {};
    DriversColl.count({'accountId':jwt.accountId},function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            callback(result);
        }
    })
};

module.exports = new Drivers();