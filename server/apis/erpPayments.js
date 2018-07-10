var ErpPaymentsColl = require('./../models/schemas').erpPaymentsColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var PartyColl = require('./../models/schemas').PartyCollection;

var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
var async = require("async");
var emailService = require('./mailerApi');
var serviceActions = require('./../constants/constants');
var analyticsService = require('./../apis/analyticsApi');
var Utils = require('./utils');
var _ = require("underscore");
var XLSX = require('xlsx');

var Payments = function () {
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

Payments.prototype.totalPayments = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ErpPaymentsColl.count({}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.total_receipts_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Success");
            analyticsService.create(req, serviceActions.total_receipts, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            retObj.data = count;
            callback(retObj);
        }
    })
};

Payments.prototype.getPayments = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;
    var jwt = req.jwt;
    if (params.fromDate && params.toDate && params.partyName) {
        PartyColl.find({name: new RegExp("^" + params.partyName, "i")}, function (err, partys) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
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
                }
                getPayments(condition, req, callback)

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
        getPayments(condition, req, callback)
    } else if (params.partyName) {
        PartyColl.find({name: new RegExp("^" + params.partyName, "i")}, function (err, partys) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
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
                    "accountId": ObjectId(jwt.accountId), "partyId": {$in: partIds}
                };
                getPayments(condition, req, callback)

            }
        });
    } else {
        condition = {accountId: req.jwt.accountId};
        getPayments(condition, req, callback);

    }

};

function getPayments(candition, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    async.parallel({
        payments: function (receiptsCallback) {
            ErpPaymentsColl.find(candition)
                .populate({path: "partyId", select: "name"})
                .populate({
                    path: "createdBy",
                    select: "firstName"
                }).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    receiptsCallback(err, docs);
                })
        },
        totalPayments: function (totalReceiptsCallback) {
            ErpPaymentsColl.count(candition, function (err, count) {
                totalReceiptsCallback(err, count);
            })
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_receipts_list_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push("Success");
            analyticsService.create(req, serviceActions.get_receipts_list_err, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            retObj.payments = results.payments;
            retObj.count = results.totalPayments;
            retObj.status = true;
            callback(retObj);

        }
    });
}

Payments.prototype.getPaymentDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Receipt ID");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        ErpPaymentsColl.findOne({_id: params._id}).populate({path: "partyId", select: "name"}).exec(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipt_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("Success");
                analyticsService.create(req, serviceActions.get_receipt_details, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages.push("Receipt details not found");
                analyticsService.create(req, serviceActions.get_receipt_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

Payments.prototype.addPayment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.partyId || !ObjectId.isValid(params.partyId)) {
        retObj.messages.push("Please select party");
    }
    if (!params.amount) {
        retObj.messages.push("Please enter amount");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.accountId = req.jwt.accountId;
        params.createdBy = req.jwt.accountId;
        var receipt = new ErpPaymentsColl(params);
        receipt.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_receipts_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                analyticsService.create(req, serviceActions.add_receipts, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });
                retObj.messages.push("Receipt added successfully");
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages.push("Receipt not added");
                analyticsService.create(req, serviceActions.add_receipts_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

Payments.prototype.updatePayment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid request");
    }
    if (!params.partyId || !ObjectId.isValid(params.partyId)) {
        retObj.messages.push("Please select party");
    }
    if (!params.amount) {
        retObj.messages.push("Please enter amount");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        ErpPaymentsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_receipts_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("Receipt updated successfully");
                analyticsService.create(req, serviceActions.update_receipts, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages.push("Receipt not updated");
                analyticsService.create(req, serviceActions.update_receipts_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }

};

Payments.prototype.deletePayment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid request")
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {

        ErpPaymentsColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_receipt_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Receipt deleted successfully");
                analyticsService.create(req, serviceActions.delete_receipt_details, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });

                callback(retObj);
            } else {
                retObj.messages.push("Receipt not deleted");
                analyticsService.create(req, serviceActions.delete_receipt_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })

    }
};


