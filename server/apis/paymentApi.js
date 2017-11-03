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

Payments.prototype.addPayment = function (accountId, paymentDetails, callback) {
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
    if(!retObj.messages.length) {
        paymentDetails = Utils.removeEmptyFields(paymentDetails);
        paymentDetails.updatedBy = accountId;
        paymentDetails.createdBy = accountId;

        var insertDoc = new PaymentsColl(paymentDetails);
        insertDoc.save(function (err) {
            if(err){
                retObj.messages.push('Error while adding payment, try again');
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Payment added Succesfuly');
                callback(retObj);
            }
        });
    }
};

Payments.prototype.getPaymentsOfTrip = function (tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsColl.find({tripId:tripId}, function (err, payments) {
        if(err){
            retObj.messages.push('Error while finding payment, try again');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.payments = payments;
            callback(retObj);
        }
    });
};

module.exports = new Payments();