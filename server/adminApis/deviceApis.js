var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var DevicesColl = require('./../models/schemas').DeviceColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var AccountDevicePlanHistoryColl = require('./../models/schemas').AccountdeviceplanhistoryColl;

var Devices = function () {
};

Devices.prototype.addDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.imei) {
        retObj.messages.push("Please enter imei number");
    }
    if (!params.simPhoneNumber) {
        retObj.messages.push("Please enter sim phone number");
    }
    if (!params.simNumber) {
        retObj.messages.push("Please enter sim number");
    }
    if (!params.assignedTo) {
        retObj.messages.push("Please assign an employee to the device");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_device_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        DevicesColl.findOne({imei: params.imei}, function (errgetdevice, getdevice) {
            if (errgetdevice) {
                retObj.messages.push("Unable to get decive, please try again");
                analyticsService.create(req, serviceActions.add_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (getdevice) {
                retObj.messages.push("Device already added");
                analyticsService.create(req, serviceActions.add_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                AccountsColl.findOne({userName: 'accounts'}, function (erraccount, account) {
                    if (erraccount) {
                        retObj.messages.push("Unable to get accounts account");
                        analyticsService.create(req, serviceActions.add_device_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        params.accountId = account._id;
                        var device = new DevicesColl(params);
                        device.save(function (addDeviceErr, document) {
                            if (addDeviceErr) {
                                retObj.messages.push("Unable to save device, please try again");
                                analyticsService.create(req, serviceActions.add_device_err, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: false,
                                    messages: retObj.messages
                                }, function (response) {
                                });
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages = "Device added successfully";
                                analyticsService.create(req, serviceActions.add_device, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: true
                                }, function (response) {
                                });
                                callback(retObj);
                            }
                        });
                    }
                });
            }
        });
    }
};

Devices.prototype.assignDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.deviceId) {
        retObj.messages.push("Please provide device id");
    }
    if (!params.truckId) {
        retObj.messages.push("Please provide truck id");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.assign_device_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.updatedBy = req.jwt.id;
        DevicesColl.findOneAndUpdate({_id: params.deviceId}, {$set: {truckId: params.truckId}}, function (errassign, assigned) {
            if(errassign) {
                retObj.messages.push("Unable to get device, please try again");
                analyticsService.create(req, serviceActions.assign_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages = "Device updated successfully";
                analyticsService.create(req, serviceActions.assign_device, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

Devices.prototype.transferDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.deviceId) {
        retObj.messages.push("Please provide device id");
    }
    if (!params.assignedTo) {
        retObj.messages.push("Please provide employee id");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.transfer_device_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.updatedBy = req.jwt.id;
        DevicesColl.findOneAndUpdate({_id: params.deviceId}, {$set: {assignedTo: params.assignedTo}}, function (errdevice, device) {
            if (errdevice) {
                retObj.messages.push("Unable to get device, please try again");
                analyticsService.create(req, serviceActions.transfer_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages = "Device updated successfully";
                analyticsService.create(req, serviceActions.transfer_device, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Devices.prototype.getDevices = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    DevicesColl.find({})
        .sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .populate('accountId', {userName:1})
        .populate('')
        .lean()
        .exec(function (errdevices, devices) {
        if (errdevices) {
            retObj.messages.push("Unable to get devices, please try again");
            analyticsService.create(req, serviceActions.get_device_err, {
                body: JSON.stringify(params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "Success";
            retObj.devices = devices;
            analyticsService.create(req, serviceActions.get_device, {
                body: JSON.stringify(params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.addDevicePlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.accountId) {
        retObj.messages.push("Please enter account id");
    }
    if (!params.deviceId) {
        retObj.messages.push("Please enter device id");
    }
    if (!params.planId) {
        retObj.messages.push("Please enter plan id");
    }
    if (!params.startTime) {
        retObj.messages.push("Please enter startTime");
    }
    if (!params.amount) {
        retObj.messages.push("Please enter amount");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_Plan_to_device, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var fulldate = new Date();
        fulldate.setMonth(fulldate.getMonth() + 1); //1 day
        params.expiryTime = fulldate;
        var planDoc = new AccountDevicePlanHistoryColl(params);
        planDoc.save(function (errplansave, plansaved) {
            if(errplansave) {
                retObj.status = false;
                retObj.messages = "Error adding plan to device";
                analyticsService.create(req, serviceActions.add_Plan_to_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages = "Plan added to device successfully";
                analyticsService.create(req, serviceActions.add_Plan_to_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Devices.prototype.editDevicePlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.accountId) {
        retObj.messages.push("Please enter account id");
    }
    if (!params.deviceId) {
        retObj.messages.push("Please enter device id");
    }
    if (!params.truckId) {
        retObj.messages.push("Please provide truck id");
    }
    if (!params.imei) {
        retObj.messages.push("Please enter imei number");
    }
    if (!params.simPhoneNumber) {
        retObj.messages.push("Please enter sim phone number");
    }
    if (!params.simNumber) {
        retObj.messages.push("Please enter sim number");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.edit_device_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        DevicesColl.findOneAndUpdate({_id: params.deviceId}, params, function (errassign, assigned) {
            if(errassign) {
                retObj.messages.push("Unable to get device, please try again");
                analyticsService.create(req, serviceActions.edit_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages = "Device updated successfully";
                analyticsService.create(req, serviceActions.edit_device, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

module.exports = new Devices();