var TripSheetsColl = require('./../models/schemas').tripSheetsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');
var invoiceColl = require('./../models/schemas').invoicesCollection;
var partyColl = require('./../models/schemas').PartyCollection;



var TripSheets = function () {

};

function createTripSheet(account,today,callback){
    var retObj = {
        status:false,
        messages:[]
    };
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
                            truckId : truck._id,
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

TripSheets.prototype.createTripSheet = function (today,callback) {
    var retObj = {
        status:false,
        messages:[]
    };
    AccountsColl.find({tripSheetEnabled:true},function(err,accounts){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding data"+JSON.stringify(err));
            callback(retObj);
        } else{
            async.each(accounts,function (account,asyncAccCallback) {
                if(account.tripSheetEnabled === true){
                    createTripSheet(account,today,function(tripSheetCallback){
                        if(tripSheetCallback.status){
                            asyncAccCallback(false);
                        }else{
                            asyncAccCallback(true);
                        }
                    });
                }else{
                    asyncAccCallback(false);
                }
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

/*
TripSheets.prototype.getTripSheets = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var today = new Date();
    today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var condition = {accountId: req.jwt.accountId};
    if(isNaN(new Date(req.query.date))){
        if(req.query.truckId && req.query.fromDate && req.query.toDate){
            condition.truckId = req.query.truckId;
            condition.createdAt = condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)};
        }else if(req.query.fromDate && req.query.toDate){
            condition.createdAt = condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)};
        }else if(req.query.truckId){
            condition.truckId = req.query.truckId;
        }else{
            condition.date = today;
        }
    }else{
        condition.date = req.query.date;
    }
    TripSheetsColl.find(condition, function (err, tripSheets) {
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
*/

TripSheets.prototype.updateTripSheet = function (req, callback) {
    var retObj = {
        status: false,
        messages: [],
        errors:[]
    };
    var tripSheets = req.body;
    var invoiceObj = {trip:[],partyId:''};
    async.each(tripSheets,function(tripSheet,asyncCallback){
        if((tripSheet.unloadingPoint && tripSheet.loadingPoint) !== undefined){
            if(tripSheet.partyId){
                retObj.errors.push("Select party");
            }
        }
        if(tripSheet.partyId){
                if(tripSheet.partyId._id !== undefined){
                    tripSheet.partyId = tripSheet.partyId._id;
                    invoiceObj.partyId = tripSheet.partyId;
                }
                invoiceColl.find({tripSheetId:tripSheet._id},function(err,invoices){
                    if(err){
                        asyncCallback(true);
                    }else if(!invoices.length){
                        invoiceObj.status = 'pending';
                        invoiceObj.tripSheetId = tripSheet._id;
                        invoiceObj.accountId = req.jwt.accountId;
                        invoiceObj.trip.push({
                            vehicleNo:tripSheet.registrationNo,
                            from:tripSheet.loadingPoint,
                            to:tripSheet.unloadingPoint
                        });
                        var invoiceDoc = new invoiceColl(invoiceObj);
                        invoiceDoc.save(function(err,result){});
                    }
                });
            }
            TripSheetsColl.findOneAndUpdate({_id:tripSheet._id},{$set:tripSheet},function(err,updateResult){
                if(err){
                    asyncCallback(true);
                }else{
                    asyncCallback(false);
                }
            });
        },function(err){
        if(retObj.errors.length>0){
            retObj.status = false;
            callback(retObj);
        }else if (err) {
            retObj.status = false;
            retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Success");
            callback(retObj);
        }
    });
};
TripSheets.prototype.getTripSheetsByParams = function(req,callback){
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {accountId: req.jwt.accountId};

    if(req.query.toDate && req.query.fromDate){
        condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)};
    }
    if(req.query.truckId !== undefined){
        condition.truckId = req.query.truckId;
    }

    TripSheetsColl.find(condition,function(err,tripSheets){
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

TripSheets.prototype.downloadTripSheetData = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {accountId: req.jwt.accountId};

    if((req.query.toDate && req.query.fromDate) !== 'undefined'){
        condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)};
    }
    if(req.query.truckId !== 'undefined'){
        condition.truckId = req.query.truckId;
    }
   TripSheetsColl.find(condition,function(err,data){
       if (err) {
           retObj.status = false;
           retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
           callback(retObj);
       } else if(data.length>0) {
           // console.log("data....",data);
           var output =[];
            for(var i=0;i<data.length;i++){
                var obj = {
                    registrationNo:data[i].registrationNo,
                    date:data[i].date,
                    loadingPoint:data[i].loadingPoint,
                    partyId:data[i].partyId,
                    unloadingPoint:data[i].unloadingPoint
                };
                output.push(obj);
            }
           retObj.data = output;
           retObj.status = true;
           retObj.messages.push("successful..");
           callback(retObj);
       }else{
           retObj.status = false;
           retObj.messages.push("No data");
           callback(retObj);
       }
   });
};


module.exports = new TripSheets();