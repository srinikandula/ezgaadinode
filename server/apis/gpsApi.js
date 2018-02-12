var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var config = require('./../config/config');

var GpsColl = require('./../models/schemas').GpsColl;
var SecretKeyColl = require('./../models/schemas').SecretKeysColl;
var SecretKeyCounterColl = require('./../models/schemas').SecretKeyCounterColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var archivedDevicePositions = require('./../models/schemas').ArchivedDevicePositionsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');

var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Gps = function () {
};

Gps.prototype.AddDevicePositions = function (position, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (position.latitude === 'true' || position.latitude === 'false') {
        position.latitude = position.valid;
        position.valid = false
    }
    position.location = {};
    position.location.coordinates = [position.longitude, position.latitude];
    if(!position.address) {
        getAddress(position, function (updatedAddress) {
            var positionDoc = new GpsColl(position);
            positionDoc.save(function (err,result) {
                if (err) {
                    retObj.messages.push('Error saving position');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Successfully saved the position');
                    TrucksColl.findOneAndUpdate({deviceId:positionDoc.deviceId},{$set:{"attrs.latestLocation":positionDoc}},function (truUpderr,result) {
                        if(truUpderr){
                            retObj.messages.push('Error updating the truck position');
                            callback(retObj);
                        }else{
                            retObj.status = true;
                            retObj.messages.push('Successfully updated the truck position');
                            callback(retObj);
                        }
                    });
                }
            });
        })
    } else {
        var positionDoc = new GpsColl(position);
        positionDoc.save(function (err,result) {
            if (err) {
                retObj.messages.push('Error saving position');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Successfully saved the position');
                TrucksColl.findOneAndUpdate({deviceId:positionDoc.deviceId},{$set:{"attrs.latestLocation":positionDoc}},function (truUpderr,result) {
                    if(truUpderr){
                        retObj.messages.push('Error updating the truck position');
                        callback(retObj);
                    }else{
                        retObj.status = true;
                        retObj.messages.push('Successfully updated the truck position');
                        callback(retObj);
                    }
                });
            }
        });
    }

};

function getAddress(position, callback) {
    var retObj = {
        status: true,
        messages: []
    };
    var options = {
        provider: 'google',
        httpAdapter: 'https'
    };
    var fulldate = new Date();
    var today = fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear();
    SecretKeyCounterColl.findOne({
        date: today,
        counter: {$lt: config.googleSecretKeyLimit}
    }).populate('secretId', {secret: 1}).exec(function (errsecret, secret) {
        if (errsecret) {
            retObj.messages.push('Error getting secret');
            callback(retObj);
        } else if (secret) {
            options.apiKey = secret.secretId.secret;
            var geocoder = nodeGeocoder(options);
            geocoder.reverse({lat: position.latitude, lon: position.longitude}, function (errlocation, location) {
                if (location) {
                    position.address = location[0]['formattedAddress'];
                }
                SecretKeyCounterColl.findOneAndUpdate({_id: secret._id}, {$inc: {counter: 1}}, function (incerr, increased) {
                    if (incerr) {
                        retObj.messages.push('Error incrementing secret');
                    } else {
                        retObj.messages.push('Secret Incremented');
                    }
                    callback(retObj);
                });
            });
        } else {
            retObj.messages.push('Secrets Completed for today');
            callback(retObj);
        }
    });
}

Gps.prototype.addSecret = function (secret, email, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    // var secret = 'AIzaSyCYmF9BGm2aYV6c27J5GXdtQYWYLUZehks';
    SecretKeyColl.findOne({secret: secret}, function (keyerr, key) {
        if (keyerr) {
            retObj.messages.push('Error saving secret');
            callback(retObj);
        } else if (key) {
            retObj.messages.push('Secret already exists');
            callback(retObj);
        } else {
            var secretDoc = new SecretKeyColl({secret: secret, email: email});
            secretDoc.save(function (err, secretSaved) {
                if (err) {
                    retObj.messages.push('Error saving secret');
                    callback(retObj);
                } else {
                    var fulldate = new Date();
                    var counterDoc = new SecretKeyCounterColl({
                        date: fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear(),
                        secretId: secretSaved._id,
                        counter: 0
                    });
                    counterDoc.save(function (err) {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        callback(retObj);
                    });
                }
            });
        }
    });
};

Gps.prototype.getAllSecrets = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var fulldate = new Date();
    SecretKeyCounterColl.find({date: fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear()}).populate('secretId', {secret: 1}).exec(function (errsecrets, secretKeys) {
        if (errsecrets) {
            retObj.messages.push('Error getting secrets');
        } else {
            retObj.status = true;
            retObj.messages.push('success');
            retObj.secretKeys = secretKeys;
            callback(retObj);
        }
    });
};

