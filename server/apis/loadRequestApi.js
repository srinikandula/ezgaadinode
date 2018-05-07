var LoadRequestColl = require('./../models/schemas').LoadRequestColl;
var analyticsService = require('./../apis/analyticsApi');
var TrucksTypesColl = require("../models/schemas").TrucksTypesColl;
var serviceActions = require('./../constants/constants');

var Loads = function () {
};

Loads.prototype.addLoad = function(jwt,info,callback){
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
                console.log("error...", err);
                retObj.status = false;
                retObj.messages.push("error in saving");
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
    // var query = {accountId:jwt.accountId};
    LoadRequestColl.find({},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfull");
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
            retObj.messages.push("error");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfull");
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
    LoadRequestColl.findOneAndUpdate(query,info,function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfull");
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
            retObj.messages.push("error");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfull");
            retObj.data=result;
            callback(retObj);
        }
    });
};
Loads.prototype.getTruckTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var condition = {};
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    if (params.trucksType) {
        condition = {
            $or:
                [
                    {"title": new RegExp(params.trucksType, "gi")},
                    //{"tonnes": new RegExp(params.trucksType, "gi")},
                    // {"mileage": new RegExp(parseFloat(params.trucksType),"gi")},
                ]
        };
    } else if (params.status) {
        condition = {"status": params.status}
    }

    TrucksTypesColl.find(condition).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_types_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages.push("Success");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_types, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No truck types found");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_types_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
};

module.exports=new Loads();

