var InventoryCollection = require('./../models/schemas').InventoryCollection;
var Utils = require('../apis/utils');
var _ = require('underscore');
var RemindersCollection = require('./../models/schemas').RemindersCollection;
var JobsCollection = require('./../models/schemas').JobsCollection;
var emailService = require('./mailerApi');
var PartsLocationColl = require('./../models/schemas').partsLocationColl;
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;


var expenseMasterApi = require('./expenseMasterApi');


var Jobs = function () {
};

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
};

function save(job,reminder,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var jobDoc = new JobsCollection(job);
    var condition = {
        accountId:job.accountId,
        vehicle:job.vehicle._id,
        partLocation:job.partLocation
    };
    JobsCollection.findOneAndUpdate(condition,{$set:{unInstallMilege:job.milege}}).sort({createdAt:-1}).exec(function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in saving....."+JSON.stringify(err));
            callback(retObj);
        }else{
            jobDoc.save(function(err,result){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("error in saving....."+JSON.stringify(err));
                    callback(retObj);
                }else{
                    InventoryCollection.findOneAndUpdate({accountId:result.accountId,_id:result.inventory},{$set:{vehicle:job.vehicle.registrationNo}},function(err,inventoryResult){
                        if(err){
                            retObj.status = false;
                            retObj.messages.push("error in saving....."+JSON.stringify(err));
                            callback(retObj);
                        }else{
                            if((reminder.reminderDate && reminder.reminderText) !== undefined){
                                reminder.refId = result._id;
                                var reminderDoc = new RemindersCollection(reminder);
                                reminderDoc.save(function(err,reminderResult){
                                    if(err){
                                        retObj.status = false;
                                        retObj.messages.push("error in saving reminder........"+JSON.stringify(err));
                                        callback(retObj);
                                    }
                                });
                            }
                        }
                    });
                    retObj.status = true;
                    retObj.messages.push("saved successfully..");
                    retObj.data = result;
                    callback(retObj);
                }
            });
        }
    });
};

function addPartLocation(partLocationName,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    PartsLocationColl.findOne({partLocationName:partLocationName},function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in saving",JSON.stringify(err));
            callback(retObj);
        }else if(data){
            retObj.status = false;
            retObj.messages.push("part location already exists");
            callback(retObj);
        }else{
            var partsLocation = {partLocationName:partLocationName};
            var doc = new PartsLocationColl(partsLocation);
            doc.save(function(err,result){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("Error in saving",JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push("saved successfully...");
                    callback(retObj);
                }
            });
        }
    });
};

