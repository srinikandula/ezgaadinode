var express = require('express');
var OpenRouter=express.Router();
var AuthRouter = express.Router();

var notifications = require('../apis/notifications');


AuthRouter.post('/saveDeviceDetails',function (req,res) {
    notifications.saveDeviceDetails(req.body,req,function (result) {
        res.json(result);
    })
});

OpenRouter.post('/sendPushNotifications',function (req,res) {
    notifications.sendPushNotifications(req.body,function (result) {
        res.json(result);
    })
});

AuthRouter.get('/getPushNotifications',function (req,res) {
    notifications.getPushNotifications(req,function (result) {
        res.json(result);
    })
})

module.exports = {
    OpenRouter:OpenRouter,
    AuthRouter: AuthRouter
};