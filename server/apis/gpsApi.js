var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var config = require('./../config/config');

var GpsColl = require('./../models/schemas').GpsColl;
var SecretKeyColl = require('./../models/schemas').SecretKeysColl;
var SecretKeyCounterColl = require('./../models/schemas').SecretKeyCounterColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var archivedDevicePositions = require('./../models/schemas').archivedDevicePositionsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var GpsSettingsColl = require('./../models/schemas').GpsSettingsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');
var GoogleMapsAPI=require('googlemaps');
var googlemapsConfig= {
    key: 'AIzaSyC3JuGIZkNVnzrOthyMWEWf3zA0J-aui0M',
    secure: true // use https
};
var googlemaps=new GoogleMapsAPI(googlemapsConfig);
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Gps = function () {
};


function savePositionDoc(position, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var positionDoc = new GpsColl(position);
    positionDoc.save(function (err,result) {
        if (err) {
            retObj.messages.push('Error saving position');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Successfully saved the position');
            TrucksColl.find({deviceId:positionDoc.deviceId},{accountId:1,isIdle:1},function (err,accountId) {
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
                            var idealTime=5;
                            var stopTime=10;
                            var currentDate=new Date();
                            var isIdle=false;
                            var isStopped=false;
                            var idealDate=new Date((currentDate-0)-(idealTime*60000));
                            async.series({
                                one: function (aCallbackOne) {
                                    GpsColl.find({
                                        deviceId: positionDoc.deviceId,
                                        createdAt: {$gte: idealDate, $lte: currentDate}
                                    }).sort({createdAt: -1}).exec(function (err, positions) {
                                        if (err) {
                                            retObj.status = false;
                                            retObj.messages.push('Error fetching gps positions data');
                                            aCallbackOne(err,retObj);
                                        } else {
                                            if (positions.length > 0) {
                                                if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                                    isIdle = true;
                                                    var stopDate = new Date((currentDate - 0) - (stopTime * 60000));
                                                    GpsColl.find({
                                                        deviceId: positionDoc.deviceId,
                                                        createdAt: {$gte: stopDate, $lte: currentDate}
                                                    }).sort({createdAt: -1}).exec(function (err, positions) {
                                                        if (err) {
                                                            retObj.status = false;
                                                            retObj.messages.push('Error fetching gps positions data');
                                                            aCallbackOne(err,retObj);
                                                        } else {
                                                            if (positions.length > 0) {
                                                                if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                                                    isStopped = true;
                                                                    aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})

                                                                } else {
                                                                    isStopped = false;
                                                                    aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                                                }
                                                            } else {
                                                                isIdle = true;
                                                                isStopped = true;
                                                                aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    isIdle = false;
                                                    isStopped = false;
                                                    aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                                }

                                            } else {
                                                isIdle = true;
                                                isStopped = true;
                                                aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                            }
                                        }
                                    })

                                },
                                two:function (aCallbackTwo) {
                                    var retObj1={status:false,
                                        messages:[]};
                                    positionDoc.isIdle=isIdle;
                                    positionDoc.isStopped=isStopped;
                                    TrucksColl.update({deviceId:positionDoc.deviceId},{$set:{isIdle:isIdle,isStopped:isStopped,"attrs.latestLocation":positionDoc}},function (err,truckResult) {
                                        if(err){
                                            retObj1.status=false;
                                            retObj1.messages.push('Error updating truck status');
                                            aCallbackTwo(err,retObj1);
                                        }else{
                                            // retObj.results={isStopped:isStopped,isIdle:isIdle};
                                            // result.isIdle=isIdle;
                                            // result.isStopped=isStopped;
                                            var positionData=new GpsColl(positionDoc);
                                            positionData.save(function (err) {
                                                if(err){
                                                    retObj1.status=false;
                                                    retObj1.messages.push('Error updating device position status');
                                                    aCallbackTwo(err,retObj1);
                                                }else{
                                                    retObj1.status=true;
                                                    retObj1.messages.push('Success');
                                                    aCallbackTwo(null,retObj1);
                                                }
                                            });
                                        }
                                    })
                                }
                            },function (err,results) {
                                if(err){
                                    retObj.status=false;
                                    retObj.messages.push('Error updating truck status');
                                    callback(retObj);
                                }else{
                                    retObj.status=true;
                                    retObj.messages.push('Success');
                                    retObj.results=results.one;
                                    callback(retObj);
                                }
                            })
                        }
                    })
                }

            })
            // TrucksColl.findOneAndUpdate({deviceId:positionDoc.deviceId},{$set:{"attrs.latestLocation":positionDoc}},function (truUpderr,result) {
            //     if(truUpderr){
            //         retObj.messages.push('Error updating the truck position');
            //         callback(retObj);
            //     }else{
            //         retObj.status = true;
            //         retObj.messages.push('Successfully updated the truck position');
            //         callback(retObj);
            //     }
            // });
        }
    });
}

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
            if(updatedAddress.status){
                savePositionDoc(position,function (result) {
                    callback(result);
                })
            }else{
                callback(retObj);
            }

        })
    } else {
        savePositionDoc(position,function (result) {
            callback(result);
        })
    }

};

