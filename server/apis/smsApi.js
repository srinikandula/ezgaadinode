var config = require('./../config/config');

var config_msg91 = config.msg91;
var msg91 = require("msg91")(config_msg91.auth_Key, config_msg91.sender_id, config_msg91.route);


/**
 * Module for sending SMS using MSG 91

 * @param contact           -- to number
 * @param Message         -- data to include in the sms
 */

var SmsService = function () {
};

SmsService.prototype.sendSMS = function (data, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    
    if(!data.contact){
        retObj.status = false;
        retObj.messages.push("Please provide contact number");
    }
    if(!data.message){
        retObj.status = false;
        retObj.messages.push("Please provide message");
    }
    
    if(retObj.messages.length) {
        callback(retObj);
    } else {
        msg91.send(data.contact, data.message, function (err, response) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Error finding user");
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("SMS sent successfully");
                callback(retObj);
            }
        });
    }
};

module.exports = new SmsService();