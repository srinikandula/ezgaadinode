var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var gps = require('../apis/gpsApi');

OpenRouter.get('/AddDevicePositions', function (req, res) {
    gps.AddDevicePositions(req.query, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/addSecret', function (req, res) {
    gps.addSecret(req.body.secret, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllSecrets', function (req, res) {
    gps.getAllSecrets(function (result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};