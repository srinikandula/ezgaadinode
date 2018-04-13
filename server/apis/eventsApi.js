var mysql = require('mysql');
var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');
const ObjectId = mongoose.Types.ObjectId;
var json2xls = require('json2xls');
var fs = require('fs');
var request = require('request');
var config = require('./../config/config');
var Events = function () {
};
var pool = mysql.createPool(config.mysql);
var pool_crm = mysql.createPool(config.mysql_crm);
var traccar_mysql = mysql.createPool(config.traccar_mysql);
var EventData = require('./../apis/eventDataApi');
var AccountsColl = require('./../models/schemas').AccountsColl;
var OperatingRoutesColl = require('./../models/schemas').OperatingRoutesColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DeviceColl = require('./../models/schemas').DeviceColl;
var erpGpsPlansColl = require('./../models/schemas').erpGpsPlansColl;
var AccountDevicePlanHistoryColl = require('./../models/schemas').AccountDevicePlanHistoryColl;
var FaultyPlanhistoryColl = require('./../models/schemas').FaultyPlanhistoryColl;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var franchiseColl = require('./../models/schemas').franchiseColl;
var adminRoleColl = require('./../models/schemas').adminRoleColl;
var adminPermissionsColl = require('./../models/schemas').adminPermissionsColl;
var TrucksTypesColl = require('./../models/schemas').TrucksTypesColl;
var GoodsTypesColl = require('./../models/schemas').GoodsTypesColl;
var LoadTypesColl = require('./../models/schemas').LoadTypesColl;
var OrderStatusColl = require('./../models/schemas').OrderStatusColl;
var CustomerLeadsColl = require('./../models/schemas').CustomerLeadsColl;


