var devicePositions = require('./../models/schemas').GpsColl;
var SmsService = require('./smsApi');

var DeviceCount = function () {

};

var devicePositionsCount = 0;

DeviceCount.prototype.sendSMS = function(callback){
    var retObj = {
        status:false,
        messages:[]
    };
    // var devicePositionsCount = 0;

    var fulldate = new Date();
    devicePositions.find({createdAt: {$lte: fulldate}}).lean().exec(function (errdata, gpsdocuments) {
        if(gpsdocuments){
            if(gpsdocuments.length-devicePositionsCount < 100){
                var smsParams = {
                    contact:'',
                    message:''
                };
                SmsService.sendSMS(smsParams, function (smsResponse) {
                    if(smsResponse.status){
                        retObj.status = true;
                        retObj.messages.push("SMS sent successfully");
                        callback(retObj);
                    }else{
                        retObj.status = true;
                        retObj.messages.push("error in sending sms");
                        callback(retObj);
                    }
                });
            }
        }
        devicePositionsCount = gpsdocuments.length;
    });
};

module.exports = new DeviceCount();