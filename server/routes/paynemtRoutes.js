var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var payments = require('./../apis/paymentApi');

AuthRouter.put('/', function (req, res) {
    console.log('req.jwt',req.jwt);
    payments.addPayment(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:tripId', function (req, res) {
    payments.getPaymentsOfTrip(req.jwt.accountId, req.params.tripId, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};