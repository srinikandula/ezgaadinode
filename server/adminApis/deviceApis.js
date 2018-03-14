var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var DevicesColl = require('./../models/schemas').DeviceColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var AccountDevicePlanHistoryColl = require('./../models/schemas').AccountDevicePlanHistoryColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var PaymentsColl = require('./../models/schemas').PaymentsColl;

var Devices = function () {
};

Devices.prototype.addDevices = function (req, callback) {
    var retObj = {
        status: false,
        messages: [],
        // alreadyadded: []
    };
    var params = req.body.devices;
    for (var i = 0; i < params.length; i++) {
        if (!params[i].imei || !params[i].simPhoneNumber || !params[i].simNumber) {
            retObj.status = false;
            retObj.messages.push("Please fill the details");
            break;
        }
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
        async.map(params, function (eachdevice, eachdeviceCallback) {
            eachdevice.createdBy = req.jwt.id;
            params.updatedBy = req.jwt.id;
            DevicesColl.findOne({imei: eachdevice.imei}, function (errgetdevice, getdevice) {
                if (errgetdevice) {
                    eachdeviceCallback(errgetdevice);
                } else if (getdevice) {
                    retObj.messages.push('device with IMEI number ' + eachdevice.imei + ' already added');
                    eachdeviceCallback(null);
                } else {
                    AccountsColl.findOne({userName: 'accounts'}, function (erraccount, account) {
                        if (erraccount) {
                            eachdeviceCallback(erraccount);
                        } else {
                            eachdevice.accountId = account._id;
                            eachdevice.assignedTo = req.body.assignedTo;
                            var device = new DevicesColl(eachdevice);
                            device.save(function (addDeviceErr, document) {
                                if (addDeviceErr) {
                                    eachdeviceCallback(addDeviceErr);
                                } else {
                                    eachdeviceCallback(null);
                                }
                            });
                        }
                    });
                }
            });
        }, function (erradingdevices, devicesadded) {
            if (erradingdevices) {
                retObj.messages.push("Unable to add devices, please try again");
                analyticsService.create(req, serviceActions.add_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (retObj.messages.length > 0) {
                retObj.status = false;
                analyticsService.create(req, serviceActions.add_device, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages = "Devices added successfully";
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
};

Devices.prototype.deleteDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DevicesColl.remove({_id: req.params.deviceId}, function (errremoved, removed) {
        if (errremoved) {
            analyticsService.create(req, serviceActions.remove_device_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "Device removed successfully";
            analyticsService.create(req, serviceActions.remove_device, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
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
            if (errassign) {
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

Devices.prototype.transferDevices = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (params.devices.length < 1) {
        retObj.messages.push("Please provide device ids");
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
        async.map(params.devices, function (device, asyncCallback) {
            DevicesColl.findOneAndUpdate({_id: device}, {
                assignedTo: req.body.assignedTo,
                updatedBy: req.jwt.id
            }, function (errTransfered, transfered) {
                asyncCallback(errTransfered, transfered);
            });
        }, function (asyncerr, asyncsuccess) {
            if (asyncerr) {
                retObj.messages.push("Unable to transfer devices, please try again");
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

Devices.prototype.count = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DevicesColl.count({}, function (errcount, count) {
        if (errcount) {
            retObj.messages.push("Unable to get devices count");
            analyticsService.create(req, serviceActions.device_count_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "Success";
            retObj.count = count;
            analyticsService.create(req, serviceActions.device_count, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
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
    var query = {};
    if (params.sortableString === 'damaged') query.isDamaged = true;
    else if (params.sortableString === 'notdamaged') query.isDamaged = false;
    else if (params.sortableString === 'active') query.isActive = true;
    else if (params.sortableString === 'inactive') query.isActive = false;
    if (params.searchString) query.$or = [{"simPhoneNumber": new RegExp(params.searchString, "gi")}, {"imei": new RegExp(params.searchString, "gi")}];
    async.parallel({
        devices: function (devicescallback) {
            DevicesColl.find(query)
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                // .populate('accountId', {userName: 1})//, {userName: {$or: [{"userName": new RegExp(params.searchString, "gi")}]}})
                .populate({
                    path: 'accountId',
                    // match: {$or: [{"userName": new RegExp(params.searchString, "gi")}]}
                })//, {userName: {$or: [{"userName": new RegExp(params.searchString, "gi")}]}})
                .populate('')
                .lean()
                .exec(function (errdevices, devices) {
                    devicescallback(errdevices, devices);
                })
        },
        count: function (countCallback) {
            DevicesColl.count(query, function (errcount, count) {
                countCallback(errcount, count);
            });
        }
    }, function (errasync, results) {
        if (errasync) {
            retObj.messages.push("Unable to get or count, please try again");
            analyticsService.create(req, serviceActions.get_devices_err, {
                body: JSON.stringify(params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            async.map(results.devices, function (device, asyncCallback) {
                async.parallel({
                    planhistory: function (planHistoryCallack) {
                        AccountDevicePlanHistoryColl.find({deviceId: device._id})
                            .sort({expiryTime: -1}).limit(1).exec(function (errdeviceplan, deviceplan) {
                            if (deviceplan.length > 0) {
                                device.expiryTime = deviceplan[0].expiryTime;
                                device.received = deviceplan[0].received;
                            }
                            planHistoryCallack(errdeviceplan, 'success');
                        });
                    },
                    employees: function (employeeCallback) {
                        if (device.installedBy) {
                            AccountsColl.findOne({id_admin: device.installedBy}, function (erremployee, employee) {
                                if (employee) {
                                    device.installedBy = employee.displayName;
                                }
                                employeeCallback(erremployee, 'success');
                            });
                        } else {
                            employeeCallback(null, 'success');
                        }
                    }
                }, function (parallelCallback, success) {
                    asyncCallback(parallelCallback, success);
                });
            }, function (errpopulated, populated) {
                if (errpopulated) {
                    retObj.messages.push("Unable to populate devices, please try again");
                    analyticsService.create(req, serviceActions.get_devices_err, {
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
                    retObj.devices = results.devices;
                    retObj.count = results.count;
                    analyticsService.create(req, serviceActions.get_devices, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        }
    });
};

Devices.prototype.getDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DevicesColl.findOne({_id: req.params.deviceId}).lean().exec(function (errdevice, device) {
        if (errdevice) {
            retObj.messages.push("Unable to get device, please try again");
            analyticsService.create(req, serviceActions.get_device_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            TrucksColl.findOne({deviceId: device.imei}, {
                insuranceExpiry: 1,
                fitnessExpiry: 1,
                registrationNo: 1
            }).lean().exec(function (errtruck, truck) {
                if (errtruck) {
                    retObj.messages.push("Unable to populate truck, please try again");
                    analyticsService.create(req, serviceActions.get_device_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    device.truck = truck;
                    retObj.status = true;
                    retObj.messages = "Success";
                    retObj.deviceDetails = device;
                    analyticsService.create(req, serviceActions.get_device, {
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
};

Devices.prototype.updateDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    TrucksColl.findOneAndUpdate({_id: params.truckId}, {$set: {deviceId: params.imei}}, function (errassaindevice, assigned) {
        if (errassaindevice) {
            retObj.messages.push("Unable to assign device to truck, please try again");
            analyticsService.create(req, serviceActions.edit_device_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            DevicesColl.findOneAndUpdate({_id: params._id}, {
                $set: {
                    accountId: params.accountId,
                    installedBy: params.installedBy
                }
            }, function (errAddedAccount, accountAdded) {
                if (errAddedAccount) {
                    retObj.messages.push("Unable to assign device to truck, please try again");
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
                    retObj.messages = "Success";
                    analyticsService.create(req, serviceActions.edit_device_err, {
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
};

Devices.prototype.getAllDevices = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.findOne({userName: 'accounts'}, function (erraccount, account) {
        if (erraccount) {
            retObj.messages.push("Unable to assign device to truck, please try again");
            analyticsService.create(req, serviceActions.get_devices_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            DevicesColl.find({"accountId": account._id}, function (errdevices, devices) {
                if (errdevices) {
                    retObj.messages.push("Unable to assign device to truck, please try again");
                    analyticsService.create(req, serviceActions.get_devices_err, {
                        body: JSON.stringify(req.body),
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
                    analyticsService.create(req, serviceActions.get_devices, {
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
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
            if (errplansave) {
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
            if (errassign) {
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

Devices.prototype.getDevicePlanHistory = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountDevicePlanHistoryColl.find({deviceId: req.params.deviceId}).populate('planId', {
        planName: 1,
        amount: 1
    }).sort({creationTime: -1}).exec(function (errhistory, history) {
        if (errhistory) {
            retObj.messages.push("Unable to get device plan history, please try again");
            analyticsService.create(req, serviceActions.get_device_plan_history_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.showGpsForm = true;
            if (history.length) {
                var expiry = (new Date(history[0].expiryTime).getTime() - new Date().getTime()) / 86400000;
                if (expiry > 30) retObj.showGpsForm = false;
            }
            retObj.status = true;
            retObj.messages = "success";
            retObj.devicePlanHistory = history;
            analyticsService.create(req, serviceActions.get_device_plan_history, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.getDeviceManagementDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.page) {
        params.page = 1;
    }
    //if(params.searchString) query.$or = [{"simPhoneNumber": new RegExp(params.searchString, "gi")}, {"imei": new RegExp(params.searchString, "gi")}];
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        employees: function (employeescallback) {
            DevicesColl.aggregate([
                {$match: {assignedTo: {$exists: true}}},
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'assignedTo',
                        foreignField: 'id_admin',
                        as: 'assignedEmployee'
                    }
                },
                {
                    $project: {
                        'assignedEmployee.contactName': 1,
                        'assignedTo': 1,
                        // 'installedBy': 1,
                        isDamaged: {$cond: [{$eq: ["$isDamaged", true]}, 1, 0]},
                        isInActive: {$cond: [{$eq: ["$isActive", true]}, 0, 1]},
                        /*isInActive: {
                            $cond: {
                                "if": {$eq: ["$isDamaged", 1]},
                                "then": 0,
                                "else": {
                                    $cond: {
                                        "if": {
                                            $and: [{$eq: ["$isDamaged", 0]}, {$eq: ["$isActive", false]}]
                                        },
                                        "then": 1,
                                        "else": 0
                                    }
                                }
                            },//[{$eq: ["$isActive", false]}, 1, 0]},
                        },*/
                        installedBy: {$cond: [{$gt: ["$installedBy", null]}, 1, 0]}
                    }
                },
                {
                    $match: {$or: [{"assignedEmployee.contactName": new RegExp(params.searchString, "gi")}]}
                },
                {
                    $group: {
                        _id: {assignedTo: '$assignedTo', employeeName: '$assignedEmployee.contactName'},
                        // installedDevices: {$push: '$installedBy'},
                        installedDevices: {$sum: '$installedBy'},
                        damagedDevices: {$sum: '$isDamaged'},
                        inactiveDevices: {$sum: '$isInActive'},
                        totalDevices: {$sum: 1}
                    }
                },
                {$sort: sort},
                {$skip: skipNumber},
                {$limit: limit}
            ], function (errEmp, details) {
                employeescallback(errEmp, details);
            });
        },
        count: function (countCallback) {
            DevicesColl.aggregate([
                {$match: {assignedTo: {$exists: true}}},
                {
                    $group: {
                        _id: {assignedTo: '$assignedTo'}
                    }
                }
            ], function (errcount, countDetails) {
                countCallback(errcount, countDetails);
            });
        }
    }, function (errDmDetails, dmDetails) {
        if (errDmDetails) {
            retObj.messages.push("Unable to get dMdevices, please try again");
            analyticsService.create(req, serviceActions.get_device_management_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.dmDetails = dmDetails.employees;
            retObj.count = dmDetails.count.length;
            analyticsService.create(req, serviceActions.get_device_management, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.getDeviceManagementCount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DevicesColl.aggregate([
        {$match: {assignedTo: {$exists: true}}},
        {
            $group: {
                _id: {assignedTo: '$assignedTo'}
            }
        }
    ], function (errDmDetails, dmDetails) {
        if (errDmDetails) {
            retObj.messages.push("Unable to get dMdevices, please try again");
            analyticsService.create(req, serviceActions.get_device_management_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.count = dmDetails.length;
            analyticsService.create(req, serviceActions.get_device_management, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.getPaymentCount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsColl.count(function (errcount, count) {
        if (errcount) {
            retObj.messages.push("Unable to get payments count, please try again");
            analyticsService.create(req, serviceActions.get_payments_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.count = count;
            analyticsService.create(req, serviceActions.get_payments, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.getPaymentDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        erp: function (erpCallback) {
            PaymentsColl.find({
                accountId: req.params.id,
                type: "erp"
            }).populate('planId', {planName: 1}).populate('createdBy', {userName: 1}).exec(function (errErpPayments, erpPayments) {
                erpCallback(errErpPayments, erpPayments);
            });
        },
        gps: function (gpsCallback) {
            PaymentsColl.find({
                accountId: req.params.id,
                type: "gps"
            }).populate('planId', {planName: 1}).populate('createdBy', {userName: 1}).exec(function (errGpsPayments, gpsPayments) {
                gpsCallback(errGpsPayments, gpsPayments);
            });
        }
    }, function (errPaymentDetails, paymentDetails) {
        if (errPaymentDetails) {
            retObj.messages.push("Unable to get payments, please try again");
            analyticsService.create(req, serviceActions.get_payments_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.paymentDetails = paymentDetails;
            analyticsService.create(req, serviceActions.get_payments, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Devices.prototype.getGPSPlansOfDevice = function (req, callback) {  //
    var retObj = {
        status: false,
        messages: []
    };
    AccountDevicePlanHistoryColl.find({deviceId: req.params.deviceId}, function (errPlans, plans) {
        if (errPlans) {
            retObj.messages.push("Unable to get plans, please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.GPSPlans = plans;
            callback(retObj);
        }
    });
    DevicesColl.aggregate([
        {$match: {assignedTo: {$exists: true}}},
        {
            $group: {
                _id: {assignedTo: '$assignedTo'}
            }
        }
    ], function (errDmDetails, dmDetails) {
        if (errDmDetails) {
            retObj.messages.push("Unable to get dMdevices, please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "success";
            retObj.count = dmDetails.length;
            callback(retObj);
        }
    });
};

module.exports = new Devices();