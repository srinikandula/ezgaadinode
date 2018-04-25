var _ = require('underscore');
var DeviceIdColl = require('./../models/schemas').deviceIdColl;
var analyticsService=require('./../apis/analyticsApi');
var config = require('./../config/config');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var FCM = require('fcm-push');
var fcm = new FCM(config.serverKey);

var Notifications = function () {
};


Notifications.prototype.saveDeviceDetails = function (body,req,callback) {
    var retObj={};
    var query = {};

    if(!body.imei){
        retObj.status = false;
        retObj.message = 'Invalid Imei';
        callback(retObj);
    }else if(!body.fcmDeviceId){
        retObj.status = false;
        retObj.message = 'Invalid Device Id';
        callback(retObj);
    }else {
        DeviceIdColl.findOne({accountId:req.jwt.accountId},function (err,device) {
            if(err){
                retObj.status = false;
                retObj.message = 'Error, please try again';
                callback(retObj);
            } else if(device){
                var index=device.fcmDeviceIds.indexOf(body.fcmDeviceId);
                if(index===-1){
                    body.fcmDeviceIds=device.fcmDeviceIds;
                    body.fcmDeviceIds.push(body.fcmDeviceId);
                    delete body.fcmDeviceId;
                    query = { _id: device._id };
                    updateDeviceId(query,body,function (response) {
                        callback(response);
                    })
                }else{
                    retObj.status = true;
                    retObj.message = 'Device already added';
                    callback(retObj);
                }
            }else{
                var id=new ObjectId();
                query = { _id: id };
                body.fcmDeviceIds=[];
                body.fcmDeviceIds.push(body.fcmDeviceId);
                delete body.fcmDeviceId;
                updateDeviceId(query,body,function (response) {
                    callback(response);
                })
            }
        });

    }
};

function updateDeviceId(query,body,callback) {
    var retObj={};
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

Notifications.prototype.sendPushNotifications = function (body,callback) {
    var regIdArray = [];
    if(!body.devices){
        var retObj={};
        DeviceIdColl.find({},function (err,devices) {
            if(err){
                retObj.status = false;
                retObj.message = 'Error saving settlement';
                callback(retObj);
            }else{
                var messages=devices[0].messages;
                messages.push({title:body.title,message:body.message,date:new Date()});
                regIdArray= _.flatten(_.pluck(devices,'fcmDeviceIds'));
                sendNotificationToDevices(body,regIdArray,function (response) {
                    if(response.status){
                        DeviceIdColl.updateMany({},{$set:{messages:messages}},function (err,result) {
                            if(err){
                                retObj.status = false;
                                retObj.message = 'Error while updating messages field';
                                callback(retObj);
                            }else{
                                retObj.status = true;
                                retObj.message = 'Updated the messages field';
                                callback(retObj);
                            }
                        })
                    }
                    // callback(response);
                });
            }
        })
    }else{
        sendNotificationToDevices(body,body.devices,function (response) {
            callback(response);
        })
    }
};

function sendNotificationToDevices(body,regIdArray,callback) {
    var retObj={};
    var notifyTitle = body.title;
    var notifyBody = body.message;
    if(regIdArray.length>0) {
        for (var i = 0; i < regIdArray.length; i++) {
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
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong! ===> " + err + ' ==> ' + message.to);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
            if (i === regIdArray.length - 1) {
                retObj.status = true;
                retObj.message = 'Notification sent succesfully';
                callback(retObj);
            }
        }
    }else{
        retObj.status = true;
        retObj.message = 'No devices found';
        callback(retObj);
    }
}

Notifications.prototype.getPushNotifications=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    DeviceIdColl.findOne({accountId:req.jwt.id},{messages:1},function (err,device) {
        if(err){
            retObj.status = false;
            retObj.messages.push('Error while retrieving notifications');
            callback(retObj);
        }else if(device){
            var messages=[];
            if(device.messages.length>10){
                messages=device.messages.splice(device.messages.length-10,device.messages.length);
            }else{
                messages=device.messages;
            }
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data=messages;
            callback(retObj);
        }else{
            retObj.status = false;
            retObj.messages.push('No device registered for this account.');
            callback(retObj);
        }
    })
};

module.exports = new Notifications();