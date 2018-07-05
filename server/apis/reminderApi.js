var RemindersCollection = require('./../models/schemas').RemindersCollection;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var SmsService = require('./smsApi');
var emailService = require('./mailerApi');


var Reminders = function () {
};


Reminders.prototype.addReminder = function(jwt,reminder,callback){
    var retObj={
        status:false,
        messages:[]
    };
    reminder.accountId = jwt.id;
    var reminderDoc = new RemindersCollection(reminder);
    reminderDoc.save(function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error in saving");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Saved successfully");
            retObj.data=result;
            callback(retObj);
        }
    });

};
Reminders.prototype.getReminderCount = function(jwt,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var currentDate = new Date();
    var sevenDate = new Date(currentDate.setDate(currentDate.getDate()+7));
    RemindersCollection.count({$and:[{accountId:jwt.id},{status:"Enable"},{"reminderDate":{$lte:sevenDate}}]},function(err,count){
        if(err){
            retObj.status=false;
            retObj.messages.push("error"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=count;
            callback(retObj);
        }
    });


};
Reminders.prototype.updateReminder = function(jwt,reminder,callback){
    var retObj={
        status:false,
        messages:[]
    };

    RemindersCollection.findOneAndUpdate({_id:reminder._id},
        {$set:{"reminderDate":reminder.reminderDate,"reminderText":reminder.reminderText,"status":reminder.status}},function(err,result){
            if(err){
                retObj.messages.push("Please try again"+JSON.stringify(err));
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push("Updated successfully");
                retObj.data=result;
                callback(retObj);
            }
        });
};
Reminders.prototype.deleteReminder = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    RemindersCollection.remove({_id:id},function(err,result) {
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

Reminders.prototype.getAllReminders = function(jwt,callback){
    var retObj={
        status:false,
        messages:[]
    };
    RemindersCollection.find({accountId:jwt.id}).sort({reminderDate:1}).exec(function(err,reminders){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while deleting load request"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successful");
            retObj.data=reminders;
            callback(retObj);
        }
    });
};

Reminders.prototype.getReminder = function(id,jwt,callback){
    var retObj={
        status:false,
        messages:[]
    };
    RemindersCollection.findOne({_id:id}).populate({path:"refId"}).populate({path:"inventory"}).populate({path:"vehicle"}).exec(function(err,reminder){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while deleting load request"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successful");
            retObj.data=reminder;
            callback(retObj);
        }
    });
};

Reminders.prototype.sendReminder = function (callback) {
    var retObj = {
        status : false,
        messages :[]
    };
    var currentDate = new Date();
    var sevenDate = new Date(currentDate.setDate(currentDate.getDate()+7));
    AccountsColl.find({},{"contactPhone":1,"email":1,"smsEnabled":1},function(err,accounts){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while fetching records..."+JSON.stringify(err));
            callback(retObj);
        }else{
            async.each(accounts,function(account,asyncCallback){
                RemindersCollection.find({"accountId":account._id,"reminderDate":{$lte:sevenDate},"status":"Enable"},function(err,reminders){
                    if(reminders.length>0){
                        var output = [];
                        for(var i=0;i<reminders.length;i++){
                            output.push({
                                "reminderDate":reminders[i].reminderDate,
                                "reminderText":reminders[i].reminderText,
                                "status":reminders[i].status
                            });
                        }
                        var emailparams = {
                            templateName: 'ReminderDetails',
                            subject: "Reminder",
                            to: account.email,
                            data:output
                        };
                        emailService.sendEmail(emailparams, function (emailResponse) {
                            if(emailResponse.status){
                                if(account.smsEnabled){
                                    var smsParams = {
                                        contact: account.contactPhone,
                                        message: "Hi "+account.firstName+"You have set reminders for upcoming jobs.Please login in to easygaadi.com and check."
                                    };
                                    SmsService.sendSMS(smsParams, function (smsResponse) {
                                        if(smsResponse.status){
                                            asyncCallback(false);
                                        }else{
                                            asyncCallback(false);
                                        }
                                    });
                                }
                            }else{
                                asyncCallback(true);
                            }
                        });
                    }else{
                        asyncCallback(true);
                    }
                });
            },function(err){
                if(err){
                    retObj.status=false;
                    retObj.messages.push("Error in sharing reminders"+JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.status=true;
                    retObj.messages.push("Reminder is shared successfully....");
                    callback(retObj);
                }
            });
        }
    });
};



module.exports=new Reminders();
