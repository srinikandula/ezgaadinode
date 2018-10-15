var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();

var unloading = require('../apis/unloadingApi');

AuthRouter.post('/addUnloadingPoint', function (req, res) {
    unloading.addUnloadingPoint(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
AuthRouter.get('/getAll', function (req, res) {
    unloading.getAll(req.jwt,req, function (result) {
        res.json(result);
    });
});

});
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};