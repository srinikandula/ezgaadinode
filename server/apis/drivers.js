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
            } else {
                driverInfo.accountId = truck.accountId;
                driverInfo.mobile = Number(driverInfo.mobile);
                delete driverInfo.joiningDate;

                DriversColl.find({
                        accountId: driverInfo.accountId
                    }, function (err, trucks) {
                        if (err) {
                            retObj.status = false;
                            retObj.message = ['Error fetching accounts'];
                            callback(retObj);
                        } else if (!trucks.length) {
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
                            var mobileIndex = _.findIndex(trucks, {mobile: driverInfo.mobile});
                            var fullNameIndex = _.findIndex(trucks, {fullName: driverInfo.fullName});

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
                )
                ;
            }
        });


    }
};

module.exports = new Drivers();