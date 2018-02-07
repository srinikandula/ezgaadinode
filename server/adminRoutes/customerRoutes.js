var express = require('express');
var AuthRouter = express.Router();
var CustomerLeads = require('../adminApis/customerLeadsApi');

AuthRouter.get('/getCustomerLeads', function(req, res) {
    CustomerLeads.getCustomerLeads(req, function(result) {
        res.send(result);
    })
});

AuthRouter.post('/addCustomerLead', function(req, res) {
    CustomerLeads.addCustomerLead(req, function(result) {
        res.send(result);
    })
});

AuthRouter.post('/updateCustomerLead', function(req, res) {
    CustomerLeads.updateCustomerLead(req, function(result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteCustomerLead', function(req, res) {
    CustomerLeads.deleteCustomerLead(req, function(result) {
        res.send(result);
    })
});

AuthRouter.get('/getCustomerLeadDetails', function(req, res) {
    CustomerLeads.getCustomerLeadDetails(req, function(result) {
        res.send(result);
    })
});

module.exports = {
    AuthRouter: AuthRouter
};