Gps.prototype.addInitialCounters = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var fulldate = new Date();
    //console.log(fulldate, fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear());
    SecretKeyColl.find(function (secreterr, secrets) {
        if (secreterr) {
            retObj.messages.push('Error getting secrets');
            callback(retObj);
        } else {
            async.map(secrets, function (secret, asyncCallback) {
                SecretKeyCounterColl.findOne({
                    date: fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear(),
                    secretId: secret._id
                }, function (errchecked, checked) {
                    if (errchecked) {
                        asyncCallback(errchecked)
                    } else if (checked){
                        asyncCallback('null', 'already added')
                    } else {
                        var counterDoc = new SecretKeyCounterColl({
                            date: fulldate.getDate() + '/' + fulldate.getMonth() + 1 + '/' + fulldate.getFullYear(),
                            secretId: secret._id,
                            counter: 0
                        });
                        counterDoc.save(function (err) {
                            asyncCallback(err, 'success');
                        });
                    }
                });
            }, function (errsaving, saved) {
                if (errsaving) {
                    retObj.messages.push('Error saving counter');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('counter saved successfully');
                    callback(retObj);
                }
            });
        }
    });
};

Gps.prototype.gpsTrackingByMapView = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null},"attrs.latestLocation":{$exists:true}}
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}}
    }
    TrucksColl.find(condition).exec(function (err, trucksData) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (trucksData) {
            var locations=_.pluck(_.pluck(trucksData,"attrs"),"latestLocation");
            var regNos=_.pluck(trucksData,'registrationNo');
            var truckTypes=_.pluck(trucksData,'truckType')
            retObj.status = true;
            retObj.data = locations;
            retObj.regNos= regNos;
            retObj.truckTypes=truckTypes;
            retObj.messages.push("success");
            callback(retObj);
        } else {
            retObj.messages.push("Please try again");
            callback(retObj);
        }
    })

};

Gps.prototype.moveDevicePositions = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var fulldate = new Date();
    fulldate.setDate(fulldate.getDate() - config.devicePositionsArchiveLimit); //1 day
    GpsColl.find({createdAt: {$lte: fulldate}}).lean().exec(function (errdata, gpsdocuments) {
        if (errdata) {
            console.log(errdata);
            retObj.messages.push('Error getting data');
            callback(retObj);
        } else {
            archivedDevicePositions.insertMany(gpsdocuments, function (errsaving, saved) {
                if (errsaving) {
                    retObj.messages.push('Error saving data');
                    callback(retObj);
                } else {
                    GpsColl.remove({createdAt: {$lte: fulldate}}, function (errremoved, removed) {
                        if (errremoved) {
                            retObj.messages.push('Error Removing data');
                            callback(retObj);
                        } else {
                            retObj.messages.push('Succesfully Moved ' + gpsdocuments.length + ' Documents');
                            callback(retObj);
                        }
                    });
                }
            });
        }
    });
};

Gps.prototype.getDeviceTrucks = function (req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.find({deviceId:{$exists:true},accountId:{$exists:true},userName:{$nin:['accounts']}},{"attrs.latestLocation":1,accountId:1,registrationNo:1,truckType:1,tracking_available:1},function (err,results) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error fetching data');
            analyticsService.create(req,serviceActions.get_truck_locations_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push('success');
            retObj.results=results;
            analyticsService.create(req,serviceActions.get_truck_locations,{accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    })
};

Gps.prototype.findDeviceStatus = function (deviceId,req,callback) {
    var retObj={status: false,
        messages: []
    };
    TrucksColl.find({deviceId:deviceId},{accountId:1},function (err,accountId) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error fetching data');
            callback(retObj);
        }else{
            AccountsColl.findOne({_id:accountId},function (err,settings) {
                if(err){
                    retObj.status=false;
                    retObj.messages.push('Error fetching settings data');
                    callback(retObj);
                }else{
                    var idealTime=60;
                    var stopTime=20;
                    var currentDate=new Date();
                    var idealDate=new Date((currentDate-0)-(idealTime*60000));
                    GpsColl.find({deviceId:deviceId,createdAt:{$gte:idealDate,$lte:currentDate}}).sort({createdAt:-1}).exec(function (err,positions) {
                        if(err){
                            retObj.status=false;
                            retObj.messages.push('Error fetching gps positions data');
                            callback(retObj);
                        }else{
                            retObj.status=true;
                            retObj.messages.push('Success');
                            retObj.results=positions;
                            console.log(positions.length);
                            callback(retObj);
                        }
                    })
                }
            })
        }

    })
}

module.exports = new Gps();