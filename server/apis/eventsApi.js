var mysql = require('mysql');
var async = require('async');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var config = require('./../config/config');
var Events = function () {
};
var pool = mysql.createPool(config.mysql);
var pool_crm = mysql.createPool(config.mysql_crm);
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
    var accountDataQuery = "select accountID as userName,contactPhone,password,contactEmail as email,contactName,contactAddress,displayName from Account order by accountID";
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
                AccountData.gpsEnabled = true;
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
    AccountsColl.find({}, function (error, accountsData) {
        accountsData.forEach(function (account) {
            if (account.userName) {
                var accountGroupDataQuery = "select accountID as userName,contactPhone,password from DeviceGroup where accountID='" + account.userName + "'";
                pool.query(accountGroupDataQuery, function (err, results) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        analyticsService.create(request, serviceActions.get_account_grp_data_err, {
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
                            var accountGroupData = retObj.results[i];
                            accountGroupData.accountId = account._id;
                            accountGroupData.type = 'group';
                            if (!accountGroupData.contactPhone || accountGroupData.contactPhone.trim().length == 0 || isNaN(accountGroupData.contactPhone)) {
                                delete accountGroupData.contactPhone;
                            }
                            EventData.createAccountGroupData(accountGroupData)
                        }
                        retObj.count = retObj.results.length;
                        analyticsService.create(request, serviceActions.get_account_grp_data, {success: true}, function (response) {
                        });
                        callback(retObj);
                    }
                });
            }
        });
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

    var trucksDataQuery = "select c.gps_account_id as userName, t.truck_reg_no as registrationNo,c.type as truckType,tt.title as modelAndYear,tt.tonnes as tonnage,t.fitness_certificate_expiry_date as fitnessExpiry,t.national_permit_expiry_date as permitExpiry,t.vehicle_insurance_expiry_date as insuranceExpiry,t.tracking_available,t.status from eg_truck t left join eg_customer c on c.id_customer=t.id_customer left join eg_truck_type tt on t.id_truck_type=tt.id_truck_type ";// where c.gps_account_id='" + account.userName + "'";
    var trucks = [];
    pool_crm.query(trucksDataQuery, function (err, truckDataResults) {
        for (var i = 0; i < truckDataResults.length; i++) {
            var truckData = truckDataResults[i];
            var truck = {};

            truck.fitnessExpiry = convertDate(truckData.fitnessExpiry);
            truck.permitExpiry = convertDate(truckData.permitExpiry);
            truck.insuranceExpiry = convertDate(truckData.insuranceExpiry);
            truck.pollutionExpiry = convertDate(truckData.pollutionExpiry);
            truck.taxDueDate = convertDate(truckData.taxDueDate);
            //truckData.driverId = driverId;
            truck.pollutionExpiry = convertDate(pollutionExpiry);
            truck.taxDueDate = convertDate(taxDueDate);
            truck.registrationNo = truckData.registrationNo;
            truck.userName = truckData.userName;
            var truckDoc = new TrucksColl(truck);
            truckDoc.save(truckDoc, function (error, newTrucks) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("New trucks inserted");
                }
            });
        }

        AccountsColl.find({}, {"userName": 1}, function (err, accounts) {
            for (var i = 0; i < accounts.length; i++) {
                TrucksColl.update({'userName': accounts[i].userName}, {$set: {accountId: accounts[i]._id}}, {multi: true}, function (err, truck) {
                    console.log("Truck is updated " + JSON.stringify(truck));
                });
            }
        });

        retObj.status = true;
        retObj.messages.push('trucks are being loaded from eg_truck');
        callback(retObj);
    });
}

