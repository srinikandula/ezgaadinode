var DeviceIdColl = require('./../models/schemas').deviceIdColl;
var analyticsService=require('./../apis/analyticsApi');
var config = require('./../config/config');
var FCM = require('fcm-push');
var fcm = new FCM(config.serverKey);

var Notifications = function () {
};


Notifications.prototype.saveDeviceDetails = function (body,callback) {
    var retObj={};
    var query = {};
    if (body._id) {
        query = { _id: body._id };
    } else {
        var id=new ObjectId();
        query = { _id: id };
    }

    if(!body.imei){
        retObj.status = false;
        retObj.message = 'Invalid Imei';
        callback(retObj);
    }else if(!body.deviceId){
        retObj.status = false;
        retObj.message = 'Invalid Device Id';
        callback(retObj);
    }else {
        DeviceIdColl.update(query, body, {upsert: true}, function (err, result) {
            if (err) {
                retObj.status = false;
                retObj.message = 'Error, please try again';
                callback(retObj);
            } else {
                if (result.nModified === 1) {
                    retObj.status = true;
                    retObj.message = 'Device Details Updated Successfully';
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.message = 'Device Details Saved Successfully';
                    callback(retObj);
                }

            }
        });
    }
};

Notifications.prototype.sendPushNotifications = function (body,callback) {
    var regIdArray = [];
    var notifyTitle = body.title;
    var notifyBody = body.message;
    var retObj={};
    DeviceIdColl.find({},function (err,devices) {
        if(err){
            retObj.status = false;
            retObj.message = 'Error saving settlement';
            callback(retObj);
        }else{
            regIdArray=_.pluck(devices,'deviceId');
            for(var i = 0; i < regIdArray.length; i++){
                var message = {
                    to: regIdArray[i], // required fill with device token or topics
                    collapse_key: 'UldGemVVZGhZV1JwUTI5c2JHRndjMlZMWlhrPQ==', //EasygaadiCollapseKey encrypt twice with base64
                    data: {
                        your_custom_data_key: 'UldGemVVZGhZV1JwUkdGMFlVdGxlUT09', //EasygaadiDataKey encrypt twice with base64
                        jsonData: {
                            deviceId: regIdArray[i],
                            title: notifyTitle,
                            body: notifyBody,
                            action: 'notifications'
                        }
                    },
                    notification: {
                        title: notifyTitle,
                        body: notifyBody,
                        jsonData: {
                            deviceId: regIdArray[i],
                            title: notifyTitle,
                            body: notifyBody,
                            action: 'notifications'
                        }
                    }
                };
                // console.log(message);
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log("Something has gone wrong! ===> " + err + ' ==> ' + message.to);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
                if(i===regIdArray.length-1){
                    retObj.status = true;
                    retObj.message = 'Notification sent succesfully';
                    callback(retObj);
                }
            }
        }
    })
};

module.exports = new Notifications();