var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Roles = require('../apis/rolesApi');



AuthRouter.post('/role/add', function (req, res) {
    Roles.addRole(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getRoles/:pageNumber', function (req, res) {
    Roles.getRoles(req.params.pageNumber,req,function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllRoles', function (req, res) {
    Roles.getAllRoles(req,function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getRole/:roleId', function (req, res) {
    Roles.getRole(req.params.roleId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/role/update', function (req, res) {
    Roles.updateRole(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});


AuthRouter.delete('/role/delete/:id', function (req, res) {
    Roles.deleteRole(req.params.id,req, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
