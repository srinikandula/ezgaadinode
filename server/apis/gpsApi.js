var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var config = require('./../config/config');

var GpsColl = require('./../models/schemas').GpsColl;
var SecretKeyColl = require('./../models/schemas').SecretKeysColl;
var SecretKeyCounterColl = require('./../models/schemas').SecretKeyCounterColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var archivedDevicePositions = require('./../models/schemas').archivedDevicePositionsColl;

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
                        var positionDoc = new GpsColl(position);
                        positionDoc.save(function (err) {
                            if (err) {
                                retObj.messages.push('Error saving position');
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('Successfully saved the position');
                                TrucksColl.findOneAndUpdate({deviceId:positionDoc.deviceId},{$set:{latestLocation:positionDoc.location}},function (truUpderr,result) {
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
                });
            });
        } else {
            retObj.messages.push('Secrets Completed for today');
            var positionDoc = new GpsColl(position);
            positionDoc.save(function (err) {
                if (err) {
                    retObj.messages.push('Error saving position');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Successfully saved the position');
                    callback(retObj);
                }
            });
        }
    });
};

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
        condition = {accountId: jwt.accountId, deviceId: {$ne: null}}
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}}
    }

    TrucksColl.find(condition).populate({path: "deviceId", select: 'deviceId'}).exec(function (err, trucksData) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (trucksData) {

            var deviceList = _.pluck(_.pluck(trucksData, "deviceId"), "deviceId");
            GpsColl.aggregate([
                    {$match: {uniqueId: {$in: deviceList}}},
                    {"$sort": {"createdAt": -1}},
                    {
                        $group: {
                            _id: "$uniqueId",
                            latitude: {$first: "$latitude"},
                            longitude: {$first: "$longitude"},
                            altitude: {$first: "$altitude"},
                            name: {$first: "$name"}

                        }
                    }],
                function (err, devices) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        callback(retObj);
                    } else if (devices) {
                        retObj.status = true;
                        retObj.data = devices;
                        retObj.messages.push("success");
                        callback(retObj);
                    } else {
                        retObj.messages.push("Please try again");
                        callback(retObj);
                    }
                });

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

module.exports = new Gps();