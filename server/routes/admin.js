var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('./../modules/accounts');

AuthRouter.post('/accounts/add', function (req, res) {
    Accounts.addAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/accounts/fetch/:pageNum', function (req, res) {
    Accounts.getAccounts(req.params.pageNum, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/accounts/:accountId', function (req, res) {
    Accounts.getAccountDetails(req.params.accountId, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/accounts/update', function (req, res) {
    Accounts.updateAccount(req.body, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};