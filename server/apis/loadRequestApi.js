var LoadRequestColl = require('./../models/schemas').LoadRequestColl;
var SmsService = require('./smsApi');
var emailService = require('./mailerApi');
var NotificationColl = require('./../models/schemas').NotificationColl;
var async = require('async');


var Loads = function () {
};
function addTripDetailsToNotification(data, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var notification = new NotificationColl(data);
    notification.save(function (err, notiData) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("LoadRequest Added Successfully");
            callback(retObj);
        }
    });
}
Loads.prototype.addLoadRequest = function(jwt,info,callback){
  var retObj = {
      status:false,
      messages:[],
      errors:[]
  };
    info.accountId = jwt.id;
    if(!info.source){
        retObj.errors.push("select source address...");
    }
    if(!info.destination){
        retObj.errors.push("select destination address...");
    }
    if(!info.dateAvailable){
        retObj.errors.push("select date...");
    }
    if(!info.expectedDateReturn){
        retObj.errors.push("select return date...");
    }
    if(retObj.errors.length){
        callback(retObj);
    }
    else {
        var insertDoc = new LoadRequestColl(info);
        insertDoc.save(function (err, result) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("error in saving"+JSON.stringify(err));
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Saved successfully");
                retObj.data = result;
                callback(retObj);
            }
        });
    }
};
Loads.prototype.getLoadRequests = function(jwt,req,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {accountId:jwt.accountId};
    LoadRequestColl.find(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error in getting load requests"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=result;
            callback(retObj);
        }
    });
};
Loads.prototype.getLoadRequest = function(id,req,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    LoadRequestColl.findOne(query).populate({path:"truckType"}).exec(function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error in getting load request"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=result;
            callback(retObj);
        }
    });
};
Loads.prototype.updateLoadRequest = function(info,req,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:info._id};
    LoadRequestColl.findOneAndUpdate(query,{$set:{source:info.source,destination:info.destination,
            truckType:info.truckType,regNo:info.regNo,price:info.price,makeYear:info.makeYear,dateAvailable:info.dateAvailable,expectedDateReturn:info.expectedDateReturn}},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while updating..."+ JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=false;
            retObj.messages.push("successfully updated...");
            retObj.data=result;
            callback(retObj);
        }
    });
};
Loads.prototype.deleteLoadRequest = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    LoadRequestColl.remove(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while deleting load request"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfully deleted");
            retObj.data=result;
            callback(retObj);
        }
    });
};
Loads.prototype.shareLoadRequest = function (id,parties, callback) {
    for(var i=0;i<parties.length;i++) {
      var party =  JSON.parse(parties[i]);
        if (party.ischecked === true) {
            var notificationParams = {
                // accountId: party._id,
                notificationType: 0,
                content: "Party Name: " + party.name + "," +
                "Contact:" + party.contact + "," ,
                status: true,
                refType:'LR',
                refId:id,
                message: "success"
            };
            var smsParams = {
                contact: party.contact,
                message: "Hi " + party.name + ",\n"
            };
            SmsService.sendSMS(smsParams, function (smsResponse) {
                if(smsResponse.status){
                    if(party.email){
                        var output=[];
                        output.push({
                            partyName:party.name,
                            contact:party.contact
                        });
                        var emailparams = {
                            templateName: 'LoadRequestDetails',
                            subject: "load request Details",
                            to: party.email,
                            data:output
                        };
                        emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    notificationParams.notificationType = 2;
                                    notificationParams.status = true;
                                    notificationParams.message = "success";
                                    addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                        callback(notificationResponse);
                                    })
                                } else {
                                    notificationParams.notificationType = 2;
                                    notificationParams.status = false;
                                    notificationParams.message = "SMS sent,but email failed";
                                    addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                        callback(notificationResponse);
                                    })
                                }
                        });
                    }else{
                        notificationParams.notificationType = 0;
                        notificationParams.status = true;
                        notificationParams.message = "success";
                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                            callback(notificationResponse);
                        })
                    }
                }else{
                    notificationParams.notificationType = 0;
                    notificationParams.status = false;
                    notificationParams.message = "SMS failed";
                    addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                        callback(notificationResponse);
                    })
                }
            });
        }
    }
};
Loads.prototype.shareDetailsViaSMS = function(info,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    var numbers = info.contact.split(',');
    if(info.text.length>160){
        retObj.status =false;
        retObj.messages.push("Message is too long...Cannot send SMS");
        callback(retObj);
    }else {
        async.each(numbers,
            function (number, asyncCallback) {
                var smsParams = {
                    contact: number,
                    message: info.text + ",\n"
                };
                var notificationParams = {
                    notificationType: 0,
                    content: "Contact:" + number + ","+"\n" + info.text,
                    status: true,
                    message: "success"
                };
                SmsService.sendSMS(smsParams, function (smsResponse) {
                    if (smsResponse.status) {
                        notificationParams.notificationType = 0;
                        notificationParams.status = true;
                        notificationParams.message = "SMS sent successfully";
                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                            if (notificationResponse.status) {
                                asyncCallback(false);
                            } else {
                                asyncCallback(notificationResponse);

                            }
                        })
                    } else {
                        notificationParams.notificationType = 0;
                        notificationParams.status = false;
                        notificationParams.message = "SMS failed";
                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                            if (notificationResponse.status) {
                                asyncCallback(false);
                            } else {
                                asyncCallback(notificationResponse);
                            }
                        })
                    }
                })
            }, function (err) {
                if (err) {
                    callback(err);
                } else {
                    retObj.status = true;
                    retObj.messages.push("SMS sent successfully..");
                    callback(retObj);
                }
            });
    }
};
module.exports=new Loads();

