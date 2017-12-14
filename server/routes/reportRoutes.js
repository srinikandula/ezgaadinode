var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var Reports = require('../apis/reportsApi');

AuthRouter.get('/', function (req, res) {
    Reports.getReport(req.jwt, req.query, function (result) {
        res.json(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};