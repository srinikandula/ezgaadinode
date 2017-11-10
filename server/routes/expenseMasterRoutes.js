var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var ExpenseMaster = require('./../apis/expenseMasterApi');

AuthRouter.post('/addExpense', function (req, res) {
    ExpenseMaster.addExpense(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllExpenses', function (req, res) {
    ExpenseMaster.getAllExpenses(function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updateExpense', function (req, res) {
    ExpenseMaster.updateExpense(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/deleteExpense/:id', function (req, res) {
    ExpenseMaster.deleteExpense(req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};