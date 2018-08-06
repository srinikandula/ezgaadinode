var EventDataCollection = require('./../models/schemas').EventDataCollection;
var AccountsColl = require('./../models/schemas').AccountsColl;
var UserLogins = require('./../models/schemas').userLogins;

var GroupsColl = require('./../models/schemas').GroupsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DeviceColl = require('./../models/schemas').DeviceColl;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');

var EventData = function () {
};

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});

EventData.prototype.createEventData = function (eventData, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var eventDataDoc = new EventDataCollection(eventData);
    eventDataDoc.save(eventData, function (err, newDoc) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            if (callback) {
                callback(retObj);
            }
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.eventData = newDoc;
            if (callback) {
                callback(retObj);
            }
        }
    });
}

EventData.prototype.deleteAll = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    EventDataCollection.remove({}, function (err) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
}


EventData.prototype.getGroupMapEvents = function (request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    EventDataCollection.aggregate([{
        $group: {
            _id: "$vehicle_number",
            latitude: {$first: "$latitude"},
            longitude: {$first: "$longitude"},
        }
    }], function (err, resutls) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            analyticsService.create(request,serviceActions.get_grp_map_events_err,{success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.resutls = resutls;
            analyticsService.create(request,serviceActions.get_grp_map_events,{success:true},function(response){ });
            callback(retObj);
        }
    });
}


EventData.prototype.getTrackEvents = function (vehicleNumber, request, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    EventDataCollection.find({"vehicle_number": vehicleNumber}, function (err, results) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            analyticsService.create(request,serviceActions.track_events_by_veh_err,{body:JSON.stringify(request.params),success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = results;
            analyticsService.create(request,serviceActions.track_events_by_veh,{body:JSON.stringify(request.params),success:true},function(response){ });
            callback(retObj);
        }
    });
}

/*EventData.prototype.createUserData = function (userData, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountDoc = new AccountsColl(userData);
    AccountsColl.find({"userName":userData.userName} , function(error, userFound){
        if(!userFound || userFound.length === 0){
            accountDoc.save(userData, function (err, newDoc) {

                if (err) {
                    logger.info(JSON.stringify(err));
                    retObj.messages.push('Error saving User Data');
                    if(callback){
                        callback(retObj);
                    }
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.userData = newDoc;
                    if(callback){
                        callback(retObj);
                    }
                }
            });
        } else{
            logger.info("ignoring to save userdata" + userData);
        }

    });


}*/

EventData.prototype.createAccountData = function (accountData, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    accountData.role = 'Truck Owner';
    accountData.leadType = 'T';
    accountData.yearInService = 2018;
    var accountDoc = new AccountsColl(accountData);
    AccountsColl.find({"userName": accountData.userName}, function (error, accountFound) {
        if (!accountFound || accountFound.length === 0) {
            accountDoc.save(accountData, function (err, newDoc) {
                if (err) {
                    logger.info(JSON.stringify(err));
                    retObj.messages.push('Error saving Account Data');
                    if (callback) {
                        callback(retObj);
                    }
                } else {
                    var userLoginEntry = new UserLogins(accountData);
                    userLoginEntry.accountId = newDoc._id;
                    UserLogins.find({"userName":accountData.userName}, function(error, userLoginFound){
                        if (!userLoginFound || userLoginFound.length === 0) {
                            userLoginEntry.save(accountData, function(err, savedDoc){
                                retObj.status = true;
                                retObj.messages.push('Success');
                                retObj.userData = newDoc;
                                if (callback) {
                                    callback(retObj);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            logger.info("ignoring to save account data" + accountData);
        }
    });
}

EventData.prototype.createAccountGroupData = function (accountGroupData, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    accountGroupData.role = 'group';
    var accountGroupDoc = new AccountsColl(accountGroupData);
    accountGroupDoc.save(accountGroupData, function (err, newDoc) {
        if (err) {
            logger.info(JSON.stringify(err));
            retObj.messages.push('Error saving Group Data');
            if (callback) {
                callback(retObj);
            }
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.userData = newDoc;
            if (callback) {
                callback(retObj);
            }
        }
    });
}

EventData.prototype.createTruckData = function (truckData, deviceData) {
    var retObj = {
        status: false,
        messages: []
    };

    var truckDataDoc = new TrucksColl(truckData);
    TrucksColl.find({"registrationNo": truckData.registrationNo}, function (error, truckFound) {
        if (!truckFound || truckFound.length === 0) {
            truckDataDoc.save(truckData, function (err, newTruck) {
                if (err) {
                    logger.error(JSON.stringify(err));
                } else {
                    if(deviceData){
                        DeviceColl.save(deviceData, function(error, newDevice){
                            if(!error){
                                TrucksColl.findOneAndUpdate(
                                    {"_id": newTruck._id},
                                    {$set: {deviceId: newDevice.imei}},
                                    function (err, truckDoc) {
                                        if (err) {
                                            logger.error("Error setting deviceId in to truck :"+JSON.stringify(err));
                                        }
                                    }
                                );
                            }
                        });
                    }

                    logger.info("truck saved");
                }
            });
        } else {
            logger.info("ignoring to save truck data" + truckData);
        }
    });
}

EventData.prototype.createDeviceTruckData = function (deviceTruckData, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var deviceTruckDataDoc = new DeviceColl(deviceTruckData);
    DeviceColl.find({"deviceId": deviceTruckData.deviceId}, function (error, deviceTruckFound) {
        if (!deviceTruckFound || deviceTruckFound.length === 0) {
            deviceTruckDataDoc.save(deviceTruckData, function (err, newDoc) {
                if (err) {
                    retObj.messages.push('Error saving Device Data');
                    if (callback) {
                        callback(retObj);
                    }
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.deviceTruckData = newDoc;
                    var deviceTruckId = newDoc.imei;
                    TrucksColl.findOneAndUpdate(
                        {"_id": newDoc.truckId},
                        {$set: {deviceId: deviceTruckId}},
                        function (err, truckDoc) {
                            if (callback) {
                                callback(retObj);
                            }
                        }
                    );
                }
            });
        } else {
            logger.info("ignoring to save Device data" + deviceTruckData);
        }
    });
}

module.exports = new EventData();