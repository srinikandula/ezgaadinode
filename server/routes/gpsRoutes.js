var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var gps = require('../apis/gpsApi');
var devices = require('../apis/devicesApi');

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
AuthRouter.get('/getDevices',function (req,res) {
    devices.getDevices(function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addDevice',function (req,res) {
    devices.addDevice(req.jwt,req.body,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/gpsTrackingByMapView',function (req,res) {
   gps.gpsTrackingByMapView(req.jwt,function (result) {
       res.send(result);
   }) ;
});

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};