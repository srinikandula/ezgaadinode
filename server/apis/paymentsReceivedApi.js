var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var PaymentsReceivedColl = require('./../models/schemas').paymentsReceivedColl;

var config = require('./../config/config');
var Helpers = require('./utils');

var PaymentsReceived = function () {
};

PaymentsReceived.prototype.addPayments = function (jwt, details, callback) {
    console.log(details);
    var retObj = {
        status: false,
        messages: []
    };
    if (!details.date) {
        retObj.messages.push("Please provide Date");
    }
    if (!details.tripId) {
        retObj.messages.push("Please provide Trip");
    }
    if (!details.truckId) {
        retObj.messages.push("Please provide Truck");
    }
    if (!details.partyId) {
        retObj.messages.push("Please provide Party");
    }
    if (!details.description || !_.isString(details.description)) {
        retObj.messages.push("Please provide description");
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

PaymentsReceived.prototype.getPayments = function (params, jwt, callback) {
    var result = {};
    if (!params.page) {
        params.page = 1;
    } else if (!_.isNumber(Number(params.page))) {
        result.status = false;
        result.message = 'Invalid page number';
        return callback(result);
    }

    var skipNumber = (params.page - 1) * params.size;
    async.parallel({
        mCosts: function (mCostsCallback) {
            var limit = params.size? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) :{};
            PaymentsReceivedColl
                .find({'accountId': jwt.accountId})
                .sort({createdAt: 1})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                //.populate('paymentsCostId')
                .lean()
                .exec(function (err, mCosts) {
                    //console.log(mCosts);
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Helpers.populateNameInUsersColl(mCosts, "createdBy", function (response) {
                                createdbyCallback(response.err, response.documents);
                            });
                        },
                        partyId: function (partiescallback) {
                            Helpers.populateNameInPartyColl(mCosts, 'partyId', function (response) {
                                partiescallback(response.err, response.documents);
                            })
                        },
                        tripId: function (tripscallback) {
                            Helpers.populateNameInTripsColl(mCosts, 'tripId', function (response) {
                                tripscallback(response.err, response.documents);
                            })
                        },
                        truckId: function (truckscallback) {
                            Helpers.populateNameInTrucksColl(mCosts, 'truckId', function (response) {
                                truckscallback(response.err, response.documents);
                            })
                        }
                    }, function (populateErr, populateResults) {
                        mCostsCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            PaymentsReceivedColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        //console.log(results);
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Payments Costs';
            callback(retObj);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.paymentsCosts = results.mCosts.createdbyname;
            callback(result);
        }
    });
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
    // paymentDetails = Utils.removeEmptyFields(paymentDetails);
    paymentDetails.updatedBy = jwt.id;
    PaymentsReceivedColl.findOneAndUpdate({accountId: jwt.accountId,_id: paymentDetails._id}, {$set: paymentDetails}, {new: true}, function (err, payment) {
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

PaymentsReceived.prototype.deletePayment = function (jwt, id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    PaymentsReceivedColl.remove({accountId: jwt.accountId, _id: id}, function (err) {
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

PaymentsReceived.prototype.countPayments = function (jwt, callback) {
    var result = {};
    PaymentsReceivedColl.count({'accountId':jwt.accountId},function (err, data) {
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

module.exports = new PaymentsReceived();