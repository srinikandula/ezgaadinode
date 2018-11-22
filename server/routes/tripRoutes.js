var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var cronjob = require('node-cron');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var Api = require('../apis/tripSheetApi');

var Trips = require('../apis/tripsApi');


AuthRouter.post('/addTripsheetTrip', function (req, res) {
    Api.addTrip(req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/updateTripSheet', function (req, res) {
    Api.updateTripSheet(req, function (result) {
        res.send(result);
    });
});


AuthRouter.get('/getTripSheets/:date', function (req, res) {
    Api.getTripSheets(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/createTripSheet/:date', function (req, res) {
    var today = new Date(req.params.date);
    today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    Api.createTripSheet(today,function (result) {
        res.send(result);
    });
});

var createTripSheet = cronjob.schedule('0 1 * * *', function() {
    var today = new Date();
    today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    Api.createTripSheet(today,function (result) {
    });
});
createTripSheet.start();

AuthRouter.get('/tripSheetReport', function (req, res) {
    Api.getTripSheetsByParams(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/downloadTripSheetDate',function(req,res){
    Api.downloadTripSheetData(req,function(result){
        console.log("result...",result.data);
        if(result.status){
            res.xls('Tripsheet details'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }
    });
});

AuthRouter.post('/addTripsheetTrip', function (req, res) {
    Api.addTrip(req.jwt,req.body, req, function (result) {
        res.send(result);
    });
});


AuthRouter.post('/addTrip', function (req, res) {
    Trips.addTrip(req.jwt, req.body, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllAccountTrips', function (req, res) {
    Trips.getAllAccountTrips(req.jwt, req.query, req, function (result) {
        res.json(result);
    });
});
AuthRouter.get('/getAllTrips', function (req, res) {
    Trips.getAll(req.jwt, req.query, req, function (result) {
        res.json(result);
    });
});
AuthRouter.post('/updateTrip', function (req, res) {
    Trips.updateTrip(req.jwt, req.body, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/shareRevenueDetailsByVechicleViaEmail', function (req, res) {
    Trips.shareRevenueDetailsByVechicleViaEmail(req.jwt, req.query, req, function (result) {
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
    Trips.downloadDetails(req.jwt, req.query, req, function (result) {
        // console.log("trips downloads...",result);
        if (result.status) {
            // var d = new Date();
            // for(var i =0;i<result.data.length;i++){
            //     result.data[i].Contact = d.toTimeString(result.data[i].Contact);
            //
            // }
            // console.log("trips downloads..data...",result.data);

            res.xls('trip details' + new Date().toLocaleDateString() + '.xlsx', result.data);

        } else {
            res.send(result);
        }
    });
});

AuthRouter.get('/downloadRevenueDetailsByVechicle', function (req, res) {

    Trips.downloadRevenueDetailsByVechicle(req.jwt, req.query, req, function (result) {
        if (result.status) {
            res.xls('revenue' + new Date().toLocaleDateString() + '.xlsx', result.data);
        } else {
            res.send(result);
        }

    });


});
AuthRouter.get('/getPartiesWhoHasTrips', function (req, res) {
    Trips.getPartiesWhoHasTrips(req.jwt, req, function (result) {
        res.send(result);
    })
});

AuthRouter.get("/viewTripDocument", function (req, res) {
    Trips.viewTripDocumnet(req, function (result) {
        res.send(result);
    })
});
AuthRouter.get('/:tripId', function (req, res) {
    Trips.findTrip(req.jwt, req.params.tripId, req, function (result) {
        res.send(result);
    });
});
AuthRouter.delete("/deleteTripImage", function (req, res) {
    Trips.deleteTripImage(req, function (result) {
        res.send(result);
    });
});
AuthRouter.delete('/:tripId', function (req, res) {
    Trips.deleteTrip(req.jwt, req.params.tripId, req, function (result) {
        res.send(result);
    });
});
AuthRouter.post('/report', function (req, res) {
    Trips.getReport(req.jwt, req.body, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/totalRevenue', function (req, res) {
    Trips.findTotalRevenue(req.jwt, req, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/find/revenueByParty', function (req, res) {
    Trips.findRevenueByParty(req.jwt, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/revenueByVehicle', function (req, res) {
    Trips.findRevenueByVehicle(req.jwt, req.query, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByParty/:partyId', function (req, res) {
    Trips.findTripsByParty(req.jwt, req.params.partyId, req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/find/tripsByVehicle/:VehicleId', function (req, res) {
    console.log(req.params);
    Trips.findTripsByVehicle(req.jwt, req.params.VehicleId, req, function (result) {
        res.send(result);
    });
});

AuthRouter.put('/sendEmail', function (req, res) {
    Trips.sendEmail(req.jwt, req.body, function (result) {
        res.send(result);
    })
});
AuthRouter.get('/total/count', function (req, res) {
    Trips.countTrips(req.jwt, req, function (result) {
        res.send(result);
    });
});

AuthRouter.post('/loockingForTripRequest', function (req, res) {
    Trips.loockingForTripRequest(req.jwt, req.body, req, function (result) {
        res.send(result);
    });
});
/*
*params:{file:file}
* input excel file,it contains column names (date,truck number,driver,party name,source,destination,vehicle type,tonnage,rate,fight amount,advance,remark)
*/
AuthRouter.post('/uploadTrips', multipartyMiddleware, function (req, res) {
    Trips.uploadTrips(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getTripInvoiceDetails/:tripId/:partyId', function (req, res) {
    Trips.getTripInvoiceDetails(req, function (result) {
        if (result.status) {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=trip_' + Date.now() + '.pdf',
            });
            res.end(result.data, 'binary');
        } else {
            res.json(result);
        }

    })
});




module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
