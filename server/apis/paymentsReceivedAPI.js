var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
const ObjectId = mongoose.Types.ObjectId;
var PaymentsReceivedColl = require('./../models/schemas').paymentsReceivedColl;
var TripColl = require('./../models/schemas').TripCollection;
var PartyCollection = require('./../models/schemas').PartyCollection;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');


var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
var Utils = require('./utils');
var emailService = require('./mailerApi');

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});

var PaymentsReceived = function () {
};

/**
 * Find total of the payments received in the account
 * @param accId
 * @param callback
 */
PaymentsReceived.prototype.getTotalAmount = function (accId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsReceivedColl.aggregate([
        {
            "$match": {accountId: ObjectId(accId)}
        },
        {
            "$group": {
                "_id": null,
                "total": {"$sum": "$amount"}
            }
        }
    ], function (err, sum) {
        if (err) {
            retObj.messages.push("Error while getting amount details, try Again");
            analyticsService.create(req,serviceActions.get_total_amnt_err,{accountId:req.jwt.accountId,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
            logger.error("Error:   failed find amount total by account" + JSON.stringify(err));
        } else {
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.amounts = sum;
            analyticsService.create(req,serviceActions.get_total_amnt,{accountId:req.jwt.accountId,success:true},function(response){ });
            callback(retObj);
        }
    });
};

PaymentsReceived.prototype.addPayments = function (jwt, details,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!details.date) {
        retObj.messages.push("Please provide Date");
    }
    if (!details.partyId) {
        retObj.messages.push("Please provide Party");
    }
    if (!details.amount) {
        retObj.messages.push("Please provide amount");
    }
    if (!details.paymentType) {
        retObj.messages.push('Select payment type');
    }
    if ((details.paymentType === 'NEFT' || details.paymentType === 'Cheque') && !details.paymentRefNo) {
        retObj.messages.push('Enter payment reference number');
    }
    if (retObj.messages.length) {
        analyticsService.create(req,serviceActions.add_payment_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        details.date = new Date(details.date);
        details.createdBy = jwt.id;
        details.updatedBy = jwt.id;
        details.accountId = jwt.accountId;

        var insertDoc = new PaymentsReceivedColl(details);
        insertDoc.save(function (err, payment) {
            if (err) {
                retObj.messages.push("Error, try Again");
                analyticsService.create(req,serviceActions.add_payment_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Successfully Added");
                retObj.payments = payment;
                analyticsService.create(req,serviceActions.add_payment,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    }
};

function getPayments(condition, jwt, params, callback) {
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
            var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
            PaymentsReceivedColl
                .find(condition)
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                //.populate('paymentsCostId')
                .lean()
                .exec(function (err, mCosts) {
                    if (mCosts) {
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
                        }, function (populateErr, populateResults) {
                            mCostsCallback(populateErr, populateResults);
                        });
                    }
                });
        },
        count: function (countCallback) {
            PaymentsReceivedColl.count({'accountId': jwt.accountId}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Payments Costs';
            callback(retObj);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = results.count;
            result.userId = jwt.id;
            result.userType = jwt.type;
            result.paymentsCosts = results.mCosts.createdbyname;
            callback(result);
        }
    });
}

PaymentsReceived.prototype.getPayments = function (jwt, params,req, callback) {
    var result = {};
    var condition = {};
    if (!params.partyName) {
        getPayments({'accountId': jwt.accountId}, jwt, params, function (paymentResp) {
            if(paymentResp.status){
                analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.message},function(response){ });
            }
            callback(paymentResp);
        });
    } else {
        PartyCollection.findOne({name: {$regex: '.*' + params.partyName + '.*'}}, function (err, partyData) {
            if (err) {
                result.status = false;
                result.message = 'Error retrieving Payments Costs';
                analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
                callback(retObj);
            } else if (partyData) {
                getPayments({'accountId': jwt.accountId, partyId: partyData._id}, jwt, params, function (paymentResp) {
                    if(paymentResp.status){
                        analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.message},function(response){ });
                    }
                    callback(paymentResp);
                });
            } else {
                result.status = true;
                result.message = 'Success';
                result.count = 0;
                result.paymentsCosts = [];
                analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                callback(result);
            }
        })
    }
};

