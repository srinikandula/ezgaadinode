
var Utils = require('../apis/utils');
var _ = require('underscore');
var RemindersCollection = require('./../models/schemas').RemindersCollection;
var JobsCollection = require('./../models/schemas').JobsCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;

var expenseMasterApi = require('./expenseMasterApi');


var Jobs = function () {
};


function save(job,reminder,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var jobDoc = new JobsCollection(job);
    jobDoc.save(function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in saving....."+JSON.stringify(err));
            callback(retObj);
        }else{
            reminder.refId = result._id;
            var reminderDoc = new RemindersCollection(reminder);
            reminderDoc.save(function(err,result){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("error in saving....."+JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push("saved successfully..");
                    retObj.data = result;
                    callback(retObj);
                }
            });
        }
    });
}

function uploadFileToS3(req,callback){
    if(req.files.files){
        Utils.uploadAttachmentsToS3(req.jwt.accountId, 'Jobs', req.files.files, function (uploadResp) {
            if(uploadResp.status){
                callback(uploadResp);
            }else{
                callback(uploadResp);
            }
        });
    }else{
        callback({'status':true});
    }
};

Jobs.prototype.addJob = function(req,callback){
    var jobInfo = req.body.content;
    jobInfo.accountId = req.jwt.accountId;
    var reminder = {
        reminderDate:jobInfo.reminderDate,
        vehicle:jobInfo.vehicle.registrationNo,
        jobDate:jobInfo.date,
        reminderText:jobInfo.reminderText,
        inventory:jobInfo.inventory.name,
        accountId:req.jwt.accountId,
        status:'Enable',
        type:'job'
    };
    if(jobInfo.expenseName && jobInfo.type === 'others'){
        expenseMasterApi.addExpenseType(req.jwt,{"expenseName":jobInfo.expenseName},req,function(ETcallback){
            if(ETcallback.status){
                jobInfo.type = ETcallback.newDoc._id.toString();
                uploadFileToS3(req,function(uploadCallback){
                    if(uploadCallback.status){
                        jobInfo.attachments = uploadCallback.attachments;
                        save(jobInfo,reminder,function(saveCallback){
                            if(saveCallback.status){
                                callback(saveCallback);
                            }else{
                                callback(saveCallback);
                            }
                        });
                    }else{
                        callback(uploadCallback);
                    }
                });
            }else{
                callback(ETcallback);
            }
        });
    }else{
        uploadFileToS3(req,function(uploadCallback){
            if(uploadCallback.status){
                jobInfo.attachments = uploadCallback.attachments;
                save(jobInfo,reminder,function(saveCallback){
                    if(saveCallback.status){
                        callback(saveCallback);

                    }else{
                        callback(saveCallback);
                    }
                });
            }else{
                callback(uploadCallback);
            }
        });
    }
};
function updateJob(info,reminder,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    uploadFileToS3(req,function(uploadCallback){
        if(uploadCallback.status){
            info.attachments = uploadCallback.attachments;
        }
    });
    JobsCollection.findOneAndUpdate({_id:info._id},{$set:info},function(err,updateResult){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            RemindersCollection.findOneAndUpdate({refId:reminder.refId},{$set:reminder},function (err,result) {
                if(err){
                    retObj.status=false;
                    retObj.messages.push("error while getting data"+JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.status=true;
                    retObj.messages.push("Updated successfully");
                    callback(retObj);
                }
            });
        }
    });
}

Jobs.prototype.updateJob = function(req,callback){
    var jobInfo = req.body.content;
    var reminder = {
        refId:jobInfo._id,
        reminderDate:jobInfo.reminderDate,
        reminderText:jobInfo.reminderText,
        accountId:req.jwt.accountId,
        status:'Enable'
    };
    if (jobInfo.type === 'others' && jobInfo.expenseName) {
        expenseMasterApi.addExpenseType(req.jwt,{"expenseName":jobInfo.expenseName}, req, function (eTResult) {
            if (eTResult.status) {
                jobInfo.type = eTResult.newDoc._id.toString();
                updateJob(jobInfo,reminder,req, callback);
            } else {
                callback(eTResult);
            }
        });
    } else {
        updateJob(jobInfo,reminder,req, callback);
    }

};

Jobs.prototype.getAllJobs = function(jwt,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var query = {accountId:jwt.accountId};
    JobsCollection.find(query).populate({path:"vehicle",select:"registrationNo"}).populate({path:"inventory",select:"name"}).exec(function(err,jobs){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = jobs;
            callback(retObj);
        }
    });

};
Jobs.prototype.getPreviousJobs = function(jwt,vehicle,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    JobsCollection.find({accountId:jwt.accountId,vehicle:vehicle._id}).populate({path:"type"}).populate({path:"inventory"}).sort({date:-1}).limit(3).exec(function(err,records){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            if(records.length>0){
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
                retObj.vehicle = vehicle.registrationNo;
                retObj.records =records;
                callback(retObj);
            }else{
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
                retObj.records =[];
                callback(retObj);
            }
        }
    });

};
Jobs.prototype.getJobsForInventory = function(jwt,inventory,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    JobsCollection.find({accountId:jwt.accountId,inventory:inventory._id}).populate({path:"vehicle"}).populate({path:"type"}).sort({createdAt:-1}).limit(5).exec(function(err,records){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            if(records.length>0){
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
                retObj.inventory = inventory.name;
                retObj.records =records;
                callback(retObj);
            }else{
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
                retObj.records =[];
                callback(retObj);
            }
        }
    });
};

Jobs.prototype.getJob = function(jwt,id,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var query = {_id:id};
    JobsCollection.findOne(query).populate({path:"vehicle"}).populate({path:"inventory"}).exec(function(err,job){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = job;
            callback(retObj);
        }
    });

};
Jobs.prototype.searchBytruckName = function(jwt,truckName,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    TrucksColl.findOne({registrationNo:truckName},function(err,truck){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting the data"+JSON.stringify(err));
            callback(retObj);
        }else if(truck){
            JobsCollection.find({accountId:jwt.accountId,vehicle:truck._id}).populate({path:"vehicle"}).populate({path:"inventory"}).exec(function(err,jobs){
                if(err){
                    retObj.status=false;
                    retObj.messages.push("error while getting the data"+JSON.stringify(err));
                    callback(retObj);
                }else if(jobs.length>0){
                    retObj.status=true;
                    retObj.messages.push("Success");
                    retObj.data=jobs;
                    callback(retObj);
                }else{
                    retObj.status=true;
                    retObj.messages.push("Success");
                    retObj.data=[];
                    callback(retObj);
                }
            });
        }
    });
};

Jobs.prototype.deleteJob = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    JobsCollection.remove(query,function(err,result){
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
Jobs.prototype.deleteImage = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Utils.deleteS3BucketFile(req.query.key, function (resp) {
        if (resp.status) {
            JobsCollection.update(
                {"_id": req.query.jobId},
                {"$pull": {"attachments": {"_id": req.query.jobId}}},
                {safe: true},
                function (err, numAffected) {
                    if (err) {
                        retObj.messages.push("Please try again, " + err.message);
                        callback(retObj);
                    } else if (numAffected) {
                        retObj.status = true;
                        retObj.messages.push(" image deleted successfully");
                        callback(retObj);
                    } else {
                        retObj.messages.push("image not deleted");
                        callback(retObj);
                    }
                }
            );
        } else {
            callback(resp);
        }
    })
};



module.exports=new Jobs();

