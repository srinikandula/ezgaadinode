var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var GoogleUrl = require( 'google-url' );
var config = require('./../config/config');
var devicePostions = require('./../models/schemas').GpsColl;
var SecretKeysColl = require('./../models/schemas').SecretKeysColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DevicesColl = require('./../models/schemas').DeviceColl;
var DriversColl = require('./../models/schemas').DriversColl;
var ShareLinksColl = require('./../models/schemas').ShareLinksColl;

var archivedDevicePositions = require('./../models/schemas').archivedDevicePositionsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var GpsSettingsColl = require('./../models/schemas').GpsSettingsColl;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var mailerApi = require('./../apis/mailerApi');
var SmsService = require('./smsApi');
var mongoose = require('mongoose');
var request = require('request');

const ObjectId = mongoose.Types.ObjectId;


var SecretKeyCounterColl = require('./../models/schemas').SecretKeyCounterColl;


var Gps = function () {
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
                if (errlocation) {
                    console.error("Google error resolving address...err", errlocation, position);
                    getOSMAddress({latitude:  position.latitude, longitude: position.longitude}, function (resp) {
                        if (resp.status) {
                            console.log('OSM resolved address ' + resp.address);
                            retObj.status = true;
                            retObj.address = resp.address;
                            callback(retObj);
                        }
                    });
                }
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
                    } else if (checked) {
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
    var condition = {}, projections = {};
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null}, "attrs.latestLocation": {$exists: true}, "attrs.latestLocation.location": {$exists: true}};
        projections = {"attrs.latestLocation": 1, registrationNo: 1, truckType: 1, lookingForLoad: 1, updatedAt: 1};
    } else {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null}};
        projections = {"attrs.latestLocation": 1, registrationNo: 1, truckType: 1, lookingForLoad: 1, updatedAt: 1};
    }
    TrucksColl.find(condition, projections).exec(function (err, trucksData) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (trucksData) {
            async.eachSeries(trucksData, function (truck, asyncCallback) {
                if (truck.attrs.latestLocation.address === '{address}' || !truck.attrs.latestLocation.address || truck.attrs.latestLocation.address.trim().length == 0 || truck.attrs.latestLocation.address.indexOf('Svalbard') != -1) {
                    resolveAddress({
                        latitude: truck.attrs.latestLocation.latitude,
                        longitude: truck.attrs.latestLocation.longitude
                    }, function (addressResp) {
                        if (addressResp.status) {
                            truck.attrs.latestLocation.address = addressResp.address;
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
                    retObj.status = true;
                    retObj.data = trucksData;
                    retObj.messages.push("success");
                    callback(retObj);
                }
            });
        } else {
            retObj.messages.push("Please try again");
            callback(retObj);
        }
    })

};


Gps.prototype.getDeviceTrucks = function (access, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (access) {
        TrucksColl.find({
            deviceId: {$exists: true},
            accountId: {$exists: true},
            userName: {$nin: ['accounts']}
        }, {
            "attrs.latestLocation": 1,
            accountId: 1,
            registrationNo: 1,
            truckType: 1,
            tracking_available: 1
        }, function (err, results) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('Error fetching data');
                analyticsService.create(req, serviceActions.get_truck_locations_err, {
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('success');
                retObj.results = results;
                analyticsService.create(req, serviceActions.get_truck_locations, {
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    } else {
        retObj.status = false;
        retObj.messages.push('Not Authorized');
        analyticsService.create(req, serviceActions.get_truck_locations_err, {
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
};

Gps.prototype.findDeviceStatus = function (deviceId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksColl.find({deviceId: deviceId}, {accountId: 1, isIdle: 1}, function (err, accountId) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error fetching data');
            callback(retObj);
        } else {
            AccountsColl.findOne({_id: accountId}, function (err, settings) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Error fetching settings data');
                    callback(retObj);
                } else {
                    var idealTime = 20;
                    var stopTime = 60;
                    var currentDate = new Date();
                    var isIdle = false;
                    var isStopped = false;
                    var idealDate = new Date((currentDate - 0) - (idealTime * 60000));
                    async.series({
                        one: function (aCallbackOne) {
                            devicePostions.find({
                                deviceId: deviceId,
                                createdAt: {$gte: idealDate, $lte: currentDate}
                            }).sort({createdAt: -1}).exec(function (err, positions) {
                                if (err) {
                                    retObj.status = false;
                                    retObj.messages.push('Error fetching gps positions data');
                                    aCallbackOne(err, retObj);
                                } else {
                                    if (positions.length > 0) {
                                        if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                            isIdle = true;
                                            var stopDate = new Date((currentDate - 0) - (stopTime * 60000));
                                            devicePostions.find({
                                                deviceId: deviceId,
                                                createdAt: {$gte: stopDate, $lte: currentDate}
                                            }).sort({createdAt: -1}).exec(function (err, positions) {
                                                if (err) {
                                                    retObj.status = false;
                                                    retObj.messages.push('Error fetching gps positions data');
                                                    aCallbackOne(err, retObj);
                                                } else {
                                                    if (positions.length > 0) {
                                                        if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                                            isStopped = true;
                                                            aCallbackOne(null, {isIdle: isIdle, isStopped: isStopped})

                                                        } else {
                                                            isStopped = false;
                                                            aCallbackOne(null, {isIdle: isIdle, isStopped: isStopped})
                                                        }
                                                    } else {
                                                        isIdle = true;
                                                        isStopped = true;
                                                        aCallbackOne(null, {isIdle: isIdle, isStopped: isStopped})
                                                    }
                                                }
                                            })
                                        } else {
                                            isIdle = false;
                                            isStopped = false;
                                            aCallbackOne(null, {isIdle: isIdle, isStopped: isStopped})
                                        }

                                    } else {
                                        isIdle = true;
                                        isStopped = true;
                                        aCallbackOne(null, {isIdle: isIdle, isStopped: isStopped})
                                    }
                                }
                            })

                        },
                        two: function (aCallbackTwo) {
                            var retObj1 = {
                                status: false,
                                messages: []
                            };
                            TrucksColl.update({deviceId: deviceId}, {
                                $set: {
                                    isIdle: isIdle,
                                    isStopped: isStopped
                                }
                            }, function (err, result) {
                                if (err) {
                                    retObj1.status = false;
                                    retObj1.messages.push('Error updating truck status');
                                    aCallbackTwo(err, retObj1);
                                } else {
                                    retObj1.status = true;
                                    retObj1.messages.push('Success');
                                    // retObj.results={isStopped:isStopped,isIdle:isIdle};
                                    aCallbackTwo(null, retObj1);
                                }
                            })
                        }
                    }, function (err, results) {
                        if (err) {
                            retObj.status = false;
                            retObj.messages.push('Error updating truck status');
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            retObj.results = results.one;
                            callback(retObj);
                        }
                    })
                }
            })
        }

    })
};

Gps.prototype.gpsTrackingByTruck = function (truckId, startDate, endDate, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var overSpeedLimit = 60;
    TrucksColl.findOne({registrationNo: truckId, deviceId: {$exists: true}}, function (err, truckDetails) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error retrieving truck');
            callback(retObj);
        } else if (truckDetails) {
            Gps.prototype.getGpsSettings(truckDetails.accountId, function (settings) {
                if (settings.results) {
                    overSpeedLimit = settings.results.overSpeedLimit;
                }
            });
             devicePostions.find({
                accountId:truckDetails.accountId.toString(),
                uniqueId: truckDetails.deviceId,
                createdAt: {$gte: startDate, $lte: endDate}
            }).sort({deviceTime: 1}).lean().exec(function (err, positions) {
                if (err) {
                    retObj.status = false;
                    callback(retObj);
                } else {
                    archivedDevicePositions.find({
                        uniqueId: truckDetails.deviceId,
                        accountId:truckDetails.accountId.toString(),
                        createdAt: {$gte: startDate, $lte: endDate}
                    }).sort({deviceTime: 1}).lean().exec(function (err, archivedPositions) {
                        if (err) {
                            retObj.status = false;
                            retObj.messages.push('Error fetching truck positions');
                            callback(retObj);
                        } else {
                            positions = positions.concat(archivedPositions);
                            //take only positions that have totalDistance changed
                            positions = _.uniq(positions, 'totalDistance');
                            //sort the positions based of deviceTime
                            positions = _.sortBy(positions, function (position) {
                                return position.deviceTime;
                            });

                            if (positions.length > 0) {
                                var timeDiff = Math.abs(positions[0].createdAt.getTime() - positions[positions.length - 1].createdAt.getTime());
                                var diffDays = timeDiff / (1000 * 3600 * 24);
                                var speedValues = _.pluck(positions, 'speed');
                                var topSpeed = Math.max.apply(Math, speedValues);
                                var sum = 0, counter = 0, distance = 0;
                                for (var i = 0; i < speedValues.length; i++) {
                                    if (Number(speedValues[i]) !== 0.0) {
                                        sum = sum + Number(speedValues[i]);
                                        counter++;
                                    }
                                    distance += positions[i].distance;
                                }
                                averageSpeed = (sum / counter);
                                retObj.status = true;
                                retObj.messages.push('Success');
                                retObj.results = {
                                    positions: positions,
                                    distanceTravelled: distance,
                                    timeTravelled: (diffDays * 24),
                                    topSpeed: topSpeed,
                                    averageSpeed: averageSpeed,
                                    overSpeedLimit: overSpeedLimit
                                };
                                callback(retObj)
                            } else {
                                retObj.status = false;
                                retObj.messages.push('No records found for that period');
                                callback(retObj);
                            }
                        }
                    });
                }
            });
        } else {
            retObj.status = false;
            retObj.messages.push('No records found for that period');
            callback(retObj);
        }
    });
};

Gps.prototype.downloadReport = function (truckId, startDate, endDate, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gps = new Gps();
    gps.gpsTrackingByTruck(truckId, startDate, endDate, req, function (result) {
        if (result.status) {
            var output = [];
            var positions = result.results.positions;
            async.eachSeries(positions,function(position,asyncCallback){
                if(position.address === '{address}'){
                    getOSMAddress({ latitude: position.location.coordinates[1],longitude: position.location.coordinates[0]},function(addResp){
                        position.address = addResp.address;
                        asyncCallback(false);
                    });
                }else{
                    asyncCallback(false);
                }
            },function(err) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('error in finding address' + JSON.stringify(err));
                    retObj.results = positions;
                    callback(retObj);
                } else {
                    for (var i = 0; i < positions.length; i++) {
                        var status;
                        if (positions[i].isStopped) {
                            status = 'Stopped'
                        } else if (positions[i].isIdle) {
                            status = 'Idle'
                        } else {
                            status = 'Moving'
                        }
                        output.push({
                            Date: positions[i].createdAt.toLocaleString(),
                            Status: status,
                            Address: positions[i].address,
                            Speed: Math.round(positions[i].speed) + " Kmph",
                            Odo: Math.round(positions[i].totalDistance) + " KM"
                        });
                        if (i === positions.length - 1) {
                            retObj.status = true;

                            retObj.data = output;
                            callback(retObj);
                        }
                    }
                }
            });
        } else {
            callback(result);
        }
    })
};

