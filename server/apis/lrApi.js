var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var _ = require('underscore');
var async=require('async');
var LRsColl = require('./../models/schemas').LRsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
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
          retObj.data=count;
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
        console.log("paramsID:",params.id)
        async.parallel({
            lrDetails:function (lrCallback) {
                LRsColl.findOne({_id:params.id}).lean().exec(function (err,doc) {
                    if(err){
                        retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                        lrCallback(retObj,'');
                    }else if(doc){
                        doc.total=doc.handling+doc.statistical+doc.caratage+doc.others+doc.freight;
                      /*  console.log(doc);*/

                        lrCallback(false,doc);
                    }else{
                        retObj.messages.push("Please try again");
                        lrCallback(retObj,'');
                    }
                })
            },
            accDetails:function (accDetailsCallback) {
                AccountsColl.findOne({_id:req.jwt.accountId},function (err,doc) {
                    if(err){
                        retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                        accDetailsCallback(retObj,'');
                    }else if(doc){
                        accDetailsCallback(false,doc);
                    }else{
                        retObj.messages.push("Please try again");
                        accDetailsCallback(retObj,'');
                    }
                })
            }
        },function (err,result) {

            if(err){
                callback(err);
            }else{
                /*console.log("result.accDetails",result.accDetails);*/
                result.lrDetails.dateStr=result.lrDetails.date.toLocaleDateString();
                result.accDetails.igstprice=(result.lrDetails.freight/100)*result.accDetails.igst;
                result.accDetails.cgstprice=(result.lrDetails.freight/100)*result.accDetails.cgst;
                result.accDetails.sgstprice=(result.lrDetails.freight/100)*result.accDetails.sgst;

               result.accDetails.grandtotal= result.accDetails.igstprice+ result.accDetails.igstprice+ result.accDetails.igstprice+ result.lrDetails.total+result.lrDetails.surCharges;
                /*console.log("result.lrDetails",result.lrDetails);*/
                pdfGenerator.createPdf('lr.html','landscape',result,function (resp) {
                    callback(resp);
                })
            }
        });

    }

};



module.exports = new Lrs();

