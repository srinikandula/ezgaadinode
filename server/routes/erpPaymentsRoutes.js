var express = require('express');
var AuthRouter = express.Router();
var Payments = require('../apis/erpPayments');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

AuthRouter.get("/totalPayments",function (req,res) {
    Payments.totalPayments(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/getPayments",function (req,res) {
   Payments.getPayments(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get("/getPaymentDetails",function (req,res) {
    Payments.getPaymentDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post("/addPayment",function (req,res) {
    Payments.addPayment(req,function (result) {
        res.send(result);
    })
});

AuthRouter.put("/updatePayment",function (req,res) {
    Payments.updatePayment(req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete("/deletePayment",function (req,res) {
    Payments.deletePayment(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/getPaymentsByParties",function (req,res) {
   Payments.getPaymentsByParties(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get("/getPaymentsByPartyName",function (req,res) {
    Payments.getPaymentsByPartyName(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/downloadPaymentsDetailsByParty",function (req,res) {
    Payments.downloadPaymentsDetailsByParty(req, function (result) {
        if (result.status) {
            res.xls('Payments' + new Date().toLocaleDateString() + '.xlsx', result.data);
        } else {
            res.send(result);
        }

    });
});

AuthRouter.get('/sharePaymentsDetailsByPartyViaEmail',function (req,res) {
   Payments.sharePaymentsDetailsByPartyViaEmail(req,function (result) {
       res.send(result);
   }) 
});

AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Payments.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/downloadDetails', function (req, res) {
    Payments.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('receipts details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});

/*
*params:{file:file}
* input excel file,it contains column names (date,party name,amount,remark)
*/
AuthRouter.post('/uploadPayments',multipartyMiddleware, function (req, res) {
    Payments.uploadPayments(req,function (result) {
        res.send(result);
    });
});
module.exports = {
    AuthRouter: AuthRouter
};

