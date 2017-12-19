var mysql = require('mysql');
var async = require('async');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var config = require('./../config/config');
var Events = function() {};
var pool  = mysql.createPool(config.mysql);
var pool_crm  = mysql.createPool(config.mysql_crm);
var EventData = require('./../apis/eventDataApi');
var AccountsColl = require('./../models/schemas').AccountsColl;

Events.prototype.getEventData = function(accountId, startDate, endDate, callback) {
    var retObj = {};
    retObj.messages = [];

    if(!accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id');
    }

    if(retObj.messages.length == 0) {
        var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + accountId + "' and timestamp >= "+ startDate +" and timestamp <= "+ endDate;
        var eventDataTempQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventDataTemp WHERE accountID='" + accountId + "' and timestamp >= "+ startDate+" and timestamp <= "+ endDate;

        async.parallel({
            eventData: function(eventDataCallback) {
                pool.query(eventDataQuery, function(err, eventDataResults) {
                    eventDataCallback(err, eventDataResults)
                });
            },
            eventDataTemp: function(eventDataTempCallback) {
                pool.query(eventDataTempQuery, function(err, eventDataTempResults) {
                    eventDataTempCallback(err, eventDataTempResults)
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
                retObj.results = results.eventData.concat(results.eventDataTemp);
                retObj.count = retObj.results.length;
                callback(retObj);
            }
        });
    } else {
        callback(retObj);
    }
};



Events.prototype.getLatestLocations = function(accountId,callback) {
    var retObj = {};
    retObj.messages = [];

    if(!accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id');
    }

    if(retObj.messages.length == 0) {
        var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + accountId + "' GROUP BY deviceID ORDER BY timestamp asc";
        var eventDataTempQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventDataTemp WHERE accountID='" + accountId + "' GROUP BY deviceID ORDER BY timestamp asc";

        async.parallel({
            eventData: function(eventDataCallback) {
                pool.query(eventDataQuery, function(err, eventDataResults) {
                    eventDataCallback(err, eventDataResults)
                });
            },
            eventDataTemp: function(eventDataTempCallback) {
                pool.query(eventDataTempQuery, function(err, eventDataTempResults) {
                    eventDataTempCallback(err, eventDataTempResults)
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
                retObj.results = results.eventData.concat(results.eventDataTemp);
                retObj.count = retObj.results.length;
                callback(retObj);
            }
        });
    } else {
        callback(retObj);
    }
};


/**
 * Find the latest GPS location of the device in an account
 * @param accountId
 * @param deviceId
 * @param callback
 */

Events.prototype.getLatestLocation = function(jwt, deviceId, callback) {
    var retObj = {};
    retObj.messages = [];

    if(!jwt.accountId) {
        retObj.status = false;
        retObj.messages.push('Invalid account Id, please check the authentication token');
    }
    if(!deviceId) {
        retObj.status = false;
        retObj.messages.push('Invalid deviceId ');
    }
    if(retObj.messages.length == 0) {
        AccountsColl.findOne({"_id":ObjectId(jwt.accountId)}, function (error, account) {
           if(error){
               retObj.status = false;
               retObj.messages.push('Error finding account info' + error.message);
               callback(retObj);
           } else {
               var eventDataQuery = "SELECT deviceID as vehicle_number, accountID as transportername, timestamp as datetime, latitude, longitude, speedKPH as speed, distanceKM as distance FROM EventData WHERE accountID='" + account.userName + "' and deviceID = '"+deviceId+"' order by timestamp limit 1";
               pool.query(eventDataQuery, function(error, latestLocation) {
                   if(error){
                       retObj.status = false;
                       retObj.messages.push('Error finding GPS location. info:' + error.message);
                       callback(retObj);
                   } else {
                       retObj.results = latestLocation;
                       retObj.status = true;
                       callback(retObj);
                   }
               });
           }
        });
    } else {
        callback(retObj);
    }
};

Events.prototype.getUserData = function (callback) {
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

    /*var userDataQuery = "select accountId,contactPhone,password from DeviceGroup";

    pool.query(userDataQuery, function(err, results) {
        if(err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            retObj.messages.push(JSON.stringify(err));

            callback(retObj);
        } else {
            if(results.length) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.results = results;
                retObj.count = retObj.results.length;
                callback(retObj);
            }
        }
    });*/
}

Events.prototype.getTrucksData = function (callback) {
    var retObj = {
        status: false,
        messages: [],
    };

    var accountId = null;
    var driverId = null;
    var pollutionExpiry = "0000-00-00";// getting error using default value as null
    var taxDueDate = "0000-00-00";// getting error using default value as null

    AccountsColl.find({},function(error, accountsData){
        accountsData.forEach(function (account) {
            if(account.userName !== "") {
                var trucksDataQuery = "select t.truck_reg_no as registrationNo,c.type as truckType,tt.title as modelAndYear,tt.tonnes as tonnage,t.fitness_certificate_expiry_date as fitnessExpiry,t.national_permit_expiry_date as permitExpiry,t.vehicle_insurance_expiry_date as insuranceExpiry,t.tracking_available from eg_truck t left join eg_customer c on c.id_customer=t.id_customer left join eg_truck_type tt on t.id_truck_type=tt.id_truck_type where c.gps_account_id='" + account.userName + "'";
                pool_crm.query(trucksDataQuery, function(err, queryData) {
                    if(err) {
                        retObj.status = false;
                        retObj.messages.push('Error fetching data');
                        retObj.messages.push(JSON.stringify(err));
                        callback(retObj);
                    } else {
                        if(queryData.length !== 0){
                            for(var i = 0;i < queryData.length;i++){
                                queryData[i].fitnessExpiry = convertDate(queryData[i].fitnessExpiry);
                                queryData[i].permitExpiry = convertDate(queryData[i].permitExpiry);
                                queryData[i].insuranceExpiry = convertDate(queryData[i].insuranceExpiry);
                                queryData[i].pollutionExpiry = convertDate(queryData[i].pollutionExpiry);
                                queryData[i].taxDueDate = convertDate(queryData[i].taxDueDate);
                                queryData[i].accountId = account._id;
                                queryData[i].driverId = driverId;
                                queryData[i].pollutionExpiry = convertDate(pollutionExpiry);
                                queryData[i].taxDueDate = convertDate(taxDueDate);
                                EventData.createTruckData(queryData[i]);
                            }
                        }
                    }
                });
            }
        });
    });
}

function convertDate(olddate) {
    if(olddate == "0000-00-00"){
        return new Date();
    } else {
        return new Date(olddate);
    }
}

module.exports = new Events();