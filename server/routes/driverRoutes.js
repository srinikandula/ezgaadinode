var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var Drivers = require('../apis/driversApi');


AuthRouter.get('/getAllDriversForFilter', function (req, res) {
    Drivers.getAllDriversForFilter(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/get/:driverId', function (req, res) {
    Drivers.getDriverDetails(req.jwt, req.params.driverId, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/', function (req, res) {
    Drivers.updateDriver(req.jwt, req.body, function (result) {
        res.json(result);
    });
});



AuthRouter.get('/account/drivers', function (req, res) {
    Drivers.getDrivers(req.jwt, req.query, function (result) {
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
AuthRouter.get('/total/count',function(req,res){
    Drivers.countDrivers(req.jwt,function(result){
        res.send(result);
    });
});
module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};