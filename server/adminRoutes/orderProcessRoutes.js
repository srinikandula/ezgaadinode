var express = require('express');
var AuthRouter = express.Router();
var OrderProcess = require('../adminApis/orderProcessApi');

AuthRouter.get('/getTruckRequests', function (req, res) {
    OrderProcess.getTruckRequests(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addTruckRequest', function (req, res) {
    OrderProcess.addTruckRequest(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateCustomerLead', function (req, res) {
    OrderProcess.updateCustomerLead(req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteCustomerLead', function (req, res) {
    OrderProcess.deleteCustomerLead(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckRequestDetails',function (req,res) {
    OrderProcess.getTruckRequestDetails(req,function (result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter
};

