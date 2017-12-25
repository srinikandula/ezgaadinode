var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('../apis/accountsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.post('/accounts/add', function (req, res) {
    Accounts.addAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/accounts/fetch', function (req, res) {
    Accounts.getAccounts(req.jwt, req.query, function (result) {
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

AuthRouter.put('/accounts/update', function (req, res) {
    Accounts.updateAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/accounts/total/count',function(req,res){
    Accounts.countAccounts(req.jwt,function(result){
        res.send(result);
    });
});

AuthRouter.get('/erpDashboard', function (req, res) {
    Accounts.erpDashBoardContent(req.jwt, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/userProfile', function (req, res) {
    Accounts.userProfile(req.jwt, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};

