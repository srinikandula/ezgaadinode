var RemindersCollection = require('./../models/schemas').RemindersCollection;

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
    RemindersCollection.find({accountId:jwt.id},function(err,reminders){
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
    RemindersCollection.findOne({_id:id},function(err,reminder){
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


module.exports=new Reminders();