Jobs.prototype.addJob = function(req,callback){
    var retObj = {
      status:false,
      errors:[]
    };
    var jobInfo = req.body;
    if(!jobInfo.inventory){
        retObj.errors.push("Please select Inventory");
    }
    if(retObj.errors.length > 0){
        callback(retObj)
    }
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
    if(jobInfo.partLocation === 'others'){
        addPartLocation(jobInfo.partLocationName,function(addCallback){
            if(!addCallback.status){
                callback(addCallback);
            }else{
                callback(addCallback);
            }
        });

    }else{
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
        if(jobInfo.partLocation === 'others'){
            addPartLocation(jobInfo.partLocationName,function(addCallback){
                if(!addCallback.status){
                    callback(addCallback);
                }else{
                    if(jobInfo.expenseName && jobInfo.type === 'others'){
                        expenseMasterApi.addExpenseType(req.jwt,{"expenseName":jobInfo.expenseName},req,function(ETcallback){
                            if(ETcallback.status){
                                jobInfo.type = ETcallback.newDoc._id.toString();
                                save(jobInfo,reminder,function(saveCallback){
                                    if(saveCallback.status){
                                        callback(saveCallback);
                                    }else{
                                        callback(saveCallback);
                                    }
                                });
                            }else{
                                callback(ETcallback);
                            }
                        });
                    }else{
                        save(jobInfo,reminder,function(saveCallback){
                            if(saveCallback.status){
                                callback(saveCallback);

                            }else{
                                callback(saveCallback);
                            }
                        });
                    }
                }
            });
        }else{
            if(jobInfo.expenseName && jobInfo.type === 'others'){
                expenseMasterApi.addExpenseType(req.jwt,{"expenseName":jobInfo.expenseName},req,function(ETcallback){
                    if(ETcallback.status){
                        jobInfo.type = ETcallback.newDoc._id.toString();
                        save(jobInfo,reminder,function(saveCallback){
                            if(saveCallback.status){
                                callback(saveCallback);
                            }else{
                                callback(saveCallback);
                            }
                        });
                    }else{
                        callback(ETcallback);
                    }
                });
            }else{
                save(jobInfo,reminder,function(saveCallback){
                    if(saveCallback.status){
                        callback(saveCallback);

                    }else{
                        callback(saveCallback);
                    }
                });
            }
        }
    }

};
function updateJob(info,reminder,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {
        accountId:info.accountId,
        vehicle:info.vehicle._id,
        partLocation:info.partLocation
    };
    JobsCollection.findOneAndUpdate(condition,{$set:{unInstallMilege:info.milege}},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            JobsCollection.findOneAndUpdate({_id:info._id},{$set:info},function(err,updateResult){
                if(err){
                    retObj.status=false;
                    retObj.messages.push("error while getting data"+JSON.stringify(err));
                    callback(retObj);
                } else{
                    InventoryCollection.findOneAndUpdate({accountId:updateResult.accountId,_id:updateResult.inventory},{$set:{vehicle:info.vehicle.registrationNo}},function(err,inventoryResult){
                        if(err){
                            retObj.status = false;
                            retObj.messages.push("error in saving....."+JSON.stringify(err));
                            callback(retObj);
                        }else{
                            RemindersCollection.findOneAndUpdate({refId:reminder.refId},{$set:reminder},function (err,result) {
                                if(err){
                                    retObj.messages.push("error in updating data"+JSON.stringify(err));
                                }
                            });
                        }
                    });
                    retObj.status=true;
                    retObj.messages.push("Updated successfully");
                    callback(retObj);
                }
            });
        }
    });
}

Jobs.prototype.updateJob = function(req,callback){
    var jobInfo = req.body;
    var reminder = {
        refId:jobInfo._id,
        reminderDate:jobInfo.reminderDate,
        reminderText:jobInfo.reminderText
    };
    if(jobInfo.partLocation === 'others'){
        addPartLocation(jobInfo.partLocationName,function(addCallback){
            if(!addCallback.status){
                callback(addCallback);
            }else{
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
            }
        });
    }else{
        jobInfo.partLocationName = '';
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
    }

};

Jobs.prototype.getAllJobs = function(jwt,requestParams,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(requestParams.truckName){
        condition = {accountId:jwt.accountId,vehicle:requestParams.truckName};
    }else if(requestParams.inventory){
        condition = {accountId:jwt.accountId,inventory:requestParams.inventory};
    }
    else if(requestParams.fromDate && requestParams.toDate){
        condition = {
            accountId:jwt.accountId,
            createdAt:{$gte:new Date(requestParams.fromDate),$lte:new Date(requestParams.toDate)}
        };
    }else{
        condition={accountId:jwt.accountId};
    }
    var skipNumber = requestParams.page ? (requestParams.page - 1) * requestParams.size : 0;
    var limit = requestParams.size ? parseInt(requestParams.size) : Number.MAX_SAFE_INTEGER;
    var sort = requestParams.sort ? JSON.parse(requestParams.sort) : {createdAt: -1};
    JobsCollection.find(condition)
        .sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .lean()
        .populate({path:"vehicle",select:"registrationNo"}).populate({path:"inventory",select:"name"})
        .exec(function(err,jobs){
            if(err){
                retObj.status=false;
                retObj.messages.push("error while getting data"+JSON.stringify(err));
                callback(retObj);
            } else{
                retObj.status=true;
                retObj.messages.push("Success");
                retObj.data = jobs;
                callback(retObj);
            }
        });
};

