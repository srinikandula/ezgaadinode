var express = require('express');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var Drivers = require('../apis/driversApi');


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