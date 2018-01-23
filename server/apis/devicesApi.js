var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var DeviceColl = require('./../models/schemas').DeviceColl;
var TrucksColl = require('./../models/schemas').TrucksColl;


var Devices = function () {
};

Devices.prototype.addDevice = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.deviceId) {
        retObj.messages.push('Enter Device Id');
    }
    if (!params.truckId || !ObjectId.isValid(params.truckId)) {
        retObj.messages.push('Select truck number');
    }
    if(!params.simNumber){
        retObj.messages.push('Enter Sim Number');
    }
    if(!params.imei){
        retObj.messages.push('Enter Imei');
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = jwt.id;
        var device = new DeviceColl(params);
        device.save(function (err, data) {
            if (err) {
                retObj.messages.push('Please try again');
                callback(retObj);
            } else if (data) {
                TrucksColl.findOneAndUpdate({_id:params.truckId},
                    {deviceId:data._id},function (err,update) {
                    if(err){
                        retObj.messages.push('Please try again');
                        callback(retObj);
                    }else if(update){
                        retObj.status = true;
                        retObj.messages.push('Device Added successfully');
                        callback(retObj);
                    }else{
                        retObj.messages.push('Please try again');
                        callback(retObj);
                    }
                });

            } else {
                retObj.messages.push('Please try again');
                callback(retObj);
            }
        })
    }
};

Devices.prototype.getDevices=function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    DeviceColl.find({}).populate({path:"truckId",select:"registrationNo"}).exec(function (err,devicesList) {
        if (err) {
            retObj.messages.push('Please try again');
            callback(retObj);
        } else if (devicesList.length>0) {
            retObj.status = true;
            retObj.devices=devicesList;
            retObj.messages.push('Success');
            callback(retObj);
        } else {
            retObj.messages.push('No Devices found');
            callback(retObj);
        }
    })
};
module.exports = new Devices();