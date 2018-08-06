var express = require('express');

var AuthRouter = express.Router();
var invoiceApi = require('../apis/invoiceApi');

AuthRouter.post('/addInvoice',function(req,res){
    invoiceApi.addInvoice(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.post('/updateInvoice',function(req,res){
    invoiceApi.updateInvoice(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/getAllInvoices',function(req,res){
    invoiceApi.getAllInvoices(req.jwt,function(result){
        res.send(result);
    });
});
AuthRouter.delete('/deleteInvoice/:id',function(req,res){
    invoiceApi.deleteInvoice(req.params,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getInvoice/:id',function(req,res){
    invoiceApi.getInvoice(req.jwt,req.params,function(result){
        res.send(result);
    });
});
AuthRouter.get('/generatePDF/:invoiceId',function (req,res) {
    invoiceApi.generatePDF(req,function (result) {
        if(result.status){
            res.writeHead(200, {'Content-Type': 'application/pdf'/*,'Content-Disposition': 'attachment; filename=lr'+Date.now()+'.pdf'*/});
            res.end(result.data, 'binary');
        }else{
            res.json(result);
        }
    });
});


module.exports = {
    AuthRouter:AuthRouter
};