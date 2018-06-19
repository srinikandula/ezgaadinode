var express = require('express');
//var mongoose = require('mongoose');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var API = require('../apis/inventoryApi');

AuthRouter.post('/addInventory',function(req,res){
    API.addInventory(req.jwt,req.body,function(result){
        res.json(result);
    });
});

AuthRouter.get('/get',function(req,res){
    API.getInventories(req.jwt,function(result){
        res.send(result);
    });
});

AuthRouter.delete('/delete/:id',function(req,res){
    API.deleteInventory(req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.get('/get/:id',function(req,res){
    API.getInventory(req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.put('/updateIventory',function(req,res){
    API.updateInventory(req.jwt,req.body,function(result){
        res.send(result);
    });
});


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};