var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('./../apis/accounts');
var logger = require('./../winston/logger')(module);

var logger = require('../winston/logger')(module);

AuthRouter.post('/accounts/add', function (req, res) {
    Accounts.addAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/accounts/fetch/:pageNum', function (req, res) {
    logger.log({'level':'debug', 'message':'finding account for page'});

    Accounts.getAccounts(req.params.pageNum, function (result) {
        logger.log({
            level: 'error',
            message: "lhadlhwalhdlw"
        });

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