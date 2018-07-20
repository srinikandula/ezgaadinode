var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var API = require('../apis/geoFenceReportApi');


AuthRouter.get('/getGroFenceReports',function(req,res){
    API.getGeoFenceReportsByAcc(req,function(result){
        res.json(result);
    });
});
AuthRouter.get('/count',function(req,res){
    API.count(req,function(result){
        res.json(result);
    });
});

//
//var geoFencingReport = cronjob.schedule('0 */45 * * * *', function() {      //runs every 45 minutes
//    API.startGeoFencesReportsJob(function (result) {
//        console.log("Ran Geo fencing job");
//    });
//});
//geoFencingReport.start();

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};