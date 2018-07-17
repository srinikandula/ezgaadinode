var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var _ = require('underscore');
var LRsColl = require('./../models/schemas').LRsColl;
var pdfGenerator=require('./../apis/pdfGenerator');

var Lrs = function () {
};

Lrs.prototype.add = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    params.updatedBy = req.jwt.id;
    params.createdBy = req.jwt.id;
    params.accountId = req.jwt.accountId;

    var lr = new LRsColl(params);
    lr.save(function (err, doc) {
        if (err) {
            retObj.messages.push("Internal server error," + JSON.stringify(err.message));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("LR Details Successfully Added");
            retObj.data = doc;
            callback(retObj);
        }
    })
};

Lrs.prototype.update = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Provide lr id");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        params.updatedBy = req.jwt.id;
        LRsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("LR Details successfully updated");
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages
            }
        })
    }

};

Lrs.prototype.get=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  var params=req.params;
  if(!params.id || !ObjectId.isValid(params.id)){
      retObj.messages.push("Provide LR Details");
  }
  if(retObj.messages.length>0){
      callback(retObj);
  }else{
      LRsColl.findOne({_id:params.id},function (err,doc) {
          if(err){
              retObj.messages.push("Internal server error," + JSON.stringify(err.message));
              callback(retObj);
          }else if(doc){
              retObj.status=true;
              retObj.data=doc;
              retObj.messages.push("Success");
              callback(retObj);
          }else{
              retObj.messages.push("Please try again");
              callback(retObj);
          }
      })
  }

};
Lrs.prototype.getAll=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    LRsColl.find({accountId:req.jwt.accountId},function (err,docs) {
        if(err){
            retObj.messages.push("Internal server error," + JSON.stringify(err.message));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=docs;
            callback(retObj);
        }
    })
};

Lrs.prototype.delete=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
    var params=req.params;
    if(!params.id || !ObjectId.isValid(params.id)){
        retObj.messages.push("Provide LR Details");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        LRsColl.findOneAndRemove({_id:params.id},function (err,doc) {
            if(err){
                retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                callback(retObj);
            }else if(doc){
                retObj.status=true;
                retObj.data=doc;
                retObj.messages.push("LR details successfully deleted");
                callback(retObj);
            }else{
                retObj.messages.push("Please try again");
                callback(retObj);
            }
        })
    }
};
Lrs.prototype.totalCount=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  LRsColl.count({accountId:req.jwt.accountId},function (err,count) {
      if(err){
          retObj.messages.push("Internal server error," + JSON.stringify(err.message));
          callback(retObj);
      }else{
          retObj.status=true;
          retObj.messages.push("Success");
          callback(retObj);
      }
  })
};

Lrs.prototype.generatePDF=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
    var params=req.params;
    if(!params.id || !ObjectId.isValid(params.id)){
        retObj.messages.push("Provide LR Details");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        LRsColl.findOne({_id:params.id},function (err,doc) {
            if(err){
                retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                callback(retObj);
            }else if(doc){
                pdfGenerator.createPdf('lr.html','doc',function (resp) {
                    callback(resp);
                })
            }else{
                retObj.messages.push("Please try again");
                callback(retObj);
            }
        })
    }

};
module.exports = new Lrs();

