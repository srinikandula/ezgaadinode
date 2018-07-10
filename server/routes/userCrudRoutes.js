var express = require('express');
var OpenRouter = express.Router();
var users = require('../apis/usersCrudApi');
OpenRouter.post('/', function (req, res) {
    users.adduser(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});
OpenRouter.get('/', function (req, res) {
    users.getUsers(req.jwt,  function (result) {
        res.send(result);
    });
});
module.exports = {
    OpenRouter: OpenRouter
};