var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var ExpenseMaster = require('./../apis/expenseMasterApi');

AuthRouter.post('/', function (req, res) {
    ExpenseMaster.addExpenseType(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    ExpenseMaster.getAllAccountExpenses(req.jwt, req.query, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getExpense/:id', function (req, res) {
    ExpenseMaster.getExpenseType(req.jwt, req.params.id, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/', function (req, res) {
    ExpenseMaster.updateExpenseType(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:id', function (req, res) {
    ExpenseMaster.deleteExpenseType(req.jwt, req.params.id, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/count', function (req, res) {
    ExpenseMaster.count(req.jwt, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};