Gps.prototype.truckReportInString = function (truckId, startDate, endDate, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gps = new Gps();
    gps.gpsTrackingByTruck(truckId, startDate, endDate, req, function (result) {
        if (result.status) {
            var output = [];
            var positions = result.results.positions;
            var reportString = 'Date,Status,Address,Speed,Odo' + '\n';
            for (var i = 0; i < positions.length; i++) {
                var status;
                if (positions[i].isStopped) {
                    status = 'Stopped'
                } else if (positions[i].isIdle) {
                    status = 'Idle'
                } else {
                    status = 'Moving'
                }
                if (i === positions.length - 1) {
                    reportString = reportString + positions[i].createdAt + ',' + status + ',' + '"' + positions[i].address + '"' + ',' + positions[i].speed + ',' + positions[i].totalDistance;
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.data = reportString;
                    callback(retObj);
                } else {
                    reportString = reportString + positions[i].createdAt + ',' + status + ',' + '"' + positions[i].address + '"' + ',' + positions[i].speed + ',' + positions[i].totalDistance + '\n';
                }

            }
        } else {
            callback(result);
        }
    })
}


Gps.prototype.getAllVehiclesLocation = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;
    if (jwt.type === "account") {
        if(params.registrationNo !== '{}'){
            condition = {accountId: jwt.accountId,deviceId: {$ne: null},registrationNo:params.registrationNo};
        }else{
            condition = {accountId: jwt.accountId, deviceId: {$ne: null}};
        }
    }else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}};
    }
    TrucksColl.find(condition, function (err, trucksData) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error retrieving trucks data');
            callback(retObj);
        } else {
            var driverIds = _.pluck(trucksData,'driverId');
            DriversColl.find({_id: {$in:driverIds}},{fullName: 1}, function (err, driverNames) {
                async.each(trucksData, function (truck, asyncCallback) {
                    if (truck.driverId) {
                        var driver = _.find(driverNames, function (driver) {
                            return driver._id.toString() === truck.driverId;
                        });
                        truck.attrs.latestLocation.driverName = driver.fullName;
                    }
                    if (truck.attrs.latestLocation && (!truck.attrs.latestLocation.address || truck.attrs.latestLocation.address === '{address}' || !truck.attrs.latestLocation.address || truck.attrs.latestLocation.address.trim().length == 0 || truck.attrs.latestLocation.address.indexOf('Svalbard') != -1)) {
                        resolveAddress({
                            latitude: truck.attrs.latestLocation.latitude || truck.attrs.latestLocation.location.coordinates[1],
                            longitude: truck.attrs.latestLocation.longitude || truck.attrs.latestLocation.location.coordinates[0]
                        }, function (addressResp) {
                            if (addressResp.status) {
                                truck.attrs.latestLocation.address = addressResp.address;
                                console.log('updating truck ' + truck.registrationNo + '   address '+addressResp.address );
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
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.results = trucksData;
                        callback(retObj);
                    }

                });
            });

        }
    })
};

