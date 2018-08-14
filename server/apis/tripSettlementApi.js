var tripSettlementsColl = require('./../models/schemas').tripSettlementsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var pdfGenerator=require('./../apis/pdfGenerator');


var TripSettlements  = function(){

};
function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
};

TripSettlements.prototype.addTripSettlement = function(jwt,tripSettlementInfo,callback){
  var retObj = {
    status:false,
      messages:[]
  };
    tripSettlementInfo.accountId = jwt.accountId;
    var tripSettlementDoc = new tripSettlementsColl(tripSettlementInfo);
    tripSettlementDoc.save(function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in saving trip settlement"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("saved successfully");
            callback(retObj);
        }
    });
};
TripSettlements.prototype.getAllTripSettlements = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(params.fromDate && params.toDate){
       condition = {
           accountId:jwt.accountId,
           createdAt:{$gte:new Date(params.fromDate),$lte:new Date(params.toDate)}
       };
    }else{
        condition = {accountId:jwt.accountId}
    };
    tripSettlementsColl.find(condition).lean().populate({path:'driverName',select:'fullName'}).exec(function(err,tripSettlements){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in fetching records"+JSON.stringify(err));
            callback(retObj);
        }else{
            var truckIds = _.pluck(tripSettlements,'truckNo');
            TrucksColl.find({_id:{$in:truckIds}},{registrationNo:1},function(err,trucks){
                async.each(tripSettlements, function (tripSettlement, asyncCallback) {
                    if (tripSettlement.truckNo) {
                        var truckName = _.find(trucks, function (truck) {
                            return truck._id.toString() === tripSettlement.truckNo;
                        });
                        tripSettlement.truckNo = truckName.registrationNo;
                        asyncCallback(false);
                    }
                },function(err){
                    if(err){
                        retObj.status = false;
                        retObj.messages.push("error in fetching records"+JSON.stringify(err));
                        callback(retObj);
                    }else{
                        retObj.status = true;
                        retObj.messages.push("Success");
                        retObj.data = tripSettlements;
                        callback(retObj);
                    }
                });
            });
        }
    });
};
TripSettlements.prototype.deleteTripSettlement = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    tripSettlementsColl.remove({_id:params.id},function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in deleting trip settlement"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("successfull");
            callback(retObj);
        }
    });
};
TripSettlements.prototype.getTripSettlement = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
   tripSettlementsColl.findOne({_id:params.id}).populate({path:'driverName',select:'fullName'}).exec(function(err,tripSettlement){
       if(err){
           retObj.status = false;
           retObj.messages.push("error in fetching the record"+JSON.stringify(err));
           callback(retObj);
       }else{
           retObj.status = true;
           retObj.messages.push("successfull");
           retObj.data = tripSettlement;
           callback(retObj);
       }
   });
};
TripSettlements.prototype.updateTripSettlement = function(jwt,tripSettlementInfo,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    tripSettlementsColl.findOneAndUpdate({_id:tripSettlementInfo._id},{$set:tripSettlementInfo},function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in updating trip settlement"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("Updated successfully");
            callback(retObj);
        }
    });
};
TripSettlements.prototype.generatePDF = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    if(!req.params.tripSettlementId || !ObjectId.isValid(req.params.tripSettlementId)){
        retObj.messages.push("Provide Trip settlement  Details");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        tripSettlementsColl.findOne({_id:req.params.tripSettlementId}).lean().populate({path:'driverName',select:'fullName'}).exec(function(err,tripSettlementDetails){
            if(err){
                retObj.status = false;
                retObj.messages.push("error in fetching data"+JSON.stringify(err));
                callback(retObj);
            }else{
                TrucksColl.findOne({_id:tripSettlementDetails.truckNo},function(err,truck){
                    if(err){
                        retObj.status = false;
                        retObj.messages.push("error in finding truck"+JSON.stringify(err));
                        callback(retObj);
                    }else{
                        tripSettlementDetails.truckNo = truck.registrationNo;
                        tripSettlementDetails.date = dateToStringFormat(new Date(tripSettlementDetails.date));
                        for(var i = 0;i<tripSettlementDetails.trip.length;i++){
                            tripSettlementDetails.trip[i].startFromDate = dateToStringFormat(new Date(tripSettlementDetails.trip[i].startFromDate));
                            tripSettlementDetails.trip[i].startToDate = dateToStringFormat(new Date(tripSettlementDetails.trip[i].startToDate));
                            // tripSettlementDetails.trip[i].endFromDate = dateToStringFormat(new Date(tripSettlementDetails.trip[i].endFromDate));
                            // tripSettlementDetails.trip[i].endToDate = dateToStringFormat(new Date(tripSettlementDetails.trip[i].endToDate));
                        }
                        pdfGenerator.createPdf('','tripSettlementInvoice.html','landscape',tripSettlementDetails,function (resp) {
                            callback(resp);
                        })
                    }
                });
            }
        });
    }
};
module.exports = new TripSettlements();