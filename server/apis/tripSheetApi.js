var TripSheetsColl = require('./../models/schemas').tripSheetsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');
var invoiceColl = require('./../models/schemas').invoicesCollection;
var partyColl = require('./../models/schemas').PartyCollection;
var LockColl = require('./../models/schemas').lockColl;
var accountBalanceColl = require('./../models/schemas').accountBalanceColl;
var Invoices = require('./../apis/invoiceApi');
var _ = require('underscore');
var ExpensesSheetColl = require('./../models/schemas').ExpensesSheetColl;
var TripSheets = function () {

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
            async.map(accounts,function (account,asyncAccCallback) {
                TrucksColl.find({accountId:account._id},function(err,trucks){
                    if(err){
                        asyncAccCallback(err);
                    }else if(trucks.length > 0){
                        var tripId = 1;
                        async.map(trucks,function(truck,asyncTruckCallback){
                           TripSheetsColl.findOne({truckId:truck._id.toString(),date:today},function(err,data){
                                if(err){
                                    asyncTruckCallback(err);
                                }else if(!data){
                                    var tripSheetObj = {
                                        truckId : truck._id,
                                        registrationNo : truck.registrationNo,
                                        accountId:account._id,
                                        date : today,
                                        tripId:tripId++
                                    };
                                    var tripSheetDoc = new TripSheetsColl(tripSheetObj);
                                    tripSheetDoc.save(function(err,result){
                                        if(err){
                                            asyncTruckCallback(err);
                                        }else{
                                            asyncTruckCallback(null);
                                        }
                                    });
                                }else{
                                    asyncTruckCallback(null);
                                }
                           });
                       },function(err){
                            if(err){
                                asyncAccCallback(err);
                            }else{
                                asyncAccCallback(null);
                            }
                       });
                    }else{
                        asyncAccCallback(null);
                    }
                });
            },function(err){
                if(err){
                    retObj.status = false;
                    callback(retObj);
                } else{
                    retObj.status = true;
                    retObj.messages.push("Success");
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
    TripSheetsColl.find({accountId: req.jwt.accountId, date: req.params.date}).sort({tripId:1}).exec(function (err, tripSheets) {
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
    var tripGroups = _.groupBy(tripSheets, 'tripId');
    //Group trips with same tripId
    var keys = [];
    for (var key in tripGroups) {
        if (tripGroups.hasOwnProperty(key)) keys.push(key);
    }
    async.map(tripSheets,function(tripSheet,asyncCallback){
            //hack to extract partyId from tripSheet
            if (tripSheet.partyId && tripSheet.partyId._id !== undefined) {
                tripSheet.partyId = tripSheet.partyId._id;
            }
            var expenseObj = {partyId: '', accountId: req.jwt.accountId}
            TripSheetsColl.findOneAndUpdate({_id: tripSheet._id}, {
                $set: {
                    loadingPoint: tripSheet.loadingPoint,
                    tripId: tripSheet.tripId,
                    unloadingPoint: tripSheet.unloadingPoint,
                    driverName: tripSheet.driverName,
                    partyId: tripSheet.partyId
                }
            }, function (err, updateResult) {
                if (err) {
                    asyncCallback(true);
                } else {
                    if (tripSheet.partyId) {
                        ExpensesSheetColl.find({tripSheetId: tripSheet._id}, function (err, expenses) {
                            if (err) {
                                asyncCallback(true);
                            } else if (!expenses.length) {
                                expenseObj.partyId = tripSheet.partyId;
                                expenseObj.from = tripSheet.loadingPoint;
                                expenseObj.to = tripSheet.unloadingPoint;
                                expenseObj.vehicleNo = tripSheet.registrationNo;
                                expenseObj.truckId = tripSheet.truckId;
                                expenseObj.tripSheetId = tripSheet._id;
                                expenseObj.date = tripSheet.date;
                                expenseObj.driverName = tripSheet.driverName;
                                var doc = new ExpensesSheetColl(expenseObj);
                                doc.save(function (err, result) {
                                });
                            }
                        });
                    }
                    asyncCallback(false);
                }
            });
    },function(err){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
            callback(retObj);
        }else{
            async.map(keys,function(key,asyncCallback){
                var invoiceObj = {trip:[],partyId:'',tripSheetId:[]};
                if(key !== 'undefined'){
                    for(var j=0;j<tripGroups[key].length;j++){
                        var tripSheet = tripGroups[key][j];
                        if(tripSheet.partyId){
                            invoiceObj.partyId = tripSheet.partyId;
                            invoiceObj.status = 'pending';
                            invoiceObj.tripId = tripSheet.tripId;
                            invoiceObj.tripSheetId.push(tripSheet._id);
                            invoiceObj.accountId = req.jwt.accountId;
                            invoiceObj.trip.push({
                                vehicleNo:tripSheet.registrationNo,
                                from:tripSheet.loadingPoint,
                                to:tripSheet.unloadingPoint,
                                driverName:tripSheet.driverName
                            });
                        }else{
                            invoiceObj = 'undefined';
                        }
                    }
                }else{
                    invoiceObj = 'undefined';
                }
                if(invoiceObj !== 'undefined'){
                    invoiceColl.find({"tripSheetId":{$in:invoiceObj.tripSheetId}},function(err,invoices){
                        if(err){
                            asyncCallback(true);
                        } else if(!invoices.length){
                            Invoices.addInvoice(req.jwt,invoiceObj,function(saveInvoiceCallback){});
                            asyncCallback(false);
                        }else{
                            asyncCallback(false);
                        }
                    });
                } else{
                    asyncCallback(false);
                }
            },function(err){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push("Success");
                    callback(retObj);
                }
            });
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
           var output =[];
           let party;
           var partyIds = _.pluck(data,"partyId");
           partyColl.find({_id: {$in : partyIds}},{name:1}, function(err,partyNames){
               async.each(data,function (tripSheet,asyncCallback) {
                   var obj = {
                       registrationNo:tripSheet.registrationNo,
                       date:tripSheet.date,
                       loadingPoint:tripSheet.loadingPoint,
                       unloadingPoint:tripSheet.unloadingPoint
                   };
                   if(tripSheet.partyId !== undefined){
                       party = _.find(partyNames, function (party) {
                           return party._id.toString() === tripSheet.partyId;
                       });
                       obj.party = party.name;
                   }else{
                       obj.party = '';
                   }
                   output.push(obj);
                   asyncCallback(false);
               },function (err) {
                   if(err){
                       retObj.status = false;
                       retObj.messages.push("error in updating trip sheet", JSON.stringify(err));
                       callback(retObj);
                   }else{
                       retObj.data = output;
                       retObj.status = true;
                       retObj.messages.push("successful..");
                       callback(retObj);
                   }
               });
           });
       }else{
           retObj.status = false;
           retObj.messages.push("No data");
           callback(retObj);
       }
   });
};
    TripSheets.prototype.addTrip=function(req,callback)
{
    var retObj = {
        status: false,
        messages: []
    };
    var tripDetails = req.body;
    tripDetails.accountId = req.jwt.accountId;
    // console.log("tripDetails",tripDetails);
    TripSheetsColl.find({"registrationNo":req.body.registrationNo,"date":req.body.date},function (err,trip) {
        console.log("body",req.body.registrationNo,"date",req.body.date);
        if(err){
            retObj.status=false;
            retObj.messages.push("error while adding the Trip data",JSON.stringify(err));
            console.log("fetching data",err);
            callback(retObj);
        }else if (trip.length>0) {
            retObj.status=false;
            retObj.messages.push("truck allready exist for this date");
            retObj.data=trip;
            console.log("trip",retObj);
            callback(retObj);
        }else{
            console.log("output",trip);
            var tripDoc=new TripSheetsColl(tripDetails);
            tripDoc.save(function(err,trip)
            {
                if(err){
                    retObj.status=false;
                    retObj.messages.push("error while adding trip, try again ");
                    console.log("fetching1 data",err);
                    callback(retObj);
                }else{
                    retObj.status=true;
                    retObj.messages.push("trip added successfully");
                    console.log("trip1",trip);
                    callback(retObj);
                }
            })
        }
    })




}

TripSheets.prototype.lockData = function (jwt, lockDetails, callback) {
    var retObj = {
        status:false,
        messages:[]
    };
    console.log("token....",jwt);
    var details={"date":lockDetails.date, accountId:jwt.accountId, locked:true};
    var doc=new TripSheetsColl(details);
    AccountsColl.find({"_id":jwt.accountId},function(err,account){
        if(err){
            retObj.messages.push("error while getting account details");
            retObj.status=false;
            callback(retObj);
        }else {
            console.log("Account",account);
        }
    })
    doc.save(function(err,docs){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while locking the data");
            // retObj.data=err;
            callback(retObj)
        }else{
            retObj.status=true;
            retObj.messages.push("TripSheet Locked Successfully");
            callback(retObj);
        }
    })
}


module.exports = new TripSheets();