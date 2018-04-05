var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Party = require('./../apis/partyApis');

AuthRouter.get('/getAllPartiesForFilter', function (req, res) {
    Party.getAllPartiesForFilter(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/addParty', function (req, res) {
    Party.addParty(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllPartiesBySupplier', function (req, res) {
    Party.getAllPartiesBySupplier(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllPartiesByTransporter', function (req, res) {
    Party.getAllPartiesByTransporter(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/downloadDetails', function (req, res) {
    Party.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('party details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});

AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Party.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:partyId', function (req, res) {
    Party.findParty(req.jwt, req.params.partyId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updateParty', function (req, res) {
    Party.updateParty(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountParties', function (req, res) {
    Party.getAccountParties(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/get/all', function (req, res) {
    Party.getAllParties(req,function (result) {
        res.send(result);
    });
});


AuthRouter.delete('/:partyId', function (req, res) {
    Party.deleteParty(req.jwt, req.params.partyId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/total/count', function (req, res) {
    Party.countParty(req.jwt,req, function (result) {
        res.send(result);
    });
});


AuthRouter.get('/tripsPayments/:partyId', function (req, res) {
    Party.findTripsAndPaymentsForParty(req.jwt, req.params.partyId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/vehiclePayments/:vehicleId', function (req, res) {
    Party.findTripsAndPaymentsForVehicle(req.jwt, req.params.vehicleId,req, function (result) {
        res.send(result);
    });
});





module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