Gps.prototype.getTruckReports = function (params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gps = new Gps();
    gps.gpsTrackingByTruck(params.truckNo, params.startDate, params.endDate, req, function (result) {
        if (result.status) {
            var positions = result.results.positions;

            async.eachSeries(positions,function(position,asyncCallback){
                if(position.address === '{address}'){
                    getOSMAddress({ latitude: position.location.coordinates[1],longitude: position.location.coordinates[0]},function(addResp){
                        position.address = addResp.address;
                        asyncCallback(false);
                    });
                }else{
                    asyncCallback(false);
                }
            },function(err){
                if(err){
                    retObj.status = false;
                    retObj.messages.push('error in finding address'+JSON.stringify(err));
                    retObj.results = positions;
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.results = positions;
                    callback(retObj);
                }
            });
        } else {
            callback(result);
        }
    })
};

function getOSMAddress(position, osmCallback) {
    var retObj = {
        status: false,
        messages: []
    };
    request({
        method: 'GET',
        url: 'http://35.154.13.0/reverse.php?format=json&lat=' + position.latitude + '&lon=' + position.longitude
    }, function (errAddress, address) {  //{"error":"Unable to geocode"}
        if (errAddress) {
            //console.error('Error resolving OSM address');
            osmCallback(retObj);
        } else {
            if (address) {
                try {
                    address = JSON.parse(address.body);
                    position.address = address.display_name;
                    retObj.status = true;
                    retObj.address = position.address;
                    retObj.messages.push('Success');
                    osmCallback(retObj);
                } catch (error) {
                    retObj.messages.push(JSON.stringify(error));
                    console.error("OSM error{$position.latitude " + JSON.stringify(error));
                    //osmCallback(retObj);
                }
            }

        }
    });
}

