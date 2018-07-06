var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();
var cronjob = require('node-cron');


var API = require('../apis/reminderApi');

AuthRouter.post('/addReminder',function(req,res){
    API.addReminder(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/getAllReminders',function(req,res){
    API.getAllReminders(req.jwt,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getCount',function(req,res){
    API.getReminderCount(req.jwt,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getReminder/:id',function(req,res){
    API.getReminder(req.params.id,req.jwt,function(result){
        res.send(result);
    });
});
AuthRouter.put('/updateReminder',function(req,res){
    API.updateReminder(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.delete('/deleteReminder/:id',function(req,res){
    API.deleteReminder(req.params.id,function(result){
        res.json(result);
    });
});

AuthRouter.get('/sendReminders',function(req,res){
    API.sendReminder(function(result){
    });
});
var task = cronjob.schedule('* * 01 * *', function() {
    API.sendReminder(function(result){
    });
});
task.start();



module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};