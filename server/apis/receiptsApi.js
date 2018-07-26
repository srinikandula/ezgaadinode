var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
const ObjectId = mongoose.Types.ObjectId;
var ReceiptsColl = require('./../models/schemas').ReceiptsColl;
var TripColl = require('./../models/schemas').TripCollection;
var PartyCollection = require('./../models/schemas').PartyCollection;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');
var XLSX = require('xlsx');


var config = require('./../config/config');
var Helpers = require('./utils');
var pageLimits = require('./../config/pagination');
var Utils = require('./utils');
var emailService = require('./mailerApi');

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});

var Receipts = function () {
};
function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}
function value(x){
    if(x){
        return x;
    }else{
        return '--';
    }
}
/**
 * Find total of the payments received in the account
 * @param accId
 * @param callback
 */
Receipts.prototype.getTotalAmount = function (accId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ReceiptsColl.aggregate([
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

Receipts.prototype.addReceipts = function (jwt, details,req, callback) {
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
    if ((details.paymentType === 'NEFT' || details.paymentType === 'Cheque') && !details.receiptRefNo) {
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

        var insertDoc = new ReceiptsColl(details);
        insertDoc.save(function (err, payment) {
            if (err) {
                retObj.messages.push("Error, try Again");
                analyticsService.create(req,serviceActions.add_payment_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Receipt added successfully");
                retObj.payments = payment;
                analyticsService.create(req,serviceActions.add_payment,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        });
    }
};

function getReceipts(condition, jwt, params, callback) {
    var result = {
        status:false,
        messages:[]
    };
    if (!params.page) {
        params.page = 1;
    } else if (!_.isNumber(Number(params.page))) {
        result.status = false;
        result.messages.push('Invalid page number');
        return callback(result);
    }
    var skipNumber = (params.page - 1) * params.size;

    async.parallel({
        mCosts: function (mCostsCallback) {
            var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
            ReceiptsColl
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
            ReceiptsColl.count({'accountId': jwt.accountId}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.status = false;
            result.messages.push('Error retrieving Receipts Costs');
            callback(retObj);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.count = results.count;
            result.userId = jwt.id;
            result.userType = jwt.type;
            result.paymentsCosts = results.mCosts.createdbyname;
            callback(result);
        }
    });
}

Receipts.prototype.getReceipts = function (jwt, params,req, callback) {
    var result = {
        status:false,
        messages:[]
    };
    var condition = {};
    if (params.fromDate && params.toDate && params.partyName) {
        PartyCollection.find({name: new RegExp("^" + params.partyName, "i")}, function (err, partys) {
            if (err) {
                result.status = false;
                result.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipts_by_parties_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                var partIds = _.pluck(partys, "_id");
                condition = {
                    "accountId": ObjectId(jwt.accountId), date: {
                        $gte: new Date(params.fromDate),
                        $lte: new Date(params.toDate),
                    }, "partyId": {$in: partIds}
                };
                getReceipts(condition, jwt, params, function (paymentResp) {
                    if(paymentResp.status){
                        analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.message},function(response){ });
                    }
                    callback(paymentResp);
                });

            }
        });
    } else if (params.fromDate && params.toDate) {
        condition = {
            "accountId": ObjectId(jwt.accountId),
            date: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate),
            }
        };
        getReceipts(condition, jwt, params, function (paymentResp) {
            if(paymentResp.status){
                analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.message},function(response){ });
            }
            callback(paymentResp);
        });
    } else if (!params.partyName) {
        getReceipts({'accountId': jwt.accountId}, jwt, params, function (paymentResp) {
            if(paymentResp.status){
                analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.message},function(response){ });
            }
            callback(paymentResp);
        });
    } else {
        PartyCollection.findOne({name:new RegExp("^" + params.partyName, "i") }, function (err, partyData) {
            if (err) {
                result.status = false;
                result.messages.push('Error retrieving Payments Costs');
                analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.messages},function(response){ });
                callback(retObj);
            } else if (partyData) {
                getReceipts({'accountId': jwt.accountId, partyId: partyData._id}, jwt, params, function (paymentResp) {
                    if(paymentResp.status){
                        analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.get_payments_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:paymentResp.messages},function(response){ });
                    }
                    callback(paymentResp);
                });
            } else {
                result.status = true;
                result.messages.push('Success');
                result.count = 0;
                result.paymentsCosts = [];
                analyticsService.create(req,serviceActions.get_payments,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                callback(result);
            }
        })
    }
};

