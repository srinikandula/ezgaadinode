var mysql = require('mysql');
var async = require('async');

var config = require('./../config/config');
var Events = function() {};
var pool  = mysql.createPool(config.mysql);

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

module.exports = new Events();