/*Auther = Sai*/
var express = require('express');
var AuthRouter = express.Router();
var Devices = require('./../adminApis/deviceApis');

AuthRouter.post('/addDevices', function (req, res) {
    Devices.addDevices(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/deleteDevice/:deviceId', function (req, res) {
    Devices.deleteDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/assignDevice', function (req, res) {
    Devices.assignDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/transferDevices', function (req, res) {
    Devices.transferDevices(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/count', function (req, res) {
    Devices.count(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getDevices', function (req, res) {
    Devices.getDevices(req, function (result) {
        // console.log(result);
        res.json(result);
    });
});

AuthRouter.get('/getDevice/:deviceId', function (req, res) {
    Devices.getDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateDevice', function (req, res) {
    Devices.updateDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAllDevices', function (req, res) {
    Devices.getAllDevices(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addDevicePlan', function (req, res) {
    Devices.addDevicePlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/editDevicePlan', function (req, res) {
    Devices.editDevicePlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getDevicePlanHistory/:deviceId', function (req, res) {
    Devices.getDevicePlanHistory(req, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};