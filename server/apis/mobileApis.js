var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var GoogleUrl = require( 'google-url' );
var devicePostions = require('./../models/schemas').GpsColl;
var SecretKeysColl = require('./../models/schemas').SecretKeysColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DevicesColl = require('./../models/schemas').DeviceColl;
var DriversColl = require('./../models/schemas').DriversColl;
var ShareLinksColl = require('./../models/schemas').ShareLinksColl;

var archivedDevicePositions = require('./../models/schemas').archivedDevicePositionsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var mailerApi = require('./../apis/mailerApi');
var SmsService = require('./smsApi');
var mongoose = require('mongoose');
var request = require('request');
const ObjectId = mongoose.Types.ObjectId;
var config = require('../config/config');
var GpsSettingsColl = require('./../models/schemas').GpsSettingsColl;
var json2xls = require('json2xls');
var fs = require('fs');


var SecretKeyCounterColl = require('./../models/schemas').SecretKeyCounterColl;


var MobileApis = function () {
};

function resolveAddress(position, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var options = {
        provider: 'google',
        httpAdapter: 'https'
    };
    var fulldate = new Date();
    var today = fulldate.getDate() + '/' + (fulldate.getMonth() + 1) + '/' + fulldate.getFullYear();
    SecretKeyCounterColl.findOne({
        date: today,
        counter: {$lt: config.googleSecretKeyLimit}
    }).exec(function (errsecret, counterEntry) {
        if (errsecret) {
            retObj.messages.push("address finding error," + JSON.stringify(errsecret.message));
            callback(retObj);
        } else if (counterEntry) {/*if key is available search address*/
            options.apiKey = counterEntry.secret;
            console.log('counterEntry.secret   '+ counterEntry.secret);
            var geocoder = nodeGeocoder(options);
            geocoder.reverse({lat: position.latitude, lon: position.longitude}, function (errlocation, location) {
                if (location) {
                    // console.log('google response '+ JSON.stringify(location));
                    retObj.status = true;
                    retObj.address = location[0]['formattedAddress'];
                    SecretKeyCounterColl.findOneAndUpdate({_id: counterEntry._id}, {$inc: {counter: 1}}, function (incerr, increased) {
                        if (incerr) {
                            retObj.messages.push('Error incrementing secret');
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Secret Incremented');
                        }
                        callback(retObj);
                    });
                } else {
                    retObj.status = true;
                    //retObj.messages.push("address finding error," + JSON.stringify(errlocation.message));
                    callback(retObj);
                }
            });
        } else {
            SecretKeyCounterColl.find({date: today}, {'secret': 1}, function (error, keys) {
                SecretKeysColl.findOne({"secret": {$nin: [keys]}}, function (err, secDoc) {
                    if (err) {
                        retObj.messages.push("address finding error," + JSON.stringify(err.message));
                        callback(retObj);
                    } else if (secDoc) {
                        var secretKeyCount = new SecretKeyCounterColl({
                            date: today,
                            secret: secDoc.secret,
                            counter: 0
                        });
                        secretKeyCount.save(function (saveSecKeyErr, saveSecDoc) {
                            if (err) {
                                retObj.messages.push("address finding error," + JSON.stringify(err.message));
                                callback(retObj);
                            } else {
                                resolveAddress(position, callback);
                            }
                        })
                    } else {
                        retObj.messages.push("No more secret keys");
                        callback(retObj);
                    }
                });
            });
        }
    });
}