Receipts.prototype.getReceiptRecord = function (jwt, paymentsId,req, callback) {
    var result = {
        status:false,
        messages:[]
    };
    var condition = {};
    if (jwt.type === "account") {
        condition = {_id: paymentsId, 'accountId': jwt.accountId};
    } else {
        condition = {_id: paymentsId, 'createdBy': jwt.id};
    }
    ReceiptsColl.findOne(condition, function (err, paymentsReceived) {
        if (err) {
            result.status = false;
            result.messages.push("Error while finding Payments, try Again");
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
            callback(result);
        } else if (paymentsReceived) {
            result.status = true;
            result.messages.push("Payment found successfully");
            result.paymentsDetails = paymentsReceived;
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(result);
        } else {
            result.status = false;
            result.message.push("Unauthorized access or Payment is not found!");
            analyticsService.create(req,serviceActions.find_payments_recieved_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.message},function(response){ });
            callback(result);
        }
    });
};

Receipts.prototype.getAllAccountReceipts = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ReceiptsColl.find({accountId: jwt.accountId}, function (err, receipts) {
        if (err) {
            retObj.messages.push('Error getting payments');
            analyticsService.create(req,serviceActions.get_all_acc_payments_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.receipts = receipts;
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

Receipts.prototype.findPartyPayments = function (jwt, partyId, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ReceiptsColl.find({accountId: jwt.accountId, partyId: partyId}, function (err, payments) {
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

Receipts.prototype.updateReceipts = function (jwt, paymentDetails,req, callback) {
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
        ReceiptsColl.findOneAndUpdate({
            _id: paymentDetails._id
        }, {$set: paymentDetails}, {new: true}, function (err, payment) {
            if (err) {
                retObj.messages.push("Error while updating Receipt, try Again");
                analyticsService.create(req,serviceActions.update_payments_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (payment) {
                retObj.status = true;
                retObj.messages.push("Receipt updated successfully");
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

Receipts.prototype.deleteReceiptsRecord = function (jwt, id,req, callback) {
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
        ReceiptsColl.remove(condition, function (err, returnValue) {
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

Receipts.prototype.countReceipts = function (jwt,params,req, callback) {
    var result = {};
    var condition = {};
    if(params.partyName){
        condition = {
                accountId: jwt.accountId,
                partyId:params.partyName
        };
    }else if(params.fromDate && params.toDate){
        condition = {
            accountId: jwt.accountId,
            date: {
                $gte: new Date(params.fromDate),
                $lte: new Date(params.toDate)
            }
        };
    }else{
        condition = {accountId: jwt.accountId};
    }
    ReceiptsColl.count(condition, function (err, data) {
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
Receipts.prototype.findPendingDueForAccount = function (condition,req, callback) {
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
            ReceiptsColl.aggregate({$match: condition},
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
    async.parallel({
        tripFrightTotal: function (callback) {
            TripColl.aggregate(condition,
                {$group: {_id: "$partyId", totalFright: {$sum: "$freightAmount"}}},
                {"$sort": {createdAt: -1}},
                function (err, totalFrieght) {
                    callback(err, totalFrieght);
                });
        },
        paymentsTotal: function (callback) {
            ReceiptsColl.aggregate(condition,
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
                retObj.grossAmounts = {grossFreight: grossFreight, grossExpenses: grossExpenses, grossDue: grossDue};
                callback(retObj);
            })

        }
    });
}

Receipts.prototype.getDuesByParty = function (jwt, params,req, callback) {
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
        };
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

Receipts.prototype.shareReceiptsDetailsByPartyViaEmail = function (jwt, params,req, callback) {
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
        Receipts.prototype.getDuesByParty(jwt, params,req, function (revenueResponse) {
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


Receipts.prototype.downloadReceiptsDetailsByParty = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    Receipts.prototype.getDuesByParty(jwt, params,req, function (paymentsResponse) {
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


};
Receipts.prototype.shareDetailsViaEmail = function (jwt,params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!params.email || !Utils.isEmail(params.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else{
        Receipts.prototype.getReceipts(jwt,params,req,function(response){
            if(response.status){
                var output = [];
                if(response.paymentsCosts.length){
                    for(var i=0;i<response.paymentsCosts.length;i++) {
                        output.push({
                            date:dateToStringFormat(response.paymentsCosts[i].date),
                            party:response.paymentsCosts[i].attrs.partyName,
                            amount:response.paymentsCosts[i].amount,
                            paymentType:response.paymentsCosts[i].paymentType,
                            receiptRefNo:value(response.paymentsCosts[i].receiptRefNo),
                            description:value(response.paymentsCosts[i].description)
                        });
                        if (i === response.paymentsCosts.length - 1) {
                            var emailparams = {
                                templateName: 'receiptDetails',
                                subject: "Receipts Details",
                                to: params.email,
                                data: output
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    retObj.status = true;
                                    retObj.messages.push(' Details shared successfully');
                                    callback(retObj);
                                } else {
                                    callback(emailResponse);
                                }
                            });
                        }
                    }
                }else{
                    retObj.messages.push("No records found....");
                    retObj.status = false;
                    callback(retObj);
                }

            }else{
                callback(response);

            }
        })
    }

};
Receipts.prototype.downloadDetails = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    console.log("share details download....");
    Receipts.prototype.getReceipts(jwt,params,req,function(response){
        if(response.status){
            var output = [];
            for(var i=0;i<response.paymentsCosts.length;i++){
                output.push({
                    Date:dateToStringFormat(response.paymentsCosts[i].date),
                    Party:response.paymentsCosts[i].attrs.partyName,
                    Amount:response.paymentsCosts[i].amount,
                    Payment_Type:response.paymentsCosts[i].paymentType,
                    Receipt_Ref_No:response.paymentsCosts[i].receiptRefNo,
                    Description:response.paymentsCosts[i].description
                });
            }
            retObj.data = output;
            retObj.status=true;
            retObj.messages.push("successful..");
            callback(retObj);
        }else{
            callback(retObj);
        }
    })
};

Receipts.prototype.uploadReceipts=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    let file = req.files.file;
    let accountId = req.jwt.accountId;
    if (!file) {
        retObj.messages.push("Please provide file");
        callback(retObj);
    } else {
        /*parse data from excel sheet*/
        var workbook = XLSX.readFile(file.path);
        var sheet_name_list = workbook.SheetNames;
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var headers = {};
        var data = [];
        for (z in worksheet) {
            if (z[0] === '!') continue;
            //parse out the column, row, and value
            var tt = 0;
            for (var i = 0; i < z.length; i++) {
                if (!isNaN(z[i])) {
                    tt = i;
                    break;
                }
            };
            var col = z.substring(0, tt);
            var row = parseInt(z.substring(tt));
            var value = worksheet[z].v;

            //store header names
            if (row == 1 && value) {
                headers[col] = value;
                continue;
            }

            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
        }
        data.shift();
        data.shift();

        if (data.length > 0) {
            var row = 0;
            var receiptsList = [];
            /*check data is valid or not*/
            async.eachSeries(data, function (receipt, receiptCallback) {
                row++;
                if (receipt['date'] && receipt['party name'] && receipt['amount'] && receipt['remark'] && receipt['payment type']) {
                    /*assign ids from strings*/
                    async.parallel({
                        getPartyId: function (partyCallback) {
                            Utils.getPartyId(accountId, receipt['party name'], function (resp) {
                                if (resp.status) {
                                    partyCallback(false, resp.data);
                                } else {
                                    partyCallback(resp, "");
                                }
                            })
                        },
                        checkNumberValues:function (numberCallback) {
                            if(isNaN(parseInt(receipt['amount']))){
                                retObj.messages.push("Please check amount");
                                numberCallback(retObj,"");
                            }else{
                                numberCallback(false,"")
                            }

                        },
                        checkPaymentMethod:function (paymentCallback) {
                            if(['NEFT','Cheque','Cash'].indexOf(receipt['payment type'])<0){
                                retObj.messages.push("payment type must be NEFT,Checque,Cash");
                                paymentCallback(retObj,"");
                            }else{
                                if(['NEFT','Cheque'].indexOf(receipt['payment type'])>-1){
                                    if(!receipt['ref no']){
                                        retObj.messages.push("Please enter reference number");
                                        paymentCallback(retObj,"");
                                    }else{
                                        paymentCallback(false,"");
                                    }
                                }else{
                                    paymentCallback(false,"");

                                }
                            }
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log("err", err);

                            receiptCallback(err);
                        } else {
                            let obj = {};
                            obj.createdBy = req.jwt.id;
                            obj.updatedBy = req.jwt.id;
                            obj.accountId = accountId;
                            obj.partyId = result.getPartyId;
                            obj.amount = receipt['amount'];
                            obj.description=receipt['remark'];
                            obj.receiptRefNo=receipt['ref no'];
                            obj.paymentType=receipt['payment type'];
                            obj.date =  new Date(receipt['date'].replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
                            receiptsList.push(obj);
                            receiptCallback(false);
                        }
                    });

                } else {
                    retObj.messages.push("Please provide all details for row number " + row);
                    receiptCallback(retObj)
                }
            }, function (err) {
                if (err) {
                    err.messages.unshift("Getting error at row number " + row);
                    callback(err);
                } else {
                    if(receiptsList.length>0){
                        /*Insert all records*/
                        ReceiptsColl.insertMany(receiptsList,function (err,docs) {
                            if(err){
                                retObj.messages.push("Internal server error, "+JSON.stringify(err.message));
                                callback(retObj);
                            }else{
                                retObj.status=true;
                                retObj.messages.push(docs.length+" rows  successfully added" );
                                callback(retObj);
                            }
                        })
                    }else{
                        retObj.messages.push("Please enter valid data");
                        callback(retObj);
                    }
                }
            })
        } else {
            retObj.messages.push("Please enter valid data");
            callback(retObj);
        }

    }
};
module.exports = new Receipts();