var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trucks = require('../apis/truckAPIs');

AuthRouter.post('/', function (req, res) {
    Trucks.addTruck(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllTrucksForFilter', function (req, res) {
    Trucks.getAllTrucksForFilter(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getTruckTypes', function (req, res) {
    Trucks.getTruckTypes(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/downloadExpiryDetailsByTruck', function (req, res) {
    Trucks.downloadExpiryDetailsByTruck(req.jwt, req.query,req, function (result) {
        if (result.status) {
            res.xls('Expiry' + new Date().toLocaleDateString() + '.xlsx', result.data);
        } else {
            res.send(result);
        }

    });
});
AuthRouter.get('/downloadDetails', function (req, res) {
    Trucks.downloadDetails(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('Truck details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});


AuthRouter.get('/shareExpiredDetailsViaEmail',function(req,res){
    Trucks.shareExpiredDetailsViaEmail(req.jwt,req.query,req,function(result){
        res.send(result);
    });
});

AuthRouter.get('/groupTrucks', function (req, res) {
    Trucks.getTrucks(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/findExpiryTrucks', function (req, res) {
    Trucks.findExpiryTrucks(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/findExpiryCount', function (req, res) {
    Trucks.findExpiryCount(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/fitnessExpiryTrucks', function (req, res) {
    Trucks.fitnessExpiryTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/permitExpiryTrucks', function (req, res) {
    Trucks.permitExpiryTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/insuranceExpiryTrucks', function (req, res) {
    Trucks.insuranceExpiryTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/pollutionExpiryTrucks', function (req, res) {
    Trucks.pollutionExpiryTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/taxExpiryTrucks', function (req, res) {
    Trucks.taxExpiryTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllTrucksForAccount',function (req,res) {
    Trucks.getAllTrucksForAccount(req,function (result) {
        res.json(result);
    })
});

AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Trucks.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/:truckId', function (req, res) {
    Trucks.findTruck(req.jwt, req.params.truckId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/', function (req, res) {
    Trucks.updateTruck(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:truckId', function (req, res) {
    Trucks.deleteTruck(req.jwt,req.params.truckId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/get/accountTrucks/:pageNumber', function (req, res) {  //trucks of jwt.id
    Trucks.getAllAccountTrucks(req.jwt,req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getAllTrucksOfAccount/:truckId', function (req, res) { //trucks of mentioned account id
    Trucks.getAllTrucksOfAccount(req, function (result) {
        res.json(result);
    })
});

AuthRouter.get('/', function (req, res) {
    Trucks.getAllAccountTrucks(req.jwt,req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getUnAssignedTrucks/getAll', function (req, res) {
    Trucks.getUnAssignedTrucks(req.jwt, req.query.groupId,req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/assignTrucks', function (req, res) {
    Trucks.assignTrucks(req.jwt, req.body.groupId, req.body.trucks,req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/unassign-trucks', function (req, res) {
    Trucks.unAssignTrucks(req.jwt, req.body,req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/total/count', function (req, res) {
    Trucks.countTrucks(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getTrucksByPopulate', function (req, res) {
    Trucks.getTrucksByPopulate(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});

OpenRouter.post('/lookingForLoad',function (req,res) {
    Trucks.lookingForLoad(req.body,req,function (result) {
        res.json(result);
    })
});

AuthRouter.post('/unCheckLookingForLoad',function (req,res) {
    Trucks.unCheckLookingForLoad(req.body,req,function (result) {
        res.json(result);
    })
});



module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};

