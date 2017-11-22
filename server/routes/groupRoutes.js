var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Groups = require('../apis/groupsApi');

AuthRouter.post('/addGroup', function (req, res) {
    Groups.addGroup(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

OpenRouter.post('/login', function (req, res) {
    Groups.login(req.body.userName, req.body.password, req.body.contactPhone, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateGroup', function (req, res) {
    Groups.update(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getGroups', function (req, res) {
    Groups.getGroups(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getGroup/:groupId', function (req, res) {
    Groups.getGroup(req.params.groupId, function (result) {
        res.send(result)
    })
});

AuthRouter.delete('/deleteUSer/:id', function (req, res) {
    Groups.deleteGroup(req.params.id, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/total/count',function(req,res){
    Groups.countGroups(req.jwt,function(result){
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
