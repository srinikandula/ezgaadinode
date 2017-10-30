var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var Drivers = require('./../apis/drivers');

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/:pageNumber', function(req, res) {
    Drivers.getDriverByPageNumber(req.params.pageNumber, function(result){
        res.json(result);
    });
});

AuthRouter.get('/get/:driverId', function(req, res) {
    Drivers.getDriverDetails(req.params.driverId, function(result){
        res.json(result);
    });
});

AuthRouter.put('/', function(req, res) {
    Drivers.updateDriver(req.jwt, req.body, function(result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter:OpenRouter
};