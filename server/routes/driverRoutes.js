var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();
var cronjob = require('node-cron');


var Drivers = require('../apis/driversApi');
var Api = require('../apis/driverAttendanceApi');

AuthRouter.get('/getAllDriversAttendance/:date',function(req,res){
    Api.getDriversAttendance(req,function(result){
        res.send(result);
    });
});
AuthRouter.get('/getDriversDataByDateRange/:driverId/:fromDate/:toDate',function(req,res){
    Api.getDriversDataByDateRange(req,function(result){
        res.send(result);
    });
});
AuthRouter.get('/downloadDriversData/:driverId/:fromDate/:toDate',function(req,res){
    Api.downloadDriversData(req,function(result){
        if(result.status){
            res.xls('Driver details'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }
    });
});
AuthRouter.put('/updateDriverSheet',function(req,res){
    Api.updateDriverSheet(req,function(result){
        res.send(result);
    });
});
var DriversAttendance = cronjob.schedule('0 1 * * *', function() {
    Api.createDriversAttendance(function (result) {
    });
});
DriversAttendance.start();

AuthRouter.get('/getAllDriversForFilter', function (req, res) {
    Drivers.getAllDriversForFilter(req.jwt, req, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/', function (req, res) {
    Drivers.addDriver(req.jwt, req.body, req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/get/:driverId', function (req, res) {
    Drivers.getDriverDetails(req.jwt, req.params.driverId, req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/', function (req, res) {
    Drivers.updateDriver(req.jwt, req.body, req, function (result) {
        res.json(result);
    });
});
AuthRouter.delete('/deleteImage',function(req,res){
    Drivers.deleteImage(req,function(result){
        res.send(result);
    });
});

AuthRouter.get('/account/drivers', function (req, res) {
    Drivers.getDrivers(req.jwt, req.query, req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Drivers.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/downloadDetails', function (req, res) {
    Drivers.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('driver details'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }
    });
});
AuthRouter.get('/:driverId', function (req, res) {
     Drivers.findDriver(req.params.driverId, req, function (result) {
         res.send(result);
     });
});
AuthRouter.put('/', function (req, res) {
    Drivers.updateDriver(req.jwt, req.body, req, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:driverId', function (req, res) {
    Drivers.deleteDriver(req.jwt, req.params.driverId, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/total/count', function (req, res) {
    Drivers.countDrivers(req.jwt, req, function (result) {
        res.send(result);
    });
});
module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};