Gps.prototype.editGpsSettings = function (body, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (body.routeNotificationInterval) {
        body.routeNotificationInterval = parseInt(body.routeNotificationInterval);
    }
    if (body.minStopTime) {
        body.minStopTime = parseInt(body.minStopTime);
    }
    /*
    stopTime: {type: Number, default: 15},
    overSpeedLimit: {type: Number, default: 60},
    minStopTime:{type:Number,default:10},
    routeNotificationInterval:{type:Number,default:30}
     */
    GpsSettingsColl.update({accountId: req.jwt.accountId}, {
        $set: {
            "stopTime": body.stopTime, "overSpeedLimit": body.overSpeedLimit,
            "minStopTime": body.minStopTime, "routeNotificationInterval": body.routeNotificationInterval
        }
    }, {upsert: true}, function (err, settings) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error retrieving settings for account,' + JSON.stringify(err.message));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Settings updated successfully');
            callback(retObj);
        }
    })
};

Gps.prototype.getGpsSettings = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    GpsSettingsColl.findOne({accountId: id}, function (err, settings) {
        if (err) {
            retObj.messages.push('Error retrieving settings for account');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = settings;
            callback(retObj);
        }
    })
};

Gps.prototype.emailDayGPSReport = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var startDate = new Date()/*req.params.date*/;
    // startDate.setDate(7);
    // startDate.setMonth(3);
    // startDate.setFullYear(2018);
    // startDate.setHours(5);
    // startDate.setMinutes(30);
    // startDate.setSeconds(0);
    var endDate = new Date();
    // endDate.setDate(6);
    // endDate.setMonth(3);
    // endDate.setFullYear(2018);
    endDate.setDate(startDate.getDate() - 1);
    // endDate.setHours(5);
    // endDate.setMinutes(30);
    // endDate.setSeconds(0);
    var gps = new Gps();

    AccountsColl.find({dailyReportEnabled: true}, function (err, accounts) {
        if (err) {
            retObj.messages.push('Error retrieving accounts for sending daily reports');
            callback(retObj);
        } else {
            async.map(accounts, function (account, accountCallback) {
                TrucksColl.find({accountId: account._id}, function (err, trucks) {
                    if (err) {
                        retObj.messages.push('Error retrieving trucks for account');
                        callback(retObj);
                    } else if (trucks.length) {
                        async.map(trucks, function (truck, asyncCallback) {
                            gps.gpsTrackingByTruck(truck.registrationNo, startDate, endDate, req, function (result) {
                                if (result.status) {
                                    var positions = result.results.positions;
                                    var distance = positions[positions.length - 1].totalDistance - positions[0].totalDistance;
                                    var reportString = truck.registrationNo + ',' + distance + ',' + '"' + positions[0].address + '"' + ',' + '"' + positions[positions.length - 1].address + '"';
                                    asyncCallback(null, reportString);
                                } else {
                                    asyncCallback(err, null);
                                }
                            })
                        }, function (err, results) {
                            if (err) {
                                retObj.status = false;
                                retObj.messages.push('Error sending daily report');
                                accountCallback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('Success');
                                var totalString = 'Truck Reg No,Distance Travelled,Start Location,End Location' + '\n';
                                if (results.length > 0) {
                                    for (var i = 0; i < results.length; i++) {
                                        if (i !== results.length - 1) {
                                            if (results[i] !== null) {
                                                totalString = totalString + results[i] + '\n';
                                            }
                                        } else {
                                            if (results[i] !== null) {
                                                totalString = totalString + results[i];
                                            }
                                        }
                                    }
                                    totalString = totalString.replace(/[^\x00-\xFF]/g, " ");
                                    retObj.data = totalString;
                                    mailerApi.sendEmailWithAttachment2({
                                        to: 'kalyanikandula0@gmail.com',//account.email,
                                        subject: 'Daily-Report',
                                        data: totalString
                                    }, function (result) {
                                        if (result.status) {
                                            retObj.status = true;
                                            retObj.messages.push('Daily Report sent successfully');
                                            accountCallback(null, retObj);
                                        } else {
                                            retObj.status = false;
                                            retObj.messages.push("Error , Please try again.");
                                            accountCallback(err, retObj);
                                        }
                                    });
                                } else {
                                    retObj.status = true;
                                    retObj.messages.push('No records found');
                                    accountCallback(null, retObj);
                                }
                            }
                        });
                    } else {
                        retObj.messages.push('No trucks found for account');
                        accountCallback(retObj);
                    }
                })
            }, function (err, accountResults) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Error sending daily report');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Daily reports sent to all accounts successfully');
                    callback(retObj);
                }
            })
        }
    })
};

