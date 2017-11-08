var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();

var Events = require('./../apis/eventsApi');

OpenRouter.get('/:accountId', function (req, res) {
    Events.getEventData(req.params.accountId, function(result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};