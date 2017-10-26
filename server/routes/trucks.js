var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trucks = require('./../apis/trucks');

AuthRouter.post('/addTruck', function (req, res) {
    Trucks.addTruck(req.jwt.id, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/updateTruck', function (req, res) {
    Trucks.updateTruck(req.jwt.id, req.body.details, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAccountTrucks', function (req, res) {
    Trucks.getAccountTrucks(req.jwt.id, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/deleteTruck/:id', function (req, res) {
    Trucks.deleteTruck(req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