Gps.prototype.shareTripDetailsByVechicleViaEmail = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gps = new Gps();

    gps.truckReportInString(req.body.regNumber, req.body.fromDate, req.body.toDate, req, function (result) {
        if (result.status) {
            mailerApi.sendEmailWithAttachment2({
                to: req.body.email,
                subject: 'Trip-Report',
                data: result.data
            }, function (result) {
                if (result.status) {
                    retObj.status = true;
                    retObj.messages.push('Trip Details sent successfully');
                    callback(retObj);
                } else {
                    retObj.status = false;
                    retObj.message = "Error , Please try again.";
                    callback(retObj);
                }
            })
        } else {
            retObj.messages.concat(result.messages);
            callback(retObj);
        }
    });
};

Gps.prototype.identifyNotWorkingDevices = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    TrucksColl.updateMany({
        $and: [{
            $or: [{"attrs.latestLocation": {$exists: false}},
                {"attrs.latestLocation.createdAt": {$exists: false}},
                {"attrs.latestLocation.createdAt": {$lte: currentTime}}]
        }, {status: 'Working'}]
    }, function (err, updatedCounts) {
    });
    DevicesColl.find({
        $and: [{
            $or: [{"attrs.latestLocation": {$exists: false}},
                {"attrs.latestLocation.createdAt": {$exists: false}},
                {"attrs.latestLocation.createdAt": {$lte: currentTime}}]
        }, {status: 'Working'}]
    }, function (err, devices) {
        if (devices.length) {
            async.each(devices, function (device, asyncCallback) {
                DevicesColl.updateOne({"_id": device._id}, {$set: {"status": 'Not Working'}}, function (err, result) {
                });
                TrucksColl.updateOne({"deviceId": device.imei}, {$set: {"status": 'Not Working'}}, function (err, result) {
                });
                
                AccountsColl.findOne({_id: ObjectId(device.accountId)}, function (err, account) {
                    if (err) {
                        asyncCallback(true);
                    } else {
                        if (account.contactPhone) {
                            var smsParams = {
                                contact: account.contactPhone,
                                message: "Hi " + account.contactName + "," + "Device is not working."
                            };
                            SmsService.sendSMS(smsParams, function (smsResponse) {
                                if (smsResponse.status) {
                                    asyncCallback(false);
                                } else {
                                    asyncCallback(true);
                                }
                            });
                        }
                    }
                });
            }, function (err) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push("Error in sending SMS");
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push("SMS has been sent successfully");
                    callback(retObj);
                }
            });
        }
    });
};

