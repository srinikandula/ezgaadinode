var _ = require('underscore');
var async = require('async');
var devicePostions = require('./../models/schemas').GpsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var GeoFencesReportsColl = require('./../models/schemas').GeoFencesReportsColl;
var GeoFenceColl = require('./../models/schemas').GeoFenceColl;

var geoFencesReports = function () {
};

geoFencesReports.prototype.getGeoFenceReportsByAcc = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    var condition={accountId:req.jwt.accountId};
    if (params.fromDate) {
        condition.start={$gte:new Date(params.fromDate)};
    };
    if (params.toDate) {
        var endDate = new Date(params.toDate);
        endDate.setDate(endDate.getDate()+1);
        condition.end={$lte:endDate};
    };
    if(params.registrationNo){
        condition.registrationNo = params.registrationNo;
    };
    GeoFencesReportsColl.find(condition).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .lean()
        .exec(function (err, reports) {
            if(err){
                retObj.messages.push("internal server error,"+JSON.stringify(err.message));
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.data=reports;
                callback(retObj);
            }
        });
};
geoFencesReports.prototype.count=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    var condition={accountId:req.jwt.accountId};
    if (req.query.fromDate && req.query.toDate) {
        condition.start={$gte:new Date(req.query.fromDate)};
        condition.end={$lte:new Date(req.query.toDate)};
    };
    if(req.query.registrationNo){
        condition.registrationNo = req.query.registrationNo;
    };
    GeoFencesReportsColl.count(condition,function (err,count) {
        if(err){
            retObj.messages.push("Internal server error," + JSON.stringify(err.message));
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Success");
            retObj.data=count;
            callback(retObj);
        }
    })
};
module.exports = new geoFencesReports();


//findingRouteConfigEnabledAccounts()//start Job
//runGeoFencingReport()