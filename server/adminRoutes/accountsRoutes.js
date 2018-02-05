var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('../adminApis/accountsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/totalAccounts', function (req, res) {
    Accounts.totalAccounts(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAccounts', function (req, res) {
    Accounts.getAccounts(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addAccount', function (req, res) {
    Accounts.addAccount(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAccountDetails', function (req, res) {
    Accounts.getAccountDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateAccount', function (req, res) {
    Accounts.updateAccount(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteAccount', function (req, res) {
    Accounts.deleteAccount(req, function (result) {
        res.send(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};