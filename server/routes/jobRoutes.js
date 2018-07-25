var express = require('express');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
//var mongoose = require('mongoose');


var OpenRouter = express.Router();
var AuthRouter = express.Router();


var API = require('../apis/jobApi');

AuthRouter.post('/addJob',function(req,res){
    API.addJob(req,function(result){
        res.json(result);
    });
});

AuthRouter.put('/updateJob',function(req,res){
    API.updateJob(req,function(result){
        res.json(result);
    });
});

AuthRouter.get('/getAllJobs',function(req,res){
    API.getAllJobs(req.jwt,req.query,function(result){
        res.send(result);
    });
});

AuthRouter.get('/searchByDateRange',function(req,res){
    API.searchByDateRange(req.jwt,req.query,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getJob/:id',function(req,res){
    API.getJob(req.jwt,req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getRecords',function(req,res){
    API.getPreviousJobs(req.jwt,req.query,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getJobsForInventory',function(req,res){
    API.getJobsForInventory(req.jwt,req.query,function(result){
        res.send(result);
    });
});

AuthRouter.get('/total/count',function(req,res){
    API.getCount(req.jwt,req.query,function(result){
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
AuthRouter.get('/shareDetailsViaEmail',function(req,res){
    API.shareDetailsViaEmail(req.jwt,req.query,function(result){
        console.log("share details via email...",result);
        res.send(result);
    });
});



module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};