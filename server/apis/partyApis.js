"use strict";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
var PartyCollection = require('./../models/schemas').PartyCollection;
var config = require('./../config/config');
var Utils = require('./utils');
var Trips = require('./tripsApi');
var PaymentsReceived = require('./paymentsReceivedAPI');

var ExpenseCostColl = require('./expensesApi');
var TripCollection = require('./../models/schemas').TripCollection;
var ExpenseCostColl1 = require('./../models/schemas').ExpenseCostColl;
const ObjectId = mongoose.Types.ObjectId;
var Party = function () {
};

Party.prototype.addParty = function (jwt, partyDetails, callback) {
    var result = {message: '', status: true};

    if (!_.isObject(partyDetails) || _.isEmpty(partyDetails)) {
        result.status = false;
        result.message += " Please fill all the required details for party";
    }
    if (!partyDetails.name || !_.isString(partyDetails.name)) {
        result.status = false;
        result.message += " Please provide valid party name";
    }
    if (!Utils.isValidPhoneNumber(partyDetails.contact)) {
        result.status = false;
        result.message += " Please provide valid contact number for party type";
    }

    if(!partyDetails.isTransporter && !partyDetails.isSupplier){
        result.status = false;
        result.message += " Please select party type";
    }
    if(!partyDetails.isSms && !partyDetails.isEmail){
        result.status = false;
        result.message += " Please select notification type";
    }

    if (result.status === false) {
        callback(result);
    } else {
        partyDetails.createdBy = jwt.id;
        partyDetails.updatedBy = jwt.id;
        partyDetails.accountId = jwt.accountId;
        var partyDoc = new PartyCollection(partyDetails);
        partyDoc.save(function (err, party) {
            if (err) {
                result.status = false;
                result.message = "Error while adding party, try Again";
                result.error = err;
                callback(result);
            } else {
                result.status = true;
                result.message = "Party Added Successfully";
                result.party = party;
                callback(result);
            }
        });
    }
};

Party.prototype.findParty = function (jwt, partyId, callback) {
    var result = {};
    PartyCollection.findOne({_id: partyId, accountId: jwt.accountId}, function (err, party) {
        if (err) {
            result.status = false;
            result.message = "Error while finding party, try Again";
            result.error = err;
            callback(result);
        } else if (party) {
            result.status = true;
            result.message = "Party found successfully";
            result.party = party;
            callback(result);
        } else {
            result.status = false;
            result.message = "Party is not found!";
            callback(result);
        }
    });
};


Party.prototype.updateParty = function (jwt, partyDetails, callback) {
    var result = {};
    PartyCollection.findOneAndUpdate({_id: partyDetails._id, accountId: jwt.accountId},
        {
            $set: {
                "name": partyDetails.name,
                "contact": partyDetails.contact,
                "email": partyDetails.email,
                "city": partyDetails.city,
                "tripLanes": partyDetails.tripLanes,
                "updatedBy": jwt.id,
                "isSupplier":partyDetails.isSupplier,
                "isTransporter":partyDetails.isTransporter,
                "isSms":partyDetails.isSms,
                "isEmail":partyDetails.isEmail
            }
        },
        {new: true}, function (err, party) {
            if (err) {
                result.status = false;
                result.message = "Error while updating party, try Again";
                callback(result);
            } else if (party) {
                result.status = true;
                result.message = "Party updated successfully";
                result.party = party;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding party";
                callback(result);
            }
        });
};

Party.prototype.getAccountParties = function (jwt, params, callback){
    var retObj = {
        status: false,
        messages: []
    };
    var condition={};
    if (!params.page) {
        params.page = 1;

    }
    if(!params.partyName){
        condition={accountId: jwt.accountId}
    }else{
        condition={accountId: jwt.accountId,name:{ $regex: '.*' + params.partyName + '.*' } }
    }
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        parties: function (partiesCallback) {
            PartyCollection
                .find(condition)
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, parties) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Utils.populateNameInUsersColl(parties, "createdBy", function (response) {
                                createdbyCallback(response.err,response.documents);
                            });
                        }
                        // rolesname:
                    }, function (populateErr, populateResults) {
                        partiesCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            PartyCollection.count({accountId: jwt.accountId},function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving parties');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.parties = results.parties.createdbyname;
            callback(retObj);

        }
    });
};

