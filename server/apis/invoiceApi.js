var InvoicesColl = require('./../models/schemas').invoicesCollection;
var PartiesColl = require('./../models/schemas').PartyCollection;
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var _ = require('underscore');
var async = require('async');
const math = require('mathjs');
var pdfGenerator=require('./../apis/pdfGenerator');
var AccountsColl = require('./../models/schemas').AccountsColl;


var Invoices = function(){

};
function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
};

Invoices.prototype.addInvoice = function(jwt,invoiceDetails,callback){
    var retObj = {
      status:false,
      messages:[]
    };
    invoiceDetails.partyId = invoiceDetails.partyId._id;
    invoiceDetails.accountId = jwt.accountId;
    invoiceDetails.vehicleNo = invoiceDetails.vehicleNo.registrationNo;
    invoiceDetails.totalAmount = math.multiply(invoiceDetails.rate,invoiceDetails.quantity);
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
    if(invoiceDetails.vehicleNo.registrationNo){
        invoiceDetails.vehicleNo = invoiceDetails.vehicleNo.registrationNo;
    }
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
    InvoicesColl.find(condition,function(err,invoices){
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
            }
        },function(err,result){
            if(err){
                callback(err);
            }else{
                PartiesColl.findOne({_id:result.invoiceDetails.partyId},function(err,party){
                    if(err){
                        retObj.messages.push("error in finding party details"+JSON.stringify(err));
                    }else{
                        for(var i = 0;i < result.invoiceDetails.trip.length;i++){
                            result.invoiceDetails.trip[i].unloadedOn = dateToStringFormat(new Date(result.invoiceDetails.trip[i].unloadedOn));
                            result.invoiceDetails.trip[i].loadedOn = dateToStringFormat(new Date(result.invoiceDetails.trip[i].loadedOn));
                        }
                        result.partyName = party.name;
                        result.partyAddress = party.city;
                        result.gstNo = party.gstNo;
                        result.cgstAmount = math.multiply((result.accountDetails.cgst/100),result.invoiceDetails.totalAmount);
                        result.sgstAmount = math.multiply((result.accountDetails.sgst/100),result.invoiceDetails.totalAmount);
                        result.totalAmount = result.cgstAmount + result.sgstAmount + result.invoiceDetails.totalAmount;
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

