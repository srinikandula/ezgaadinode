var _ = require('underscore');
var async = require('async');
var nodeGeocoder = require('node-geocoder');
var config = require('./../config/config');
var devicePostions = require('./../models/schemas').GpsColl;
var SecretKeyColl = require('./../models/schemas').SecretKeysColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DevicesColl = require('./../models/schemas').DeviceColl;

var archivedDevicePositions = require('./../models/schemas').archivedDevicePositionsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var GpsSettingsColl = require('./../models/schemas').GpsSettingsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');
var mailerApi=require('./../apis/mailerApi');

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

    SecretKeyCounterColl.findOne({date: today,counter:{$lt:config.googleSecretKeyLimit}}).exec(function (errsecret, counterEntry) {
        if (errsecret) {
            retObj.messages.push("address finding error," + JSON.stringify(errsecret.message));
            callback(retObj);
        } else if (counterEntry) {/*if key is available search address*/
            options.apiKey = counterEntry.secret;
            var geocoder = nodeGeocoder(options);
            geocoder.reverse({lat: position.latitude, lon: position.longitude}, function (errlocation, location) {
                if(errlocation) {
                    console.error("error resolving address...err",errlocation);
                }
                if (location) {
                    // console.log('google response '+ JSON.stringify(location));
                    retObj.status = true;
                    retObj.address = location[0]['formattedAddress'];
                    SecretKeyCounterColl.findOneAndUpdate({_id: counterEntry._id}, {$inc: {counter: 1}}, function (incerr, increased) {
                        if (incerr) {
                            retObj.messages.push('Error incrementing secret');
                        } else {
                            retObj.status=true;
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
        }  else {/*assign new key for day*/
            SecretKeyCounterColl.find({date: today}, {'secret': 1}, function (error, keys) {
                SecretKeyColl.findOne({"secret":{$nin: [ keys ]}}, function (err, secDoc) {
                    if (err) {
                        retObj.messages.push("address finding error," + JSON.stringify(err.message));
                        callback(retObj);
                    } else if(secDoc){
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
                    }else{
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
        projections={"attrs.latestLocation":1,registrationNo:1,truckType:1,lookingForLoad:1,updatedAt:1};
    } else {
        condition = {accountId: jwt.id, deviceId: {$ne: null}};
        projections={"attrs.latestLocation":1,registrationNo:1,truckType:1,lookingForLoad:1,updatedAt:1};
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
    devicePostions.find({createdAt: {$lte: fulldate}}).limit(5000).exec(function (errdata, gpsdocuments) {
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
                    devicePostions.remove({createdAt: {$lte: fulldate}}).limit(5000).exec(function (errremoved, removed) {
                        if (errremoved) {
                            retObj.messages.push('Error Removing data');
                            callback(retObj);
                        } else {
                            retObj.messages.push('Succesfully Moved ' + removed.result.n + ' Documents');
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
                            devicePostions.find({
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
                                            devicePostions.find({
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
            devicePostions.find({
                uniqueId: truckDetails.deviceId,
                createdAt: {$gte: startDate, $lte: endDate}
            }).sort({deviceTime: 1}).lean().exec(function (err, positions) {
                if(err){
                    retObj.status=false;
                    retObj.messages.push('Error fetching truck positions');
                    callback(retObj);
                }else{
                    archivedDevicePositions.find({uniqueId: truckDetails.deviceId,
                        createdAt: {$gte: startDate, $lte: endDate}}).sort({deviceTime: 1}).lean().exec(function (err, archivedPositions) {
                        if(err){
                            retObj.status=false;
                            retObj.messages.push('Error fetching truck positions');
                            callback(retObj);
                        }else {
                            positions = positions.concat(archivedPositions);
                            //take only positions that have totalDistance changed
                            positions = _.uniq(positions, 'totalDistance');
                            //sort the positions based of deviceTime
                            positions = _.sortBy(positions, function(position) { return position.deviceTime; })
                            if (positions.length>0) {
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

                                async.each(positions, function(position, asyncCallback) {
                                    if(position.address === '{address}'){
                                        resolveAddress({
                                            latitude: position.location.coordinates[1],
                                            longitude: position.location.coordinates[0]
                                        }, function (addressResp) {
                                            if(addressResp.status){
                                                position.address = addressResp.address;
                                                asyncCallback(false);
                                            }else{
                                                asyncCallback(addressResp);
                                            }
                                        });
                                    }else{
                                        asyncCallback(false);
                                    }
                                }, function(err) {
                                    if( err ) {
                                        callback(err);
                                    } else {
                                        retObj.status = true;
                                        retObj.messages.push('Success');
                                        retObj.results = {
                                            positions: positions,
                                            distanceTravelled: distance,
                                            timeTravelled: (diffDays * 24),
                                            topSpeed:topSpeed,
                                            averageSpeed: averageSpeed
                                        };
                                        callback(retObj);
                                    }
                                    // console.log("callback ret object..",retObj.results.positions);
                                });

                                //distance=positions[positions.length-1].totalDistance-positions[0].totalDistance;

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
            retObj.messages.push('No records found for that period');
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
                    Date:positions[i].createdAt.toLocaleString(),
                    Status:status,
                    Address:positions[i].address,
                    Speed:Math.round(positions[i].speed)+" Kmph",
                    Odo:Math.round(positions[i].totalDistance)+" KM"
                });
                if (i === positions.length - 1) {
                    retObj.status = true;

                    retObj.data = output;
                    callback(retObj);
                }
            }
        }else{
            callback(result);
        }
    })
};

Gps.prototype.truckReportInString = function (truckId,startDate,endDate,req,callback) {
    var retObj={status: false,
        messages: []
    };
    var gps=new Gps();
    gps.gpsTrackingByTruck(truckId,startDate,endDate,req,function (result) {
        if(result.status){
            var output = [];
            var positions=result.results.positions;
            var reportString='Date,Status,Address,Speed,Odo'+'\n';
            for(var i=0;i<positions.length;i++){
                var status;
                if(positions[i].isStopped){
                    status='Stopped'
                }else if(positions[i].isIdle){
                    status='Idle'
                }else{
                    status='Moving'
                }
                if(i === positions.length - 1){
                    reportString=reportString+positions[i].createdAt+','+status+','+'"'+positions[i].address+'"'+','+positions[i].speed+','+positions[i].totalDistance;
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.data=reportString;
                    callback(retObj);
                }else{
                    reportString=reportString+positions[i].createdAt+','+status+','+'"'+positions[i].address+'"'+','+positions[i].speed+','+positions[i].totalDistance+'\n';
                }

            }
        }else{
            callback(result);
        }
    })
}


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
            async.each(trucksData,function(truck,asyncCallback){
                if(truck.attrs.latestLocation.address === '{address}' || !truck.attrs.latestLocation.address || truck.attrs.latestLocation.address.trim().length == 0 || truck.attrs.latestLocation.address.indexOf('Svalbard') != -1){
                    resolveAddress({
                        latitude:truck.attrs.latestLocation.latitude,
                        longitude:truck.attrs.latestLocation.longitude
                    }, function (addressResp) {
                        if(addressResp.status){
                            truck.attrs.latestLocation.address = addressResp.address;
                            asyncCallback(false);
                        }else{
                            asyncCallback(addressResp);
                        }
                    });

                }else{
                    asyncCallback(false);
                }
            },function(err){
                if(err){
                    callback(err);
                }else{
                    retObj.status=true;
                    retObj.messages.push('Success');
                    retObj.results=trucksData;
                    callback(retObj);
                }

            });

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
    if(body.routeNotificationInterval){
        body.routeNotificationInterval=parseInt(body.routeNotificationInterval);
    }
    if(body.minStopTime){
        body.minStopTime=parseInt(body.minStopTime);
    }

    /*
    stopTime: {type: Number, default: 15},
    overSpeedLimit: {type: Number, default: 60},
    minStopTime:{type:Number,default:10},
    routeNotificationInterval:{type:Number,default:30}
     */
    GpsSettingsColl.update({accountId:req.jwt.id},{$set:{"stopTime":body.stopTime,"overSpeedLimit":body.overSpeedLimit,
            "minStopTime":body.minStopTime,"routeNotificationInterval":body.routeNotificationInterval }},{upsert: true},function (err,settings) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Error retrieving settings for account,'+JSON.stringify(err.message));
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

Gps.prototype.emailDayGPSReport = function (req,callback) {
    var retObj={status: false,
        messages: []
    };
    var startDate=new Date()/*req.params.date*/;
    // startDate.setDate(7);
    // startDate.setMonth(3);
    // startDate.setFullYear(2018);
    // startDate.setHours(5);
    // startDate.setMinutes(30);
    // startDate.setSeconds(0);
    var endDate=new Date();
    // endDate.setDate(6);
    // endDate.setMonth(3);
    // endDate.setFullYear(2018);
    endDate.setDate(startDate.getDate()-1);
    // endDate.setHours(5);
    // endDate.setMinutes(30);
    // endDate.setSeconds(0);
    var gps=new Gps();

    AccountsColl.find({dailyReportEnabled:true},function (err,accounts) {
        if(err){
            retObj.messages.push('Error retrieving accounts for sending daily reports');
            callback(retObj);
        }else{
            async.map(accounts,function (account,accountCallback) {
                TrucksColl.find({accountId:account._id},function (err,trucks) {
                    if(err){
                        retObj.messages.push('Error retrieving trucks for account');
                        callback(retObj);
                    }else if(trucks.length){
                        async.map(trucks,function (truck,asyncCallback) {
                            gps.gpsTrackingByTruck(truck.registrationNo,endDate,startDate,req,function (result) {
                                if(result.status){
                                    var positions=result.results.positions;
                                    var distance= positions[positions.length-1].totalDistance-positions[0].totalDistance;
                                    var reportString=truck.registrationNo+','+distance+','+'"'+positions[0].address+'"'+','+'"'+positions[positions.length-1].address+'"';
                                    asyncCallback(null,reportString);
                                }else{
                                    asyncCallback(err,null);
                                }
                            })
                        },function (err,results) {
                            if(err){
                                retObj.status=false;
                                retObj.messages.push('Error sending daily report');
                                accountCallback(retObj);
                            }else{
                                retObj.status=true;
                                retObj.messages.push('Success');
                                var totalString='Truck Reg No,Distance Travelled,Start Location,End Location'+'\n';
                                if(results.length>0) {
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
                                        to: 'srini@easygaadi.com',//account.email,
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
                                }else {
                                    retObj.status = true;
                                    retObj.messages.push('No records found');
                                    accountCallback(null, retObj);
                                }
                            }
                        });
                    }else{
                        retObj.messages.push('No trucks found for account');
                        accountCallback(retObj);
                    }
                })
            },function (err,accountResults) {
                if (err){
                    retObj.status=false;
                    retObj.messages.push('Error sending daily report');
                    callback(retObj);
                }else{
                    retObj.status=true;
                    retObj.messages.push('Daily reports sent to all accounts successfully');
                    callback(retObj);
                }
            })
        }
    })
};

Gps.prototype.shareTripDetailsByVechicleViaEmail = function (req,callback) {
    var retObj={status: false,
        messages: []
    };
    var gps=new Gps();

    gps.truckReportInString(req.body.regNumber,req.body.fromDate,req.body.toDate,req,function (result) {
        if(result.status){
            mailerApi.sendEmailWithAttachment2({to:req.body.email,subject:'Trip-Report',data:result.data},function (result) {
                if(result.status){
                    retObj.status=true;
                    retObj.messages.push('Trip Details sent successfully');
                    callback(retObj);
                }else{
                    retObj.status = false;
                    retObj.message = "Error , Please try again.";
                    callback(retObj);
                }
            })
        }else{
            retObj.messages.concat(result.messages);
            callback(retObj);
        }
    });
};

Gps.prototype.identifyNotWorkingDevices = function() {
    var currentTime = new Date();
    currentTime = currentTime.setMinutes(currentTime.getMinutes()-30);
    TrucksColl.updateMany({$or:[{"attrs.latestLocation":{$exists:false}},
            {"attrs.latestLocation.createdAt":{$exists:false}},
            {"attrs.latestLocation.createdAt":{$lte:currentTime}}]},
            {$set:{"attrs.latestLocation.isIdle":true,"attrs.latestLocation.isStopped":true,"attrs.latestLocation.isNotWorking":true}},function (err,updatedCounts) {
            console.log(updatedCounts.n +" trucks to be updated");
            DevicesColl.updateMany(//{$or:[
                        {"attrs.latestLocation":{$exists:false}},
                        //,{"attrs.latestLocation.createdAt":{$exists:false}}
                        //,{"attrs.latestLocation.createdAt":{$lte:currentTime}}
                        //]},
                {$set:{"attrs.latestLocation.isIdle":true,"attrs.latestLocation.isStopped":true,"attrs.latestLocation.isNotWorking":true}},function (err,updatedDevices) {
                    console.log(updatedDevices.n +" devices to be updated");
                    DevicesColl.count({"attrs.latestLocation":{$exists:false}},function(error, count){
                        console.log("count "+ count);
                    });
                });
    });

}
module.exports = new Gps();