var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var API = require('../apis/geoFenceApi');


AuthRouter.post('/addGeoFence',function(req,res){
    API.addgeoFence(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/getGeoFences',function(req,res){
    API.getGeoFences(req.jwt,function(result){
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};