/**
 * Find the Total receipts from the receipts in the account
 */

Payments.prototype.findTotalReceipts = function (erpSettingsCondition, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ErpPaymentsColl.aggregate([{$match: erpSettingsCondition},
            {$group: {_id: null, totalReceipts: {$sum: "$amount"}}}],
        function (err, receipt) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.find_total_receipts_by_account_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                if (receipt[0]) {
                    retObj.totalReceipts = receipt[0].totalReceipts;
                } else {
                    retObj.totalReceipts = 0;

                }
                analyticsService.create(req, serviceActions.find_total_receipts_by_account, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });

};

Payments.prototype.getPaymentsByParties = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;
    var jwt = req.jwt;

    if (params.fromDate && params.toDate && params.partyName) {
        PartyColl.find({name: {$regex: '.*' + params.partyName + '.*'}}, function (err, partys) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
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
                    $match: {
                        "accountId": ObjectId(jwt.accountId), date: {
                            $gte: new Date(params.fromDate),
                            $lte: new Date(params.toDate),
                        }, "partyId": {$in: partIds}
                    }
                };
                getReceiptsByParties(req, condition, callback);

            }
        });
    } else if (params.fromDate && params.toDate) {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }
            }
        };
        getReceiptsByParties(req, condition, callback);
    } else if (params.partyName) {
        PartyColl.find({name: {$regex: '.*' + params.partyName + '.*'}}, function (err, partys) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
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
                    $match: {
                        "accountId": ObjectId(jwt.accountId), "partyId": {$in: partIds}
                    }
                };
                getReceiptsByParties(req, condition, callback);

            }
        });
    } else {
        ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipts_by_parties_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (erpSettings) {
                condition = {$match: Utils.getErpSettings(erpSettings.revenue, erpSettings.accountId)};
                getReceiptsByParties(req, condition, callback);
            } else {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipts_by_parties_err, {
                    body: JSON.stringify(req.query),
                    accountId: jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }


};

function getReceiptsByParties(req, condition, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ErpPaymentsColl.aggregate(condition,
        {
            "$lookup": {
                "from": "parties",
                "localField": "partyId",
                "foreignField": "_id",
                "as": "partyId"
            }
        }, {"$unwind": "$partyId"},
        {$group: {_id: "$partyId", amount: {$sum: "$amount"}}},
        function (err, receipts) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipts_by_parties_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Success");
                analyticsService.create(req, serviceActions.get_receipts_by_parties, {
                    accountId: req.id,
                    success: true
                }, function (response) {
                });
                retObj.data = receipts;
                callback(retObj);
            }
        });
}

