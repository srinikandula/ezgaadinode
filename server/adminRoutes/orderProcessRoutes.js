var express = require('express');
var AuthRouter = express.Router();
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

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

AuthRouter.delete('/deleteTruckRequest', function (req, res) {
    OrderProcess.deleteTruckRequest(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/countTruckRequest', function (req, res) {
    OrderProcess.countTruckRequest(req, function (result) {
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

AuthRouter.post('/addTruckRequestComment',function (req,res) {
    OrderProcess.addTruckRequestComment(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckRequestComments',function (req,res) {
    OrderProcess.getTruckRequestComments(req,function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateTruckRequestDetails',function (req,res) {
    OrderProcess.updateTruckRequestDetails(req,function (result) {
        res.send(result);
    })
});

/*Load Request*/
AuthRouter.get('/countLoadRequest', function (req, res) {
    OrderProcess.countLoadRequest(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadRequest', function (req, res) {
    OrderProcess.getLoadRequest(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addLoadRequest', function (req, res) {
    OrderProcess.addLoadRequest(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadRequestDetails',function (req,res) {
    OrderProcess.getLoadRequestDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateLoadRequest',function (req,res) {
    OrderProcess.updateLoadRequest(req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteLoadRequest', function (req, res) {
    OrderProcess.deleteLoadRequest(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountsExceptTruckOwners',function (req,res) {
   OrderProcess.getAllAccountsExceptTruckOwners(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get('/getAdminTruckOrdersList',function (req,res) {
   OrderProcess.getAdminTruckOrdersList(req,function (result) {
     res.send(result);
   });
});

AuthRouter.get('/totalAdminTruckOrders',function (req,res) {
    OrderProcess.totalAdminTruckOrders(req,function (result) {
        res.send(result);
    });
});

AuthRouter.post('/createOrder',function (req,res) {
   OrderProcess.createOrder(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get('/getTruckOwnerOrderDetails',function (req,res) {
   OrderProcess.getTruckOwnerOrderDetails(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get('/getLoadOwnerOrderDetails',function (req,res) {
    OrderProcess.getLoadOwnerOrderDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addOrderComment',function (req,res) {
    OrderProcess.addOrderComment(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addOrderPayment',function (req,res) {
   OrderProcess.addOrderPayment(req,function (result) {
       res.send(result);
   })
});

AuthRouter.post('/addOrderTransaction',function (req,res) {
    OrderProcess.addOrderTransaction(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/updateOrderPOD',multipartyMiddleware,function (req,res) {
   OrderProcess.updateOrderPOD(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get('/getEasygaadiEmployeesList',function (req,res) {
   OrderProcess.getEasygaadiEmployeesList(req,function (result) {
       res.send(result);
   })
});

AuthRouter.post('/addOrderLocation',function (req,res) {
    OrderProcess.addOrderLocation(req,function (result) {
        res.send(result);
    })
});

AuthRouter.put("/updateOrderProcess",function (req,res) {
   OrderProcess.updateOrderProcess(req,function (result) {
       res.send(result);
   })
});

module.exports = {
    AuthRouter: AuthRouter
};

