var express = require('express');
var cronjob = require('node-cron');


var AuthRouter = express.Router();


var Api = require('../apis/tripSheetApi');

AuthRouter.get('/createTripSheet',function(req,res){
    Api.createTripSheet(req,function(result){
       res.send(result);
    });
});
/*var createTripSheet = cronjob.schedule('0 1 * * *', function() {
    Api.createTripSheet(function (result) {
    });
});
createTripSheet.start();*/

AuthRouter.put('/updateTripSheet',function(req,res){
    Api.updateTripSheet(req,function(result){
        res.send(result);
    });
});


module.exports = {
    AuthRouter:AuthRouter
};