Payments.prototype.getPaymentsByPartyName = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid party");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        ErpPaymentsColl.find({partyId: params._id}).populate({path: 'partyId', select: "name"}).exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_receipts_by_party_name_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                var total = 0;
                retObj.status = true;
                retObj.messages.push("Success");
                for (var i = 0; i < docs.length; i++) {
                    total += docs[i].amount;
                    if (i === docs.length - 1) {
                        retObj.data = docs;
                        retObj.total = total;
                        analyticsService.create(req, serviceActions.get_receipts_by_party_name, {
                            accountId: req.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                }

            } else {
                retObj.messages.push("No Payments found");
                analyticsService.create(req, serviceActions.get_receipts_by_party_name_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

Payments.prototype.downloadPaymentsDetailsByParty = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Payments.prototype.getReceiptsByParties(req, function (response) {
        if (response.status) {
            var output = [];
            for (var i = 0; i < response.data.length; i++) {
                output.push({
                    Party_Name: response.data[i]._id.name,
                    amount: response.data[i].amount

                });
                if (i === response.data.length - 1) {
                    retObj.status = true;
                    retObj.data = output;
                    analyticsService.create(req, serviceActions.download_receipt_by_party, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            }
        } else {
            retObj.messages.push("Receipt not downloaded");
            analyticsService.create(req, serviceActions.download_receipt_by_party_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(response);
        }
    })
};

Payments.prototype.sharePaymentsDetailsByPartyViaEmail = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt=req.jwt;
    var params=req.query;
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req,serviceActions.share_receipts_by_party_via_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        Payments.prototype.getReceiptsByParties(req, function (revenueResponse) {
            if (revenueResponse.status) {
                var emailparams = {
                    templateName: 'shareReceiptsDetailsByParty',
                    subject: "Easygaadi Payments Details",
                    to: params.email,
                    data: {
                        receipts: revenueResponse.data
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Payments details shared successfully');
                        analyticsService.create(req,serviceActions.share_receipts_by_party_via_email,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                    } else {
                        analyticsService.create(req,serviceActions.share_receipts_by_party_via_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:emailResponse.messages},function(response){ });
                        callback(emailResponse);
                    }
                });
            } else {
                analyticsService.create(req,serviceActions.share_receipts_by_party_via_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:revenueResponse.messages},function(response){ });
                callback(revenueResponse);
            }
        })
    }

};
Payments.prototype.shareDetailsViaEmail = function (jwt,params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    // console.log("shareDetailsViaEmail",params);
    if(!params.email || !Utils.isEmail(params.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else{
        Payments.prototype.getPayments(req,function(response){
            if(response.status){
                var output = [];
                if(response.payments.length){
                    for(var i=0;i<response.payments.length;i++) {
                        output.push({
                            date:dateToStringFormat(response.payments[i].date),
                            partyId:response.payments[i].partyId.name,
                            amount:response.payments[i].amount,
                            description:value(response.payments[i].description)
                        });
                        if (i === response.payments.length - 1) {
                            var emailparams = {
                                templateName: 'paymentDetails',
                                subject: "Payment Details",
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
Payments.prototype.downloadDetails = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    console.log("share details download....");
    Payments.prototype.getPayments(req,function(response){
        console.log("response....",response);
        if(response.status){
            var output = [];
            for(var i=0;i<response.payments.length;i++){
               output.push({
                   Date:dateToStringFormat(response.payments[i].date),
               Party:response.payments[i].partyId.name,
               Amount:response.payments[i].amount,
               Description:response.payments[i].description});
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

Payments.prototype.uploadPayments=function (req,callback) {
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
            var paymentsList = [];
            /*check data is valid or not*/
            async.eachSeries(data, function (payment, paymentCallback) {
                row++;
                if (payment['date'] && payment['party name'] && payment['amount'] && payment['remark']) {
                    /*assign ids from strings*/
                    async.parallel({
                        getSupplierId: function (supplierCallback) {
                            Utils.getSupplierId(accountId, payment['party name'], function (resp) {
                                if (resp.status) {
                                    supplierCallback(false, resp.data);
                                } else {
                                    supplierCallback(resp, "");
                                }
                            })
                        },
                        checkNumberValues:function (numberCallback) {
                            if(isNaN(parseInt(payment['amount']))){
                                retObj.messages.push("Please check amount");
                                numberCallback(retObj,"");
                            }else{
                                numberCallback(false,"")
                            }

                        },
                    }, function (err, result) {
                        if (err) {
                            console.log("err", err);

                            paymentCallback(err);
                        } else {
                            let obj = {};
                            obj.createdBy = req.jwt.id;
                            obj.updatedBy = req.jwt.id;
                            obj.accountId = accountId;
                            obj.partyId = result.getSupplierId;
                            obj.amount = payment['amount'];
                            obj.description=payment['remark'];

                            obj.date =  new Date(payment['date'].replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
                            paymentsList.push(obj);
                            paymentCallback(false);
                        }
                    });

                } else {
                    retObj.messages.push("Please provide all details for row number " + row);
                    paymentCallback(retObj)
                }
            }, function (err) {
                if (err) {
                    err.messages.unshift("Getting error at row number " + row);
                    callback(err);
                } else {
                    if(paymentsList.length>0){
                        /*Insert all records*/
                        ErpPaymentsColl.insertMany(paymentsList,function (err,docs) {
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
module.exports = new Payments();