var analyticsColl=require('./../models/schemas').analyticsColl;
var service = function () {
};

service.prototype.create = function(req, systemAction, attrs, callback){
    var analytics = {};
    var retObj={};
    analytics.remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    analytics.userAgent = req.headers['user-agent'];
    analytics.action=systemAction;
    analytics.attrs=attrs;
    var analyticsData=new analyticsColl(analytics);
    analyticsData.save(analytics,function(err){
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Saved data successfully';
            callback(retObj);
        }
    })
};

service.prototype.getAnalytics = function (callback) {
    var retObj={};
    analyticsColl.find({},function (err,data) {
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Saved data successfully';
            retObj.results=data;
            console.log(data);
            callback(retObj);
        }
    })
};

module.exports= new service();