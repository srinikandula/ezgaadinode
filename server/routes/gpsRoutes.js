var express = require('express');
var cronjob = require('node-cron');
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
    gps.addSecret(req.body.secret, req.body.email, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllSecrets', function (req, res) {
    gps.getAllSecrets(function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getDevices', function (req, res) {
    devices.getDevices(function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addDevice', function (req, res) {
    devices.addDevice(req.jwt, req.body, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/gpsTrackingByMapView', function (req, res) {
    gps.gpsTrackingByMapView(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/addInitialCounters',function (req,res) {
    gps.addInitialCounters(function (result) {
        res.send(result);
    }) ;
});

AuthRouter.get('/getDeviceTrucks',function (req,res) {
    gps.getDeviceTrucks(req,function (results) {
        res.send(results);
    })
});

OpenRouter.get('/findDeviceStatus/:deviceId',function (req,res) {
    gps.findDeviceStatus(req.params.deviceId,req,function (results) {
        res.send(results);
    })
});

OpenRouter.get('/gpsTrackingByTruck/:truckId/:startDate/:endDate',function (req,res) {
    gps.gpsTrackingByTruck(req.params.truckId,req.params.startDate,req.params.endDate,req,function (results) {
        res.send(results);
    })
});

/*OpenRouter.get('/moveDevicePositions', function (rew, res) {
    gps.moveDevicePositions(function (result) {
        res.send(result);
    });
});*/

var job = cronjob.schedule('0 0 0 * * *', function() {      //runs everyday midnight at 12AM.
    gps.moveDevicePositions(function (result) {
        console.log(result.messages[0]);
    });
    gps.addInitialCounters(function (result) {
        console.log(result.messages[0]);
    });
});
job.start();

/*gps.moveDevicePositions(function (result) {
    res.send(result);
});*/

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};