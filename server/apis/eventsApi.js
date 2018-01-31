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
var TrucksColl = require('./../models/schemas').TrucksColl;
var DeviceColl = require('./../models/schemas').DeviceColl;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');


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
    var accountDataQuery = "select accountID as userName,contactPhone,password,contactEmail as email from Account order by accountID";
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
                if (!AccountData.contactPhone || AccountData.contactPhone.trim().length == 0 || isNaN(AccountData.contactPhone)) {
                    delete AccountData.contactPhone;
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
                if(error){
                    console.log(error);
                } else {
                    console.log("New trucks inserted");
                }
            });
        }

        AccountsColl.find({},{"userName":1}, function (err, accounts) {
            for(var i=0;i<accounts.length;i++){
                TrucksColl.update({'userName': accounts[i].userName}, {$set: {accountId: accounts[i]._id}}, {multi: true}, function (err, truck) {
                    console.log("Truck is updated "+ JSON.stringify(truck));
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
                    deviceData.installTime = device.installTime
                    var deviceDoc = new DeviceColl(deviceData);
                    deviceDoc.save(deviceData, function (error, device) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("New device inserted");
                        }
                    });
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
                    //EventData.createTruckData(truckData,deviceData);
                }
                retObj.status = true;
                retObj.messages.push('trucks are being loaded');
                callback(retObj);
            }
        }
    });
}

function convertDate(olddate) {
    if(!olddate) {
        return new Date();
    } else if (olddate == "0000-00-00") {
        return new Date();
    } else {
        return new Date(olddate);
    }
}

module.exports = new Events();