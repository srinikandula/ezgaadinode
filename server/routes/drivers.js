var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var Drivers = require('../apis/driversApi');

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/:pageNumber', function (req, res) {
    Drivers.getDriverByPageNumber(req.params.pageNumber, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/get/:driverId', function (req, res) {
    Drivers.getDriverDetails(req.params.driverId, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/', function (req, res) {
    Drivers.updateDriver(req.jwt, req.body, function (result) {
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
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};