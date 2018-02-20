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

AuthRouter.get('/searchTrucksForRequest',function (req,res) {
    OrderProcess.searchTrucksForRequest(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addTruckRequestQuote',function (req,res) {
    OrderProcess.addTruckRequestQuote(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckRequestQuotes',function (req,res) {
    OrderProcess.getTruckRequestQuotes(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/loadBookingForTruckRequest',function (req,res) {
    OrderProcess.loadBookingForTruckRequest(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadBookingDetails',function (req,res) {
    OrderProcess.getLoadBookingDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTrucksAndDriversByAccountId',function (req,res) {
    OrderProcess.getTrucksAndDriversByAccountId(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/saveLoadBooking',function (req,res) {
   OrderProcess.saveLoadBooking(req,function (result) {
       res.send(result);
   })
});

module.exports = {
    AuthRouter: AuthRouter
};

