var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Party = require('./../apis/partyApis');

AuthRouter.post('/addParty', function (req, res) {
    Party.addParty(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:partyId', function (req, res) {
    Party.findParty(req.jwt, req.params.partyId, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updateParty', function (req, res) {
    Party.updateParty(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountParties', function (req, res) {
    Party.getAccountParties(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/all', function (req, res) {
    Party.getAllParties(function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:partyId', function (req, res) {
    Party.deleteParty(req.jwt, req.params.partyId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/total/count', function (req, res) {
    Party.countParty(req.jwt, function (result) {
        res.send(result);
    });
});


AuthRouter.get('/tripsPayments/:partyId', function (req, res) {
    Party.findTripsAndPaymentsForParty(req.jwt, req.params.partyId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/vehiclePayments/:vehicleId', function (req, res) {
    Party.findTripsAndPaymentsForVehicle(req.jwt, req.params.vehicleId, function (result) {
        res.send(result);
    });
});


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
