var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var MaintenanceCost = require('../apis/maintenanceCostApi');

AuthRouter.post('/addMaintenance', function (req, res) {
    MaintenanceCost.addMaintenance(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAll', function (req, res) {
    MaintenanceCost.getAll(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getMaintenance/:maintenanceId', function (req, res) {
    MaintenanceCost.findMaintenanceRecord(req.params.maintenanceId, function (result) {
        res.send(result);
    });
});


AuthRouter.put('/updateMaintenance', function (req, res) {
    MaintenanceCost.updateMaintenanceCost(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:maintenanceId', function (req, res) {
    MaintenanceCost.deleteMaintenanceRecord( req.params.maintenanceId, function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};