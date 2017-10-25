var express = require('express');
var AuthRouter = express.Router();
var Accounts = require('./../modules/accounts');

AuthRouter.post('/accounts/add', function (req, res) {
    Accounts.addAccount(req.jwt, req.body, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};