PaymentsReceived.prototype.findPaymentsReceived = function (jwt, paymentsId,req, callback) {
    var result = {};
    var condition = {};
    if (jwt.type === "account") {
        condition = {_id: paymentsId, 'accountId': jwt.accountId};
    } else {
        condition = {_id: paymentsId, 'createdBy': jwt.id};
    }
    PaymentsReceivedColl.findOne(condition, function (err, paymentsReceived) {
        if (err) {
            result.status = false;
            result.message = "Error while finding Payments, try Again";
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
            callback(result);
        } else if (paymentsReceived) {
            result.status = true;
            result.message = "Payment found successfully";
            result.paymentsDetails = paymentsReceived;
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(result);
        } else {
            result.status = false;
            result.message = "Unauthorized access or Payment is not found!";
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
            callback(result);
        }
    });
};

PaymentsReceived.prototype.getAllAccountPayments = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsReceivedColl.find({accountId: jwt.accountId}, function (err, payments) {
        if (err) {
            retObj.messages.push('Error getting payments');
            analyticsService.create(req,serviceActions.get_all_acc_payments_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.payments = payments;
            analyticsService.create(req,serviceActions.get_all_acc_payments,{accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

/**
 * Find payments made by a party
 * @param jwt
 * @param callback
 */

PaymentsReceived.prototype.findPartyPayments = function (jwt, partyId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PaymentsReceivedColl.find({accountId: jwt.accountId, partyId: partyId}, function (err, payments) {
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

PaymentsReceived.prototype.updatePayment = function (jwt, paymentDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var giveAccess = false;
    if (jwt.type === "account" && paymentDetails.accountId === jwt.accountId) {
        giveAccess = true;
    } else if (jwt.type === "group" && paymentDetails.createdBy === jwt.id) {
        giveAccess = true;

    } else {
        retObj.status = false;
        retObj.messages.push("Unauthorized access");
        analyticsService.create(req,serviceActions.update_payments_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(result);
    }
    if (giveAccess) {
        paymentDetails = Utils.removeEmptyFields(paymentDetails);
        paymentDetails.updatedBy = jwt.id;
        PaymentsReceivedColl.findOneAndUpdate({
            _id: paymentDetails._id
        }, {$set: paymentDetails}, {new: true}, function (err, payment) {
            if (err) {
                retObj.messages.push("Error while updating payment, try Again");
                analyticsService.create(req,serviceActions.update_payments_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (payment) {
                retObj.status = true;
                retObj.messages.push("Payment updated successfully");
                analyticsService.create(req,serviceActions.update_payments,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            } else {
                retObj.messages.push("Error, finding payment");
                analyticsService.create(req,serviceActions.update_payments_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });
    }
};

PaymentsReceived.prototype.deletePaymentsRecord = function (jwt, id,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var giveAccess = false;
    if (jwt.type === "account") {
        condition = {accountId: jwt.accountId, _id: id};
        giveAccess = true;
    } else if (jwt.type === "group") {
        condition = {_id: id, createdBy: jwt.id};
        giveAccess = true;
    } else {
        retObj.status = false;
        retObj.messages.push("Unauthorized access");
        analyticsService.create(req,serviceActions.del_payments_record_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(result);
    }

    if (giveAccess) {
        PaymentsReceivedColl.remove(condition, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting payment');
                analyticsService.create(req,serviceActions.del_payments_record_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting payment Record');
                analyticsService.create(req,serviceActions.del_payments_record_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('payment successfully Deleted');
                analyticsService.create(req,serviceActions.del_payments_record,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    }
};

PaymentsReceived.prototype.countPayments = function (jwt,req, callback) {
    var result = {};
    PaymentsReceivedColl.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req,serviceActions.count_payments_err,{accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req,serviceActions.count_payments,{accountId:req.jwt.id,success:true},function(response){ });
            callback(result);
        }
    })
};


/**
 * Find the total of pending payments in the account using the below formula
 * sum(total_trips_frieght) - sum(payment amount)
 */
PaymentsReceived.prototype.findPendingDueForAccount = function (condition,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        tripFrightTotal: function (callback) {
            TripColl.aggregate({$match: condition},
                {$group: {_id: null, totalFright: {$sum: "$freightAmount"}}},
                function (err, totalFrieght) {
                    callback(err, totalFrieght);
                });
        },
        paymentsTotal: function (callback) {
            PaymentsReceivedColl.aggregate({$match: condition},
                {$group: {_id: null, totalPayments: {$sum: "$amount"}}},
                function (err, totalPayments) {
                    callback(err, totalPayments);
                });
        }
    }, function (populateErr, populateResults) {
        if (populateErr) {
            retObj.status = true;
            retObj.messages.push(JSON.stringify(populateErr));
            analyticsService.create(req,serviceActions.get_account_due_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            var totalFright = 0;
            var totalPayments = 0;
            if (Object.keys(populateResults).length > 0) {
                if (populateResults.tripFrightTotal[0]) {
                    totalFright = populateResults.tripFrightTotal[0].totalFright;
                }
                if (populateResults.paymentsTotal[0]) {
                    totalPayments = populateResults.paymentsTotal[0].totalPayments;
                }
                retObj.pendingDue = totalFright - totalPayments;
            } else {
                retObj.pendingDue = 0 //populateResults.tripFreightTotal[0].totalFreight - populateResults.expensesTotal[0].totalExpenses;
            }
            // retObj.pendingDue = populateResults.tripFrightTotal[0].totalFright - populateResults.paymentsTotal[0].totalPayments;
            analyticsService.create(req,serviceActions.get_account_due,{accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
}

/**
 * Find the dues grouped by party
 * @param jwt
 * @param callback
 */
function getDuesByParty(jwt, condition, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.page) {
        params.page = 1;
    }
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        tripFrightTotal: function (callback) {
            TripColl.aggregate(condition,
                {$group: {_id: "$partyId", totalFright: {$sum: "$freightAmount"}}},
                {"$sort": sort},
                {"$skip": skipNumber},
                {"$limit": limit},
                function (err, totalFrieght) {
                    callback(err, totalFrieght);
                });
        },
        paymentsTotal: function (callback) {
            PaymentsReceivedColl.aggregate(condition,
                {$group: {_id: "$partyId", totalPayments: {$sum: "$amount"}}},
                function (err, totalPayments) {
                    callback(err, totalPayments);
                });
        }
    }, function (populateErr, populateResults) {
        if (populateErr) {
            retObj.status = true;
            retObj.messages.push(JSON.stringify(populateErr));
            callback(retObj);
        } else {
            var partyIds = _.pluck(populateResults.tripFrightTotal, "_id");
            var parties = [];
            var grossFreight = 0;
            var grossExpenses = 0;
            var grossDue = 0;
            for (var i = 0; i < partyIds.length; i++) {
                var party = {"id": partyIds[i], "totalPayment": 0, "totalFright": 0};
                var partyInfo = _.find(populateResults.tripFrightTotal, function (total) {
                    if (total._id === party.id) {
                        return total;
                    }
                });
                if (partyInfo && partyInfo.totalFright) {
                    party.totalFright = partyInfo.totalFright;
                }
                partyInfo = _.find(populateResults.paymentsTotal, function (payment) {
                    if (payment._id.toString() === party.id.toString()) {
                        return payment;
                    }
                });
                if (partyInfo && partyInfo.totalPayments) {
                    party.totalPayment = partyInfo.totalPayments;
                }
                party.totalDue = parseFloat(party.totalFright) - parseFloat(party.totalPayment);
                parties.push(party);

                grossFreight = grossFreight + party.totalFright;
                grossExpenses = grossExpenses + party.totalPayment;
                grossDue = grossDue + party.totalDue;
            }
            Utils.populateNameInPartyColl(parties, 'id', function (result) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.parties = result.documents;
                retObj.grossAmounts = {grossFreight: grossFreight, grossExpenses: grossExpenses, grossDue: grossDue}
                callback(retObj);
            })

        }
    });
}

PaymentsReceived.prototype.getDuesByParty = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var retObj = {
        status: false,
        messages: []
    };
    if (params.fromDate != '' && params.toDate != '' && params.partyId != '') {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }, "partyId": ObjectId(params.partyId)
            }
        }
        getDuesByParty(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.get_dues_by_party,{accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        })
    } else if (params.fromDate && params.toDate) {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }
            }
        }
        getDuesByParty(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.get_dues_by_party,{accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        })
    } else if (params.partyId) {
        condition = {$match: {"accountId": ObjectId(jwt.accountId), "partyId": ObjectId(params.partyId)}}
        getDuesByParty(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.get_dues_by_party,{accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        })
    } else {
        condition = {$match: {"accountId": ObjectId(jwt.accountId)}}
        ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (erpSettings) {

                condition = {$match: Utils.getErpSettings(erpSettings.payment, erpSettings.accountId)}
                getDuesByParty(jwt, condition, params, function (response) {
                    if(response.status){
                        analyticsService.create(req,serviceActions.get_dues_by_party,{accountId:req.jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:response.messages},function(response){ });
                    }
                    callback(response);
                })
            } else {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.get_dues_by_party_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });

    }

};

PaymentsReceived.prototype.sharePaymentsDetailsByPartyViaEmail = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req,serviceActions.share_party_payment_det_by_email_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        PaymentsReceived.prototype.getDuesByParty(jwt, params, function (revenueResponse) {
            if (revenueResponse.status) {
                var emailparams = {
                    templateName: 'sharesPaymentsDetailsByParty',
                    subject: "Easygaadi Payments Details",
                    to: params.email,
                    data: {
                        parties: revenueResponse.parties,
                        grossAmounts: revenueResponse.grossAmounts
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Payments details share successfully');
                        analyticsService.create(req,serviceActions.share_party_payment_det_by_email,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:true},function(response){ });
                        callback(retObj);
                    } else {
                        analyticsService.create(req,serviceActions.share_party_payment_det_by_email_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:emailResponse.messages},function(response){ });
                        callback(emailResponse);
                    }
                });
            } else {
                analyticsService.create(req,serviceActions.share_party_payment_det_by_email_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:revenueResponse.messages},function(response){ });
                callback(revenueResponse);
            }
        })
    }

};


PaymentsReceived.prototype.downloadPaymentDetailsByParty = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    PaymentsReceived.prototype.getDuesByParty(jwt, params, function (paymentsResponse) {
        if (paymentsResponse.status) {

            var output = [];
            for (var i = 0; i < paymentsResponse.parties.length; i++) {
                output.push({
                    Party_Name: paymentsResponse.parties[i].attrs.partyName,
                    Party_Mobile: paymentsResponse.parties[i].attrs.partyContact,
                    Total_Fright: paymentsResponse.parties[i].totalFright,
                    Paid_Amount: paymentsResponse.parties[i].totalPayment,
                    Due_Amount: paymentsResponse.parties[i].totalDue
                })
                if (i === paymentsResponse.parties.length - 1) {
                    retObj.status = true;
                    output.push({
                        Party_Name: 'Total',
                        Party_Mobile: '',
                        Total_Fright: paymentsResponse.grossAmounts.grossFreight,
                        Paid_Amount: paymentsResponse.grossAmounts.grossExpenses,
                        Due_Amount: paymentsResponse.grossAmounts.grossDue
                    })
                    retObj.data = output;
                    analyticsService.create(req,serviceActions.dwnld_party_payment_det,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:true},function(response){ });
                    callback(retObj);
                }
            }
        } else {
            analyticsService.create(req,serviceActions.dwnld_party_payment_det_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:paymentsResponse.messages},function(response){ });
            callback(paymentsResponse);
        }
    })


}

module.exports = new PaymentsReceived();