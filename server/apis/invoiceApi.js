var InvoicesColl = require('./../models/schemas').invoicesCollection;
var PartiesColl = require('./../models/schemas').PartyCollection;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var _ = require('underscore');
var async = require('async');
var math = require('mathjs');
var pdfGenerator = require('./../apis/pdfGenerator');
var AccountsColl = require('./../models/schemas').AccountsColl;
var TripCollection = require('./../models/schemas').TripCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;
var dateFormat=require('dateformat');
var converter= require('number-to-words');
var CounterCollection = require('./../models/schemas').CounterCollection;

var Invoices = function () {};

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}

Invoices.prototype.getCount = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (params.fromDate && params.toDate) {
        condition = {
            accountId: jwt.accountId,
            createdAt: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate)
            }
        };
    } else {
        condition = {
            accountId: jwt.accountId
        };
    }
    InvoicesColl.count(condition, function (err, count) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('error in getting count' + JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('success');
            retObj.data = count;
            callback(retObj);
        }
    });
};
function saveInvoice(invoiceDetails,callback){
    var retObj = {
        status: false,
        messages: []
    };
    var invoiceDoc = new InvoicesColl(invoiceDetails);
    invoiceDoc.save(function (err, result) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('error in saving invoice' + JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('saved successfully');
            callback(retObj);
        }
    });
};

Invoices.prototype.addInvoice = function (jwt, invoiceDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var countObj = {};
    invoiceDetails.accountId = jwt.accountId;
    CounterCollection.find({},function(err,data){
        if(err){
            retObj.messages.push("Internal server error," + JSON.stringify(err.message));
            callback(retObj);
        }else if(!data.length){
            countObj.count = 100;
        }else{
            var count = data[data.length-1].count+1;
            countObj.count = count;
        }
        var doc =  new CounterCollection(countObj);
        doc.save(function(err,result){
            invoiceDetails.invoiceNo = "IN-"+result.count;
            saveInvoice(invoiceDetails,function(saveCallback){
                callback(saveCallback);
            });
        });

    });
};
Invoices.prototype.updateInvoice = function (jwt, invoiceDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(invoiceDetails.tripSheetId){
        invoiceDetails.status = '';
    }
    InvoicesColl.findOneAndUpdate({
            _id: invoiceDetails._id
        }, {
            $set: invoiceDetails
        },
        function (err, result) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('error in updating' + JSON.stringify(err));
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Successfully updated');
                retObj.data = result;
                callback(retObj);
            }
        }
    );
};
Invoices.prototype.getAllInvoices = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (params.fromDate && params.toDate) {
        condition = {
            accountId: jwt.accountId,
            createdAt: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate)
            }
        };
    } else {
        condition = {
            accountId: jwt.accountId
        };
    }
    var skipNumber = params.page ? (params.page - 1) * params.size : 0;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ?
        JSON.parse(params.sort) : {
            createdAt: -1
        };
    InvoicesColl.find(condition)
        .sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .lean()
        .exec(function (err, invoices) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('error in fetching records' + JSON.stringify(err));
                callback(retObj);
            } else {
                // console.log('invoices222222222', invoices);
                var partyIds = _.pluck(invoices, 'partyId');
                PartiesColl.find({
                        _id: {
                            $in: partyIds
                        }
                    }, {
                        name: 1
                    },
                    function (err, parties) {
                        async.each(
                            invoices,
                            function (invoice, asyncCallback) {
                                // console.log('invoices3333333', invoices);
                                if (invoice.partyId) {
                                    var party = _.find(parties, function (party) {
                                        return party._id.toString() === invoice.partyId;
                                    });
                                    invoice.partyId = party.name;
                                    asyncCallback(false);
                                }
                            },
                            function (err) {
                                if (err) {
                                    retObj.status = false;
                                    retObj.messages.push(
                                        'error in fetching records' + JSON.stringify(err)
                                    );
                                    callback(retObj);
                                } else {
                                    retObj.status = true;
                                    retObj.messages.push('Success');
                                    retObj.data = invoices;
                                    callback(retObj);
                                }
                            }
                        );
                    }
                );
            }
        });
};
Invoices.prototype.deleteInvoice = function (params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    InvoicesColl.remove({
            _id: params.id
        },
        function (err, result) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('error in deleting invoice' + JSON.stringify(err));
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('successfull');
                callback(retObj);
            }
        }
    );
};
Invoices.prototype.getInvoice = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    InvoicesColl.findOne({
            _id: params.id
        },
        function (err, invoice) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('error in deleting invoice' + JSON.stringify(err));
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('successfull');
                retObj.data = invoice;
                callback(retObj);
            }
        }
    );
};
Invoices.prototype.getTrip = function (jwt, params, callback) {
    var retObj = {
        status: false,
        message: []
    };
    TripCollection.findOne({
            tripId: params.tripId
        },
        function (err, trip) {
            if (err) {
                retObj.status = false;
                retObj.message.push('error' + JSON.stringify(err));
                callback(retObj);
            } else {
                TrucksColl.findOne({
                        _id: trip.truckId
                    },
                    function (err, truck) {
                        if (err) {
                            retObj.status = false;
                            retObj.message.push('error' + JSON.stringify(err));
                            callback(retObj);
                        } else {
                            retObj.truckName = truck.registrationNo;
                            retObj.message.push('success');
                            retObj.status = true;
                            retObj.data = trip;
                            callback(retObj);
                        }
                    }
                );
            }
        }
    );
};

