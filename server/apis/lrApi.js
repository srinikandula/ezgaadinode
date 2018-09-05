var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var _ = require('underscore');
var async=require('async');
var LRsColl = require('./../models/schemas').LRsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var pdfGenerator=require('./../apis/pdfGenerator');
const math = require('mathjs');

var PartiesColl = require('./../models/schemas').PartyCollection;

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
    params.partyName = params.consignorName.name;
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
    if(params.consignorName.name){
        params.partyName = params.consignorName.name;
    }
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
            } else {
                retObj.status = true;
                retObj.messages.push("LR Details successfully updated");
                retObj.data = doc;
                callback(retObj);
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
              retObj.status = false;
              retObj.messages.push("Internal server error," + JSON.stringify(err.message));
              callback(retObj);
          }else{
              retObj.status=true;
              retObj.data=doc;
              retObj.messages.push("Success");
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
    var requestParams = req.query;
    var condition = {accountId:req.jwt.accountId};
    var skipNumber = requestParams.page ? (requestParams.page - 1) * requestParams.size : 0;
    var limit = requestParams.size ? parseInt(requestParams.size) : Number.MAX_SAFE_INTEGER;
    var sort = requestParams.sort ? JSON.parse(requestParams.sort) : {createdAt: -1};
    if(requestParams.consignorName){
        condition.consignorName = requestParams.consignorName;
    }
    if (requestParams.party) {
        condition.partyName = new RegExp("^" + requestParams.party, "i");
    }
    LRsColl.find(condition)
        .sort(sort).limit(limit).skip(skipNumber).lean()
        .exec(function (err,docs) {
        if(err){
            retObj.messages.push("Internal server error," + JSON.stringify(err.message));
            callback(retObj);
        }else {
            var partyIds = _.pluck(docs, 'consignorName');
            PartiesColl.find({_id: {$in: partyIds}}, function (err, parties) {
                 if (err) {
                     retObj.messages.push("Internal server error........," + JSON.stringify(err.message));
                     callback(retObj);
                 } else {
                     async.each(docs, function (doc, asyncCallback) {
                         var party = _.find(parties, function (party) {
                             return party._id.toString() === doc.consignorName;
                         });
                         doc.partyName = party.name;
                         asyncCallback(false);
                     }, function (err) {
                         if (err) {
                             retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                             callback(retObj);
                         } else {
                             retObj.status = true;
                             retObj.messages.push("Success");
                             retObj.data = docs;
                             callback(retObj);
                         }
                     });
                 }
             });
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
  var condition = {accountId:req.jwt.accountId};
  if(req.query.partyId){
      condition.consignorName = req.query.partyId;
  }
  if (req.query.party) {
      condition.partyName = new RegExp("^" + req.query.party, "i");
  }
  LRsColl.count(condition,function (err,count) {
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
function nanToZero(value){
    if(isNaN(value)){
        return 0;
    }else{
        return value;
    }
}

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
        async.parallel({
            lrDetails:function (lrCallback) {
                LRsColl.findOne({_id:params.id}).lean().exec(function (err,doc) {
                    if(err){
                        retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                        lrCallback(retObj,'');
                    }else if(doc){
                        doc.total=nanToZero(doc.handling)+nanToZero(doc.statistical)+nanToZero(doc.caratage)+nanToZero(doc.others)+nanToZero(doc.freight)+nanToZero(doc.surCharges)+nanToZero(doc.rc);
                        lrCallback(false,doc);
                    }else {
                        retObj.messages.push("Please try again");
                        lrCallback(retObj, '');
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
                var lrDate = new Date(result.lrDetails.date);
                result.lrDetails.dateStr = lrDate.getDate()+"-"+(lrDate.getMonth()+1)+"-"+lrDate.getFullYear();
                result.accDetails.igstprice=nanToZero((result.lrDetails.freight/100)*result.accDetails.igst);
                result.accDetails.cgstprice=nanToZero((result.lrDetails.freight/100)*result.accDetails.cgst);
                result.accDetails.sgstprice=nanToZero((result.lrDetails.freight/100)*result.accDetails.sgst);
                result.accDetails.grandtotal=result.accDetails.igstprice+ result.accDetails.cgstprice+ result.accDetails.sgstprice+nanToZero(result.lrDetails.total);
                result.miscCharges = result.accDetails.grandtotal - (nanToZero(result.lrDetails.freight)+nanToZero(result.lrDetails.rc));
                pdfGenerator.createPdf(result.accDetails.templatePath,'lr.html','landscape',result,function (resp) {
                    callback(resp);
                })
            }
        });

    }

};



module.exports = new Lrs();