Events.prototype.createTruckFromDevices = function (request, callback) {
    var retObj = {
        status: false,
        messages: [],
    };

    var deviceDataQuery = "select accountId, deviceId, installedById, devicePaymentStatus, currentPlanId, isDamaged, equipmentType, vehicleModel, vehicleId, licenseExpire, insuranceExpire, fitnessExpire, NPExpire, fuelCapacity, installTime, resetTime, expirationTime, serialNumber, simPhoneNumber, simID, imeiNumber, isActive, lastStopTime from Device";
    pool.query(deviceDataQuery, function (err, devices) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            if (devices.length !== 0) {
                for (var i = 0; i < devices.length; i++) {
                    var device = devices[i];
                    var truckData = {};
                    truckData.userName = device.accountId;
                    truckData.fitnessExpiry = convertDate(device.fitnessExpire);
                    truckData.permitExpiry = convertDate(device.NPExpire);
                    truckData.insuranceExpiry = convertDate(device.insuranceExpire);
                    truckData.pollutionExpiry = convertDate(device.pollutionExpiry);
                    truckData.taxDueDate = convertDate(device.taxDueDate);
                    truckData.deviceId = device.imeiNumber;
                    truckData.registrationNo = device.vehicleId;
                    truckData.truckType = device.vehicleModel;
                    truckData.tracking_available = 1;
                    var truckDoc = new TrucksColl(truckData);
                    truckDoc.save(truckDoc, function (error, newTrucks) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("New trucks inserted");
                        }
                    });

                    var deviceData = {};
                    deviceData.deviceId = device.deviceId;
                    //deviceData.truckId = truckId; //get deviceId
                    deviceData.simNumber = device.simID;
                    deviceData.imei = device.imeiNumber;
                    deviceData.simPhoneNumber = device.simPhoneNumber;
                    deviceData.installedBy = device.installedById;
                    deviceData.userName = device.accountId; //find accountId
                    deviceData.devicePaymentStatus = device.devicePaymentStatus;
                    deviceData.devicePaymentPlan = device.currentPlanId;
                    deviceData.isDamaged = device.isDamaged;
                    deviceData.equipmentType = device.equipmentType;
                    deviceData.serialNumber = device.serialNumber;
                    deviceData.isActive = device.isActive;
                    deviceData.lastStopTime = device.lastStopTime;
                    deviceData.fuelCapacity = device.fuelCapacity;
                    deviceData.installTime = device.installTime;
                    var deviceDoc = new DeviceColl(deviceData);
                    deviceDoc.save(deviceData, function (error, device) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("New device inserted");
                        }
                    });

                    if(i===devices.length-1){
                        retObj.status = true;
                        retObj.messages.push('trucks are being loaded');
                        callback(retObj);
                    }
                    //EventData.createTruckData(truckData,deviceData);
                }
                AccountsColl.find({}, {"userName": 1}, function (err, accounts) {
                    for (var i = 0; i < accounts.length; i++) {
                        TrucksColl.update({'userName': accounts[i].userName}, {$set: {accountId: accounts[i]._id}}, {multi: true}, function (err, truck) {
                            console.log("Truck is updated " + JSON.stringify(truck));
                        });
                        DeviceColl.update({'userName': accounts[i].userName}, {$set: {accountId: accounts[i]._id}}, {multi: true}, function (err, device) {
                            console.log("Device is updated " + JSON.stringify(device));
                        });
                    }
                });
            }
        }
    });
};

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
                erpGpsPlansColl.findOne({devicePlanId: plan.id_device_plans}, function (findplanerr, planfound) {
                    if (findplanerr) {
                        planCallBack(findplanerr);
                    } else if (planfound) {
                        planCallBack('plan added already');
                    } else {
                        var planDoc = new erpGpsPlansColl({
                            devicePlanId: plan.id_device_plans,
                            franchiseId: plan.id_franchise,
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
                });
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
                                        // console.log(plan.accountID, accountid);
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
                                    planIdCallback(planiderr, planid._id);
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
                franchiseColl.findOne({franchiseId: franchise.id_franchise}, function (findFranchiseErr, franchiseFound) {
                    if (findFranchiseErr) {
                        franchiseCallBack(findFranchiseErr);
                    } else if (franchiseFound) {
                        franchiseCallBack('franchise exists');
                    } else {
                        var franchiseDoc = new franchiseColl({
                            franchiseId: franchise.id_franchise,
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
    var adminRoleQuery = "select * from eg_admin_role";
    pool_crm.query(adminRoleQuery, function (err, roles) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(roles, function (role, roleCallBack) {
                adminRoleColl.findOne({adminRoleId: role.id_admin_role}, function (findRoleErr, roleFound) {
                    if (findRoleErr) {
                        roleCallBack(findRoleErr);
                    } else if (roleFound) {
                        roleCallBack('role exists');
                    } else {
                        var roleDoc = new adminRoleColl({
                            adminRoleId: role.id_admin_role,
                            id_franchise: role.id_franchise,
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
    var adminPermissionsQuery = "select * from eg_admin_permissions";
    pool_crm.query(adminPermissionsQuery, function (err, permissions) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(permissions, function (permission, permissionCallBack) {
                adminPermissionsColl.findOne({adminPermissionId: permission.id_admin_role}, function (findPermissionErr, permissionFound) {
                    if (findPermissionErr) {
                        permissionCallBack(findPermissionErr);
                    } else if (permissionFound) {
                        permissionCallBack('permission exists');
                    } else {
                        var permissionDoc = new adminPermissionsColl({
                            adminPermissionId: permission.id_admin_permission,
                            id_admin_role: permission.id_admin_role,
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
                        });
                        permissionDoc.save(function (err) {
                            adminRoleColl.find({}, {"adminRoleId": 1}, function (err, roles) {
                                for (var i = 0; i < roles.length; i++) {
                                    adminPermissionsColl.update({'id_admin_role': roles[i].adminRoleId}, {$set: {adminRoleId: roles[i]._id}}, {multi: true}, function (err, permission) {
                                        console.log("Permission is updated " + JSON.stringify(permission));
                                    });
                                }
                            });
                            permissionCallBack(err, 'saved');
                        })
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
    var employeeDataQuery = "select * from eg_admin";
    pool_crm.query(employeeDataQuery, function (err, employees) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(employees, function (employee, employeeCallBack) {
                AccountsColl.findOne({email: employee.email}, function (findEmployeeErr, employeeFound) {
                    if (findEmployeeErr) {
                        employeeCallBack(findEmployeeErr);
                    } else if (employeeFound) {
                        employeeCallBack(null, 'Employee exists');
                    } else {
                        var employeeDoc = new AccountsColl({
                            userName: employee.email,
                            contactPhone: employee.phone,
                            password: "12345678",
                            email: employee.email,
                            type: "employee",
                            id_admin: employee.id_admin,
                            id_franchise: employee.id_franchise,
                            id_admin_role: employee.id_admin_role,
                            firstName: employee.first_name,
                            lastName: employee.last_name,
                            contactName: employee.first_name+' '+employee.last_name,
                            displayName: employee.first_name+' '+employee.last_name,
                            city: employee.city,
                            state: employee.state,
                            location: employee.city+' '+employee.state,
                            isActive: employee.status,
                            // createdAt: convertDate(employee.date_created),
                            // updatedAt: convertDate(employee.date_modified),
                        });
                        employeeDoc.save(function (err) {
                            adminRoleColl.find({}, {"adminRoleId": 1}, function (err, roles) {
                                for (var i = 0; i < roles.length; i++) {
                                    AccountsColl.update({'id_admin_role': roles[i].adminRoleId}, {$set: {adminRoleId: roles[i]._id}}, {multi: true}, function (err, permission) {
                                        console.log("Account is updated " + JSON.stringify(permission));
                                    });
                                }
                            });
                            employeeCallBack(err, 'saved');
                        })
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
    var AccountOperatingRoutesDataQuery = "SELECT accountID as id_account, source_city as source, source_state as sourceState, source_address as sourceAddress, source_lat as sourceLatitude, source_lng as sourceLongitude, destination_city as destination, destination_state as destinationState, destination_address as destinationAddress, destination_lat as destinationLatitude, destination_lng as destinationLongitude FROM AccountOperatingDestinations";
    pool.query(AccountOperatingRoutesDataQuery, function (err, AccountOperatingRoutes) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(AccountOperatingRoutes, function (AccountOperatingRoute, AccountOperatingRoutesCallBack) {
                OperatingRoutesColl.findOne({id_account: AccountOperatingRoute.id_account,source: AccountOperatingRoute.source,sourceState: AccountOperatingRoute.sourceState,sourceLatitude: AccountOperatingRoute.sourceLatitude,sourceLongitude: AccountOperatingRoute.sourceLongitude,destination: AccountOperatingRoute.destination,destinationState: AccountOperatingRoute.destinationState,destinationLatitude: AccountOperatingRoute.destinationLatitude,destinationLongitude: AccountOperatingRoute.destinationLongitude}, function (findAccountOperatingRoutesErr, AccountOperatingRoutesFound) {
                    if (findAccountOperatingRoutesErr) {
                        AccountOperatingRoutesCallBack(findAccountOperatingRoutesErr);
                    } else if (AccountOperatingRoutesFound) {
                        AccountOperatingRoutesCallBack(null, 'Account Operating Routes exists');
                    } else {
                        AccountOperatingRoute.sourceLocation = {
                            coordinates:[AccountOperatingRoute.sourceLongitude,AccountOperatingRoute.sourceLatitude]
                        }
                        AccountOperatingRoute.destinationLocation = {
                            coordinates:[AccountOperatingRoute.destinationLongitude,AccountOperatingRoute.destinationLatitude]
                        };
                        var AccountOperatingRoutesDoc = new OperatingRoutesColl(AccountOperatingRoute);
                        AccountOperatingRoutesDoc.save(function (err) {
                            AccountsColl.find({}, {"userName": 1}, function (err, accounts) {
                                for (var i = 0; i < accounts.length; i++) {
                                    OperatingRoutesColl.update({'id_account': accounts[i].userName}, {$set: {accountId: accounts[i]._id}}, {multi: true}, function (err, permission) {
                                        console.log("Account is updated " + JSON.stringify(permission));
                                    });
                                }
                            });
                            AccountOperatingRoutesCallBack(err, 'saved');
                        })
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
    } else if (olddate == "0000-00-00") {
        return new Date();
    } else {
        return new Date(olddate);
    }
}

Events.prototype.getCompleteData = function (req,callback) {
    var events=new Events();
    async.series({
        one: function(callBackOne) {
            events.getAccountData(req, function (result1) {
                console.log('1 Completed',result1);
                if(result1.status){
                    callBackOne(null,result1);
                }else{
                    callBackOne(result1,null);
                }
            })
        },
        two: function(callBackTwo){
            events.createTruckFromEGTruck(req, function (result2) {
                console.log('2 Completed',result2);
                if(result2.status){
                    callBackTwo(null,result2);
                }else{
                    callBackTwo(result2,null);
                }
            })
        },
        three:function (callBackThree) {
            events.createTruckFromDevices(req,function (result) {
                console.log('3 Completed',result);
                if(result.status){
                    callBackThree(null,result);
                }else{
                    callBackThree(result,null);
                }
            })
        },
        four:function (callBackFour) {
            events.getDevicePlans(req,function (result) {
                console.log('4 Completed',result);
                if(result.status){
                    callBackFour(null,result);
                }else{
                    callBackFour(result,null);
                }
            })
        },
        five:function (callBackFive) {
            events.devicePlansHistory(req,function (result) {
                console.log('5 Completed',result);
                if(result.status){
                    callBackFive(null,result);
                }else{
                    callBackFive(result,null);
                }
            })
        },
        six:function (callBackSix) {
            events.getFranchise(req,function (result) {
                console.log('6 Completed',result);
                if(result.status){
                    callBackSix(null,result);
                }else{
                    callBackSix(result,null);
                }
            })
        },
        seven:function (callBackSeven) {
            events.getAdminRoles(req,function (result) {
                console.log('7 Completed',result);
                if(result.status){
                    callBackSeven(null,result);
                }else{
                    callBackSeven(result,null);
                }
            })
        },
        /*eight:function (callBackEight) {
            events.getAdminPermissions(req,function (result) {
                console.log('8 Completed',result);
                if(result.status){
                    callBackEight(null,result);
                }else{
                    callBackEight(result,null);
                }
            })
        },*/
        nine:function (callBackNine) {
            events.getTrucksTypeData(req,function (result) {
                console.log('9 Completed',result);
                if(result.status){
                    callBackNine(null,result);
                }else{
                    callBackNine(result,null);
                }
            })
        }
    }, function(err,results) {
        if(err){
            callback({});
        }else{
            callback(results);
            console.log(results);
        }
    });
};

Events.prototype.getAlternateContact = function (req,callback) {
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
                AccountsColl.update({userName:AccountData.userName},{$set:{alternatePhone:AccountData.alternatePhone}},function (err,result) {
                    if(err){
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    }else{
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.results = results;
                    }
                });
                if(i===retObj.results.length-1){
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
                TrucksTypesColl.findOne({title: trucksType.title,tonnes: trucksType.tonnes,mileage: trucksType.mileage}, function (findTrucksTypeErr, trucksTypeFound) {
                    if (findTrucksTypeErr) {
                        trucksTypeCallBack(findTrucksTypeErr);
                    } else if (trucksTypeFound) {
                        trucksTypeCallBack(null, 'Trucks Type exists');
                    } else {
                        if(trucksType.status === 1) {
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
                        if(goodsType.status === 1) {
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
                        if(loadType.status === 1) {
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
    var orderStatusDataQuery = "select * from eg_order_status";
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
                        if(orderStatus.status === 1) {
                            status = true;
                        }
                        var orderStatusDoc = new OrderStatusColl({
                            title: orderStatus.title,
                            status: status,
                        });
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

Events.prototype.getCustomersData = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var status = false;
    var customerDataQuery = "select * from eg_customer";
    pool_crm.query(customerDataQuery, function (err, customers) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));
            callback(retObj);
        } else {
            async.map(customers, function (customer, customerCallBack) {
                AccountsColl.findOne({title: customer.title}, function (findLoadTypeErr, customerFound) {
                    if (findLoadTypeErr) {
                        customerCallBack(findLoadTypeErr);
                    } else if (customerFound) {
                        customerCallBack(null, 'Customer exists');
                    } else {
                        if(customer.status === 1) {
                            status = true;
                        }
                        var customerDoc = new AccountsColl({
                            title: customer.title,
                            status: status,
                        });
                        customerDoc.save(function (err) {
                            customerCallBack(err, 'saved');
                        })
                    }
                });
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
};

module.exports = new Events();