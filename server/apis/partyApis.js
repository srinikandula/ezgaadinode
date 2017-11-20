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

    if (result.status === false) {
        callback(result);
    } else {
        partyDetails.createdBy = jwt.id;
        partyDetails.updatedBy = jwt.id;
        partyDetails.accountId = jwt.accountId;
        //var tripLanes = partyDetails.tripLanes;
        //delete partyDetails.tripLanes;
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
                "updatedBy": jwt.id
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

Party.prototype.getAccountParties = function (jwt, callback) {
    var result = {};
    PartyCollection.find({accountId: jwt.accountId}, function (err, accountParties) {
        if (err) {
            result.status = false;
            result.message = 'Error getting parties';
            callback(result);
        } else {
            Utils.populateNameInUsersColl(accountParties, "createdBy", function (response) {
                if (response.status) {
                    result.status = true;
                    result.message = 'Success';
                    result.parties = response.documents;
                    callback(result);
                } else {
                    result.message = 'Error getting parties';
                    callback(result);
                }
            });
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

Party.prototype.findTripsAndPaymentsForParty = function(jwt, partyId, callback){
    var retObj = {
        status: false,
        messages: []
    };
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
            }
            callback(retObj);
        }
    });
}

Party.prototype.findTripsAndPaymentsForVehicle = function(jwt, vehicleId, callback){
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        trips: function(tripsCallback) {
            Trips.findTripsByVehicle(jwt,vehicleId,function (tripsResults) {
                //console.log("tripsResults :",tripsResults);
                tripsCallback(tripsResults.error, tripsResults.trips);
            });
        },
        expenses: function(expensesCallback){
            ExpenseCostColl.findVehicleExpenses(jwt,vehicleId, function(expensesResults){
                //console.log("expensesResults :",expensesResults);
                expensesCallback(expensesResults.error, expensesResults.expenses);
            });
        }
    },function (error, tripsAndExpenses) {
        //console.log("tripsAndExpenses : ",tripsAndExpenses);
        if(error){
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = tripsAndExpenses.expenses;
            //console.log("results : ",tripsAndExpenses.expenses);

            Utils.populateNameInPartyColl(tripsAndExpenses.trips,"partyId",function(partyDocuments){
                //console.log("partyDocuments :",partyDocuments.documents[0].attrs.partyName);
                retObj.results = retObj.results.concat(partyDocuments.documents);
                callback(retObj);
            });
        }
    });
}

Party.prototype.findPartyByVehicle =  function(jwt, vehicleId, callback) {
    PartyCollection.find({"accountId":jwt.accountId, "registrationNo":vehicleId},
        function (error, party) {
            //console.log(party);
            var retObj = {
                status: false,
                messages: []
            };
            if(error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                callback(retObj)
            } else {
                Utils.populateNameInTrucksColl(party,"registrationNo",function(partyDocuments){
                    retObj.status = true;
                    retObj.party= partyDocuments.documents;
                    callback(retObj)
                });
            }
        });
}

module.exports = new Party();