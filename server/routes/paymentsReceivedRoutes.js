var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var PaymentsReceived = require('../apis/paymentsReceivedAPI');

AuthRouter.post('/addPayments', function (req, res) {
    PaymentsReceived.addPayments(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/', function (req, res) {
    PaymentsReceived.getAllAccountPayments(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updatePayments', function (req, res) {
    PaymentsReceived.updatePayment(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getPaymentsRecord/:paymentsId', function (req, res) {
    //console.log(req);
    PaymentsReceived.findPaymentsReceived(req.jwt,req.params.paymentsId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:id', function (req, res) {
    PaymentsReceived.deletePaymentsRecord(req.jwt, req.params.id,req, function (result) {
        res.send(result);

    });
});

AuthRouter.get('/countPayments', function (req, res) {
    PaymentsReceived.countPayments(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getPayments', function (req, res) {
    PaymentsReceived.getPayments(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getTotalAmount',function(req,res){
   PaymentsReceived.getTotalAmount(req.jwt.accountId,req,function(result){
       res.send(result);
   })
});

AuthRouter.get('/getPartyTotal',function(req,res){
    PaymentsReceived.getPartyTotal(req.jwt.accountId,function(result){
        res.send(result);
    })
});

AuthRouter.get('/getAccountDue',function(req,res){
    PaymentsReceived.findPendingDueForAccount(req.jwt,req,function(result){
        res.send(result);
    })
});

AuthRouter.get('/getDuesByParty',function(req,res){
    PaymentsReceived.getDuesByParty(req.jwt,req.query,req,function(result){
        res.send(result);
    })
});

AuthRouter.get('/sharePaymentsDetailsByPartyViaEmail',function(req,res){
    PaymentsReceived.sharePaymentsDetailsByPartyViaEmail(req.jwt,req.query,req,function(result){
        res.send(result);
    })
})
AuthRouter.get('/downloadPaymentDetailsByParty', function (req, res) {
    
    PaymentsReceived.downloadPaymentDetailsByParty(req.jwt,req.query,req, function (result) {
            if(result.status){
                res.xls('payments'+new Date().toLocaleDateString()+'.xlsx', result.data);
            }else{
                res.send(result);
            }       
            
        });
       
    
    });
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};