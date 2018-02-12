var express = require('express');
var AuthRouter = express.Router();
var globalApis = require('../apis/globalApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/getContactInfo/:accountId',function (req,res) {
    globalApis.getContactInfo(req.params.accountId,req.body.globalAccess,req,function (result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter
};
