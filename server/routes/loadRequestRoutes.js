var express = require('express');

var AuthRouter = express.Router();

var loadRequestAPI = require('../apis/loadRequestApi');

AuthRouter.post('/add',function(req,res){
    loadRequestAPI.addLoadRequest(req.jwt,req.body,function(result){
        res.json(result);
    });
});

AuthRouter.get('/getLoadRequests',function(req,res){
    loadRequestAPI.getLoadRequests(req.jwt,req,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getLoadRequest/:id',function(req,res){
    loadRequestAPI.getLoadRequest(req.params.id,req,function(result){
        res.send(result);
    });
});
AuthRouter.put('/updateLoadRequest',function(req,res){
    loadRequestAPI.updateLoadRequest(req.body,req,function(result){
        res.json(result);
    });
});
AuthRouter.delete('/deleteLoadRequest/:id',function(req,res){
    loadRequestAPI.deleteLoadRequest(req.params.id,function(result){
        res.json(result);
    });
});
AuthRouter.get('/shareDetails/:id', function (req, res) {
    loadRequestAPI.shareLoadRequest(req.params.id,req.query.parties, function (result) {
        res.send(result);
    })
});



module.exports = {
    AuthRouter:AuthRouter
};
