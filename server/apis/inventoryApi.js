var InventoryCollection = require('./../models/schemas').InventoryCollection;
var Utils = require('../apis/utils');
var _ = require('underscore');


var Inventories = function () {
};



function updateInventory(jwt,info,callback){

};

Inventories.prototype.addInventory = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var jwt=req.jwt;
    var info = req.body;
    info.accountId = jwt.accountId;
    info.createdBy = jwt.id;
    if (!info.name || !_.isString(info.name)) {
        retObj.messages.push('Invalid inventory name');
    }
    if(!info.partyId){
        retObj.messages.push('Invalid supplier name');
    }
    if (info.mode === 'Cash' && (!info.amount || _.isNaN(info.amount))) {
        retObj.messages.push("Please provide Total Expense Amount");
    }
    if (info.mode === 'Credit' && (!info.totalAmount || _.isNaN(info.totalAmount))) {
        retObj.messages.push("Please enter Total Expense Amount");
    }
    if(retObj.messages.length > 0){
        callback(retObj);
    }else{
        var inventoryDoc = new InventoryCollection(info);
        inventoryDoc.save(function (err,result) {
            if(err){
                retObj.status=false;
                retObj.messages.push("error in saving"+JSON.stringify(err));
                callback(retObj);
            } else{
                retObj.status=true;
                retObj.messages.push("saved successfully");
                callback(retObj);
            }
        });
    }
};


Inventories.prototype.updateInventory = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var info = req.body;
    InventoryCollection.findOneAndUpdate({_id:info._id},{$set:info},function(err,inventory){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while updating record"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfully updated");
            retObj.data=inventory;
            callback(retObj);
        }
    });
};
Inventories.prototype.getInventories = function(jwt,query,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(query.truckName){
        condition = {accountId:jwt.accountId,vehicle:query.truckName};
    }else if(query.inventory){
        condition = {accountId:jwt.accountId,name:query.inventory};
    }else{
        condition = {accountId:jwt.accountId};
    }
    InventoryCollection.find(condition).populate({path:"partyId",select:'name'}).lean().exec(function(err,inventories){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = inventories;
            callback(retObj);
        }
    });

};

Inventories.prototype.deleteInventory = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    InventoryCollection.remove(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while deleting"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfully deleted");
            retObj.data=result;
            callback(retObj);
        }
    });
};

Inventories.prototype.getInventory = function(id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    InventoryCollection.findOne(query).populate({path:"partyId"}).exec(function(err,inventory){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while fetching record"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfully fectched record");
            retObj.data=inventory;
            callback(retObj);
        }
    });
};

Inventories.prototype.deleteImage = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Utils.deleteS3BucketFile(req.query.key, function (resp) {
        if (resp.status) {
                InventoryCollection.update(
                    {"_id": req.query.inventoryId},
                    {"$pull": {"attachments": {"_id": req.query.inventoryId}}},
                    {safe: true},
                    function (err, numAffected) {
                        if (err) {
                            retObj.messages.push("Please try again, " + err.message);
                            callback(retObj);
                        } else if (numAffected) {
                            retObj.status = true;
                            retObj.messages.push(" image deleted successfully");
                            callback(retObj);
                        } else {
                            retObj.messages.push("image not deleted");
                            callback(retObj);
                        }
                    }
                );
            } else {
                callback(resp);
            }
        })
};


module.exports=new Inventories();

