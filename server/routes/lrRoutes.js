var express = require('express');


var OpenRouter = express.Router();
var AuthRouter = express.Router();


var LRsAPI = require('../apis/lrApi');

AuthRouter.post('/add',function (req,res) {
   LRsAPI.add(req,function (result) {
       res.json(result);
   })
});

AuthRouter.put('/update',function (req,res) {
    LRsAPI.update(req,function (result) {
        res.json(result);
    })
});

AuthRouter.get('/get/:id',function (req,res) {
   LRsAPI.get(req,function (result) {
       res.json(result);
   })
});

AuthRouter.get('/getAll',function (req,res) {
    LRsAPI.getAll(req,function (result) {
        res.json(result);
    })
});

AuthRouter.delete('/:id',function (req,res) {
   LRsAPI.delete(req,function (result) {
       res.json(result);
   })
});

AuthRouter.get('/total/count',function (req,res) {
   LRsAPI.totalCount(req,function (result) {
       res.json(result);
   })
});

AuthRouter.get('/generatePDF/:id',function (req,res) {
    LRsAPI.generatePDF(req,function (result) {
        if(result.status){
            res.writeHead(200, {'Content-Type': 'application/pdf','Content-Disposition': 'attachment; filename=lr'+Date.now()+'.pdf',});
            res.end(result.data, 'binary');
        }else{
            res.json(result);
        }
    })
});
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter:AuthRouter
};
