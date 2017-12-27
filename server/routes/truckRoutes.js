var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trucks = require('../apis/truckAPIs');

AuthRouter.post('/', function (req, res) {
    Trucks.addTruck(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/downloadExpiryDetailsByTruck', function (req, res) {

    Trucks.downloadExpiryDetailsByTruck(req.jwt, req.query, function (result) {
        if (result.status) {
            res.xls('Expairy' + new Date().toLocaleDateString() + '.xlsx', result.data);
        } else {
            res.send(result);
        }

    });


});

AuthRouter.get('/shareExpiredDetailsViaEmail',function(req,res){
    Trucks.shareExpiredDetailsViaEmail(req.jwt,req.query,function(result){
        res.send(result);
    });
})

AuthRouter.get('/groupTrucks', function (req, res) {
    Trucks.getTrucks(req.jwt, req.query, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/findExpiryTrucks', function (req, res) {
    Trucks.findExpiryTrucks(req.jwt, req.query, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/findExpiryCount', function (req, res) {
    Trucks.findExpiryCount(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/fitnessExpiryTrucks', function (req, res) {
    Trucks.fitnessExpiryTrucks(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/permitExpiryTrucks', function (req, res) {
    Trucks.permitExpiryTrucks(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/insuranceExpiryTrucks', function (req, res) {
    Trucks.insuranceExpiryTrucks(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/pollutionExpiryTrucks', function (req, res) {
    Trucks.pollutionExpiryTrucks(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/taxExpiryTrucks', function (req, res) {
    Trucks.taxExpiryTrucks(req.jwt, function (result) {
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


AuthRouter.delete('/:truckId', function (req, res) {
    Trucks.deleteTruck(req.params.truckId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountTrucks/:pageNumber', function (req, res) {
    Trucks.getAllAccountTrucks(req.jwt, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/', function (req, res) {
    Trucks.getAllAccountTrucks(req.jwt, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getUnAssignedTrucks/getAll', function (req, res) {
    Trucks.getUnAssignedTrucks(req.jwt, req.query.groupId, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/assignTrucks', function (req, res) {
    Trucks.assignTrucks(req.jwt, req.body.groupId, req.body.trucks, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/unassign-trucks', function (req, res) {
    Trucks.unAssignTrucks(req.jwt, req.body, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/total/count', function (req, res) {
    Trucks.countTrucks(req.jwt, function (result) {
        res.send(result);
    });
});




module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
