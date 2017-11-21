
var EventDataCollection = require('./../models/schemas').EventDataCollection;
var EventData = function () {
};

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




module.exports = new EventData();