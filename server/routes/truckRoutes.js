var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trucks = require('../apis/truckAPIs');

AuthRouter.post('/', function (req, res) {
    Trucks.addTruck(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:truckId', function (req, res) {
    Trucks.findTruck(req.jwt, req.params.truckId, function (result) {
        res.send(result);
    });
});
AuthRouter.put('/', function (req, res) {
    Trucks.updateTruck(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/groupTrucks/:pageNumber', function (req, res) {
    Trucks.getTrucks(req.jwt, req.params.pageNumber, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:truckId', function (req, res) {
    Trucks.deleteTruck(req.params.truckId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountTrucks/:pageNumber', function (req, res) {
    Trucks.getAllAccountTrucks(req.jwt.accountId,function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getUnAssignedTrucks/getAll', function (req, res) {
    Trucks.getUnAssignedTrucks(req.jwt,req.query.groupId,function (result) {
        res.json(result);
    });
});


AuthRouter.post('/assignTrucks',function(req,res){
   Trucks.assignTrucks(req.jwt,req.body.groupId,req.body.trucks,function(result){
      res.json(result);
   });
});


AuthRouter.post('/unassign-trucks',function(req,res){
    Trucks.unAssignTrucks(req.jwt,req.body,function(result){
        res.json(result);
    });
});


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
