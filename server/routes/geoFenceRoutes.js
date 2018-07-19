var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var API = require('../apis/geoFenceApi');


AuthRouter.post('/addGeoFence',function(req,res){
    API.addgeoFence(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.put('/updateGeoFence',function(req,res){
    API.updategeoFence(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/getGeoFences',function(req,res){
    API.getGeoFences(req.jwt,function(result){
        res.send(result);
    });
});
AuthRouter.delete('/deleteGeoFence/:id',function(req,res){
    API.deleteGeoFence(req.jwt,req.params.id,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getGeoFence/:id',function(req,res){
    API.getGeoFence(req.jwt,req.params.id,function(result){
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};