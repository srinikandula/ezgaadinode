var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();

var loading = require('../apis/loadingApi');

AuthRouter.post('/addLoadingPoint', function (req, res) {
    loading.addLoadingPoint(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/getAll',function(req,res){
    loading.getAll(req.jwt,req,function(result){
    res.json(result);
    })
});
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};