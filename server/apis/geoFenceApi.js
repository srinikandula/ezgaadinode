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
        "coordinates" : [ geoLocation.geoLocation.lat,geoLocation.geoLocation.lng]
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

module.exports=new geoFences();

