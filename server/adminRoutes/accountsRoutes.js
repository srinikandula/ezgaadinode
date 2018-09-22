var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();
var Accounts = require('../adminApis/accountsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/count/:type', function (req, res) {
    Accounts.totalAccounts(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAccounts', function (req, res) {
    Accounts.getAccounts(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/checkAvailablity', function (req, res) {
    Accounts.checkAvailablity(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/deleteRoute/:id', function (req, res) {
    Accounts.deleteRoute(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addAccount', function (req, res) {
    Accounts.addAccount(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAccountDetails/:accountId', function (req, res) {
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

AuthRouter.post('/assignPlan', function (req, res) {
    Accounts.assignPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/createKeyPair/:accountId/:globalAccess',function (req,res) {
    Accounts.createKeys(req.params.accountId,req.params.globalAccess,req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getKeyPairsForAccount/:accountId',function (req,res) {
    Accounts.getKeyPairsForAccount(req.params.accountId,req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteKeyPair/:id/:accountId',function (req,res) {
    Accounts.deleteKeyPair(req.params.id,req.params.accountId,req,function (result) {
        res.send(result);
    })
})

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter:OpenRouter
};