function nanToZero(value) {
    if (isNaN(value)) {
        return 0;
    } else {
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
                        if(doc.lrDate){
                            doc.lrDate=  dateFormat(doc.lrDate,"dd/mm/yyyy");
                        }
                        if(doc.consignorInvoiceDate){
                            doc.consignorInvoiceDate=  dateFormat(doc.consignorInvoiceDate,"dd/mm/yyyy");
                        }
                        if(doc.gatePassDate){
                            doc.gatePassDate=  dateFormat(doc.gatePassDate,"dd/mm/yyyy");
                        }
                        doc.pdfTotalAmount=nanToZero(doc.amount)+nanToZero(doc.DCamount);
                        doc.pdfTotalAmountWords=converter.toWords(doc.pdfTotalAmount);
                        doc.amount=nanToZero(doc.amount);
                        if(doc.temparatureCargo) {
                            doc.temparatureCargo ="Yes"
                        }else{
                            doc.temparatureCargo="No"
                        }
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
            console.log("resultttttttttttttt",result);
            var totalAmountByTonne = 0;
            if(err){
                callback(err);
            }else{
                result.invoiceNo = result.invoiceDetails.invoiceNo;
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
                        if(result.invoiceDetails.trip[i].loadedOn !== undefined){
                            var loadedOn = new Date(result.invoiceDetails.trip[i].loadedOn);
                            result.invoiceDetails.trip[i].date = loadedOn.getDate()+"-"+(loadedOn.getMonth()+1)+"-"+loadedOn.getFullYear();
                            result.invoiceDetails.trip[i].loadedOn = loadedOn.getDate()+"-"+(loadedOn.getMonth()+1)+"-"+loadedOn.getFullYear();

                        }
                        if(result.invoiceDetails.trip[i].unloadedOn !== undefined){
                            var unloadedOn = new Date(result.invoiceDetails.trip[i].unloadedOn);
                            result.invoiceDetails.trip[i].unloadedOn = unloadedOn.getDate()+"-"+(unloadedOn.getMonth()+1)+"-"+unloadedOn.getFullYear();

                        }
                    }
                    result.totalAmountByTonne = nanToZero(totalAmountByTonne);
                }
                PartiesColl.findOne({_id:result.invoiceDetails.partyId},function(err,party){
                    if(err){
                        retObj.messages.push("error in finding party details"+JSON.stringify(err));
                    }else{
                        result.invoiceDate = dateToStringFormat(new Date());
                        result.partyName = party.name;
                        result.partyAddress = party.city;
                        result.gstNo = party.gstNo;
                        if(result.accountDetails.cgst && result.accountDetails.sgst && result.accountDetails.igst){
                            result.cgstAmount = (result.accountDetails.cgst/100)*result.invoiceDetails.totalAmount;
                            result.sgstAmount = (result.accountDetails.sgst/100)*result.invoiceDetails.totalAmount;
                            result.totalAmount = result.cgstAmount + result.sgstAmount + result.invoiceDetails.totalAmount;
                        }
                        pdfGenerator.createPdf(result.accountDetails.templatePath,'invoice.html','portrait',result,function (resp) {
                            callback(resp);
                        })
                    }
                });
            }
        });
    }
};

