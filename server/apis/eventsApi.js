var mysql = require('mysql');
var async = require('async');

var config = require('./../config/config');
var Events = function() {};
// var pool  = mysql.createPool(config.mysql);

Events.prototype.getEventData = function(accountId, callback) {
    var retObj = {};

    if(!accountId) {
        retObj.status = false;
        retObj.message = 'Invalid account Id';
        callback(retObj);
    } else {
        var eventDataQuery = "SELECT deviceID, timestamp, latitude, longitude FROM gts.EventData WHERE accountID='" + accountId + "'";
        var eventDataTempQuery = "SELECT deviceID, timestamp, latitude, longitude FROM gts.EventDataTemp WHERE accountID='" + accountId + "'";

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
                retObj.message = 'Error fetching data';
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.message = 'Success';
                retObj.results = results.eventData.concat(results.eventDataTemp);
                callback(retObj);
            }
        });
    }
};

module.exports = new Events();