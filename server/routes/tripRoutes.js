var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var Trips = require('../apis/tripsApi');

AuthRouter.post('/addTrip',multipartyMiddleware, function (req, res) {
    Trips.addTrip(req.jwt,req.body.content,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountTrips', function (req, res) {
    Trips.getAllAccountTrips(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/getAllTrips', function (req, res) {
    Trips.getAll(req.jwt, req.query,req, function (result) {
        res.json(result);
    });
});
AuthRouter.post('/updateTrip',multipartyMiddleware, function (req, res) {
    Trips.updateTrip(req.jwt, req.body.content,req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/shareRevenueDetailsByVechicleViaEmail', function (req, res) {
    Trips.shareRevenueDetailsByVechicleViaEmail(req.jwt, req.query,req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/shareDetailsViaEmail', function (req, res) {
    Trips.shareDetailsViaEmail(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/downloadDetails', function (req, res) {
    // toTimeString()
    Trips.downloadDetails(req.jwt,req.query,req, function (result) {
        // console.log("trips downloads...",result);
        if(result.status){
            // var d = new Date();
            // for(var i =0;i<result.data.length;i++){
            //     result.data[i].Contact = d.toTimeString(result.data[i].Contact);
            //
            // }
            // console.log("trips downloads..data...",result.data);

            res.xls('trip details'+new Date().toLocaleDateString()+'.xlsx', result.data);

        }else{
            res.send(result);
        }
    });
});

AuthRouter.get('/downloadRevenueDetailsByVechicle', function (req, res) {

    Trips.downloadRevenueDetailsByVechicle(req.jwt,req.query,req, function (result) {
        if(result.status){
            res.xls('revenue'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }       
        
    });
   

});
AuthRouter.get('/getPartiesWhoHasTrips',function(req,res){
    Trips.getPartiesWhoHasTrips(req.jwt,req,function(result){
        res.send(result);
    })
});

AuthRouter.get("/viewTripDocument",function (req,res) {
    Trips.viewTripDocumnet(req,function (result) {
        res.send(result);
    })
});
AuthRouter.get('/:tripId', function (req, res) {
    Trips.findTrip(req.jwt, req.params.tripId,req, function (result) {
        res.send(result);
    });
});
AuthRouter.delete("/deleteTripImage",function (req,res) {
    Trips.deleteTripImage(req, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:tripId', function (req, res) {
    Trips.deleteTrip(req.jwt,req.params.tripId,req, function (result) {
        res.send(result);
    });
});
AuthRouter.post('/report', function (req, res) {
    Trips.getReport(req.jwt, req.body,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/totalRevenue', function (req, res) {
    Trips.findTotalRevenue(req.jwt,req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/find/revenueByParty', function (req, res) {
    Trips.findRevenueByParty(req.jwt,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/revenueByVehicle', function (req, res) {
    Trips.findRevenueByVehicle(req.jwt, req.query,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByParty/:partyId', function (req, res) {
    Trips.findTripsByParty(req.jwt, req.params.partyId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByVehicle/:VehicleId', function (req, res) {
    console.log(req.params);
    Trips.findTripsByVehicle(req.jwt, req.params.VehicleId,req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/sendEmail', function (req, res) {
    Trips.sendEmail(req.jwt, req.body, function (result) {
        res.send(result);
    })
});
AuthRouter.get('/total/count', function (req, res) {
    Trips.countTrips(req.jwt, req,function (result) {
        res.send(result);
    });
});

AuthRouter.post('/loockingForTripRequest', function (req, res) {
    Trips.loockingForTripRequest(req.jwt,req.body,req,function (result) {
        res.send(result);
    });
});



module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
