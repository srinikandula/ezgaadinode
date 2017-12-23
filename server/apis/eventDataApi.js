
var EventDataCollection = require('./../models/schemas').EventDataCollection;
var AccountsColl = require('./../models/schemas').AccountsColl;
var GroupsColl = require('./../models/schemas').GroupsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var EventData = function () {
};

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
log4js.configure(__dirname + '/../config/log4js_config.json', { reloadSecs: 60});

EventData.prototype.createEventData = function (eventData, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var eventDataDoc = new EventDataCollection(eventData);
    eventDataDoc.save(eventData, function (err, newDoc) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            if(callback){
                callback(retObj);
            }
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.eventData = newDoc;
            if(callback){
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


EventData.prototype.getGroupMapEvents = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    EventDataCollection.aggregate([{$group : {_id : "$vehicle_number",latitude: { $first: "$latitude"},longitude: { $first: "$longitude"},}}], function (err, resutls) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.resutls = resutls;
            callback(retObj);
        }
    });
}


EventData.prototype.getTrackEvents = function (vehicleNumber, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    EventDataCollection.find({"vehicle_number" : vehicleNumber}, function (err, results) {
        if (err) {
            retObj.messages.push('Error saving EventData');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = results;
            callback(retObj);
        }
    });
}

EventData.prototype.createUserData = function (userData, callback) {
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


}

/*EventData.prototype.createAccountData = function (accountData, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountDoc = new AccountsColl(accountData);
    AccountsColl.find({"userName":accountData.userName} , function(error, accountFound){
        if(!accountFound || accountFound.length === 0){
            accountDoc.save(accountData, function (err, newDoc) {

                if (err) {
                    logger.info(JSON.stringify(err));
                    retObj.messages.push('Error saving Account Data');
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
            logger.info("ignoring to save account data" + accountData);
        }

    });
}

EventData.prototype.createGroupData = function (groupData, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var groupDoc = new GroupsColl(groupData);
    GroupsColl.find({"accountId":accountData.accountId} , function(error, groupFound){
        if(!groupFound || groupFound.length === 0){
            groupDoc.save(groupData, function (err, newDoc) {

                if (err) {
                    logger.info(JSON.stringify(err));
                    retObj.messages.push('Error saving Group Data');
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
            logger.info("ignoring to save group data" + groupData);
        }

    });
}*/

EventData.prototype.createTruckData = function (truckData, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var truckDataDoc = new TrucksColl(truckData);
    truckDataDoc.save(truckData, function (err, newDoc) {
        if (err) {
            retObj.messages.push('Error saving Truck Data');
            if(callback){
                callback(retObj);
            }
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.truckData = newDoc;
            if(callback){
                callback(retObj);
            }
        }
    });
}


module.exports = new EventData();