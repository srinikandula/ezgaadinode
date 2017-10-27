var express = require('express');
var AuthRouter = express.Router();

var Drivers = require('./../apis/drivers');

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.body, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};