Jobs.prototype.getCount = function(jwt,requestParams,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(requestParams.truckName){
        condition = {accountId:jwt.accountId,vehicle:requestParams.truckName};
    }else if(requestParams.inventory){
        condition = {accountId:jwt.accountId,inventory:requestParams.inventory};
    }
    else if(requestParams.fromDate && requestParams.toDate){
        condition = {
            accountId:jwt.accountId,
            createdAt:{$gte:new Date(requestParams.fromDate),$lte:new Date(requestParams.toDate)}
        };
    }else{
        condition = {accountId:jwt.accountId};
    }
    JobsCollection.count(condition,function(err,count){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Successfull");
            retObj.data = count;
            callback(retObj);
        }
    });
};

Jobs.prototype.getPreviousJobs = function(jwt,query,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {accountId:jwt.accountId,vehicle:query.vehicleId};
    if(query.jobId){
        condition._id = { $nin : query.jobId };
    }
    JobsCollection.find(condition).populate({path:"type"}).populate({path:"inventory"}).sort({date:-1}).limit(3).exec(function(err,records){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            if(records.length>0){
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
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
Jobs.prototype.getJobsForInventory = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {accountId:jwt.accountId,inventory:params.inventoryId};
    if(params.jobId){
        condition._id = {$nin:params.jobId}
    }
    JobsCollection.find(condition).populate({path:"vehicle"}).populate({path:"type"}).sort({createdAt:-1}).limit(5).exec(function(err,records){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        }else{
            if(records.length>0){
                retObj.status = true;
                retObj.messages.push("records fetched successfully");
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

Jobs.prototype.deleteJob = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    JobsCollection.remove(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while deleting job"+JSON.stringify(err));
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
Jobs.prototype.shareDetailsViaEmail = function (jwt,requestParams,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!requestParams.email || !Utils.isEmail(requestParams.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else {
        Jobs.prototype.getAllJobs(jwt, requestParams, function (getCallback) {
            if (getCallback.status) {
                var output = [];
                if (getCallback.data.length > 0) {
                    for (var i = 0; i < getCallback.data.length; i++) {
                        output.push({
                            jobDate: dateToStringFormat(getCallback.data[i].date),
                            inventory: getCallback.data[i].inventory.name,
                            vehicle: getCallback.data[i].vehicle.registrationNo,
                            milege: getCallback.data[i].milege,
                            reminderDate: dateToStringFormat(getCallback.data[i].reminderDate)
                        });
                        if (i === getCallback.data.length - 1) {
                            var emailparams = {
                                templateName: 'jobDetails',
                                subject: "Job Details",
                                to: requestParams.email,
                                data: output
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    retObj.status = true;
                                    retObj.messages.push(' Details shared successfully');
                                    callback(retObj);
                                } else {
                                    callback(emailResponse);
                                }
                            });
                        }
                    }
                } else {
                    callback(getCallback);
                }
            } else {
                callback(getCallback);
            }
        });
    }
};
Jobs.prototype.getAllPartsLocations = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    PartsLocationColl.find({},function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in fetching the data...",JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = data;
            callback(retObj);
        }
    });
};
Jobs.prototype.getJobForSelectedPartLocation = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {
        accountId:jwt.accountId,
        vehicle:params.vehicle,
        partLocation:params.partLocation
    };
    if(!params.vehicle){
        retObj.messages.push();
    }
    if(params.jobId){
       condition._id = {$nin:params.jobId};
    }
    JobsCollection.find(condition).sort({createdAt:-1}).limit(1).populate({path:"inventory"}).exec(function(err,job){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in fetching the data...",JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = job;
            callback(retObj);
        }
    });
};
module.exports=new Jobs();

