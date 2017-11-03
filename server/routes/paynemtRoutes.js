var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var payments = require('./../apis/paymentApi');

AuthRouter.put('/', function (req, res) {
    payments.addPayment(req.jwt.accountId, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:tripId', function (req, res) {
    payments.getPaymentsOfTrip(req.params.tripId, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};