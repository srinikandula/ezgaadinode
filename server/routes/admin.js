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
AuthRouter.put('/accounts/newUpdate', function (req, res) {
    Accounts.updateNewAccount(req.jwt, req.body, function (result) {
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

AuthRouter.post('/addAccountGroup', function (req, res) {
    Accounts.addAccountGroup(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/countAccountGroups',function(req,res){
    Accounts.countAccountGroups(req.jwt,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountGroup', function (req, res) {
    Accounts.getAllAccountGroup(req.jwt,req.query,function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAccountGroup/:accountGroupId', function (req, res) {
    Accounts.getAccountGroup(req.params.accountGroupId, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateAccountGroup', function (req, res) {
    Accounts.updateAccountGroup(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/uploadUserProfilePic', function (req, res) {
    Accounts.uploadUserProfilePic(req.jwt.accountId, req.body, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getErpSettings', function (req, res) {
    Accounts.getErpSettings(req.jwt, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateErpSettings', function (req, res) {
    Accounts.updateErpSettings(req.body, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};

