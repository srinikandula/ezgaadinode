var SubLoginsCollection = require('./../models/schemas').subLoginsCollection;
var _ = require('underscore');
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');



var Users = function () {
};

Users.prototype.addUser = function(jwt,info,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };

    if (!info.userName || !_.isString(info.userName)) {
        retObj.messages.push('Invalid User Name');
    }

    if (!info.password || info.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be atleast 5 characters');
    }

    if (!info.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }else{
        SubLoginsCollection.findOne({'userName':info.userName},function(err,account){
            if(err){
                retObj.messages.push('Error fetching account'+JSON.stringify(err));
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else if(account){
                retObj.messages.push('Account with same userName already exists');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else{
                info.createdBy = jwt.id;
                info.type = "account";
                var insertDoc = new SubLoginsCollection(info);
                insertDoc.save(function (err, result) {
                    if (err) {
                        retObj.messages.push('Error saving account');
                        analyticsService.create(req, serviceActions.add_account_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else{
                        info.accountId = result._id;
                        info.type = "account";
                        retObj.status = true;
                        retObj.messages.push('Success');
                        analyticsService.create(req, serviceActions.add_account, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Users.prototype.getUsers = function(jwt,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    SubLoginsCollection.find({createdBy:jwt.id},function(err,users){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = users;
            callback(retObj);
        }
    });
};

Users.prototype.getUser = function(jwt,id,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    SubLoginsCollection.findOne({_id:id},function(err,user){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = user;
            callback(retObj);
        }
    });
};
Users.prototype.updateUser = function(jwt,info,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };

    if (!info.userName || !_.isString(info.userName)) {
        retObj.messages.push('Invalid User Name');
    }

    if (!info.password || info.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be atleast 5 characters');
    }

    if (!info.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }else{
        SubLoginsCollection.findOneAndUpdate({_id:info._id},{$set:info},function(err,result){
            if(err){
                retObj.messages.push('Error fetching account'+JSON.stringify(err));
                analyticsService.create(req, serviceActions.update_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else{
                retObj.status = true;
                retObj.messages.push('Success');
                analyticsService.create(req, serviceActions.update_account, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};
Users.prototype.deleteUser = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    SubLoginsCollection.remove(query,function(err,result){
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


module.exports=new Users();


