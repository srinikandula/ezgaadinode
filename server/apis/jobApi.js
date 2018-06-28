var JobsCollection = require('./../models/schemas').JobsCollection;
var Utils = require('../apis/utils');
var _ = require('underscore');
var expenseMasterApi = require('./expenseMasterApi');


var Jobs = function () {
};

function save(info,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var jobDoc = new JobsCollection(info);
    jobDoc.save(function(err,result){
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

function uploadFileToS3(req,callback){
    if(req.files.files){
        Utils.uploadAttachmentsToS3(req.jwt.accountId, 'Jobs', req.files.files, function (uploadResp) {
            if(uploadResp.status){
                callback(uploadResp);
            }else{
                callback(uploadResp);
            }
        });
    }
};

Jobs.prototype.addJob = function(req,callback){
    var jobInfo = req.body.content;
    jobInfo.accountId = req.jwt.accountId;
    if(jobInfo.jobName && jobInfo.type === 'others'){
        expenseMasterApi.addExpenseType(req.jwt,{"jobName":jobInfo.jobName},req,function(ETcallback){
            if(ETcallback.status){
                jobInfo.type = ETcallback.newDoc._id.toString();
                uploadFileToS3(req,function(uploadCallback){
                    if(uploadCallback.status){
                        jobInfo.attachments = uploadCallback.attachments;
                        save(jobInfo,function(saveCallback){
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
                save(jobInfo,function(saveCallback){
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
function updateJob(info,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    uploadFileToS3(req,function(uploadCallback){
        if(uploadCallback.status){
            info.attachments = uploadCallback.attachments;
            JobsCollection.findOneAndUpdate({_id:info._id},{$set:info},function(err,updateResult){
                if(err){
                    retObj.status=false;
                    retObj.messages.push("error while getting data"+JSON.stringify(err));
                    callback(retObj);
                } else{
                    retObj.status=true;
                    retObj.messages.push("Updated successfully");
                    retObj.data = updateResult;
                    callback(retObj);
                }
            });
        }else{
            callback(uploadCallback);
        }
    });
}

Jobs.prototype.updateJob = function(req,callback){
    var jobInfo = req.body.content;
    if (jobInfo.type === 'others' && jobInfo.jobName) {
        expenseMasterApi.addExpenseType(req.jwt,{"jobName":jobInfo.jobName}, req, function (eTResult) {
            if (eTResult.status) {
                jobInfo.type = eTResult.newDoc._id.toString();
                updateJob(jobInfo,req, callback);
            } else {
                callback(eTResult);
            }
        });
    } else {
        updateJob(jobInfo,req, callback);
    }

};

Jobs.prototype.getAllJobs = function(jwt,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var query = {accountId:jwt.id};
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

Jobs.prototype.getJob = function(id,callback){
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

