var ReceiptsColl = require('./../models/schemas').ReceiptsColl;
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
var Receipts = function () {
};

Receipts.prototype.totalReceipts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ReceiptsColl.count({}, function (err, count) {
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

Receipts.prototype.getReceipts = function (req, callback) {
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
                getReceipts(condition, req, callback)

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
        getReceipts(condition, req, callback)
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
                getReceipts(condition, req, callback)

            }
        });
    } else {
        condition = {accountId: req.jwt.accountId};
        getReceipts(condition, req, callback);

    }

};

function getReceipts(candition, req, callback) {
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
        receipts: function (receiptsCallback) {
            ReceiptsColl.find(candition)
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
        totalReceipts: function (totalReceiptsCallback) {
            ReceiptsColl.count(candition, function (err, count) {
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
            retObj.receipts = results.receipts;
            retObj.count = results.totalReceipts;
            retObj.status = true;
            callback(retObj);

        }
    });
}

Receipts.prototype.getReceiptDetails = function (req, callback) {
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
        ReceiptsColl.findOne({_id: params._id}).populate({path: "partyId", select: "name"}).exec(function (err, doc) {
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

Receipts.prototype.addReceipt = function (req, callback) {
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
        var receipt = new ReceiptsColl(params);
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

Receipts.prototype.updateReceipt = function (req, callback) {
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
        ReceiptsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
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

Receipts.prototype.deleteReceipt = function (req, callback) {
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

        ReceiptsColl.remove({_id: params._id}, function (err, doc) {
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

Receipts.prototype.findTotalReceipts = function (erpSettingsCondition, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ReceiptsColl.aggregate([{$match: erpSettingsCondition},
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

Receipts.prototype.getReceiptsByParties = function (req, callback) {
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
    ReceiptsColl.aggregate(condition,
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

Receipts.prototype.getReceiptByPartyName = function (req, callback) {
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
        ReceiptsColl.find({partyId: params._id}).populate({path: 'partyId', select: "name"}).exec(function (err, docs) {
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
                retObj.messages.push("No Receipts found");
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

Receipts.prototype.downloadReceiptsDetailsByParty = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Receipts.prototype.getReceiptsByParties(req, function (response) {
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

Receipts.prototype.shareReceiptsDetailsByPartyViaEmail = function (req, callback) {
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
        Receipts.prototype.getReceiptsByParties(req, function (revenueResponse) {
            if (revenueResponse.status) {
                var emailparams = {
                    templateName: 'shareReceiptsDetailsByParty',
                    subject: "Easygaadi Receipts Details",
                    to: params.email,
                    data: {
                        receipts: revenueResponse.data
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Receipts details shared successfully');
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
module.exports = new Receipts();