var ReceiptsColl = require('./../models/schemas').ReceiptsColl;

var mongoose=require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
var async = require("async");

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
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Success");
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
    async.parallel({
        receipts: function (receiptsCallback) {
            ReceiptsColl.find({}).populate({path:"partyId",select:"name"}).populate({path:"createdBy",select:"firstName"}).exec( function (err, docs) {
                receiptsCallback(err, docs);
            })
        },
        totalReceipts: function (totalReceiptsCallback) {
            ReceiptsColl.count({}, function (err, count) {
                totalReceiptsCallback(err, count);
            })
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else {
            retObj.messages.push("Success");
            retObj.receipts = results.receipts;
            retObj.count = results.totalReceipts;
            retObj.status = true;
            callback(retObj);

        }
    });

};
Receipts.prototype.getReceiptDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Receipt ID");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        ReceiptsColl.findOne({_id:params._id},function (err,doc) {
            if(err){
                retObj.messages.push("Please try again");
                callback(retObj);
            }else if(doc){
                retObj.status=true;
                retObj.messages.push("Success");
                retObj.data=doc;
                callback(retObj);
           }else{
                retObj.messages.push("Receipt details not found");
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
        params.accountId=req.jwt.accountId;
        params.createdBy=req.jwt.accountId;
        var receipt = new ReceiptsColl(params);
        receipt.save(function (err, doc) {
            if (err) {
                retObj.status = false;
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("Receipt added successfully");
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages.push("Receipt not added");
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
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        ReceiptsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("Receipt updated successfully");
                retObj.data = doc;
                callback(retObj);
            } else {
                retObj.messages.push("Receipt not updated");
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
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Receipt deleted successfully");
                callback(retObj);
            } else {
                retObj.messages.push("Receipt not deleted");
                callback(retObj);
            }
        })

    }
};


/**
 * Find the Total receipts from the receipts in the account
 */

Receipts.prototype.findTotalReceipts = function (erpSettingsCondition,req, callback) {
  var retObj={
      status:false,
      messages:[]
  };
  console.log("cond",erpSettingsCondition)
    ReceiptsColl.aggregate([{$match: erpSettingsCondition},
            {$group: {_id: null, totalReceipts: {$sum: "$amount"}}}],
        function (err, receipt) {
           if(err){
               retObj.messages.push("Please try again");
               callback(retObj);
           }else{
               retObj.status=true;
               if(receipt[0]){
                   retObj.totalReceipts=receipt[0].totalReceipts;
               }else{
                   retObj.totalReceipts=0;

               }
               callback(retObj);
           }
        });

};

Receipts.prototype.getReceiptsByParties=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
    getReceiptsByParties({$match: {}},callback);


};

function getReceiptsByParties(condition,callback) {
    var retObj={
        status:false,
        messages:[]
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
        {$group: {_id: "$partyId",amount: {$sum: "$amount"}}},

        function (err, receipts) {
        console.log(err)
            if(err){
                retObj.messages.push("Please try again");
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push("Success");
                retObj.data=receipts;
                callback(retObj);
            }
        });
}

module.exports = new Receipts();