/*Auther = Sai*/
var express = require('express');
var AuthRouter = express.Router();
var Devices = require('./../adminApis/deviceApis');

AuthRouter.post('/addDevice', function (req, res) {
    Devices.addDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/transferDevice', function (req, res) {
    Devices.transferDevice(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getDevices', function (req, res) {
    Devices.getDevices(req, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};