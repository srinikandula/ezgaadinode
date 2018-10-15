var TripSheetsColl = require('./../models/schemas').tripSheetsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');
var loadingPoint = require('../apis/loadingApi');
var unLoadingPoint = require('../apis/unloadingApi');
var invoiceColl = require('./../models/schemas').invoicesCollection;


var TripSheets = function () {

};

function createTripSheet(account,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var today = new Date();
    today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    TrucksColl.find({accountId:account._id},function(err,trucks){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding trucks"+JSON.stringify(err));
            callback(retObj);
        }else if(trucks.length>0){
            async.each(trucks,function(truck,asyncCallback){
                TripSheetsColl.find({accountId:account._id,date : today},function(err,tripSheet){
                    if(err || tripSheet.length>0){
                        asyncCallback(true);
                    }else{
                        var tripSheetObj = {
                            vehicleId : truck._id,
                            registrationNo : truck.registrationNo,
                            accountId:account._id,
                            date : today
                        };
                        var tripSheetDoc = new TripSheetsColl(tripSheetObj);
                        tripSheetDoc.save(function(err,result){
                            if(err){
                                asyncCallback(true);
                            }else{
                                asyncCallback(false);
                            }
                        });
                    }
                });
            },function(err){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("Error in saving trip sheet");
                    callback(retObj);
                } else{
                    retObj.status = true;
                    retObj.messages.push("Saved successfully");
                    callback(retObj);
                }
            });
        }else{
            retObj.status = false;
            retObj.messages.push("No trucks found");
            callback(retObj);
        }
    });
};

TripSheets.prototype.createTripSheet = function (callback) {
    var retObj = {
        status:false,
        messages:[]
    };
    AccountsColl.find({},function(err,accounts){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding data"+JSON.stringify(err));
            callback(retObj);
        } else{
            async.each(accounts,function (account,asyncAccCallback) {
                createTripSheet(account,function(tripSheetCallback){
                    if(tripSheetCallback.status){
                        asyncAccCallback(false);
                    }else{
                        asyncAccCallback(true);
                    }
                });
            },function(err){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("Error in saving trip sheet");
                    callback(retObj);
                } else{
                    retObj.status = true;
                    retObj.messages.push("Saved successfully");
                    callback(retObj);
                }
            });
        }
    });
};

TripSheets.prototype.getTripSheets = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TripSheetsColl.find({accountId: req.jwt.accountId, date: req.params.date}, function (err, tripSheets) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = tripSheets;
            callback(retObj);
        }
    });

};

TripSheets.prototype.updateTripSheet = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var tripSheets = req.body;
    async.each(tripSheets,function(tripSheet,asyncCallback){
        var invoiceObj = {
            trip:[]
        };
        var trip = {
            vehicleNo:tripSheet.registrationNo
        };
        if(tripSheet.loadingPoint.name === 'other'){
            loadingPoint.addLoadingPoint(req.jwt,{loadingPoint:tripSheet.loadingPointOthers},req,function(addLoadPointCallback){});
            trip.from = tripSheet.loadingPointOthers;
        }else{
            trip.from = tripSheet.loadingPoint.name;
        }
        if(tripSheet.unloadingPoint.name === 'other'){
            unLoadingPoint.addUnloadingPoint(req.jwt,{unloadingPoint:tripSheet.unloadingPointOthers},req,function(addUnLoadPointCallback){});
            trip.to = tripSheet.unloadingPointOthers;
        }else{
            trip.to = tripSheet.unloadingPoint.name;
        }
        invoiceObj.trip.push(trip);
        if(tripSheet.partyId){
            invoiceObj.status = 'pending';
            invoiceObj.tripSheetId = tripSheet._id;
            invoiceObj.accountId = req.jwt.accountId;
            invoiceObj.partyId = tripSheet.partyId._id;
            invoiceColl.find({tripSheetId:tripSheet._id},function(err,invoices){
                if(err){
                    retObj.messages.push("error in finding invoices", JSON.stringify(err));
                }else if(!invoices.length){
                    var invoiceDoc = new invoiceColl(invoiceObj);
                    invoiceDoc.save(function(err,result){});
                }
            });
        }
        TripSheetsColl.findOneAndUpdate({_id:tripSheet._id},{$set:{
                loadingPoint:tripSheet.loadingPoint,
                loadingPointOthers:tripSheet.loadingPointOthers,
                unloadingPoint:tripSheet.unloadingPoint,
                unloadingPointOthers:tripSheet.unloadingPointOthers
            }},function(err,result){
            if(err){
                asyncCallback(true);
            }else{
                asyncCallback(false);
            }
        });
    },function(err){
        if (err) {
            retObj.status = false;
            retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Successfully updated");
            callback(retObj);
        }
    });
};

module.exports = new TripSheets();