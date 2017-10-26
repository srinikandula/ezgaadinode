var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trips = require('./../apis/trips');

AuthRouter.post('/addTrip', function (req, res) {
    Trips.addTrip(req.jwt.id, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAll', function (req, res) {
    Trips.getAll(req.jwt.id, req.body, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