Party.prototype.getAllParties = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };

    PartyCollection.find({}, function (err, parties) {
        if (err) {
            retObj.message.push('Error getting parties');
            callback(retObj);
        } else {
            Utils.populateNameInUsersColl(parties, "createdBy", function (response) {
                if (response.status) {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.parties = response.documents;
                    callback(retObj);
                } else {
                    retObj.messages.push('Error getting parties');
                    callback(retObj);
                }
            });
        }
    });
};

Party.prototype.deleteParty = function (jwt, partyId, callback) {
    var result = {};
    var query = {_id: partyId};
    //if the use is not admin
    //query['accountId'] = jwt.accountId;
    PartyCollection.remove(query, function (err, retValue) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting party';
            callback(result);
        } else if (retValue.result && retValue.result.n === 1) {
            result.status = true;
            result.message = 'Success';
            callback(result);
        } else {
            result.status = false;
            result.message = 'Error deleting party';
            callback(result);
        }
    });
};
Party.prototype.countParty = function (jwt, callback) {
    var result = {};
    PartyCollection.count({'accountId':jwt.accountId},function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            callback(result);
        }
    })
};
/**
 * Find trips and parties combined for a party
 * @param jwt
 * @param partyId
 * @param callback
 */
Party.prototype.findTripsAndPaymentsForParty = function(jwt, partyId, callback){
    var retObj = {
        status: false,
        messages: []
    };
    var totalFreight = 0;
    var totalPaid = 0;
    async.parallel({
        trips: function(tripsCallback) {
            Trips.findTripsByParty(jwt,partyId,function (tripsResults) {
                tripsCallback(tripsResults.error, tripsResults.trips);
            });
        },
        payments: function(paymentsCallback){
            PaymentsReceived.findPartyPayments(jwt,partyId, function(partyResults){
                paymentsCallback(partyResults.error, partyResults.payments);
            });
        }
    },function (error, tripsAndPayments) {
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = tripsAndPayments.payments;
            if(tripsAndPayments.trips){
                retObj.results = retObj.results.concat(tripsAndPayments.trips);
               for(var i = 0;i < retObj.results.length;i++){
                    if(retObj.results[i].freightAmount) {
                        totalFreight = totalFreight + retObj.results[i].freightAmount;
                    }
                    if(retObj.results[i].amount) {
                        totalPaid = totalPaid + retObj.results[i].amount;
                    }
                }
                retObj.totalPendingPayments = {totalFreight:totalFreight,totalPaid:totalPaid}
            }
            if(retObj.results){
                retObj.results = retObj.results.sort(function(x,y){
                    return x.date > y.date ? 1 : -1;
                });
            }
            callback(retObj);
        }
    });
}

/*
* Retrieve trips and expenses details based on vehicle number
* */

Party.prototype.findTripsAndPaymentsForVehicle = function(jwt, vehicleId, callback){
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        trips: function(tripsCallback) {
            Trips.findTripsByVehicle(jwt,vehicleId,function (tripsResults) {
                 tripsCallback(tripsResults.error, tripsResults.trips);
            });
        },
        expenses: function(expensesCallback){
            ExpenseCostColl.findVehicleExpenses(jwt,vehicleId, function(expensesResults){
                expensesCallback(expensesResults.error, expensesResults.expenses);
            });
        },
    },function (error, tripsAndExpenses) {
        var totalFreight = 0;
        var totalExpenses = 0;
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.trips = tripsAndExpenses.expenses;

            for(var i =0; i < tripsAndExpenses.trips.length; i++) {
                totalFreight = totalFreight + tripsAndExpenses.trips[i].freightAmount;
            }
            for(var i =0; i < tripsAndExpenses.expenses.length; i++) {
                totalExpenses = totalExpenses + tripsAndExpenses.expenses[i].cost;
            }
            Utils.populateNameInPartyColl(tripsAndExpenses.trips,"partyId",function(partyDocuments){
                retObj.trips = retObj.trips.concat(partyDocuments.documents);
                if(retObj.trips){
                    retObj.trips = retObj.trips.sort(function(x,y){
                        return x.date < y.date ? 1 : -1;
                    });
                }
                retObj.totalRevenue = {totalFreight : totalFreight,totalExpenses : totalExpenses};
                callback(retObj);
            });

        }
    });
}


module.exports = new Party();