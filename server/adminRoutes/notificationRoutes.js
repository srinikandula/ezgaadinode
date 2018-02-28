var express = require('express');
var AuthRouter = express.Router();
var Notifications = require('../adminApis/notificationsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/getNotifications', function (req, res) {
    Notifications.getNotifications(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/totalNumOfNotifications', function (req, res) {
    Notifications.totalNumOfNotifications(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addGpsTruckNtfn', function (req, res) {
    Notifications.addGpsTruckNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getGpsTruckNtfn', function (req, res) {
    Notifications.getGpsTruckNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getGpsTruckNtfnDetails', function (req, res) {
    Notifications.getGpsTruckNtfnDetails(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateGpsTruckNtfn', function (req, res) {
    Notifications.updateGpsTruckNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteTruckNtfn', function (req, res) {
    Notifications.deleteTruckNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/countOfTruckNtfns', function (req, res) {
    Notifications.countOfTruckNtfns(req, function (result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter
};
