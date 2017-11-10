var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var PaymentsReceived = require('./../apis/paymentsReceivedApi');

AuthRouter.post('/addPayment', function (req, res) {
    PaymentsReceived.addPayment(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountPayments', function (req, res) {
    PaymentsReceived.getAllAccountPayments(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updatePayment', function (req, res) {
    PaymentsReceived.updatePayment(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/deletePayment/:id', function (req, res) {
    PaymentsReceived.deletePayment(req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};