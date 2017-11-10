var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var PaymentsReceivedColl = require('./../models/schemas').paymentsReceivedColl;

var config = require('./../config/config');
var Utils = require('./utils');

var PaymentsReceived = function () {
};

PaymentsReceived.prototype.addPayment = function (jwt, details, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!details.description || !_.isString(details.description)) {
        retObj.messages.push("Please provide description");
    }
    if (!details.expenseType || !_.isString(details.expenseType)) {
        retObj.messages.push("Please provide expense type");
    }
    if (!details.amount) {
        retObj.messages.push("Please provide amount");
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        details.accountId = jwt.accountId;
        details.createdBy = jwt.id;
        details.updatedBy = jwt.id;
        var insertDoc = new PaymentsReceivedColl(details);
        insertDoc.save(function (err) {
            if (err) {
                retObj.messages.push("Error, try Again");
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Successfully Added");
                callback(retObj);
            }
        });
    }
};

PaymentsReceived.prototype.getAllAccountPayments = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsReceivedColl.find({accountId: jwt.accountId}, function (err, payments) {
        if (err) {
            retObj.messages.push('Error getting payments');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.payments = payments;
            callback(retObj);
        }
    });
};

PaymentsReceived.prototype.updatePayment = function (jwt, paymentDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    paymentDetails = Utils.removeEmptyFields(paymentDetails);
    paymentDetails.updatedBy = jwt.id;
    PaymentsReceivedColl.findOneAndUpdate({_id: paymentDetails._id}, {$set: paymentDetails}, {new: true}, function (err, payment) {
        if (err) {
            retObj.messages.push("Error while updating payment, try Again");
            callback(retObj);
        } else if (payment) {
            retObj.status = true;
            retObj.messages.push("Payment updated successfully");
            callback(retObj);
        } else {
            retObj.messages.push("Error, finding payment");
            callback(retObj);
        }
    });
};

PaymentsReceived.prototype.deletePayment = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    PaymentsReceivedColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.messages.push('Error deleting payment');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('payment successfully Deleted');
            callback(retObj);
        }
    });
};

module.exports = new PaymentsReceived();