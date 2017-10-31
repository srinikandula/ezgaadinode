var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Users = require('../apis/usersApi');

AuthRouter.post('/addUser', function (req, res) {
    Users.addUser(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

OpenRouter.post('/login', function (req, res) {
    Users.login(req.body.userName, req.body.accountName, req.body.password, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateUser', function (req, res) {
    Users.update(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAccountUsers', function (req, res) {
    Users.getAccountUsers(req.jwt.id, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllUsers/:pageNumber', function (req, res) {
    Users.getAllUsers(req.params.pageNumber, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getUser/:userId', function (req, res) {
    Users.getUser(req.params.userId, function (result) {
        res.send(result)
    })
});

AuthRouter.get('/getUser/:userId', function (req, res) {
    Users.getUser(req.params.userId, function (result) {
        res.send(result)
    })
});

AuthRouter.post('/getUserNames', function (req, res) {
    Users.getUserNames(req.body, function (result) {
        console.log(" usernames " + result);
        res.send(result)
    })
});

AuthRouter.delete('/deleteUSer/:id', function (req, res) {
    Users.deleteUSer(req.params.id, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
