var InvoicesColl = require('./../models/schemas').invoicesCollection;
var PartiesColl = require('./../models/schemas').PartyCollection;
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var _ = require('underscore');
var async = require('async');
const math = require('mathjs');
var pdfGenerator=require('./../apis/pdfGenerator');
var AccountsColl = require('./../models/schemas').AccountsColl;
var TripCollection = require('./../models/schemas').TripCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;



var Invoices = function(){

};
function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
};
Invoices.prototype.getCount = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(params.fromDate && params.toDate){
        condition = {
            accountId:jwt.accountId,
            createdAt:{$gte:new Date(params.fromDate),$lte:new Date(params.toDate)}
        }
    }else{
        condition = {accountId:jwt.accountId}
    };
    InvoicesColl.count(condition,function(err,count){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in getting count"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("success");
            retObj.data = count;
            callback(retObj);
        }
    });
};
Invoices.prototype.addInvoice = function(jwt,invoiceDetails,callback){
    var retObj = {
      status:false,
      messages:[]
    };
    invoiceDetails.accountId = jwt.accountId;
    var invoiceDoc = new InvoicesColl(invoiceDetails);
    invoiceDoc.save(function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in saving invoice"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("saved successfully");
            callback(retObj);
        }
    });
};
Invoices.prototype.updateInvoice = function(jwt,invoiceDetails,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    InvoicesColl.findOneAndUpdate({_id:invoiceDetails._id},{$set:invoiceDetails},function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in updating"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("Successfully updated");
            retObj.data = result;
            callback(retObj);
        }
    });
};
Invoices.prototype.getAllInvoices = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(params.fromDate && params.toDate){
        condition = {
            accountId:jwt.accountId,
            createdAt:{$gte:new Date(params.fromDate),$lte:new Date(params.toDate)}
        }
    }else{
        condition = {accountId:jwt.accountId}
    }
    var skipNumber = params.page ? (params.page - 1) * params.size : 0;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    InvoicesColl.find(condition).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .lean()
        .exec(function(err,invoices){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in fetching records"+JSON.stringify(err));
            callback(retObj);
        }else{
            var partyIds = _.pluck(invoices,'partyId');
            PartiesColl.find({_id: {$in:partyIds}},{name: 1}, function (err, partyNames) {
                async.each(invoices, function (invoice, asyncCallback) {
                    if (invoice.partyId) {
                        var party = _.find(partyNames, function (party) {
                            return party._id.toString() === invoice.partyId;
                        });
                        invoice.partyId = party.name;
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
                        retObj.data = invoices;
                        callback(retObj);
                    }
                });
            });
        }
    });
};
Invoices.prototype.deleteInvoice = function(params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    InvoicesColl.remove({_id:params.id},function(err,result){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in deleting invoice"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("successfull");
            callback(retObj);
        }
    });
};
Invoices.prototype.getInvoice = function(jwt,params,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    InvoicesColl.findOne({_id:params.id},function(err,invoice){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in deleting invoice"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("successfull");
            retObj.data = invoice;
            callback(retObj);
        }
    });
};
Invoices.prototype.getTrip=function(jwt,params,callback) {
    var retObj={
        status:false,
        message:[]
    };
    TripCollection.findOne({tripId:params.tripId},function(err,trip) {
        if(err) {
            retObj.status=false;
            retObj.message.push("error"+JSON.stringify(err));
            callback(retObj);
        }else{
            TrucksColl.findOne({_id:trip.registrationNo},function(err,truck){
                if(err){
                    retObj.status=false;
                    retObj.message.push("error"+JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.truckName = truck.registrationNo;
                    retObj.message.push("success");
                    retObj.status=true;
                    retObj.data=trip;
                    callback(retObj);
                }
            });
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
Invoices.prototype.generatePDF = function(req,callback){
    var retObj={
        status:false,
        messages:[]
    };
    if(!req.params.invoiceId || !ObjectId.isValid(req.params.invoiceId)){
        retObj.messages.push("Provide Invoice Details");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        async.parallel({
            invoiceDetails:function(invoiceCallback){
                InvoicesColl.findOne({_id:req.params.invoiceId}).lean().exec(function (err,doc){
                   if(err){
                       retObj.messages.push("error in fetching record"+JSON.stringify(err));
                       invoiceCallback(retObj,null);
                   } else if(doc){
                       invoiceCallback(false,doc);
                   }else{
                       retObj.messages.push("Please try again");
                       invoiceCallback(retObj,'');
                   }
                });
            },accountDetails:function(accCallback){
                AccountsColl.findOne({_id:req.jwt.accountId},function (err,doc) {
                    if(err){
                        retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                        accCallback(retObj,'');
                    }else if(doc){
                        accCallback(false,doc);
                    }else{
                        retObj.messages.push("Please try again");
                        accCallback(retObj,'');
                    }
                })
            },invoicesCount:function(countCallback){
                InvoicesColl.count({accountId:req.jwt.accountId},function(err,count){
                    if(err){
                        retObj.messages.push("Internal server error," + JSON.stringify(err.message));
                        countCallback(retObj,'');
                    }else if(count){
                        countCallback(false,count);
                    }else{
                        retObj.messages.push("Please try again");
                        countCallback(retObj,'');
                    }
                });
            }
        },function(err,result){
            var totalAmountByTonne = 0;
            if(err){
                callback(err);
            }else{
                if(result.invoiceDetails.addTrip){
                    for(var i=0;i<result.invoiceDetails.trip.length;i++){
                        result.invoiceDetails.trip[i].index = i+1;
                        var tripDate = new Date(result.invoiceDetails.trip[i].date);
                        result.invoiceDetails.trip[i].date = tripDate.getDate()+"-"+(tripDate.getMonth()+1)+"-"+tripDate.getFullYear();
                        totalAmountByTonne += result.invoiceDetails.trip[i].amountPerTonne;
                    }
                    result.totalAmountByTonne = nanToZero(totalAmountByTonne);
                }else{
                    for(var i = 0;i < result.invoiceDetails.trip.length;i++){
                        result.invoiceDetails.trip[i].index = i+1;
                        result.invoiceDetails.trip[i].ratePerTonne = result.invoiceDetails.ratePerTonne;
                        result.invoiceDetails.trip[i].tonnage = result.invoiceDetails.tonnage;
                        result.invoiceDetails.trip[i].amountPerTonne = nanToZero(result.invoiceDetails.trip[i].ratePerTonne*result.invoiceDetails.trip[i].tonnage);
                        totalAmountByTonne += result.invoiceDetails.trip[i].amountPerTonne ;
                        var loadedOn = new Date(result.invoiceDetails.trip[i].loadedOn);
                        result.invoiceDetails.trip[i].loadedOn = loadedOn.getDate()+"-"+(loadedOn.getMonth()+1)+"-"+loadedOn.getFullYear();
                        var unloadedOn = new Date(result.invoiceDetails.trip[i].unloadedOn);
                        result.invoiceDetails.trip[i].unloadedOn = unloadedOn.getDate()+"-"+(unloadedOn.getMonth()+1)+"-"+unloadedOn.getFullYear();
                        result.invoiceDetails.trip[i].date = loadedOn.getDate()+"-"+(loadedOn.getMonth()+1)+"-"+loadedOn.getFullYear();
                    }
                    result.totalAmountByTonne = nanToZero(totalAmountByTonne);
                }
                PartiesColl.findOne({_id:result.invoiceDetails.partyId},function(err,party){
                    if(err){
                        retObj.messages.push("error in finding party details"+JSON.stringify(err));
                    }else{
                        result.invoicesCount = 500+result.invoicesCount;
                        result.invoiceDate = dateToStringFormat(new Date());
                        result.partyName = party.name;
                        result.partyAddress = party.city;
                        result.gstNo = party.gstNo;
                        if(result.accountDetails.cgst && result.accountDetails.sgst && result.accountDetails.igst){
                            result.cgstAmount = (result.accountDetails.cgst/100)*result.invoiceDetails.totalAmount;
                            result.sgstAmount = (result.accountDetails.sgst/100)*result.invoiceDetails.totalAmount;
                            result.totalAmount = result.cgstAmount + result.sgstAmount + result.invoiceDetails.totalAmount;
                        }
                        pdfGenerator.createPdf(result.accountDetails.templatePath,'invoice.html','landscape',result,function (resp) {
                            callback(resp);
                        })
                    }
                });
            }
        });
    }
};

module.exports=new Invoices();

