var express = require('express');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
//var mongoose = require('mongoose');
var cronjob = require('node-cron');


var OpenRouter = express.Router();
var AuthRouter = express.Router();


var API = require('../apis/jobApi');

AuthRouter.post('/addJob',multipartyMiddleware,function(req,res){
    API.addJob(req,function(result){
        res.json(result);
    });
});

AuthRouter.post('/updateJob',multipartyMiddleware,function(req,res){
    API.updateJob(req,function(result){
        res.json(result);
    });
});

AuthRouter.get('/getAllJobs',function(req,res){
    API.getAllJobs(req.jwt,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getJob/:id',function(req,res){
    API.getJob(req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.delete('/deleteJob/:id',function(req,res){
    API.deleteJob(req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.delete('/deleteImage',function(req,res){
    API.deleteImage(req,function(result){
        res.send(result);
    });
});

var task = cronjob.schedule('* * * * *', function() {
    API.sendReminder(function(result){
    });
});
task.start();

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};