function getAddress(position, callback) {
    var retObj = {
        status: false,
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
                        retObj.status=true;
                        retObj.messages.push('Secret Incremented');
                    }
                    callback(retObj);
                });
            });
        } else {
            retObj.status=true;
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
    var condition = {},projections={};
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null},"attrs.latestLocation":{$exists:true}};
        projections={"attrs.latestLocation":1,registrationNo:1,truckType:1};
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}};
        projections={"attrs.latestLocation":1,registrationNo:1,truckType:1};
    }
    TrucksColl.find(condition,projections).exec(function (err, trucksData) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (trucksData) {
            retObj.status = true;
            retObj.data = trucksData;
            console.log(trucksData);
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

Gps.prototype.getDeviceTrucks = function (access,req,callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if(access) {
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
    }else{
        retObj.status=false;
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

Gps.prototype.findDeviceStatus = function (deviceId,req,callback) {
    var retObj={status: false,
        messages: []
    };
    TrucksColl.find({deviceId:deviceId},{accountId:1,isIdle:1},function (err,accountId) {
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
                    var idealTime=20;
                    var stopTime=60;
                    var currentDate=new Date();
                    var isIdle=false;
                    var isStopped=false;
                    var idealDate=new Date((currentDate-0)-(idealTime*60000));
                    async.series({
                        one: function (aCallbackOne) {
                            GpsColl.find({
                                deviceId: deviceId,
                                createdAt: {$gte: idealDate, $lte: currentDate}
                            }).sort({createdAt: -1}).exec(function (err, positions) {
                                if (err) {
                                    retObj.status = false;
                                    retObj.messages.push('Error fetching gps positions data');
                                    aCallbackOne(err,retObj);
                                } else {
                                    if (positions.length > 0) {
                                        if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                            isIdle = true;
                                            var stopDate = new Date((currentDate - 0) - (stopTime * 60000));
                                            GpsColl.find({
                                                deviceId: deviceId,
                                                createdAt: {$gte: stopDate, $lte: currentDate}
                                            }).sort({createdAt: -1}).exec(function (err, positions) {
                                                if (err) {
                                                    retObj.status = false;
                                                    retObj.messages.push('Error fetching gps positions data');
                                                    aCallbackOne(err,retObj);
                                                } else {
                                                    if (positions.length > 0) {
                                                        if (positions[0].location.coordinates[0] === positions[positions.length - 1].location.coordinates[0] && positions[0].location.coordinates[1] === positions[positions.length - 1].location.coordinates[1]) {
                                                            isStopped = true;
                                                            aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})

                                                        } else {
                                                            isStopped = false;
                                                            aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                                        }
                                                    } else {
                                                        isIdle = true;
                                                        isStopped = true;
                                                        aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                                    }
                                                }
                                            })
                                        } else {
                                            isIdle = false;
                                            isStopped = false;
                                            aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                        }

                                    } else {
                                        isIdle = true;
                                        isStopped = true;
                                        aCallbackOne(null,{isIdle:isIdle,isStopped:isStopped})
                                    }
                                }
                            })

                        },
                        two:function (aCallbackTwo) {
                            var retObj1={status:false,
                            messages:[]};
                            TrucksColl.update({deviceId:deviceId},{$set:{isIdle:isIdle,isStopped:isStopped}},function (err,result) {
                                if(err){
                                    retObj1.status=false;
                                    retObj1.messages.push('Error updating truck status');
                                    aCallbackTwo(err,retObj1);
                                }else{
                                    retObj1.status=true;
                                    retObj1.messages.push('Success');
                                    // retObj.results={isStopped:isStopped,isIdle:isIdle};
                                    aCallbackTwo(null,retObj1);
                                }
                            })
                        }
                    },function (err,results) {
                        if(err){
                            retObj.status=false;
                            retObj.messages.push('Error updating truck status');
                            callback(retObj);
                        }else{
                            retObj.status=true;
                            retObj.messages.push('Success');
                            retObj.results=results.one;
                            callback(retObj);
                        }
                    })
                }
            })
        }

    })
};

