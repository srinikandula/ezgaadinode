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

Events.prototype.getTrucksData = function (request, callback) {
    var retObj = {
        status: false,
        messages: [],
    };

    var groupId = null;
    var driverId = null;
    var pollutionExpiry = "0000-00-00";// getting error using default value as null
    var taxDueDate = "0000-00-00";// getting error using default value as null
    AccountsColl.find({}, function (error, accountsData) {
        accountsData.forEach(function (account) {
            if (account.userName !== "") {
                var trucksDataQuery = "select t.truck_reg_no as registrationNo,c.type as truckType,tt.title as modelAndYear,tt.tonnes as tonnage,t.fitness_certificate_expiry_date as fitnessExpiry,t.national_permit_expiry_date as permitExpiry,t.vehicle_insurance_expiry_date as insuranceExpiry,t.tracking_available,t.status from eg_truck t left join eg_customer c on c.id_customer=t.id_customer left join eg_truck_type tt on t.id_truck_type=tt.id_truck_type where c.gps_account_id='" + account.userName + "'";
                var deviceDataQuery = "select vehicleId as registrationNo,vehicleModel as truckType,vehicleModel as modelAndYear,vehicleModel as tonnage,fitnessExpire as fitnessExpiry,NPExpire as permitExpiry,insuranceExpire as insuranceExpiry from Device where accountId = '" + account.userName + "'";
                async.parallel({
                    truckData: function (truckDataCallback) {
                        pool_crm.query(trucksDataQuery, function (err, truckDataResults) {
                            truckDataCallback(err, truckDataResults)
                        });
                    },
                    deviceData: function (deviceDataCallback) {
                        pool.query(deviceDataQuery, function (err, deviceDataResults) {
                            deviceDataCallback(err, deviceDataResults)
                        });
                    }
                }, function (err, results) {
                    console.log(results);
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    } else {
                        console.log("looking up :" + account.userName);
                        retObj.results = results.truckData.concat(results.deviceData);
                        console.log(account.userName + ' --->trucks: ' + retObj.results.length);
                        for (var i = 0; i < retObj.results.length; i++) {
                            var truckData = retObj.results[i];
                            truckData.fitnessExpiry = convertDate(truckData.fitnessExpiry);
                            truckData.permitExpiry = convertDate(truckData.permitExpiry);
                            truckData.insuranceExpiry = convertDate(truckData.insuranceExpiry);
                            truckData.pollutionExpiry = convertDate(truckData.pollutionExpiry);
                            truckData.taxDueDate = convertDate(truckData.taxDueDate);
                            truckData.accountId = account._id;
                            truckData.driverId = driverId;
                            truckData.pollutionExpiry = convertDate(pollutionExpiry);
                            truckData.taxDueDate = convertDate(taxDueDate);
                            EventData.createTruckData(truckData);
                        }
                        console.log("Done Loading all trucks for account");
                        retObj.count = retObj.results.length;
                        retObj.status = true;
                        retObj.messages.push('Done');
                        callback(retObj);
                    }
                });
            }
        });
        console.log("Done Loading for all accounts");
    });
}

Events.prototype.getDeviceTrucksData = function (request, callback) {
    var retObj = {
        status: false,
        messages: [],
    };
    //DeviceColl.remove({},function (error,deviceData) {
    TrucksColl.find({}, function (error, trucksData) {
        trucksData.forEach(function (truck) {
            if (truck.registrationNo !== "") {
                console.log('account', truck.registrationNo);
                var deviceTrucksDataQuery = "select deviceId,simID as simNumber,imeiNumber as imei,simPhoneNumber,installedBy,devicePaymentStatus,isDamaged,equipmentType,serialNumber from Device where vehicleID = '" + truck.registrationNo + "'";
                console.log('deviceTrucksDataQuery', deviceTrucksDataQuery);
                pool.query(deviceTrucksDataQuery, function (err, queryData) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    } else {
                        if (queryData.length !== 0) {
                            for (var i = 0; i < queryData.length; i++) {
                                queryData[i].createdBy = truck.accountId;
                                queryData[i].truckId = truck._id;
                                queryData[i].accountId = truck.accountId;
                                EventData.createDeviceTruckData(queryData[i]);
                            }
                        }
                    }
                });
            }
        });
    });
    //});
}

function convertDate(olddate) {
    if (olddate == "0000-00-00") {
        return new Date();
    } else {
        return new Date(olddate);
    }
}

module.exports = new Events();