MobileApis.prototype.getTruckLocations = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null}};
    }else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}};
    }
    TrucksColl.find(condition, function (err, trucksData) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error retrieving trucks data');
            callback(retObj);
        } else {
            async.each(trucksData, function (truck, asyncCallback) {
                if (truck.attrs.latestLocation && (!truck.attrs.latestLocation.address || truck.attrs.latestLocation.address === '{address}'
                    || !truck.attrs.latestLocation.address || truck.attrs.latestLocation.address.trim().length == 0 ||
                    truck.attrs.latestLocation.address.indexOf('Svalbard') != -1) && (truck.attrs.latestLocation.latitude||
                    truck.attrs.latestLocation.longitude)) {
                    resolveAddress({
                        latitude: truck.attrs.latestLocation.latitude || truck.attrs.latestLocation.location.coordinates[1],
                        longitude: truck.attrs.latestLocation.longitude || truck.attrs.latestLocation.location.coordinates[0]
                    }, function (addressResp) {
                        if (addressResp.status) {
                            truck.attrs.latestLocation.address = addressResp.address;
                            // console.log('updating truck ' + truck.registrationNo + '   address '+addressResp.address );
                            TrucksColl.findOneAndUpdate({"registrationNo":truck.registrationNo}, {$set: {"attrs.latestLocation.address": addressResp.address}}, function(err, updated) {
                                //  console.log('truck updated ' + updated);
                            });
                            asyncCallback(false);
                        } else {
                            asyncCallback(addressResp);
                        }
                    });

                } else {
                    asyncCallback(false);
                }
            }, function (err) {
                if (err) {
                    callback(err);
                } else {
                    var response = [];
                    for(var i = 0; i< trucksData.length; i++){
                        truckInfo ={
                            "truck_no": trucksData[i].registrationNo,
                            "deviceID": trucksData[i].deviceId,
                            "vehicleType": trucksData[i].truckType,
                            "vehicleModel": trucksData[i].truckType
                        }
                        if(trucksData[i].attrs && trucksData[i].attrs.latestLocation){
                            var latestLocation = trucksData[i].attrs.latestLocation;
                            truckInfo.latitude = trucksData[i].attrs.latestLocation.latitude;
                            truckInfo.longitude = trucksData[i].attrs.latestLocation.longitude;
                            latestLocation.speed = Math.ceil(parseFloat(latestLocation.speed)* 1.82);
                            latestLocation.speed = latestLocation.speed;
                            truckInfo.speedValue = latestLocation.speed;
                            truckInfo.speed = parseFloat(latestLocation.speed) +" km/hr";
                            var d = new Date(trucksData[i].attrs.latestLocation.deviceTime);
                            truckInfo.date_time = d.getDate()+"-"+(d.getMonth()+1)+"-"+(d.getYear() -100) + " "+ d.getHours()+"-"+d.getMinutes();
                            truckInfo.odometer =  Math.ceil(latestLocation.totalDistance);
                            truckInfo.todayOdo =  Math.ceil(latestLocation.totalDistance);
                            const millisecondsPerMinute = 60000;
                            if(truckInfo.speedValue == 0.00){
                                if(latestLocation.createdAt < -  new Date().getTime()-millisecondsPerMinute*30){
                                    truckInfo.momentStatus = "Long Stop";
                                } else {
                                    truckInfo.momentStatus = "Stop";
                                }
                            } else {
                                truckInfo.momentStatus = "Running";
                            }
                            if(latestLocation.createdAt < -  new Date().getTime()-millisecondsPerMinute*30*4){
                                truckInfo.momentMsg = "GPS Connection Lost.Contact Support!";
                            }
                            truckInfo.address = latestLocation.address;
                        } else{
                            truckInfo.address = "Unknown";
                            truckInfo.momentStatus = "Long Stop";
                            truckInfo.momentMsg = "GPS Connection Lost.Contact Support!";
                            truckInfo.odometer = 0;
                            truckInfo.speed = 0;
                            truckInfo.speedValue = "0 km/hr";
                            var d = new Date();
                            truckInfo.date_time = d.getDate()+"-"+(d.getMonth()+1)+"-"+(d.getYear() -100) + " "+ d.getHours()+"-"+d.getMinutes();

                        }
                        response.push(truckInfo);
                    }
                    retObj.status = true;
                    retObj.data = response;
                    callback(retObj);


                    /*
                    "heading": "350",
                            "lastUpdateTime": trucksData.attrs.la,
                            "truck_no": "SPYD1",
                            "deviceID": "SPYD1",
                            "latitude": "18.376054444444442",
                            "longitude": "79.83041777777777",
                            "speedValue": "19",
                            "time_in_secs": "1545456088",
                            "date_time": "22-12-18 10:51",
                            "odometer": "8134 Km",
                            "vehicleType": "TK",
                            "vehicleModel": "12 Tyre-21 Ton",
                            "lookingForLoad": 0,
                            "lookingForLoadDate": "0000-00-00",
                            "todayOdo": "8134 Km",
                            "momentStatus": "Damage",
                            "momentMsg": "GPS Connection Lost.Contact Support!",
                            "speed": "19 Km/Hr",
                            "address": "18\u00b022'36.0\"N 79\u00b049",
                            "truck_owner": "krishna",
                            "truck_owner_phone": "9676777256"
                     */
                }

            });
        }
    })
};


module.exports = new MobileApis();