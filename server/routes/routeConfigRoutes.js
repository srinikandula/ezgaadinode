var express = require('express');
//var mongoose = require('mongoose');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var routeConfigAPI = require('../apis/routeConfigApi');
var AccountServices=require('./../apis/accountsApi');

AuthRouter.post('/',function(req,res){
    // console.log('req.body',req.body);
    routeConfigAPI.addRouteConfig(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/get',function(req,res){
    routeConfigAPI.getRouteConfigs(req.jwt,req,function(result){
        res.send(result);
    });
});
AuthRouter.delete('/:Id',function(req,res){
    routeConfigAPI.deleteRouteConfigs(req.params.Id,function(result){
        console.log("Id...",req.params.Id);
        res.send(result);
    });
});
AuthRouter.get('/getRouteConfig/:id',function(req,res){
    routeConfigAPI.getRouteConfig(req.params.id,req,function(result){
        res.send(result);
    });
});
AuthRouter.put('/', function (req, res) {
    routeConfigAPI.updateRouteConfig(req.body,req , function (result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};