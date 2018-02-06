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

AuthRouter.get('/getPlan', function (req, res) {
    Settings.getPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addPlan', function (req, res) {
    Settings.addPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getPlanDetails', function (req, res) {
    Settings.getPlanDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updatePlan', function (req, res) {
    Settings.updatePlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deletePlan', function (req, res) {
    Settings.deletePlan(req, function (result) {
        res.send(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};
