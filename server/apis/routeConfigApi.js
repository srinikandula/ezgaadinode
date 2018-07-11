var RoutesCollection = require('./../models/schemas').RouteConfigColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var AccountServices=require('./../apis/accountsApi');
var _ = require('underscore');


var Routes = function () {
};

Routes.prototype.addRouteConfig = function(jwt,Info,callback){
    var retObj={
        status:false,
        messages:[],
        errors:[]
    };
    Info.accountId = jwt.accountId;
    if(!Info.name || ! _.isString(Info.name)){
        retObj.errors.push("Invalid name");
    }
    if(!Info.distance || ! _.isNumber(Info.distance)){
        retObj.errors.push("Invalid distance");
        }
    if(!Info.source){
        retObj.errors.push("Enter source location");
    }
    if(!Info.destination){
        retObj.errors.push("Enter destination location");
    }
    if(retObj.errors.length){
        callback(retObj);
    }
    else{
        var insertDoc = new RoutesCollection(Info);
        insertDoc.save(function(err,result){
            if(err){
                console.log("error...",err);
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
    }
};
Routes.prototype.getRouteConfigs = function(jwt,req,callback){
    var retObj={
        status:false,
        message:""
    };
    var query = {accountId:jwt.id};
    RoutesCollection.find(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.getRouteConfig = function(id,req,callback){
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:id};
    RoutesCollection.find(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.updateRouteConfig= function (Info,req, callback) {
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:Info._id};


    RoutesCollection.findOneAndUpdate(query,Info,function (err,result) {
        if(err){
            retObj.message="Please try again";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="Updated successfully";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.deleteRouteConfigs = function(Id,callback){
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:Id};
    RoutesCollection.remove(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};

module.exports=new Routes();

