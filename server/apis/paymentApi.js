var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var TripsColl = require('./../models/schemas').TripCollection;
var PaymentsColl = require('./../models/schemas').PaymentsColl;

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Payments = function () {
};

Payments.prototype.addPayment = function (jwt, paymentDetails, callback) {
    console.log('here...');
    var retObj = {
        status: false,
        messages: []
    };
    if(!paymentDetails.tripId) {
        retObj.messages.push('Please provide trip id');
    }
    if(!paymentDetails.paymentDate) {
        retObj.messages.push('please provide payment date');
    }
    if(!paymentDetails.amount) {
        retObj.push('please provide amount');
    }
    if(!paymentDetails.paymentType) {
        retObj.push('please provide payment type');
    }
    console.log('retObj1...',retObj);
    if(retObj.messages.length) {
        callback(retObj);
    } else {
        paymentDetails = Utils.removeEmptyFields(paymentDetails);
        paymentDetails.accountId = jwt.accountId;
        paymentDetails.updatedBy = jwt.id;
        paymentDetails.createdBy = jwt.id;

        var insertDoc = new PaymentsColl(paymentDetails);
        console.log('here2...');
        insertDoc.save(function (err) {
            if(err){
                retObj.messages.push('Error while adding payment, try again');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Payment added Succesfuly');
                console.log('retObj2...',retObj);
                callback(retObj);
            }
        });
    }

};

Payments.prototype.getPaymentsOfTrip = function (accountId, tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsColl.find({tripId:tripId, accountId:accountId}, {createdAt:0,updatedAt:0}, function (err, payments) {
        if(err){
            retObj.messages.push('Error while finding payment, try again');
            callback(retObj);
        } else {
            Utils.populateNameInUsersColl(payments, "createdBy", function (response) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.payments = payments;
                callback(retObj);
            });
        }
    });
};

module.exports = new Payments();