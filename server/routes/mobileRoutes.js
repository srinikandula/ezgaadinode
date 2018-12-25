var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var mobile = require('../apis/mobileApis');

AuthRouter.get('/getTruckLocations', function (req, res) {
    mobile.getAllVehiclesLocation(req.jwt, req, function (result) {
        res.send(result);
    });
});


module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};