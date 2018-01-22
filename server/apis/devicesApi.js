
var DeviceColl = require('./../models/schemas').DeviceColl;

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Devices = function () {
};

Devices.prototype.addDevice=function (params,callback) {
  var  retObj={
        status:false,
        messages:[]
    }

    if(!params.deviceId){

    }else if(!params.truckId || )
};

module.exports = new Devices();