Invoices.prototype.invoiceByParty = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (params.fromDate && params.toDate && params._id) {
        q = {
            accountId: jwt.accountId,
            createdAt: {
                $gte: params.fromDate,
                $lte: params.toDate
            },
            partyId: params._id
        };
    } else if (params.fromDate && params.toDate) {
        q = {
            accountId: jwt.accountId,
            createdAt: {
                $gte: params.fromDate,
                $lte: params.toDate
            }
        };
    } else {
        q = {
            accountId: jwt.accountId,
            partyId: params._id
        };

    }
    InvoicesColl.find(q, function (err, invoices) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('error while getting invoives' + JSON.stringify(err));
            callback(retObj);
        } else {
            var partyIds = _.pluck(invoices, 'partyId');
            PartiesColl.find({
                    _id: {
                        $in: partyIds
                    }
                }, {
                    name: 1
                },
                function (err, parties) {
                    async.each(
                        invoices,
                        function (invoice, asyncCallback) {
                            if (invoice.partyId) {
                                var party = _.find(parties, function (party) {
                                    return party._id.toString() === invoice.partyId;
                                });
                                invoice.partyId = party.name;
                                asyncCallback(false);
                            }
                        },
                        function (err) {
                            if (err) {
                                retObj.status = false;
                                retObj.messages.push(
                                    'error in fetching records' + JSON.stringify(err)
                                );
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('Success');
                                retObj.data = invoices;
                                callback(retObj);
                            }
                        });
                });
        }
    });
};

Invoices.prototype.downloadDetails = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = {};
    if (req.query.fromDate) {
        params.fromDate = req.query.fromDate;
    } else if (req.query.toDate) {
        params.toDate = req.query.toDate;
    } else if (req.query.partyId) {
        params._id = req.query.partyId;
    }
    Invoices.prototype.invoiceByParty(jwt, params, function (response) {
        if (response.status) {
            var output = [];
            for (var i = 0; i < response.data.length; i++) {
                output.push({
                    PartyName: response.data[i].partyId,
                    Date: dateToStringFormat(response.data[i].createdAt),
                    TruckNo: response.data[i].vehicleNo,
                    From: response.data[i].trip[0].from,
                    To: response.data[i].trip[0].to,
                    RatePerTrip: response.data[i].rate,
                    NoOfTrips: response.data[i].quantity
                });
            }

            retObj.data = output;
            retObj.status = true;
            retObj.messages.push("successful..");
            callback(retObj);
        } else {
            callback(retObj);
        }
    })
};
Invoices.prototype.printInvoice = function(req,callback){
    var retObj = {
        status: false,
        messages: []
    };
   Invoices.prototype.generatePDF(req,function (invoiceCallback) {
      if(invoiceCallback.status){
         retObj.status = true;
         retObj.messages.push("success");
         retObj.data = invoiceCallback.result;
         callback(retObj);
      }else{
          retObj.status = false;
          retObj.messages.push("Error");
          callback(retObj);      }
   });
};


module.exports = new Invoices();