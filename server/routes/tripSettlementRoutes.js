var express = require('express');

var AuthRouter = express.Router();
var tripSettlementApi = require('../apis/tripSettlementApi');

AuthRouter.post('/addTripSettlement',function(req,res){
    tripSettlementApi.addTripSettlement(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.post('/updateTripSettlement',function(req,res){
    tripSettlementApi.updateTripSettlement(req.jwt,req.body,function(result){
        res.json(result);
    });
});
AuthRouter.get('/getTripSettlements',function(req,res){
    tripSettlementApi.getAllTripSettlements(req.jwt,req.query,function(result){
        res.send(result);
    });
});
AuthRouter.delete('/deleteTripSettlement/:id',function(req,res){
    tripSettlementApi.deleteTripSettlement(req.jwt,req.params,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getTripSettlement/:id',function(req,res){
    tripSettlementApi.getTripSettlement(req.jwt,req.params,function(result){
        res.send(result);
    });
});
AuthRouter.get('/generatePDF/:tripSettlementId',function (req,res) {
    tripSettlementApi.generatePDF(req,function (result) {
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