var AccessPermissionsColl = require('./../models/schemas').accessPermissionsColl;

var AccessPermissions = function(){

};

AccessPermissions.prototype.addAccessPermission = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var accessPermissionInfo = req.body;
    var accessPermissionDoc = new AccessPermissionsColl(accessPermissionInfo);
    accessPermissionDoc.save(function(err,result){
       if(err){
          retObj.status = false;
          retObj.messages.push("Error in saving the data",JSON.stringify(err));
          callback(retObj);
       } else{
           retObj.status = true;
           retObj.messages.push("Success");
           callback(retObj);
       }
    });
};
AccessPermissions.prototype.getAllAccessPermissions = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    AccessPermissionsColl.find({},function (err,accessPermissions) {
       if(err){
           retObj.status = false;
           retObj.messages.push("Error in fetching the data",JSON.stringify(err));
           callback(retObj);
       } else{
           retObj.status = true;
           retObj.messages.push("Success");
           retObj.data = accessPermissions;
           callback(retObj);
       }
    });
};

module.exports = new AccessPermissions();
