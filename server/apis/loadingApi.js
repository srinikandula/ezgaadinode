var LoadingColl = require('./../models/schemas').loadingPointsColl;

var loading=function(){};
loading.prototype.addLoadingPoint = function (jwt,loadingPoints, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    LoadingColl.find({"loadingPoint":loadingPoints.loadingPoint,"accountId":jwt.accountId},function(err,loadingPoint){
        if(err){
            retObj.messages.push("error while comparing Loading Points");
            callback(retObj);
        } else if(loadingPoint && loadingPoint.length>0){
            retObj.messages.push("Loading Point already exist");
            callback(retObj);
        }
        else{

            loadingPoints.accountId=jwt.accountId;
            loadingPoints.createdBy=jwt.id;
            var loadingDoc = new LoadingColl(loadingPoints);
            loadingDoc.save(loadingPoint, function (err, newDoc) {
                if (err) {
                    retObj.messages.push('error while adding Loading point');
                    callback(retObj);
                }else{
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.loadingPoint=newDoc;
                    callback(retObj);
                }
            });
        }

});
}
loading.prototype.getAll=function(jwt,req,callback){
    var retObj = {
        status: false,
        messages: []
    };
    LoadingColl.find({"accountId":jwt.accountId},function(err,result){
        if(err){
            retObj.status=false;
            retObj.messages.push("error while getting the data");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("success");
            retObj.data=result;
            callback(retObj);
        }
    })
}

module.exports = new loading();