
var UnloadingColl = require('./../models/schemas').unloadingPointsColl;


var unloading=function(){};
unloading.prototype.addUnloadingPoint = function (jwt,unloadingPoints, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    UnloadingColl.find({"unloadingPoint":unloadingPoints.unloadingPoint},function(err,unloadingPoint){
        if(err){
            retObj.messages.push("error while comparing Unloading Points");
            callback(retObj);
        } else if(unloadingPoint && unloadingPoint.length>0){
            retObj.messages.push("unloading Point already exist");
            callback(retObj);
        }
        else{
            unloadingPoints.accountId=jwt.accountId;
            unloadingPoints.createdBy=jwt.id;
            var  unloadingDoc = new UnloadingColl(unloadingPoints);
            unloadingDoc.save(unloadingPoint, function (err, newDoc) {
                if (err) {
                    retObj.messages.push('error while adding Unloading point');
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.unloadingPoints=newDoc;
                    callback(retObj);
                }
            });
        }
    })

}
unloading.prototype.getAll = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
   var accountId=jwt.accountId;
    var query={
        "accountId":jwt.accountId
    }
    UnloadingColl.find(query, function (err, unloadingPoints) {
        if (err) {
            retObj.messages.push('error while getting UnLoading point');
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.unloadingPoints=unloadingPoints;
            callback(retObj);
        }
    });
}

module.exports = new unloading();