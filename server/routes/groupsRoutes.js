var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();


var GroupsAPI = require('../apis/groupsApi');

AuthRouter.post('/addAccountGroup', function (req, res) {
    GroupsAPI.addAccountGroup(req.jwt,req.body,req,function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAllAccountGroups', function (req, res) {
    GroupsAPI.getAllAccountGroups(req.jwt,req.query,req,function (result) {
        res.send(result);
    });
});

AuthRouter.get('/countAccountGroups',function(req,res){
    GroupsAPI.countAccountGroups(req.jwt,req,function(result){
        res.send(result);
    });
});


AuthRouter.get('/getAccountGroup/:accountGroupId', function (req, res) {
    GroupsAPI.getAccountGroup(req.params.accountGroupId,req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateAccountGroup', function (req, res) {
    GroupsAPI.updateAccountGroup(req.jwt, req.body,req, function (result) {
        res.json(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};
