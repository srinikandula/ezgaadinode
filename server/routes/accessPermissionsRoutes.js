var express = require('express');

var OpenRouter = express.Router();


var API = require('../apis/accessPermissionsApi');

OpenRouter.post('/add',function (req,res) {
    API.addAccessPermission(req,function (result) {
        res.json(result);
    });
});
OpenRouter.get('/getAllAccessPermissions',function (req,res) {
    API.getAllAccessPermissions(req,function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter:OpenRouter
};
