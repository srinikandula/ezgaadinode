var analyticsColl=require('./../models/schemas').analyticsColl;
var UAParser = require('ua-parser-js');
var parser = new UAParser();
var service = function () {
};

service.prototype.create = function(req, systemAction, attrs, callback){
    var analytics = {};
    var retObj={};
    analytics.remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    analytics.userAgent = req.headers['user-agent'];
    var keys=Object.keys(req);
    if(keys.indexOf("headers")!==-1&&Object.keys(req.headers).indexOf('user-agent')!==-1){
        analytics.userAgentJSON=parser.setUA(req.headers['user-agent']).getResult();
    }
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

service.prototype.getLoginCounts = function (from,to,callback) {
    var retObj={};
    analyticsColl.find({action:'LG_IN',createdAt:{$gte:from,$lte:to}}).distinct("attrs.accountId").populate('attrs.accountId').exec(function(err, docs) {
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Success';
            retObj.results=docs.length;
            callback(retObj);
        }
    });
};

service.prototype.getReports = function (action,from,to,callback) {
    var retObj={};
    console.log(action);
    analyticsColl.find({action:action,createdAt:{$gte:from,$lte:to}}).populate('attrs.accountId').exec(function (err,docs) {
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Success';
            retObj.results=docs;
            callback(retObj);
        }
    });
};

service.prototype.getCounts = function (action,from,to,callback) {
    var retObj={};
    analyticsColl.find({action:action,createdAt:{$gte:from,$lte:to}},function (err,docs) {
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Success';
            retObj.results=docs.length;
            callback(retObj);
        }
    });
};

service.prototype.getReportsByUserAgent = function (userAgent,from,to,callback) {
    var retObj={};
    analyticsColl.find({"userAgentJSON.os.name":userAgent,createdAt:{$gte:from,$lte:to}}).populate('attrs.accountId').exec(function (err,docs) {
        if(err){
            retObj.status=false;
            retObj.message='Error while saving analytics data';
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message='Success';
            retObj.results=docs;
            callback(retObj);
        }
    });
}

// service.prototype.

module.exports= new service();