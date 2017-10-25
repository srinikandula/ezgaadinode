var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Users = require('./../modules/users');

OpenRouter.post('/adduser', function (req, res) {
    Users.adduser(req.body, function (result) {
        res.send(result);
    });
});

OpenRouter.post('/login', function (req, res) {
    Users.login(req.body.userName, req.body.accountName, req.body.password, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/update', function (req, res) {
    Users.update(req.jwt.id, req.body.details, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAccountUsers', function (req, res) {
    Users.getAccountUsers(req.jwt.id, function (result) {
        res.send(result);
    });
});

OpenRouter.delete('/deleteUSer/:id', function (req, res) {
    Users.deleteUSer(req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
