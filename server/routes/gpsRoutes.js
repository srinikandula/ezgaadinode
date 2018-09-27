var express = require('express');
var cronjob = require('node-cron');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var gps = require('../apis/gpsApi');
var devices = require('../apis/devicesApi');

AuthRouter.post('/addSecret', function (req, res) {
    gps.addSecret(req.body.secret, req.body.email, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllSecrets', function (req, res) {
    gps.getAllSecrets(function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getDevices', function (req, res) {
    devices.getDevices(function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addDevice', function (req, res) {
    devices.addDevice(req.jwt, req.body, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/gpsTrackingByMapView', function (req, res) {
    gps.gpsTrackingByMapView(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/addInitialCounters',function (req,res) {
    gps.addInitialCounters(function (result) {
        res.send(result);
    }) ;
});

AuthRouter.get('/getDeviceTrucks',function (req,res) {
    gps.getDeviceTrucks(req.body.globalAccess,req,function (results) {
        res.send(results);
    })
});

OpenRouter.get('/findDeviceStatus/:deviceId',function (req,res) {
    gps.findDeviceStatus(req.params.deviceId,req,function (results) {
        res.send(results);
    })
});

AuthRouter.get('/gpsTrackingByTruck/:truckId/:startDate/:endDate',function (req,res) {
    gps.gpsTrackingByTruck(req.params.truckId,req.params.startDate,req.params.endDate,req,function (results) {
        res.send(results);
    })
});

AuthRouter.get('/downloadReport/:truckId/:startDate/:endDate',function (req,res) {
    gps.downloadReport(req.params.truckId,req.params.startDate,req.params.endDate,req,function (results) {
        if(results.status){
            res.xls('tripReport'+new Date().toLocaleDateString()+'.xlsx', results.data);
        }else{
            console.log('Error');
            res.send(results);
        }
    })
});

AuthRouter.get('/getAllVehiclesLocation',function (req,res) {
   gps.getAllVehiclesLocation(req.jwt,req,function (results) {
        res.send(results);
   })
});

AuthRouter.get('/getTruckReport/:startDate/:endDate/:truckNo',function (req,res) {
    gps.getTruckReports(req.params,req,function (results) {
        res.send(results);
    })
});

AuthRouter.post('/updateGpsSettings',function (req,res) {
    gps.editGpsSettings(req.body,req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getGpsSettings',function (req,res) {
    gps.getGpsSettings(req.jwt.accountId,function (result) {
        res.send(result);
    })
});

OpenRouter.get('/getDailyReport',function (req,res) {
    gps.emailDayGPSReport(req,function (result) {
        res.send(result);
    });
});

AuthRouter.post('/shareTripDetailsByVechicleViaEmail',function (req,res) {
    gps.shareTripDetailsByVechicleViaEmail(req,function (result) {
        res.send(result);
    })
});


var identifyNotWorkingDevices = cronjob.schedule('*/30 * * * *', function() {
    gps.identifyNotWorkingDevices(function (result) {
    });
});
identifyNotWorkingDevices.start();

/*

var task = cronjob.schedule('* *!/30 * * *', function() {
    console.log("daily email report...");
    gps.emailDayGPSReport({},function (result) {
        console.log("emailDayGPSReport..",result);
    });
});
task.start();
*/


OpenRouter.get('/emailDayGPSreport',function (req,res) {
    gps.emailDayGPSReport({},function (result) {
        // console.log("emailDayGPSReport..",result);
    });
});

AuthRouter.post('/generateShareTrackingLink',function(req,res){
   gps.generateShareTrackingLink(req,function (result) {
       res.json(result);
   });
});

OpenRouter.get('/getTruckLatestLocation/:trackingId',function (req,res) {
    gps.getTruckLatestLocation(req,function (result) {
        res.json(result);
    });
});


module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};