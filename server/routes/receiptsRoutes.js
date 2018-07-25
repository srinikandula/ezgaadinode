var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Receipts = require('../apis/receiptsApi');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

AuthRouter.post('/addReceipts', function (req, res) {
    Receipts.addReceipts(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    Receipts.getAllAccountReceipts(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updateReceipts', function (req, res) {
    Receipts.updateReceipts(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getReceiptRecord/:receiptId', function (req, res) {
    //console.log(req);
    Receipts.getReceiptRecord(req.jwt,req.params.receiptId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:id', function (req, res) {
    Receipts.deleteReceiptsRecord(req.jwt, req.params.id,req, function (result) {
        res.send(result);

    });
});

AuthRouter.get('/countReceipts', function (req, res) {
    Receipts.countReceipts(req.jwt,req.query,req,function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getReceipts', function (req, res) {
    Receipts.getReceipts(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getTotalAmount',function(req,res){
   Receipts.getTotalAmount(req.jwt.accountId,req,function(result){
       res.send(result);
   })
});

AuthRouter.get('/getPartyTotal',function(req,res){
    Receipts.getPartyTotal(req.jwt.accountId,function(result){
        res.send(result);
    })
});

AuthRouter.get('/getAccountDue',function(req,res){
    Receipts.findPendingDueForAccount(req.jwt,req,function(result){
        res.send(result);
    })
});

AuthRouter.get('/getDuesByParty',function(req,res){
    Receipts.getDuesByParty(req.jwt,req.query,req,function(result){
        res.send(result);
    })
});

AuthRouter.get('/shareReceiptsDetailsByPartyViaEmail',function(req,res){
    Receipts.shareReceiptsDetailsByPartyViaEmail(req.jwt,req.query,req,function(result){
        res.send(result);
    })
});
AuthRouter.get('/downloadReceiptsDetailsByParty', function (req, res) {
    
    Receipts.downloadReceiptsDetailsByParty(req.jwt,req.query,req, function (result) {
            if(result.status){
                res.xls('payments'+new Date().toLocaleDateString()+'.xlsx', result.data);
            }else{
                res.send(result);
            }       
            
        });
       
    
    });
AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Receipts.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/downloadDetails', function (req, res) {
    Receipts.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('payments details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});

/*
*params:{file:file}
* input excel file,it contains column names (date,party name,amount,payment type,remark)
*/
AuthRouter.post('/uploadReceipts',multipartyMiddleware, function (req, res) {
    Receipts.uploadReceipts(req,function (result) {
        res.send(result);
    });
});
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};