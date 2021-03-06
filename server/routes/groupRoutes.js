var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Groups = require('../apis/loginApi');


OpenRouter.post('/login', function (req, res) {
    Groups.login(req.body.userName, req.body.password, req.body.contactPhone,req, function (result) {
        res.json(result);
    });
});

OpenRouter.post('/forgot-password',function(req,res){
    Groups.forgotPassword(req.body.contactPhone,req,function(result){
        res.send(result);
    })
});

OpenRouter.post('/verify-otp',function(req,res){
    Groups.verifyOtp(req.body,req,function(result){
        res.send(result);
    })
});


OpenRouter.post('/reset-password',function(req,res){
    Groups.resetPasword(req.body,req,function(result){
        res.send(result);
    })
});

module.exports = {
    OpenRouter: OpenRouter
};