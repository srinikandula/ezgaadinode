var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trucks = require('./../apis/trucks');

AuthRouter.post('/', function (req, res) {
    Trucks.addTruck(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:truckId', function (req, res) {
    Trucks.findTruck(req.jwt, req.params.truckId, function (result) {
        res.send(result);
    });
});
AuthRouter.put('/', function (req, res) {
    Trucks.updateTruck(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountTrucks', function (req, res) {
    Trucks.getAccountTrucks(req.jwt.accountId, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:truckId', function (req, res) {
    Trucks.deleteTruck(req.params.truckId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    Trucks.getAllTrucks(function (result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
