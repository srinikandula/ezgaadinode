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

module.exports = {
    AuthRouter: AuthRouter
};
