var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Users = require('./../modules/users');

OpenRouter.post('/signup', function (req, res) {
    Users.signup(req.body, function (result) {
        res.json(result);
    });
});

OpenRouter.post('/login', function (req, res) {
    Users.login(req.body.userName, req.body.accountName, req.body.password, function (result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