Events.prototype.getEventData = function (accountId, startDate, endDate, request, callback) {
    var retObj = {};
    retObj.messages = [];

    if (!accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id');
    }

    if (retObj.messages.length == 0) {
        var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + accountId + "' and timestamp >= " + startDate + " and timestamp <= " + endDate;
        var eventDataTempQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventDataTemp WHERE accountID='" + accountId + "' and timestamp >= " + startDate + " and timestamp <= " + endDate;

        async.parallel({
            eventData: function (eventDataCallback) {
                pool.query(eventDataQuery, function (err, eventDataResults) {
                    eventDataCallback(err, eventDataResults)
                });
            },
            eventDataTemp: function (eventDataTempCallback) {
                pool.query(eventDataTempQuery, function (err, eventDataTempResults) {
                    eventDataTempCallback(err, eventDataTempResults)
                });
            }
        }, function (err, results) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('Error fetching data');
                retObj.messages.push(JSON.stringify(err));
                analyticsService.create(request, serviceActions.get_event_data_err, {
                    body: JSON.stringify(request.params),
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.results = results.eventData.concat(results.eventDataTemp);
                retObj.count = retObj.results.length;
                analyticsService.create(request, serviceActions.get_event_data, {
                    body: JSON.stringify(request.params),
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    } else {
        callback(retObj);
        analyticsService.create(request, serviceActions.get_event_data_err, {
            body: JSON.stringify(request.params),
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
    }
};


Events.prototype.getLatestLocations = function (accountId, request, callback) {
    var retObj = {};
    retObj.messages = [];

    if (!accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id');
    }

    if (retObj.messages.length == 0) {
        var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + accountId + "' GROUP BY deviceID ORDER BY timestamp desc";
        var eventDataTempQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventDataTemp WHERE accountID='" + accountId + "' GROUP BY deviceID ORDER BY timestamp desc";

        async.parallel({
            eventData: function (eventDataCallback) {
                pool.query(eventDataQuery, function (err, eventDataResults) {
                    eventDataCallback(err, eventDataResults)
                });
            },
            eventDataTemp: function (eventDataTempCallback) {
                pool.query(eventDataTempQuery, function (err, eventDataTempResults) {
                    eventDataTempCallback(err, eventDataTempResults)
                });
            }
        }, function (err, results) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('Error fetching data');
                retObj.messages.push(JSON.stringify(err));
                analyticsService.create(request, serviceActions.get_lat_loc_err, {
                    body: JSON.stringify(request.params),
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.results = results.eventData.concat(results.eventDataTemp);
                retObj.count = retObj.results.length;
                analyticsService.create(request, serviceActions.get_lat_loc, {
                    body: JSON.stringify(request.params),
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    } else {
        analyticsService.create(request, serviceActions.get_lat_loc_err, {
            body: JSON.stringify(request.params),
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
};


/**
 * Find the latest GPS location of the device in an account
 * @param accountId
 * @param deviceId
 * @param callback
 */

Events.prototype.getLatestLocation = function (jwt, deviceId, req, callback) {
    var retObj = {};
    retObj.messages = [];

    if (!jwt.accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id, please check the authentication token');
    }
    if (!deviceId) {
        retObj.status = false;
        retObj.messages.push('Invalid deviceId ');
    }
    if (retObj.messages.length == 0) {
        AccountsColl.findOne({"_id": ObjectId(jwt.accountId)}, function (error, account) {
            if (error) {
                retObj.status = false;
                retObj.messages.push('Error finding account info' + error.message);
                analyticsService.create(req, serviceActions.get_latest_device_loc_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + account.userName + "' and deviceID = '" + deviceId + "' order by timestamp desc limit 1";
                pool.query(eventDataQuery, function (error, latestLocation) {
                    if (error) {
                        retObj.status = false;
                        retObj.messages.push('Error finding GPS location. info:' + error.message);
                        analyticsService.create(req, serviceActions.get_latest_device_loc_err, {
                            body: JSON.stringify(req.params),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        for (var i = 0; i < latestLocation.length; i++) {
                            latestLocation[i].date = new Date(latestLocation[i].datetime * 1000);
                        }
                        retObj.results = latestLocation;
                        retObj.status = true;
                        analyticsService.create(req, serviceActions.get_latest_device_loc, {
                            body: JSON.stringify(req.params),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                });
            }
        });
    } else {
        analyticsService.create(req, serviceActions.get_latest_device_loc_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
};

/*Events.prototype.getUserData = function (callback) {
 var retObj = {
 status: false,
 messages: []
 };
 var accountDataQuery = "select accountId as userName,contactPhone,password from Account";
 var groupDataQuery = "select accountId as userName,contactPhone,password from DeviceGroup";

 async.parallel({
 accountData: function(accountDataCallback) {
 pool.query(accountDataQuery, function(err, accountDataResults) {
 accountDataCallback(err, accountDataResults)
 });
 },
 groupData: function(groupDataCallback) {
 pool.query(groupDataQuery, function(err, groupDataResults) {
 groupDataCallback(err, groupDataResults)
 });
 }
 }, function(err, results) {
 if(err) {
 retObj.status = false;
 retObj.messages.push('Error fetching data');
 retObj.messages.push(JSON.stringify(err));

 callback(retObj);
 } else {
 retObj.status = true;
 retObj.messages.push('Success');
 retObj.results = results.accountData.concat(results.groupData);
 for(var i = 0; i < retObj.results.length; i++) {
 var userData = retObj.results[i];
 if(!userData.contactPhone || userData.contactPhone.trim().length == 0 || isNaN(userData.contactPhone)){
 delete userData.contactPhone;
 }
 EventData.createUserData(userData)
 }
 retObj.count = retObj.results.length;
 callback(retObj);
 }
 });
 }*/

Events.prototype.getAccountData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountDataQuery = "select accountID as userName,contactPhone,password,contactEmail as email,contactName,contactAddress,displayName,contactName as firstName from Account order by accountID";
    pool.query(accountDataQuery, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            analyticsService.create(request, serviceActions.get_account_data_err, {
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = results;
            for (var i = 0; i < retObj.results.length; i++) {
                var AccountData = retObj.results[i];
                //AccountData.gpsEnabled = true;
                if (!AccountData.contactPhone || AccountData.contactPhone.trim().length == 0 || isNaN(AccountData.contactPhone)) {
                    delete AccountData.contactPhone;
                    AccountData.gpsEnabled = true;
                }
                EventData.createAccountData(AccountData)
            }
            retObj.count = retObj.results.length;
            analyticsService.create(request, serviceActions.get_account_data, {success: true}, function (response) {
            });
            callback(retObj);
        }
    });
}

Events.prototype.getAccountGroupData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var accountGroupDataQuery = "select accountID as userName,contactPhone,password from DeviceGroup";
    pool_crm.query(accountGroupDataQuery, function (err, accountGroupDataResults) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(accountGroupDataResults, function (accountGroupDataResult, accountGroupDataCallBack) {
                AccountsColl.findOne({
                    userName: accountGroupDataResult.userName,
                    type: 'group'
                }, function (findAccountGroupErr, accountGroupFound) {
                    if (findAccountGroupErr) {
                        accountGroupDataCallBack(findAccountGroupErr);
                    } else if (accountGroupFound) {
                        accountGroupDataCallBack(null, 'Account group exists');
                    } else {
                        var accountGroupData = {
                            userName: accountGroupDataResult.userName,
                            contactPhone: accountGroupDataResult.contactPhone,
                            password: accountGroupDataResult.password,
                            role: 'Truck Owner',
                            leadType: 'T',
                            yearInService: 2018,
                            type: 'group',
                        };
                        AccountsColl.findOne({
                            "userName": accountGroupDataResult.userName,
                            "role": "Truck Owner"
                        }, function (err, account) {
                            if (account) {
                                accountGroupData.accountId = account._id;
                            }

                            var accountGroupDataDoc = new AccountsColl(accountGroupData);
                            accountGroupDataDoc.save(function (err, doc) {
                                accountGroupDataCallBack(err, 'saved');
                            });
                        });
                    }
                });
            }, function (accountGroupErr, accountGroupSaved) {
                if (accountGroupErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(planerr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Account group saved succesfully');
                    callback(retObj);
                }
            });
        }
    });
}

Events.prototype.createTruckFromEGTruck = function (request, callback) {
    var retObj = {
        status: false,
        messages: [],
    };
    var driverId = null;
    var pollutionExpiry = "0000-00-00";// getting error using default value as null
    var taxDueDate = "0000-00-00";// getting error using default value as null

    var trucksDataQuery = "select c.gps_account_id as userName, t.truck_reg_no as registrationNo,c.type as truckType,tt.title as modelAndYear,tt.tonnes as tonnage,t.fitness_certificate_expiry_date as fitnessExpiry,t.national_permit_expiry_date as permitExpiry,t.vehicle_insurance_expiry_date as insuranceExpiry,t.tracking_available,t.status from eg_truck t left join eg_customer c on c.id_customer=t.id_customer left join eg_truck_type tt on t.id_truck_type=tt.id_truck_type ";
    var trucks = [];
    pool_crm.query(trucksDataQuery, function (err, truckDataResults) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(truckDataResults, function (truckDataResult, truckDataCallBack) {
                TrucksColl.findOne({
                    registrationNo: truckDataResult.registrationNo,
                    userName: truckDataResult.userName
                }, function (findTruckErr, truckFound) {
                    if (findTruckErr) {
                        truckDataCallBack(findTruckErr);
                    } else if (truckFound) {
                        truckDataCallBack(null, 'truck exists');
                    } else {
                        var truckData = {
                            fitnessExpiry: convertDate(truckDataResult.fitnessExpiry),
                            permitExpiry: convertDate(truckDataResult.permitExpiry),
                            insuranceExpiry: convertDate(truckDataResult.insuranceExpiry),
                            pollutionExpiry: convertDate(pollutionExpiry),
                            taxDueDate: convertDate(taxDueDate),
                            registrationNo: truckDataResult.registrationNo,
                            userName: truckDataResult.userName,
                        };
                        AccountsColl.findOne({"userName": truckDataResult.userName}, function (err, account) {
                            if (account) {
                                truckData.accountId = account._id;
                            }

                            var truckDataDoc = new TrucksColl(truckData);
                            truckDataDoc.save(function (err, doc) {
                                truckDataCallBack(err, 'saved');
                            });
                        });
                    }
                });
            }, function (truckErr, truckSaved) {
                if (truckErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(planerr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Trucks saved succesfully');
                    callback(retObj);
                }
            });
        }
    });
}

Events.prototype.createTruckFromDevices = function (request, callback) {
    var retObj = {
        status: false,
        messages: [],
    };

    var pollutionExpiry = "0000-00-00";// getting error using default value as null
    var taxDueDate = "0000-00-00";// getting error using default value as null

    var employeeDataQuery = "select distinct id_admin,email from eg_admin";
    pool_crm.query(employeeDataQuery, function (employeeErr, employeeDataResult) {
        if (employeeErr) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(employeeErr));
            callback(retObj);
        } else {
            var deviceDataQuery = "select accountId, deviceId, installedById, devicePaymentStatus, currentPlanId, isDamaged, equipmentType, vehicleModel, vehicleId, licenseExpire, insuranceExpire, fitnessExpire, NPExpire, fuelCapacity, installTime, resetTime, expirationTime, serialNumber, simPhoneNumber, simID, imeiNumber, isActive, lastStopTime from Device where installedById<>0";
            pool.query(deviceDataQuery, function (err, devicesDataResults) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Error fetching data');
                    retObj.messages.push(JSON.stringify(err));
                    callback(retObj);
                } else {
                    async.map(devicesDataResults, function (devicesDataResult, deviceDataCallBack) {
                        async.parallel({
                            accountId: function (accountCallback) {
                                AccountsColl.findOne({
                                    "userName": devicesDataResult.accountId
                                }, function (accountErr, account) {
                                    if (account) {
                                        accountCallback(accountErr, account._id);
                                    } else {
                                        accountCallback(accountErr, account);//null);
                                    }
                                });
                            },
                            employeeId: function (employeeCallback) {
                                var resultObject = _.find(employeeDataResult, function (employee) {
                                    return employee.id_admin === devicesDataResult.installedById;
                                });
                                // var resultObject = searchEmployeeId(devicesDataResult.installedById, employeeDataResult);
                                if (resultObject) {
                                    AccountsColl.findOne({
                                        "role": "employee",
                                        "userName": resultObject.email
                                    }, function (employeeErr, employee) {
                                        if (employee) {
                                            employeeCallback(employeeErr, employee._id);
                                        } else {
                                            employeeCallback(employeeErr, employee);
                                        }
                                    });
                                } else {
                                    employeeCallback('null');
                                }
                            },
                            truck: function (truckCallback) {
                                TrucksColl.findOne({
                                    userName: devicesDataResult.accountId,
                                    registrationNo: devicesDataResult.vehicleId
                                }, function (truckErr, truck) {
                                    if (truckErr) {
                                        truckCallback(truckErr, truck);
                                    } else if (truck) {
                                        truckCallback(null, "Truck Exists");
                                    } else {
                                        var truckData = {
                                            fitnessExpiry: convertDate(devicesDataResult.fitnessExpire),
                                            permitExpiry: convertDate(devicesDataResult.NPExpire),
                                            insuranceExpiry: convertDate(devicesDataResult.insuranceExpire),
                                            pollutionExpiry: convertDate(pollutionExpiry),
                                            taxDueDate: convertDate(taxDueDate),
                                            registrationNo: devicesDataResult.vehicleId,
                                            userName: devicesDataResult.accountId,
                                            deviceId: devicesDataResult.imeiNumber,
                                            truckType: devicesDataResult.vehicleModel,
                                            tracking_available: 1
                                        };
                                        truckCallback(null, truckData);
                                    }
                                })
                            },
                            device: function (deviceCallback) {
                                DeviceColl.findOne({
                                    userName: devicesDataResult.accountId,
                                    deviceId: devicesDataResult.deviceId,
                                    simNumber: devicesDataResult.simID,
                                    imei: devicesDataResult.imeiNumber,
                                    simPhoneNumber: devicesDataResult.simPhoneNumber
                                }, function (deviceErr, device) {
                                    if (deviceErr) {
                                        deviceCallback(deviceErr, device);
                                    } else if (device) {
                                        deviceCallback(null, "Device Exists");
                                    } else {
                                        var deviceData = {
                                            deviceId: devicesDataResult.deviceId,
                                            simNumber: devicesDataResult.simID,
                                            imei: devicesDataResult.imeiNumber,
                                            simPhoneNumber: devicesDataResult.simPhoneNumber,
                                            userName: devicesDataResult.accountId, //find accountId
                                            devicePaymentStatus: devicesDataResult.devicePaymentStatus,
                                            devicePaymentPlan: devicesDataResult.currentPlanId,
                                            isDamaged: devicesDataResult.isDamaged,
                                            equipmentType: devicesDataResult.equipmentType,
                                            serialNumber: devicesDataResult.serialNumber,
                                            isActive: devicesDataResult.isActive,
                                            lastStopTime: devicesDataResult.lastStopTime,
                                            fuelCapacity: devicesDataResult.fuelCapacity,
                                            installTime: devicesDataResult.installTime,
                                        };
                                        deviceCallback(null, deviceData);

                                    }
                                })
                            }
                        }, function (err, data) {
                            if (err) {
                                deviceDataCallBack(err);
                            } else {
                                async.parallel({
                                    truckDoc: function (truckDocCallBack) {
                                        if (data.truck !== 'Truck Exists') {
                                            data.truck.accountId = data.accountId;
                                            var truckDataDoc = new TrucksColl(data.truck);
                                            truckDataDoc.save(function (err, doc) {
                                                truckDocCallBack(err, 'saved');
                                            });
                                        } else {
                                            truckDocCallBack(null, 'saved');
                                        }
                                    },
                                    deviceDoc: function (deviceDocCallBack) {
                                        if (data.device !== 'Device Exists') {
                                            data.device.accountId = data.accountId;
                                            console.log('data.device.devicePaymentStatus', data.device.devicePaymentStatus);
                                            if (data.device.devicePaymentStatus.length > 0) {
                                                data.device.installedBy = data.employeeId;
                                            }
                                            data.device.assignedTo = data.employeeId;

                                            var deviceDataDoc = new DeviceColl(data.device);
                                            if (data.device.imei && data.device.deviceId) {
                                                traccar_mysql.query("INSERT INTO devices (name, uniqueid) VALUES ('" + data.device.deviceId.toString() + "','" + data.device.imei.toString() + "')", function (err, result) {
                                                    if (err) console.log("Err", err);
                                                });
                                            }

                                            deviceDataDoc.save(function (err, doc) {
                                                deviceDocCallBack(err, 'saved');
                                            });
                                        } else {
                                            deviceDocCallBack(null, 'saved');
                                        }
                                    }
                                }, function (saveErr, saved) {
                                    if (saveErr) {
                                        deviceDataCallBack(saveErr, saved);
                                    } else {
                                        deviceDataCallBack(saveErr, "saved");
                                    }
                                });
                            }
                        });
                    }, function (deviceErr, deviceSaved) {
                        if (deviceErr) {
                            retObj.status = false;
                            retObj.messages.push('Error saving data');
                            retObj.messages.push(JSON.stringify(deviceErr));
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Device saved successfully');
                            callback(retObj);
                        }
                    });
                }
            });
        }
    });
};

function searchEmployeeId(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id_admin === nameKey) {
            return myArray[i].email;
        }
    }
}

Events.prototype.getDevicePlans = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var devicePlanQuery = "select * from DevicePlans";
    pool.query(devicePlanQuery, function (err, plans) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(plans, function (plan, planCallBack) {
                erpGpsPlansColl.findOne({planName: plan.plan_name}, {durationInMonths: plan.duration_in_months}, {amount: plan.amount}, function (findplanerr, planfound) {
                    if (findplanerr) {
                        planCallBack(findplanerr);
                    } else if (planfound) {
                        planCallBack(null, 'plan added already');
                    } else {
                        var planDoc = new erpGpsPlansColl({
                            devicePlanId: plan.id_device_plans,
                            planName: plan.plan_name,
                            durationInMonths: plan.duration_in_months,
                            amount: plan.amount,
                            status: plan.status,
                            remark: plan.remark,
                            plan: "gps"
                        });
                        planDoc.save(function (err) {
                            planCallBack(err, 'saved');
                        })
                    }
                });
            }, function (planerr, plansaved) {
                if (planerr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(planerr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('devicePlans saved succesfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.devicePlansHistory = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var devicePlanQuery = "select * from Accountdeviceplanhistory";
    pool.query(devicePlanQuery, function (err, plansHistory) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            AccountDevicePlanHistoryColl.remove({}, function (errremoved, removed) {
                FaultyPlanhistoryColl.remove({}, function (errfaultcollremove, faultcollremoved) {
                    if (errremoved) {
                        retObj.status = false;
                        retObj.messages.push('Error removing data');
                        callback(retObj);
                    } else {
                        async.map(plansHistory, function (plan, planCallBack) {
                            async.parallel({
                                accountId: function (accountCallback) {
                                    AccountsColl.findOne({userName: plan.accountID}, function (erracountid, accountid) {
                                        if (!accountid) {
                                            accountCallback(erracountid, {name: plan.accountID});//null);
                                        } else {
                                            accountCallback(erracountid, {id: accountid._id});
                                        }
                                    });
                                },
                                deviceId: function (deviceCallback) {
                                    DeviceColl.findOne({deviceId: plan.deviceID}, function (errdeviceid, deviceid) {
                                        if (deviceid) {
                                            deviceCallback(errdeviceid, deviceid._id);
                                        } else {
                                            var planDoc = new FaultyPlanhistoryColl({
                                                accountId: plan.accountID,
                                                deviceId: plan.deviceID,
                                                planId: plan.planID,
                                                amount: plan.amount,
                                                remark: plan.remark,
                                                creationTime: plan.creationTime,
                                                startTime: plan.startTime,
                                                expiryTime: plan.expiryTime,
                                                received: plan.received
                                            });
                                            planDoc.save(function (errsavingfaultplan) {
                                                deviceCallback(errsavingfaultplan, null);
                                            });
                                        }
                                    })
                                },
                                planId: function (planIdCallback) {
                                    erpGpsPlansColl.findOne({devicePlanId: plan.planID}, function (planiderr, planid) {
                                        if (planid) {
                                            planIdCallback(planiderr, planid._id);
                                        } else {
                                            planIdCallback(planiderr, planid);
                                        }
                                    });
                                }
                            }, function (errids, ids) {
                                if (errids) {
                                    planCallBack(errids);
                                } else {
                                    if (ids.deviceId) {
                                        var planDoc = new AccountDevicePlanHistoryColl({
                                            deviceId: ids.deviceId,
                                            planId: ids.planId,
                                            amount: plan.amount,
                                            remark: plan.remark,
                                            creationTime: plan.creationTime,
                                            startTime: plan.startTime,
                                            expiryTime: plan.expiryTime,
                                            received: plan.received
                                        });
                                        if (ids.accountId) {
                                            if (ids.accountId.id) planDoc.accountId = ids.accountId.id;
                                            else planDoc.accountName = ids.accountId.name;
                                        }
                                        planDoc.save(function (err) {
                                            planCallBack(err, 'saved');
                                        });
                                    } else {
                                        planCallBack(err, 'saved');
                                    }
                                }
                            });
                        }, function (planerr, plansaved) {
                            if (planerr) {
                                retObj.status = false;
                                retObj.messages.push('Error saving data');
                                retObj.messages.push(JSON.stringify(planerr));
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('devicePlansHistory saved succesfully');
                                callback(retObj);
                            }
                        });
                    }
                });
            });
        }
    });
};

Events.prototype.getFranchise = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var franchiseQuery = "select * from eg_franchise";
    pool_crm.query(franchiseQuery, function (err, franchises) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(franchises, function (franchise, franchiseCallBack) {
                franchiseColl.findOne({account: franchise.account}, function (findFranchiseErr, franchiseFound) {
                    if (findFranchiseErr) {
                        franchiseCallBack(findFranchiseErr);
                    } else if (franchiseFound) {
                        franchiseCallBack(null, 'franchise exists');
                    } else {
                        var franchiseDoc = new franchiseColl({
                            fullName: franchise.fullname,
                            account: franchise.account,
                            mobile: franchise.mobile,
                            landLine: franchise.landline,
                            city: franchise.city,
                            state: franchise.state,
                            address: franchise.address,
                            company: franchise.company,
                            bankDetails: franchise.bank_details,
                            panCard: franchise.pancard,
                            gst: franchise.service_tax_no,
                            doj: franchise.doj,
                            status: franchise.status,
                            createdAt: convertDate(franchise.date_created),
                            updatedAt: convertDate(franchise.date_created),
                        });
                        franchiseDoc.save(function (err) {
                            franchiseCallBack(err, 'saved');
                        })
                    }
                });
            }, function (franchiseErr, franchiseSaved) {
                if (franchiseErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(franchiseErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Franchise saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getAdminRoles = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var adminRoleQuery = "select distinct role,status from eg_admin_role";
    pool_crm.query(adminRoleQuery, function (err, roles) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(roles, function (role, roleCallBack) {
                adminRoleColl.findOne({role: role.role}, function (findRoleErr, roleFound) {
                    if (findRoleErr) {
                        roleCallBack(findRoleErr);
                    } else if (roleFound) {
                        roleCallBack(null, 'role exists');
                    } else {
                        var roleDoc = new adminRoleColl({
                            role: role.role,
                            status: role.status,
                            createdAt: convertDate(role.date_created),
                            updatedAt: convertDate(role.date_modified),
                        });
                        roleDoc.save(function (err) {
                            roleCallBack(err, 'saved');
                        })
                    }
                });
            }, function (roleErr, roleSaved) {
                if (roleErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(roleErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Admin role saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getAdminPermissions = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var adminPermissionsQuery = "SELECT ap.*,ar.role FROM `eg_admin_permissions` ap,eg_admin_role ar where ap.id_admin_role=ar.id_admin_role";
    pool_crm.query(adminPermissionsQuery, function (err, permissions) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(permissions, function (permission, permissionCallBack) {
                adminPermissionsColl.findOne({moduleName: permission.module_name}, {fileName: permission.file_name}, function (findPermissionErr, permissionFound) {
                    if (findPermissionErr) {
                        permissionCallBack(findPermissionErr);
                    } else if (permissionFound) {
                        permissionCallBack(null, 'permission exists');
                    } else {
                        adminRoleColl.findOne({"role": permission.role}, function (err, role) {
                            var permissionData = {
                                moduleName: permission.module_name,
                                fileName: permission.file_name,
                                title: permission.title,
                                listAll: permission.listall,
                                view: permission.view,
                                add: permission.add,
                                edit: permission.edit,
                                trash: permission.trash,
                                fileSortOrder: permission.file_sort_order,
                                moduleSortOrder: permission.module_sort_order,
                                menuType: permission.menu_type,
                                status: permission.status,
                                createdAt: convertDate(permission.date_modified),
                                updatedAt: convertDate(permission.date_modified),
                            }
                            if (role) {
                                permissionData.adminRoleId = role._id;
                            }

                            var permissionDoc = new adminPermissionsColl(permissionData);
                            permissionDoc.save(function (err) {
                                permissionCallBack(err, 'saved');
                            });
                        });
                    }
                });
            }, function (permissionErr, permissionSaved) {
                if (permissionErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(permissionErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Admin permission saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getEmployeeData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeDataQuery = "SELECT a.*,ar.role FROM `eg_admin` a,eg_admin_role ar where a.id_admin_role=ar.id_admin_role";
    pool_crm.query(employeeDataQuery, function (err, employees) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(employees, function (employee, employeeCallBack) {
                AccountsColl.findOne({"email": employee.email}, {"role": "employee"}, function (findEmployeeErr, employeeFound) {
                    if (findEmployeeErr) {
                        employeeCallBack(findEmployeeErr);
                    } else if (employeeFound) {
                        employeeCallBack(null, 'Employee exists');
                    } else {
                        adminRoleColl.findOne({"role": employee.role}, function (err, role) {
                            var employeeData = {
                                userName: employee.email,
                                password: "12345678",
                                email: employee.email,
                                firstName: employee.first_name,
                                lastName: employee.last_name,
                                contactName: employee.first_name + ' ' + employee.last_name,
                                displayName: employee.first_name + ' ' + employee.last_name,
                                city: employee.city,
                                state: employee.state,
                                location: employee.city + ' ' + employee.state,
                                isActive: employee.status,
                                role: 'employee',
                                createdAt: convertDate(employee.date_created),
                                updatedAt: convertDate(employee.date_modified),
                            }
                            if (!isNaN(employee.phone)) {
                                employeeData.contactPhone = employee.phone;
                            }
                            if (role) {
                                employeeData.adminRoleId = role._id;
                            }

                            var employeeDoc = new AccountsColl(employeeData);
                            employeeDoc.save(function (err) {
                                employeeCallBack(err, 'saved');
                            })
                        });
                    }
                });
            }, function (employeeErr, employeeSaved) {
                if (employeeErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(employeeErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Employees saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getAccountOperatingRoutes = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var AccountOperatingRoutesDataQuery = "SELECT accountID, source_city as source, source_state as sourceState, source_address as sourceAddress, source_lat as sourceLatitude, source_lng as sourceLongitude, destination_city as destination, destination_state as destinationState, destination_address as destinationAddress, destination_lat as destinationLatitude, destination_lng as destinationLongitude FROM AccountOperatingDestinations";
    pool.query(AccountOperatingRoutesDataQuery, function (err, AccountOperatingRoutes) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(AccountOperatingRoutes, function (AccountOperatingRoute, AccountOperatingRoutesCallBack) {
                AccountsColl.findOne({"userName": {$regex: '.*' + AccountOperatingRoute.accountID + '.*'}}, function (err, account) {
                    if (err) {
                        AccountOperatingRoutesCallBack(err);
                    } else if (account) {
                        OperatingRoutesColl.findOne({
                            accountId: account._id,
                            source: AccountOperatingRoute.source,
                            sourceState: AccountOperatingRoute.sourceState,
                            // sourceLatitude: AccountOperatingRoute.sourceLatitude,
                            // sourceLongitude: AccountOperatingRoute.sourceLongitude,
                            destination: AccountOperatingRoute.destination,
                            destinationState: AccountOperatingRoute.destinationState,
                            // destinationLatitude: AccountOperatingRoute.destinationLatitude,
                            // destinationLongitude: AccountOperatingRoute.destinationLongitude
                        }, function (findAccountOperatingRoutesErr, AccountOperatingRoutesFound) {
                            if (findAccountOperatingRoutesErr) {
                                AccountOperatingRoutesCallBack(findAccountOperatingRoutesErr);
                            } else if (AccountOperatingRoutesFound) {
                                AccountOperatingRoutesCallBack(null, 'Account Operating Routes exists');
                            } else {
                                AccountOperatingRoute.sourceLocation = {
                                    coordinates: [AccountOperatingRoute.sourceLongitude, AccountOperatingRoute.sourceLatitude]
                                }
                                AccountOperatingRoute.destinationLocation = {
                                    coordinates: [AccountOperatingRoute.destinationLongitude, AccountOperatingRoute.destinationLatitude]
                                };
                                AccountOperatingRoute.accountId = account._id;
                                var AccountOperatingRoutesDoc = new OperatingRoutesColl(AccountOperatingRoute);
                                AccountOperatingRoutesDoc.save(function (err) {
                                    AccountOperatingRoutesCallBack(err, 'saved');
                                })
                            }
                        });
                    } else {
                        AccountOperatingRoutesCallBack(null, "No Account");
                    }
                });
            }, function (AccountOperatingRoutesErr, AccountOperatingRoutesSaved) {
                if (AccountOperatingRoutesErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(AccountOperatingRoutesErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Account Operating Routes saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

function convertDate(olddate) {
    if (!olddate) {
        return new Date();
    } else if (olddate == "0000-00-00" || olddate == "0000-00-00 00:00:00") {
        return new Date();
    } else {
        return new Date(olddate);
    }
}

Events.prototype.getCompleteData = function (req, callback) {
    var events = new Events();
    async.series({
        one: function (callBackOne) {
            events.getAccountData(req, function (result1) {
                console.log('1 Completed', result1);
                if (result1.status) {
                    callBackOne(null, result1);
                } else {
                    callBackOne(result1, null);
                }
            })
        },
        two: function (callBackTwo) {
            events.getMappingGpsStatusToAccount(req, function (result2) {
                console.log('2 Completed', result2);
                if (result2.status) {
                    callBackTwo(null, result2);
                } else {
                    callBackTwo(result2, null);
                }
            })
        },
        three: function (callBackThree) {
            events.createTruckFromEGTruck(req, function (result) {
                console.log('3 Completed', result);
                if (result.status) {
                    callBackThree(null, result);
                } else {
                    callBackThree(result, null);
                }
            })
        },
        four: function (callBackFour) {
            events.getFranchise(req, function (result) {
                console.log('4 Completed', result);
                if (result.status) {
                    callBackFour(null, result);
                } else {
                    callBackFour(result, null);
                }
            })
        },
        five: function (callBackFive) {
            events.getAdminRoles(req, function (result) {
                console.log('5 Completed', result);
                if (result.status) {
                    callBackFive(null, result);
                } else {
                    callBackFive(result, null);
                }
            })
        },
        six: function (callBackSix) {
            events.getAdminPermissions(req, function (result) {
                console.log('6 Completed', result);
                if (result.status) {
                    callBackSix(null, result);
                } else {
                    callBackSix(result, null);
                }
            })
        },
        seven: function (callBackSeven) {
            events.getEmployeeData(req, function (result) {
                console.log('7 Completed', result);
                if (result.status) {
                    callBackSeven(null, result);
                } else {
                    callBackSeven(result, null);
                }
            })
        },
        eight: function (callBackEight) {
            events.getDevicePlans(req, function (result) {
                console.log('8 Completed', result);
                if (result.status) {
                    callBackEight(null, result);
                } else {
                    callBackEight(result, null);
                }
            })
        },
        nine: function (callBackNine) {
            events.createTruckFromDevices(req, function (result) {
                console.log('9 Completed', result);
                if (result.status) {
                    callBackNine(null, result);
                } else {
                    callBackNine(result, null);
                }
            })
        },
        ten: function (callBackTen) {
            events.devicePlansHistory(req, function (result) {
                console.log('10 Completed', result);
                if (result.status) {
                    callBackTen(null, result);
                } else {
                    callBackTen(result, null);
                }
            })
        },
        eleven: function (callBackEleven) {
            events.getCustomerData(req, function (result) {
                console.log('11 Completed', result);
                if (result.status) {
                    callBackEleven(null, result);
                } else {
                    callBackEleven(result, null);
                }
            })
        },
        twelve: function (callBackTwelve) {
            events.getAlternateContact(req, function (result) {
                console.log('12 Completed', result);
                if (result.status) {
                    callBackTwelve(null, result);
                } else {
                    callBackTwelve(result, null);
                }
            })
        },
        thirteen: function (callBackThirteen) {
            events.getAccountOperatingRoutes(req, function (result) {
                console.log('13 Completed', result);
                if (result.status) {
                    callBackThirteen(null, result);
                } else {
                    callBackThirteen(result, null);
                }
            })
        },
        fourteen: function (callBackFourteen) {
            events.getTrucksTypeData(req, function (result) {
                console.log('14 Completed', result);
                if (result.status) {
                    callBackFourteen(null, result);
                } else {
                    callBackFourteen(result, null);
                }
            })
        },
        fifteen: function (callBackFifteen) {
            events.getGoodsTypeData(req, function (result) {
                console.log('15 Completed', result);
                if (result.status) {
                    callBackFifteen(null, result);
                } else {
                    callBackFifteen(result, null);
                }
            })
        },
        sixteen: function (callBackSixteen) {
            events.getLoadsTypeData(req, function (result) {
                console.log('16 Completed', result);
                if (result.status) {
                    callBackSixteen(null, result);
                } else {
                    callBackSixteen(result, null);
                }
            })
        },
        seventeen: function (callBackSeventeen) {
            events.getOrderStatusData(req, function (result) {
                console.log('17 Completed', result);
                if (result.status) {
                    callBackSeventeen(null, result);
                } else {
                    callBackSeventeen(result, null);
                }
            })
        },
        eighteen: function (callBackEighteen) {
            events.getCustomerLeadsData(req, function (result) {
                console.log('18 Completed', result);
                if (result.status) {
                    callBackEighteen(null, result);
                } else {
                    callBackEighteen(result, null);
                }
            })
        },
        nineteen: function (callBackNineteen) {
            events.getCustomerOperatingRoutes(req, function (result) {
                console.log('19 Completed', result);
                if (result.status) {
                    callBackNineteen(null, result);
                } else {
                    callBackNineteen(result, null);
                }
            })
        },
        twenty: function (callBackTwenty) {
            events.getJunkLeadsData(req, function (result) {
                console.log('20 Completed', result);
                if (result.status) {
                    callBackTwenty(null, result);
                } else {
                    callBackTwenty(result, null);
                }
            })
        }
    }, function (err, results) {
        if (err) {
            callback({});
        } else {
            callback(results);
        }
    });
};

Events.prototype.getAlternateContact = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountDataQuery = "select accountID as userName,privateLabelName as alternatePhone from Account order by accountID";
    pool.query(accountDataQuery, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = results;
            for (var i = 0; i < retObj.results.length; i++) {
                var AccountData = retObj.results[i];
                AccountsColl.update({userName: AccountData.userName}, {$set: {alternatePhone: AccountData.alternatePhone}}, function (err, result) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.results = results;
                    }
                });
                if (i === retObj.results.length - 1) {
                    retObj.count = retObj.results.length;
                    callback(retObj);
                }
            }
        }
    });
};

Events.prototype.getTrucksTypeData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var status = false;
    var trucksTypeDataQuery = "select * from eg_truck_type";
    pool_crm.query(trucksTypeDataQuery, function (err, trucksTypes) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(trucksTypes, function (trucksType, trucksTypeCallBack) {
                TrucksTypesColl.findOne({
                    title: trucksType.title,
                    tonnes: trucksType.tonnes,
                    mileage: trucksType.mileage
                }, function (findTrucksTypeErr, trucksTypeFound) {
                    if (findTrucksTypeErr) {
                        trucksTypeCallBack(findTrucksTypeErr);
                    } else if (trucksTypeFound) {
                        trucksTypeCallBack(null, 'Trucks Type exists');
                    } else {
                        if (trucksType.status === 1) {
                            status = true;
                        }
                        var trucksTypeDoc = new TrucksTypesColl({
                            title: trucksType.title,
                            tonnes: trucksType.tonnes,
                            mileage: trucksType.mileage,
                            status: status,
                        });
                        trucksTypeDoc.save(function (err) {
                            trucksTypeCallBack(err, 'saved');
                        })
                    }
                });
            }, function (trucksTypeErr, trucksTypeSaved) {
                if (trucksTypeErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(trucksTypeErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Trucks Type saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getGoodsTypeData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var status = false;
    var goodsTypeDataQuery = "select * from eg_goods_type";
    pool_crm.query(goodsTypeDataQuery, function (err, goodsTypes) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(goodsTypes, function (goodsType, goodsTypeCallBack) {
                GoodsTypesColl.findOne({title: goodsType.title}, function (findGoodsTypeErr, goodsTypeFound) {
                    if (findGoodsTypeErr) {
                        goodsTypeCallBack(findGoodsTypeErr);
                    } else if (goodsTypeFound) {
                        goodsTypeCallBack(null, 'GoodsType exists');
                    } else {
                        if (goodsType.status === 1) {
                            status = true;
                        }
                        var goodsTypeDoc = new GoodsTypesColl({
                            title: goodsType.title,
                            status: status,
                        });
                        goodsTypeDoc.save(function (err) {
                            goodsTypeCallBack(err, 'saved');
                        })
                    }
                });
            }, function (goodsTypeErr, goodsTypeSaved) {
                if (goodsTypeErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(goodsTypeErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Goods Type saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getLoadsTypeData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var status = false;
    var loadTypeDataQuery = "select * from eg_load_type";
    pool_crm.query(loadTypeDataQuery, function (err, loadsType) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(loadsType, function (loadType, loadTypeCallBack) {
                LoadTypesColl.findOne({title: loadType.title}, function (findLoadTypeErr, loadTypeFound) {
                    if (findLoadTypeErr) {
                        loadTypeCallBack(findLoadTypeErr);
                    } else if (loadTypeFound) {
                        loadTypeCallBack(null, 'Loads Type exists');
                    } else {
                        if (loadType.status === 1) {
                            status = true;
                        }
                        var loadTypeDoc = new LoadTypesColl({
                            title: loadType.title,
                            status: status,
                        });
                        loadTypeDoc.save(function (err) {
                            loadTypeCallBack(err, 'saved');
                        })
                    }
                });
            }, function (loadTypeErr, loadTypeSaved) {
                if (loadTypeErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(loadTypeErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Loads Type saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getOrderStatusData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var status = false;
    var orderStatusDataQuery = "select title,release_truck as releaseTruck,status from eg_order_status";
    pool_crm.query(orderStatusDataQuery, function (err, orderStatus) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(orderStatus, function (orderStatus, orderStatusCallBack) {
                OrderStatusColl.findOne({title: orderStatus.title}, function (findLoadTypeErr, orderStatusFound) {
                    if (findLoadTypeErr) {
                        orderStatusCallBack(findLoadTypeErr);
                    } else if (orderStatusFound) {
                        orderStatusCallBack(null, 'Order Status exists');
                    } else {
                        var orderStatusDoc = new OrderStatusColl(orderStatus);
                        orderStatusDoc.save(function (err) {
                            orderStatusCallBack(err, 'saved');
                        })
                    }
                });
            }, function (orderStatusErr, orderStatusSaved) {
                if (orderStatusErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(orderStatusErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Order Status saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getCustomerLeadsData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var alternatePhone = [];
    var approved = '';
    var customerLeadsDataQuery = "select * from eg_customer c,eg_customer_lead cl where cl.id_customer=c.id_customer and cl.lead_status<>'Junk Lead' and (c.islead=1 or c.type='G')";

    pool_crm.query(customerLeadsDataQuery, function (err, customerLeads) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(customerLeads, function (customerLead, customerLeadCallBack) {
                CustomerLeadsColl.findOne({firstName: customerLead.fullname}, {leadType: customerLead.type}, function (findCustomerLeadErr, customerLeadFound) {
                    if (findCustomerLeadErr) {
                        customerLeadCallBack(findCustomerLeadErr);
                    } else if (customerLeadFound) {
                        customerLeadCallBack(null, 'Customer Lead exists');
                    } else {
                        if (customerLead.alt_mobile_1) {
                            alternatePhone.push(customerLead.alt_mobile_1);
                        }
                        if (customerLead.alt_mobile_2) {
                            alternatePhone.push(customerLead.alt_mobile_2);
                        }
                        if (customerLead.alt_mobile_3) {
                            alternatePhone.push(customerLead.alt_mobile_3);
                        }

                        if (customerLead.approved) {
                            approved = 'Accepted';
                        }
                        if (customerLead.approved) {
                            approved = 'Rejected';
                        }
                        var id_customer = customerLead.id_customer;
                        var customerLeadData = {
                            userId: customerLead.idprefix,
                            isLead: customerLead.islead,
                            leadType: customerLead.type,
                            firstName: customerLead.fullname,
                            contactPhone: customerLead.mobile,
                            alternatePhone: alternatePhone,
                            email: customerLead.email,
                            yearInService: customerLead.year_in_service,
                            password: '1234',
                            loadEnabled: customerLead.load_required,
                            gpsEnabled: customerLead.gps_required,
                            paymentType: customerLead.payment_type,
                            companyName: customerLead.company,
                            address: customerLead.address,
                            city: customerLead.city,
                            state: customerLead.state,
                            pinCode: customerLead.pincode,
                            officeNumber: customerLead.landline,
                            isActive: customerLead.status,
                            status: approved,
                            fuelCardApplied: customerLead.applied_fuel_card,
                            leadStatus: customerLead.lead_status,
                            leadSource: customerLead.lead_source,
                            createdAt: convertDate(customerLead.date_created),
                            updatedAt: convertDate(customerLead.date_modified),
                        };

                        if (!customerLead.year_in_service) {
                            customerLeadData.yearInService = 2018;
                        }

                        AccountsColl.findOne({"role": {"$ne": "account"}}, {"firstName": customerLead.fullname}, {"leadType": customerLead.type}, function (err, account) {
                            if (account) {
                                customerLeadData.accountId = account._id;
                            }

                            var customerLeadDoc = new CustomerLeadsColl(customerLeadData);
                            customerLeadDoc.save(function (err, doc) {
                                alternatePhone = [];
                                customerLeadCallBack(err, 'saved');
                            });
                        });
                    }
                });
            }, function (customerLeadErr, customerLeadSaved) {
                if (customerLeadErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(customerLeadErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Customer Lead saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getCustomerOperatingRoutes = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var CustomerOperatingRoutesDataQuery = "SELECT c.gps_account_id,c.type,c.fullname, cod.source_city as source, cod.source_state as sourceState, cod.source_address as sourceAddress, cod.source_lat as sourceLatitude, cod.source_lng as sourceLongitude, cod.destination_city as destination, cod.destination_state as destinationState, cod.destination_address as destinationAddress, cod.destination_lat as destinationLatitude, cod.destination_lng as destinationLongitude FROM eg_customer_operating_destinations cod,eg_customer c where cod.id_customer=c.id_customer order by cod.id_customer ";
    pool_crm.query(CustomerOperatingRoutesDataQuery, function (err, CustomerOperatingRoutes) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(CustomerOperatingRoutes, function (CustomerOperatingRoute, CustomerOperatingRoutesCallBack) {
                AccountsColl.findOne({"userName": {$regex: '.*' + CustomerOperatingRoute.gps_account_id + '.*'}}, function (err, account) {
                    if (err) {
                        AccountOperatingRoutesCallBack(err);
                    } else if (account) {
                        OperatingRoutesColl.findOne({
                            accountId: account._id,
                            source: CustomerOperatingRoute.source,
                            sourceState: CustomerOperatingRoute.sourceState,
                            // sourceLatitude: CustomerOperatingRoute.sourceLatitude,
                            // sourceLongitude: CustomerOperatingRoute.sourceLongitude,
                            destination: CustomerOperatingRoute.destination,
                            destinationState: CustomerOperatingRoute.destinationState,
                            // destinationLatitude: CustomerOperatingRoute.destinationLatitude,
                            // destinationLongitude: CustomerOperatingRoute.destinationLongitude
                        }, function (findCustomerOperatingRoutesErr, CustomerOperatingRoutesFound) {
                            if (findCustomerOperatingRoutesErr) {
                                CustomerOperatingRoutesCallBack(findCustomerOperatingRoutesErr);
                            } else if (CustomerOperatingRoutesFound) {
                                CustomerOperatingRoutesCallBack(null, 'Customer Operating Routes exists');
                            } else {
                                CustomerOperatingRoute.sourceLocation = {
                                    coordinates: [CustomerOperatingRoute.sourceLongitude, CustomerOperatingRoute.sourceLatitude]
                                }
                                CustomerOperatingRoute.destinationLocation = {
                                    coordinates: [CustomerOperatingRoute.destinationLongitude, CustomerOperatingRoute.destinationLatitude]
                                };
                                if (account) {
                                    CustomerOperatingRoute.accountId = account._id;
                                }
                                var CustomerOperatingRoutesDoc = new OperatingRoutesColl(CustomerOperatingRoute);
                                CustomerOperatingRoutesDoc.save(function (err) {
                                    CustomerOperatingRoutesCallBack(err, 'saved');
                                })
                            }
                        });
                    } else {
                        CustomerOperatingRoutesCallBack(null, "No Account");
                    }
                });
            }, function (CustomerOperatingRoutesErr, CustomerOperatingRoutesSaved) {
                if (CustomerOperatingRoutesErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(CustomerOperatingRoutesErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Customer Operating Routes saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Events.prototype.getCustomerData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var customerDataQuery = "select * from eg_customer";

    pool_crm.query(customerDataQuery, function (err, customers) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(customers, function (customer, customerCallBack) {
                // if(customer.email) {
                var condition = {
                    $or: [
                        {"userName": customer.email},
                        {"userName": customer.mobile},
                    ], userId: customer.idprefix,
                    leadType: customer.type,
                };
                AccountsColl.findOne(condition, function (findCustomerErr, customerFound) {
                    if (findCustomerErr) {
                        customerCallBack(findCustomerErr);
                    } else if (customerFound) {
                        customerCallBack(null, "Customer Exists");
                    } else {
                        var alternatePhone = [];
                        var role = '';
                        var approved = '';
                        var userName = '';
                        if (customer.alt_mobile_1) {
                            alternatePhone.push(customer.alt_mobile_1);
                        }
                        if (customer.alt_mobile_2) {
                            alternatePhone.push(customer.alt_mobile_2);
                        }
                        if (customer.alt_mobile_3) {
                            alternatePhone.push(customer.alt_mobile_3);
                        }

                        if (customer.approved) {
                            approved = 'Accepted';
                        }
                        if (customer.approved) {
                            approved = 'Rejected';
                        }

                        if (customer.type === 'T') {
                            role = 'Truck Owner';
                        } else if (customer.type === 'TR') {
                            role = 'Transporter';
                        } else if (customer.type === 'C') {
                            role = 'Commission Agent';
                        } else if (customer.type === 'L') {
                            role = 'Factory Owners';
                        } else if (customer.type === 'G') {
                            role = 'Guest';
                        }

                        if (customer.email) {
                            userName = customer.email;
                        } else {
                            userName = customer.mobile;
                        }

                        var customerData = {
                            userName: userName,
                            userId: customer.idprefix,
                            firstName: customer.fullname,
                            alternatePhone: alternatePhone,
                            email: customer.email,
                            companyName: customer.company,
                            contactAddress: customer.address,
                            city: customer.city,
                            state: customer.state,
                            pinCode: customer.pincode,
                            officeNumber: customer.landline,
                            password: '1234',
                            erpEnabled: customer.erp_required,
                            gpsEnabled: customer.gps_required,
                            loadEnabled: customer.load_required,
                            yearInService: customer.year_in_service,
                            paymentType: customer.payment_type,
                            loadPaymentToPayPercent: customer.load_payment_topay_percent,
                            loadPaymentAdvancePercent: customer.load_payment_advance_percent,
                            loadPaymentPodDays: customer.load_payment_pod_days,
                            leadSource: customer.lead_source,
                            noOfRegTrucks: customer.no_of_vechiles,
                            noOfTrucks: customer.no_of_vechiles,
                            //registrationNo: registrationNo,
                            isLead: customer.islead,
                            leadType: customer.type,
                            isActive: customer.status,
                            leadStatus: customer.lead_status,
                            createdAt: convertDate(customer.date_created),
                            updatedAt: convertDate(customer.date_modified),
                            smsEmailAds: customer.enable_sms_email_ads,
                            role: role
                        }
                        if (!isNaN(customer.mobile)) {
                            customerData.contactPhone = customer.mobile;
                        }
                        AccountsColl.findOne({"role": {"$ne": "employee"}}, {"userName": customer.gps_account_id}, function (err, account) {
                            if (account) {
                                customerData.accountId = account._id;
                            }

                            var customerDoc = new AccountsColl(customerData);
                            customerDoc.save(function (err) {
                                customerCallBack(err, 'saved');
                            })
                        });
                    }
                });
                /*} else {
                 customerCallBack(null, "Customer Exists");
                 }*/
            }, function (customerErr, customerSaved) {
                if (customerErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(customerErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Customer saved successfully');
                    callback(retObj);
                }
            });
        }
    });
}

Events.prototype.getJunkLeadsData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var alternatePhone = [];
    var approved = '';
    var role = '';
    var smsEnabled = '';
    var junkLeadDataQuery = "SELECT * FROM eg_customer c,eg_customer_lead cl where c.id_customer=cl.id_customer and cl.lead_status = 'Junk Lead'";

    pool_crm.query(junkLeadDataQuery, function (err, junkLeads) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(junkLeads, function (junkLead, junkLeadCallBack) {
                CustomerLeadsColl.findOne({
                    firstName: junkLead.fullname,
                    leadType: junkLead.type,
                    leadStatus: junkLead.lead_status
                }, function (findJunkLeadErr, junkLeadFound) {
                    if (findJunkLeadErr) {
                        junkLeadCallBack(findJunkLeadErr);
                    } else if (junkLeadFound) {
                        junkLeadCallBack(null, 'Junk Lead exists');
                    } else {
                        alternatePhone = [];
                        if (junkLead.alt_mobile_1) {
                            alternatePhone.push(junkLead.alt_mobile_1);
                        }
                        if (junkLead.alt_mobile_2) {
                            alternatePhone.push(junkLead.alt_mobile_2);
                        }
                        if (junkLead.alt_mobile_3) {
                            alternatePhone.push(junkLead.alt_mobile_3);
                        }

                        if (junkLead.approved) {
                            approved = 'Accepted';
                        }
                        if (junkLead.approved) {
                            approved = 'Rejected';
                        }
                        var junkLeadData = {
                            userId: junkLead.idprefix,
                            firstName: junkLead.fullname,
                            password: '1234',
                            alternatePhone: alternatePhone,
                            email: junkLead.email,
                            isLead: junkLead.islead,
                            leadType: junkLead.type,
                            status: approved,
                            companyName: junkLead.company,
                            address: junkLead.address,
                            city: junkLead.city,
                            state: junkLead.state,
                            pinCode: junkLead.pincode,
                            officeNumber: junkLead.landline,
                            gpsEnabled: junkLead.gps_required,
                            erpEnabled: junkLead.erp_required,
                            loadEnabled: junkLead.load_required,
                            yearInService: junkLead.year_in_service,
                            leadSource: junkLead.lead_source,
                            createdAt: convertDate(junkLead.date_created),
                            updatedAt: convertDate(junkLead.date_modified),
                            leadStatus: junkLead.lead_status,
                            isActive: junkLead.status,
                            fuelCardApplied: junkLead.applied_fuel_card,
                            smsEmailAds: junkLead.enable_sms_email_ads,
                        }

                        if (!isNaN(junkLead.mobile)) {
                            junkLeadData.contactPhone = junkLead.mobile;
                        }

                        AccountsColl.findOne({
                            "role": {"$ne": "employee"},
                            "userName": junkLead.gps_account_id
                        }, function (err, account) {
                            if (account) {
                                junkLeadData.accountId = account._id;
                            }

                            var junkLeadDoc = new CustomerLeadsColl(junkLeadData);
                            junkLeadDoc.save(function (err) {
                                alternatePhone = [];
                                junkLeadCallBack(err, 'saved');
                            });
                        });
                    }
                });
            }, function (junkLeadErr, junkLeadSaved) {
                if (junkLeadErr) {
                    retObj.status = false;
                    retObj.messages.push('Error saving data');
                    retObj.messages.push(JSON.stringify(junkLeadErr));
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Junk Lead saved successfully');
                    callback(retObj);
                }
            });
        }
    });
}

Events.prototype.getMappingGpsStatusToAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gpsMappingAccountDataQuery = "select distinct accountID from Device order by accountID";
    pool.query(gpsMappingAccountDataQuery, function (err, results) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = results;
            for (var i = 0; i < retObj.results.length; i++) {
                var AccountData = retObj.results[i];
                AccountsColl.update({userName: AccountData.accountID}, {$set: {gpsEnabled: true}}, function (err, result) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.results = results;
                    }
                });
                if (i === retObj.results.length - 1) {
                    retObj.count = retObj.results.length;
                    callback(retObj);
                }
            }
        }
    });
};

Events.prototype.getDevicesFromTracker = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    traccar_mysql.query('select * from devices', function (err, docs) {
        if (err) {
            console.log("errr===>", JSON.stringify(err));
            retObj.messages.push("Please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.data = docs;
            callback(retObj);
        }
    })
};

function getOSMAddress(position, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    request({
        method: 'GET',
        url: 'http://13.127.89.224/reverse.php?format=json&lat=' + position.latitude + '&lon=' + position.longitude
    }, function (errAddress, address) {  //{"error":"Unable to geocode"}
        if (errAddress) {
            console.error('Error resolving OSM address');
            callback(retObj);
        } else {
            if (address) {
                try {
                    address = JSON.parse(address.body);
                    position.address = address.display_name;

                    retObj.status = true;
                    retObj.address = position.address;
                    retObj.messages.push('Success');
                    callback(retObj);
                } catch (error) {
                    retObj.messages.push(JSON.stringify(error));
                    console.error("OSM error{$position.latitude " + JSON.stringify(error));
                    callback(retObj);

                }
            }

        }
    });
}

Events.prototype.generateReportsByAccount = function (params, callback) {
    var retObj = {
        status: false,
        messages: []

    };

    if (!params.accountId) {
        retObj.messages.push("Enter account id");
    }
    if (!params.fromDate) {
        retObj.messages.push("Enter from date");
    }
    if (!params.toDate) {
        retObj.messages.push("Enter to date");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {

        pool_crm.query("select deviceID,distanceKM,statusCode,FROM_UNIXTIME(timestamp) as timestamp,speedKPH,latitude,longitude from EventDataTemp where accountID='" + params.accountId +
            "' and timestamp >= UNIX_TIMESTAMP(STR_TO_DATE('" + params.fromDate + "', '%M-%d-%Y'))" +
            "and timestamp <= UNIX_TIMESTAMP(STR_TO_DATE('" + params.toDate + "', '%M-%d-%Y'));", function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                callback(retObj);
            } else {
                var c = 0;
                var data = [];
                async.eachSeries(docs, function (doc, docCallback) {
                    if (doc.latitude && doc.longitude) {
                        getOSMAddress({latitude: doc.latitude, longitude: doc.longitude}, function (resp) {
                            if (resp.status) {
                                setTimeout(function () {
                                    c++;
                                    console.log("==", c, doc.timestamp);
                                    data.push({
                                        "Truck No": doc.deviceID,
                                        "Date & Time": new Date(doc.timestamp).toLocaleString(),
                                        "Address": resp.address,
                                        "Speed": parseInt(doc.speedKPH),
                                        "Distance": doc.distanceKM.toFixed(2)
                                    });
                                    docCallback(false);


                                }, 10);

                            } else {
                                docCallback(true);

                            }

                        })
                    } else {
                        console.log('no lan lat-------------------------------------------------->')
                        docCallback(doc);
                    }

                }, function (err) {

                    if (err) {
                        console.log('error', err);
                    } else {
                        var xls = json2xls(data);

                        fs.writeFileSync('server/reports/data.xlsx', xls, 'binary', function (err) {
                            if (err) {
                                retObj.messages.push("Excel file failed");
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push("Excel Created successfully");
                                callback(retObj);
                            }
                        });
                    }
                });

            }
        })
    }


};

Events.prototype.generateReportsGroupByTruck = function (params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.accountId) {
        retObj.messages.push("Enter account id");
    }
    if (!params.date) {
        retObj.messages.push("Enter date");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            startLocation: function (startCallback) {
                pool_crm.query("select deviceID,FROM_UNIXTIME(timestamp) as startDate,\n" +
                    "latitude as slat,longitude as slan from EventDataTemp where accountID='" + params.accountId + "' and date(FROM_UNIXTIME(timestamp)) = STR_TO_DATE('" + params.date + "', '%M-%d-%Y')\n" +
                    "order by timestamp asc limit 1;", function (err, startDocs) {
                    startCallback(err, startDocs);
                });
            },
            endLocation: function (endCallback) {
                pool_crm.query("select deviceID,FROM_UNIXTIME(timestamp) as endDate,\n" +
                    "latitude as elat,longitude as elan from EventDataTemp where accountID='" + params.accountId + "' and date(FROM_UNIXTIME(timestamp)) = STR_TO_DATE('" + params.date + "', '%M-%d-%Y')\n" +
                    "order by timestamp desc limit 1;", function (err, endDocs) {
                    endCallback(err, endDocs);
                });
            }
        }, function (err, result) {
            if (err) {
                console.log(err);

            } else {
                var output = _.map(result.startLocation, function (element) {
                    var match = _.findWhere(result.endLocation, {deviceID: element.deviceID});

                    return _.extend(element, match);
                });
                async.eachSeries(output, function (device, deviceCallback) {
                    async.parallel({
                        startAdd: function (startAddCallback) {
                            console.log("sd",device.slat,device.slan);
                            getOSMAddress({latitude: device.slat, longitude: device.slan}, function (resp) {                            console.log("11");

                                if (resp.status) {
                                    device.startAddress=resp.address;
                                    startAddCallback(false);

                                } else {
                                    startAddCallback(true);

                                }

                            })
                        }, endAdd: function (endAddCallback) {
                            getOSMAddress({latitude: device.elat, longitude: device.elan}, function (resp) {                            console.log("122");

                                if (resp.status) {
                                    device.endAddress=resp.address;
                                    endAddCallback(false);

                                } else {
                                    endAddCallback(true);

                                }

                            })
                        },distance:function (distanceCallback) {
                            device.distance=1.609344 * 3956 * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((device.elat-device.slat)*Math.PI/180 /2),2)+Math.cos(device.slat*Math.PI/180)*Math.cos(device.elat*Math.PI/180)*Math.pow(Math.sin((device.elan-device.slan)*Math.PI/180/2),2)))
                            console.log(device.distance);
                            distanceCallback(false)
                        }
                    }, function (err) {
                        if(err){
                            console.log("errrr==========>>>>>>>>>>>>>>>>.");
                        }else{
                            console.log("44");

                            setTimeout(function () {
                                deviceCallback(false);


                            }, 10);
                        }
                    })
                }, function (err) {
                    if (err) {
                        console.log("errrr==========<<<<<<<<<<<<<<<<<<<<<<<<<,,,,,,.");

                    } else {
                        console.log("end out put",output);
                    }
                })
            }
        });

    }
};
module.exports = new Events();