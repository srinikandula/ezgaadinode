var express = require('express');
var AuthRouter = express.Router();

var Drivers = require('./../apis/drivers');

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.body, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/', function (req, res) {
    Drivers.getAllDrivers(function (result) {
        res.json(result);
    });
});
AuthRouter.get('/:driverId', function (req, res) {
    Drivers.findDriver(req.params.driverId, function (result) {
        res.send(result);
    });
});
AuthRouter.put('/', function (req, res) {
    Drivers.updateDriver(req.jwt, req.body, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:driverId', function (req, res) {
    Drivers.deleteDriver(req.params.driverId, function (result) {
        res.send(result);
    });
});
module.exports = {
    AuthRouter: AuthRouter
};