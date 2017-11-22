var express = require('express');
var OpenRouter = express.Router();
var Groups = require('../apis/groupsApi');


OpenRouter.post('/login', function (req, res) {
    Groups.login(req.body.userName, req.body.password, req.body.contactPhone, function (result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter
};
