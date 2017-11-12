var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('../apis/accountsApi');
var logger = require('./../winston/logger')(module);

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

AuthRouter.get('/accounts/fetchAllAccounts', function (req, res) {
    Accounts.getAllAccounts(function (result) {
        res.json(result);
    });
});

AuthRouter.get('/accounts/:accountId', function (req, res) {
    Accounts.getAccountDetails(req.params.accountId, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/accounts/update', function (req, res) {
    Accounts.updateAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};