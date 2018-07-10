var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
var userscoll = require('./../models/schemas').UsersColl;
var usersCrud=function()
{

}
usersCrud.prototype.adduser = function(jwt,params,req,callback)
{
    var retObj={status:false,message:""};
    var insertDoc=new userscoll(params);
    insertDoc.save(function(err,result){
        if(err){
            console.log("error while inserting data");
        }
        else{
            retObj.status=true;
            retObj.data=result;
            callback(retObj);
        }
        }
    )
};
usersCrud.prototype.getUsers = function(jwt,callback)
{
    var retObj={status:false,message:""};

    userscoll.find(function(err,result){
            if(err){
                console.log("error while inserting data");
            }
            else{
                retObj.status=true;
                retObj.data=result;
                callback(retObj);
            }
        }
    )
};
module.exports = new usersCrud();