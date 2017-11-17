var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var PaymentsReceived = require('./../apis/paymentsReceivedApi');

AuthRouter.post('/addPayments', function (req, res) {
    PaymentsReceived.addPayments(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    PaymentsReceived.getAllAccountPayments(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updatePayments', function (req, res) {
    PaymentsReceived.updatePayment(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getPaymentsRecord/:paymentsId', function (req, res) {
    console.log(req);
    PaymentsReceived.findPaymentsReceived(req.jwt,req.params.paymentsId, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:id', function (req, res) {
    PaymentsReceived.deletePaymentsRecord(req.jwt, req.params.id, function (result) {
        res.send(result);mtwlabs@321

    });
});

AuthRouter.get('/countPayments', function (req, res) {
    PaymentsReceived.countPayments(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getPayments', function (req, res) {
    PaymentsReceived.getPayments(req.params, req.jwt, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};