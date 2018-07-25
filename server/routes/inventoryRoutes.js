var express = require('express');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
//var mongoose = require('mongoose');


var OpenRouter = express.Router();
var AuthRouter = express.Router();


var API = require('../apis/inventoryApi');

AuthRouter.post('/addInventory',function(req,res){
    API.addInventory(req,function(result){
        res.json(result);
    });
});

AuthRouter.get('/get',function(req,res){
    API.getInventories(req.jwt,req.query,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getCount',function(req,res){
    API.getCount(req.jwt,function(result){
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

AuthRouter.put('/updateInventory',function(req,res){
    API.updateInventory(req,function(result){
        res.send(result);
    });
});

AuthRouter.delete('/deleteImage',function(req,res){
    API.deleteImage(req,function(result){
        res.send(result);
    });
});
AuthRouter.get('/shareDetailsViaEmail',function(req,res){
    API.shareDetailsViaEmail(req.jwt,req.query,function(result){
        res.send(result);
    });
});




module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};