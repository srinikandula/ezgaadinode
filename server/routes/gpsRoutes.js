var express = require('express');
var cronjob = require('node-cron');
var AuthRouter = express.Router();
var OpenRouter = express.Router();

var gps = require('../apis/gpsApi');
var devices = require('../apis/devicesApi');
var kafka = require('./../apis/testkafka/kafkaProducer');

OpenRouter.get('/AddDevicePositions', function (req, res) {
    kafka.sendRecord(req.query, function (result) {
        res.send(result);
    });
    // console.log(req.query);
    // gps.AddDevicePositions(req.query, function (result) {
    //     res.send(result);
    // });
});

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
            console.log('Success ');
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
    gps.getGpsSettings(req.jwt.id,req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getDailyReport/:date',function (req,res) {
    gps.getDailyReports(req,function (result) {
        res.send(result);
    });
})

/*OpenRouter.get('/moveDevicePositions', function (rew, res) {
    gps.moveDevicePositions(function (result) {
        res.send(result);
    });
});*/

var job = cronjob.schedule('0 1,30 * * * *', function() {      //runs everyday midnight at 12AM.
    gps.moveDevicePositions(function (result) {
        console.log(result.messages[0]);
    });
    /*gps.addInitialCounters(function (result) {
        console.log(result.messages[0]);
    });*/
});
job.start();

/*gps.moveDevicePositions(function (result) {
    res.send(result);
});*/

module.exports = {
    AuthRouter: AuthRouter,
    OpenRouter: OpenRouter
};