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

AuthRouter.post('/addLoadNtfn', function (req, res) {
    Notifications.addLoadNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadNtfn', function (req, res) {
    Notifications.getLoadNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadNtfnDetails', function (req, res) {
    Notifications.getLoadNtfnDetails(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateLoadNtfn', function (req, res) {
    Notifications.updateLoadNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteLoadNtfn', function (req, res) {
    Notifications.deleteLoadNtfn(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/countOfLoadNtfns', function (req, res) {
    Notifications.countOfLoadNtfns(req, function (result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter
};
