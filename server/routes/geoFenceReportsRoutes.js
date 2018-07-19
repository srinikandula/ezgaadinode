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


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};