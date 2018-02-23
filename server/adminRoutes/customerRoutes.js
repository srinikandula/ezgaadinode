var express = require('express');
var AuthRouter = express.Router();
var CustomerLeads = require('../adminApis/customerLeadsApi');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

AuthRouter.get('/getCustomerLeads', function(req, res) {
    CustomerLeads.getCustomerLeads(req, function(result) {
        res.send(result);
    })
});

AuthRouter.get('/totalCustomerLeads',function (req,res) {
    CustomerLeads.totalCustomerLeads(req, function(result) {
        res.send(result);
    })
});

AuthRouter.post('/addCustomerLead',multipartyMiddleware, function(req, res) {
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

AuthRouter.get('/getTruckOwners',function (req,res) {
    CustomerLeads.getTruckOwners(req, function(result) {
        res.send(result);
    })
});

AuthRouter.get('/getTotalTruckOwners',function (req,res) {
   CustomerLeads.getTotalTruckOwners(req,function (result) {
       res.send(result);
   })
});

AuthRouter.post('/convertCustomerLead',function (req,res) {
   CustomerLeads.convertCustomerLead(req,function (result) {
       res.send(result);
   })
});


module.exports = {
    AuthRouter: AuthRouter
};