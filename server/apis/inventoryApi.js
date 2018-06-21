var InventoryCollection = require('./../models/schemas').InventoryCollection;


var Inventories = function () {
};

Inventories.prototype.addInventory = function(jwt,info,req,callback){
    var retObj = {
      status:false,
      messages:[]
    };

    info.accountId = jwt.id;

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

};

Inventories.prototype.getInventories = function(jwt,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    InventoryCollection.find({accountId:jwt.id},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting data"+JSON.stringify(err));
            callback(retObj);
        } else{
            retObj.status=true;
            retObj.messages.push("records fetched successfully");
            retObj.data = result;
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
            retObj.messages.push("error while deleting load request"+JSON.stringify(err));
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

Inventories.prototype.updateInventory = function(jwt,info,callback){
    var retObj={
        status:false,
        messages:[]
    };
    InventoryCollection.findOneAndUpdate({_id:info._id},{$set:{name:info.name,id:info.id,date:info.date}},function(err,inventory){
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

module.exports=new Inventories();

