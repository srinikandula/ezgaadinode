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

var Devices = function () {
};

Devices.prototype.addDevices = function (req, callback) {
    console.log(req.body)
    var retObj = {
        status: false,
        messages: [],
        // alreadyadded: []
    };
    var params = req.body.devices;
    for(var i = 0;i < params.length;i++){
        if(!params[i].imei || !params[i].simPhoneNumber || !params[i].simNumber) {
            retObj.status = false;
            retObj.messages.push("Please fill the details");
            break;
        }
    }
    if(retObj.messages.length > 0) {
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
                } else if(getdevice) {
                    retObj.messages.push('device with IMEI number '+eachdevice.imei+' already added');
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
            // console.log('devicesadded', devicesadded);
            if(erradingdevices) {
                retObj.messages.push("Unable to add devices, please try again");
                analyticsService.create(req, serviceActions.add_device_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if(retObj.messages.length > 0){
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
        if(errremoved) {
            analyticsService.create(req, serviceActions.remove_device_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else{
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
            DevicesColl.findOneAndUpdate({_id:device}, {assignedTo: req.body.assignedTo, updatedBy : req.jwt.id}, function (errTransfered, transfered) {
                asyncCallback(errTransfered, transfered);
            });
        }, function (asyncerr, asyncsuccess) {
            if(asyncerr) {
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
    async.parallel({
        devices: function (devicescallback) {
            DevicesColl.find({})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .populate('accountId', {userName: 1})
                .populate('')
                .lean()
                .exec(function (errdevices, devices) {
                    devicescallback(errdevices, devices);
                })
        },
        count: function (countCallback) {
            DevicesColl.count(function (errcount, count) {
                countCallback(errcount, count);
            });
        }
    }, function (errasync, results) {
        if(errasync) {
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
            // for (var i = 0; i < results.devices.length; i++) console.log(results.devices[i]._id);
            async.map(results.devices, function (device, asyncCallback) {
                console.log('installed', device.imei, device.installedBy);
                async.parallel({
                    planhistory: function (planHistoryCallack) {
                        AccountDevicePlanHistoryColl.find({deviceId: device._id})
                            .sort({expiryTime: -1}).limit(1).exec(function (errdeviceplan, deviceplan) {
                            // console.log('deviceplan.length', deviceplan, device._id);
                            if (deviceplan.length > 0) {
                                device.expiryTime = deviceplan[0].expiryTime;
                                device.received = deviceplan[0].received;
                                // console.log(device);
                            }
                            planHistoryCallack(errdeviceplan, 'success');
                        });
                    },
                    employees: function (empoyeeCallback) {
                        if(device.installedBy) {
                            AccountsColl.findOne({id_admin: device.installedBy}, function (erremployee, employee) {
                                if(employee) {
                                    device.installedBy = employee.displayName;
                                }
                                empoyeeCallback(erremployee, 'success');
                            });
                        } else {
                            empoyeeCallback(null, 'success');
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

Devices.prototype.getDevice = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DevicesColl.findOne({_id:req.params.deviceId}).lean().exec(function (errdevice, device) {
        if(errdevice) {
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
            TrucksColl.findOne({deviceId: device.imei}, {insuranceExpiry: 1,fitnessExpiry:1, registrationNo:1}).lean().exec(function (errtruck, truck) {
                if(errtruck){
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
    TrucksColl.findOneAndUpdate({_id: params.truckId}, {$set:{deviceId: params.imei}}, function (errassaindevice, assigned) {
        // console.log('errassaindevice', errassaindevice);
        // console.log('assigned', assigned);
        if(errassaindevice) {
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
            DevicesColl.findOneAndUpdate({_id: params._id}, {$set:{accountId: params.accountId, installedBy: params.installedBy}}, function (errAddedAccount, accountAdded) {
                if(errAddedAccount) {
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
            DevicesColl.find({"accountId" : account._id}, function (errdevices, devices) {
                if(errdevices) {
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


module.exports = new Devices();