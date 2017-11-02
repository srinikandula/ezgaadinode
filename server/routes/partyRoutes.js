var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Party = require('./../apis/partyApis');

AuthRouter.post('/', function (req, res) {
    Party.add(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:partyId', function (req, res) {
    Party.findParty(req.jwt, req.params.partyId, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/', function (req, res) {
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

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