Gps.prototype.generateShareTrackingLink = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.truckId || !ObjectId.isValid(params.truckId)) {
        retObj.messages.push("provide truck details");
        callback(retObj);
    } else {
        var d1 = new Date();
        d1.setHours(d1.getHours() + 24);
        var obj = {
            truckId: params.truckId,
            expairyAt: new Date(d1)
        };
        var shareLink = new ShareLinksColl(obj);
        shareLink.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.data = config.baseUrl + '/live-tracking/' + doc._id;
                callback(retObj);
            }
        })
    }
};

Gps.prototype.getTruckLatestLocation = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var trackingId = req.params.trackingId;
    if (!trackingId || !ObjectId.isValid(trackingId)) {
        retObj.messages.push('Invalid tracking link');
        callback(retObj);
    } else {
        ShareLinksColl.findOne({_id:trackingId},function (err,doc) {
            if(err){
                retObj.messages.push("Internal server error,"+err.message);
                callback(retObj);
            }else if(doc){
                var d=new Date();
                var d2=new Date(doc.expairyAt);
                if(d<d2){
                    TrucksColl.findOne({_id:doc.truckId},function (err,truck) {
                        if(err){
                            retObj.messages.push("Internal server error,"+err.message);
                            callback(retObj);
                        }else if(truck){
                            retObj.status=true;
                            retObj.data=truck.attrs;
                            retObj.registrationNo = truck.registrationNo;
                            callback(retObj);
                        }else{
                            retObj.messages.push("Invalid truck tracking request");
                            callback(retObj);
                        }
                    })
                }else{
                    retObj.messages.push("Tracking link is expired");
                    callback(retObj);
                }
            }else{
                retObj.messages.push("Invalid tracking request");
                callback(retObj);
            }
        })
    }
};

module.exports = new Gps();