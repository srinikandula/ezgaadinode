var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var TripsColl = require('./../models/schemas').TripCollection;
var PaymentsColl = require('./../models/schemas').PaymentsColl;

var config = require('./../config/config');
var Utils = require('./utils');

var Payments = function () {
};


Payments.prototype.addPayment = function (jwt, paymentDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!paymentDetails.tripId) {
        retObj.messages.push('Please provide trip id');
    }
    if (!paymentDetails.paymentDate) {
        retObj.messages.push('please provide payment date');
    }
    if (!paymentDetails.amount) {
        retObj.messages.push('please provide amount');
    }
    if (!paymentDetails.paymentType) {
        retObj.messages.push('please provide payment type');
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        // TripsColl.findOne({_id: paymentDetails.tripId}, function (errtrip, trip) {
        //     if(errtrip) {
        //         if (err) {
        //             retObj.messages.push('Error while adding payment, try again');
        //             callback(retObj);
        //         } else if(!trip.freightAmount) {
        //             retObj.messages.push('No freight amount details found with this trip');
        //             callback(retObj);
        //         }
        //     }
        // });
        paymentDetails.accountId = jwt.accountId;
        paymentDetails.updatedBy = jwt.id;
        paymentDetails.createdBy = jwt.id;

        var insertDoc = new PaymentsColl(paymentDetails);
        insertDoc.save(function (err) {
            if (err) {
                retObj.messages.push('Error while adding payment, try again');
                callback(retObj);
            } else {
                TripsColl.findOneAndUpdate({_id: paymentDetails.tripId}, {
                    $inc: {
                        advance: paymentDetails.amount,
                        balance: -paymentDetails.amount
                    }
                }, function (errupdating, updated) {
                    if (errupdating) {
                        retObj.messages.push('Error while adding payment, try again.');
                        callback(retObj);
                    } else if(updated) {
                        retObj.status = true;
                        retObj.messages.push('Payment added Succesfuly');
                        callback(retObj);
                    } else {
                        retObj.messages.push("Error, updating trip");
                        callback(retObj);
                    }
                });
            }
        });
    }

};

Payments.prototype.getPaymentsOfTrip = function (accountId, tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsColl.find({tripId: tripId, accountId: accountId}, {createdAt: 0, updatedAt: 0}, function (err, payments) {
        if (err) {
            retObj.messages.push('Error while finding payment, try again');
            callback(retObj);
        } else {
            // Utils.populateNameInUsersColl(payments, "createdBy", function (response) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.payments = payments;
                retObj.err = err;
                callback(retObj);
            // });
        }
    });
};

module.exports = new Payments();