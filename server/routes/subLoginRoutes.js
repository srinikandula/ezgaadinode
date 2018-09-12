var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();

var Employees = require('../adminApis/employeeApi');
var API = require('../apis/subLoginsAPi');

AuthRouter.post('/addUser', function (req, res) {
    API.addUser(req.jwt,req.body,req,function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getUsers', function (req, res) {
    API.getUsers(req.jwt,function (result) {
        res.send(result);
    });
});
AuthRouter.post('/updateUser', function (req, res) {
    API.updateUser(req.jwt,req.body,req,function (result) {
        res.json(result);
    });
});
AuthRouter.delete('/deleteUser/:id',function(req,res){
    API.deleteUser(req.params.id,function(result){
        res.send(result);
    });
});

AuthRouter.get('/getUser/:id', function (req, res) {
    API.getUser(req.jwt,req.params.id,function (result) {
        res.send(result);
    });
});

AuthRouter.get('/adminRolesDropDown', function (req, res) {
    Employees.adminRolesDropDown(req, function (result) {
        res.json(result)
    });
});


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};
