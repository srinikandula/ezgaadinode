var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var Trips = require('../apis/tripsApi');

AuthRouter.post('/addTrip', function (req, res) {
    Trips.addTrip(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountTrips', function (req, res) {
    Trips.getAllAccountTrips(req.jwt, req.query, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/getAllTrips', function (req, res) {
    Trips.getAll(req.jwt, req.query, function (result) {
        res.json(result);
    });
});
AuthRouter.put('/', function (req, res) {
    Trips.updateTrip(req.jwt, req.body, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/shareRevenueDetailsByVechicleViaEmail', function (req, res) {
    Trips.shareRevenueDetailsByVechicleViaEmail(req.jwt, req.query, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/downloadRevenueDetailsByVechicle', function (req, res) {

    Trips.downloadRevenueDetailsByVechicle(req.jwt,req.query, function (result) {
        if(result.status){
            res.xls('revenue'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }       
        
    });
   

});
AuthRouter.get('/getPartiesByTrips',function(req,res){
    Trips.getPartiesByTrips(req.jwt,function(result){
        res.send(result);
    })
})
AuthRouter.get('/:tripId', function (req, res) {
    Trips.findTrip(req.jwt, req.params.tripId, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:tripId', function (req, res) {
    Trips.deleteTrip(req.jwt,req.params.tripId, function (result) {
        res.send(result);
    });
});
AuthRouter.post('/report', function (req, res) {
    Trips.getReport(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/totalRevenue', function (req, res) {
    Trips.findTotalRevenue(req.jwt, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/find/revenueByParty', function (req, res) {
    Trips.findRevenueByParty(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/revenueByVehicle', function (req, res) {
    Trips.findRevenueByVehicle(req.jwt, req.query, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByParty/:partyId', function (req, res) {
    Trips.findTripsByParty(req.jwt, req.params.partyId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByVehicle/:VehicleId', function (req, res) {
    console.log(req.params);
    Trips.findTripsByVehicle(req.jwt, req.params.VehicleId, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/sendEmail', function (req, res) {
    Trips.sendEmail(req.jwt, req.body, function (result) {
        res.send(result);
    })
});
AuthRouter.get('/total/count', function (req, res) {
    Trips.countTrips(req.jwt, function (result) {
        res.send(result);
    });
});



module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
