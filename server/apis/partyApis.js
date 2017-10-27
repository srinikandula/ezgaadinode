"use strict";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

var PartyCollection = require('./../models/schemas').PartyCollection;
var config = require('./../config/config');
var Utils = require('./utils');

var Party = function () {
};

Party.prototype.add = function (jwt, partyDetails, callback) {
    var result = {message:'',status:true};

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

    if(result.status == false) {
        callback(result);
    } else {
        partyDetails.createdBy = jwt.id;
        partyDetails.updatedBy =  jwt.id;
        partyDetails.accountId =  jwt.accountId;
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

Party.prototype.findParty= function (jwt, partyId, callback) {
    var result = {};
    PartyCollection.findOne({_id:partyId, accountId:jwt.accountId}, function (err, party) {
        if(err) {
            result.status = false;
            result.message = "Error while finding party, try Again";
            result.error = err;
            callback(result);
        } else if(party) {
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
    PartyCollection.findOneAndUpdate({_id:partyDetails._id, accountId: jwt.accountId},
        {$set:{
            "name":partyDetails.name,
            "contact":partyDetails.contact,
            "email": partyDetails.email,
            "city" : partyDetails.city,
            "operatingLane": partyDetails.operatingLane,
            "updatedBy": jwt.id
        }},
        {new: true}, function (err, party) {
        if(err) {
            result.status = false;
            result.message = "Error while updating party, try Again";
            callback(result);
        } else if(party) {
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

Party.prototype.getAccountParties = function (accountId, callback) {
    var result = {};
    PartyCollection.find({accountId:accountId},function (err, accountParties) {
        if (err) {
            result.status = false;
            result.message = 'Error getting parties';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.parties = accountParties;
            callback(result);
        }
    });
};

Party.prototype.getAllParties = function (callback) {
    var result = {};
    PartyCollection.find({}, function (err, parties) {
        if (err) {
            result.status = false;
            result.message = 'Error getting parties';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.parties = parties;
            callback(result);
        }
    });
};

Party.prototype.deleteParty = function (jwt, partyId, callback) {
    var result = {};
    var query ={_id:partyId};
    //if the use is not admin
    //query['accountId'] = jwt.accountId;
    PartyCollection.remove(query, function (err, retValue) {
        if (err){
            result.status = false;
            result.message = 'Error deleting party';
            callback(result);
        } else if(retValue.result &&  retValue.result.n === 1){
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


module.exports = new Party();