var express = require('express');
var AuthRouter = express.Router();
var Receipts = require('../apis/receiptsApi');

AuthRouter.get("/totalReceipts",function (req,res) {
    Receipts.totalReceipts(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/getReceipts",function (req,res) {
   Receipts.getReceipts(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get("/getReceiptDetails",function (req,res) {
    Receipts.getReceiptDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post("/addReceipt",function (req,res) {
    Receipts.addReceipt(req,function (result) {
        res.send(result);
    })
});

AuthRouter.put("/updateReceipt",function (req,res) {
    Receipts.updateReceipt(req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete("/deleteReceipt",function (req,res) {
    Receipts.deleteReceipt(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/getReceiptsbyParties",function (req,res) {
   Receipts.getReceiptsByParties(req,function (result) {
       res.send(result);
   })
});

AuthRouter.get("/getReceiptByPartyName",function (req,res) {
    Receipts.getReceiptByPartyName(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get("/downloadReceiptsDetailsByParty",function (req,res) {
    Receipts.downloadReceiptsDetailsByParty(req, function (result) {
        if (result.status) {
            res.xls('Receipts' + new Date().toLocaleDateString() + '.xlsx', result.data);
        } else {
            res.send(result);
        }

    });
});

AuthRouter.get('/shareReceiptsDetailsByPartyViaEmail',function (req,res) {
   Receipts.shareReceiptsDetailsByPartyViaEmail(req,function (result) {
       res.send(result);
   }) 
});

AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Receipts.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/downloadDetails', function (req, res) {
    Receipts.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('receipts details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});

module.exports = {
    AuthRouter: AuthRouter
};

