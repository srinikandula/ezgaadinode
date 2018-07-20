var GeoFenceCollection = require('./../models/schemas').GeoFenceColl;

var geoFences = function () {
};

geoFences.prototype.addgeoFence = function(jwt,geoLocation,callback){
    var retObj={
        status:false,
        messages:[],
        errors:[]
    };
    geoLocation.accountId = jwt.accountId;
    geoLocation.geoLocation= {
        "coordinates" :[
            17.4169860328715,
            78.4581752114258
        ]
    };
    var insertDoc = new GeoFenceCollection(geoLocation);
        insertDoc.save(function(err,result){
            if(err){
                retObj.status=false;
                retObj.messages.push("error in saving"+JSON.stringify(err));
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push("Saved successfully");
                retObj.data=result;
                callback(retObj);
            }
        });

};

geoFences.prototype.updategeoFence = function(jwt,geoLocation,callback){
    var retObj={
        status:false,
        messages:[],
        errors:[]
    };

    GeoFenceCollection.findOneAndUpdate({_id:geoLocation._id},{$set:geoLocation},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error in saving"+JSON.stringify(err));
            callback(retObj);
        }else {
            retObj.status = true;
            retObj.messages.push("Updated successfully");
            retObj.data = result;
            callback(retObj);
        }
        });
};

geoFences.prototype.getGeoFences = function(jwt,callback){
    var retObj={
        status:false,
        messages:[],
        errors:[]
    };
    GeoFenceCollection.find({accountId:jwt.accountId},function(err,geoFences){
        if(err){
            retObj.status=false;
            retObj.messages.push("error in saving"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=geoFences;
            callback(retObj);
        }
    });

};
geoFences.prototype.deleteGeoFence = function(jwt,id,callback){
    var retObj={
        status:false,
        messages:[],
        errors:[]
    };
    GeoFenceCollection.remove({_id:id},function(err,result){
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
geoFences.prototype.getGeoFence = function(jwt,id,callback){
    var retObj={
        status:false,
        messages:[]
    };
    var query = {_id:id};
    GeoFenceCollection.findOne({_id:id},function(err,geoFence){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while fetching record"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("successfully fectched record");
            retObj.data=geoFence;
            callback(retObj);
        }
    });
};

module.exports=new geoFences();

