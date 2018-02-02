var express = require('express');
var AuthRouter = express.Router();
var Settings = require('../adminApis/settingsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/getTruckTypes', function (req, res) {
    Settings.getTruckTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addTruckType', function (req, res) {
    Settings.addTruckType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateTruckType', function (req, res) {
    Settings.updateTruckType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteTruckType', function (req, res) {
    Settings.deleteTruckType(req, function (result) {
        res.send(result);
    })
});

/*Author SVPrasadK*/

AuthRouter.get('/getGPSPlan', function (req, res) {
    Settings.getGPSPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addGPSPlan', function (req, res) {
    Settings.addGPSPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getGPSPlanDetails', function (req, res) {
    Settings.getGPSPlanDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateGPSPlan', function (req, res) {
    Settings.updateGPSPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteGPSPlan', function (req, res) {
    Settings.deleteGPSPlan(req, function (result) {
        res.send(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};
