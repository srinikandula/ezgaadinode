var express = require('express');
var AuthRouter = express.Router();
var Users = require('../adminApis/userApi');
var logger = require('./../winston/logger')(module);

/*Author SVPrasadK*/
AuthRouter.get('/getUser', function (req, res) {
    Users.getUser(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addUser', function (req, res) {
    Users.addUser(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getUserDetails', function (req, res) {
    Users.getUserDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateUser', function (req, res) {
    Users.updateUser(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteUser', function (req, res) {
    Users.deleteUser(req, function (result) {
        res.send(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};