Gps.prototype.gpsTrackingByTruck = function (truckId,startDate,endDate,req,callback) {
    var retObj={status: false,
        messages: []
    };
    TrucksColl.findOne({registrationNo:truckId,deviceId:{$exists:true}},function (err,truckDetails) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error retrieving truck');
            callback(retObj);
        }else if(truckDetails){
            GpsColl.find({
                deviceId: truckDetails.deviceId,
                createdAt: {$gte: startDate, $lte: endDate}
            }).sort({createdAt: 1}).exec(function (err, positions) {
                if(err){
                    retObj.status=false;
                    retObj.messages.push('Error fetching truck positions');
                    callback(retObj);
                }else{
                    archivedDevicePositions.find({deviceId: truckDetails.deviceId,
                        createdAt: {$gte: startDate, $lte: endDate}}).sort({createdAt: 1}).exec(function (err, archivedPositions) {
                            if(err){
                                retObj.status=false;
                                retObj.messages.push('Error fetching truck positions');
                                callback(retObj);
                            }else {
                                positions = positions.concat(archivedPositions);
                                if (positions.length>0) {
                                    var origins = positions[0].location.coordinates[1] + ',' + positions[0].location.coordinates[0];
                                    var destinations = positions[positions.length - 1].location.coordinates[1] + ',' + positions[positions.length - 1].location.coordinates[0];
                                    var distance;
                                    var timeDiff = Math.abs(positions[0].createdAt.getTime() - positions[positions.length - 1].createdAt.getTime());
                                    var diffDays = timeDiff / (1000 * 3600 * 24);
                                    var averageSpeed = _.pluck(positions, 'speed');
                                    var sum = 0, counter = 0;
                                    for (var i = 0; i < averageSpeed.length; i++) {
                                        if (Number(averageSpeed[i]) !== 0.0) {
                                            sum = sum + Number(averageSpeed[i]);
                                            counter++;
                                        }
                                    }
                                    averageSpeed = (sum / counter);
                                    googlemaps.distance({
                                        origins: origins,
                                        destinations: destinations
                                    }, function (err, result) {
                                        distance = result.rows[0].elements[0].distance.text;
                                        if (result) {
                                            retObj.status = true;
                                            retObj.messages.push('Success');
                                            retObj.results = {
                                                positions: positions,
                                                distanceTravelled: distance,
                                                timeTravelled: (diffDays * 24),
                                                averageSpeed: averageSpeed
                                            };
                                            callback(retObj);
                                        } else {
                                            retObj.status = false;
                                            retObj.messages.push('Error finding distance');
                                            callback(retObj);
                                        }
                                    });
                                }else{
                                    retObj.status = false;
                                    retObj.messages.push('No records found for that period');
                                    callback(retObj);
                                }
                            }
                    });
                }
            });
        }else{
            retObj.status=false;
            retObj.messages.push('No truck found');
            callback(retObj);
        }
    });
};

Gps.prototype.downloadReport = function (truckId,startDate,endDate,req,callback) {
    var retObj={status: false,
        messages: []
    };
    var gps=new Gps();
    gps.gpsTrackingByTruck(truckId,startDate,endDate,req,function (result) {
        if(result.status){
            var output = [];
            var positions=result.results.positions;
            for(var i=0;i<positions.length;i++){
                var status;
                if(positions[i].isStopped){
                    status='Stopped'
                }else if(positions[i].isIdle){
                    status='Idle'
                }else{
                    status='Moving'
                }
                output.push({
                    Date:positions[i].createdAt,
                    Status:status,
                    Address:positions[i].address,
                    Speed:positions[i].speed
                });
                if (i === positions.length - 1) {
                    retObj.status = true;
                    output.push({
                        Date:positions[i].createdAt,
                        Status:status,
                        Address:positions[i].address,
                        Speed:positions[i].speed
                    });
                    retObj.data = output;
                    callback(retObj);
                }
            }
        }else{
            callback(result);
        }
    })
};

Gps.prototype.getAllVehiclesLocation = function (jwt,req,callback) {
    var retObj={status: false,
        messages: []
    };
    var condition = {};
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, deviceId: {$ne: null},"attrs.latestLocation":{$exists:true}};
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}};
    }
    TrucksColl.find(condition,function (err,trucksData) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error retrieving trucks data');
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push('Success');
            retObj.results=trucksData;
            callback(retObj);
        }
    })
};

Gps.prototype.getTruckReports = function (params,req,callback) {
    var retObj={status: false,
        messages: []
    };
    var gps=new Gps();
    gps.gpsTrackingByTruck(params.truckNo,params.startDate,params.endDate,req,function (result) {
        if(result.status){
            var positions=result.results.positions;
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results=positions;
            callback(retObj);
        }else{
            callback(result);
        }
    })
};

Gps.prototype.editGpsSettings = function (body,req,callback) {
    var retObj={status: false,
        messages: []
    };
    body.idleTime=parseInt(body.idleTime);
    GpsSettingsColl.update({accountId:req.jwt.id},{$set:body},function (err,settings) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error retrieving settings for account');
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push('Settings updated successfully');
            callback(retObj);
        }
    })
};

Gps.prototype.getGpsSettings = function (id,req,callback) {
    var retObj={status: false,
        messages: []
    };

    GpsSettingsColl.findOne({accountId:id},function (err,settings) {
        if(err){
            retObj.messages.push('Error retrieving settings for account');
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results=settings;
            callback(retObj);
        }
    })
};

module.exports = new Gps();