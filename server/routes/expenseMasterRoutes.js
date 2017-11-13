var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var ExpenseMaster = require('./../apis/expenseMasterApi');

AuthRouter.post('/', function (req, res) {
    ExpenseMaster.addExpense(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    ExpenseMaster.getAllAccountExpenses(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/', function (req, res) {
    ExpenseMaster.updateExpense(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:id', function (req, res) {
    ExpenseMaster.deleteExpense(req.jwt, req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};