var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var url = require('url');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var Events = require('./../apis/eventsApi');
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');

var EventData = require('./../apis/eventDataApi');
var S3Bucket = require('./../apis/s3-aws');

OpenRouter.get('/:accountId', function (request, res) {
    var urlParams = url.parse(request.url, true);
    var startDate  = urlParams.query.startDate;
    var endDate = urlParams.query.endDate;
    var retObj = {};
    retObj.messages = [];
    if(!startDate){
        retObj.status = false;
        retObj.messages.push('Missing param startDate(YYYY-MM-dd)');
    } else {
        var timestamp=Date.parse(startDate);
        if (isNaN(timestamp)==false) {
            startDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid start date format; valid format 'YYYY-MM-dd'");
        }
    }

    if(!endDate){
        retObj.status = false;
        retObj.messages.push('Missing param endDate(YYYY-MM-dd);');
    }else {
        var timestamp=Date.parse(endDate);
        if (isNaN(timestamp)==false) {
            endDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid end date format; valid format 'YYYY-MM-dd'");
        }
    }
    if(retObj.messages.length > 0) {
        analyticsService.create(request,serviceActions.get_event_data_err,{body:JSON.stringify(request.params),accountId:request.jwt.id,success:false,messages:retObj.messages},function(response){ });
        res.json(retObj);
    }else {
        Events.getEventData(request.params.accountId, startDate.getTime()/1000, endDate.getTime()/1000,request, function(result) {
            res.json(result);
        });
    }

});

AuthRouter.get('/latestLocation/:deviceId', function (req, res) {
    var retObj = {};
    retObj.messages = [];
    if(!req.params.deviceId){
        retObj.messages.push("Missing deviceId in request params");
    }
    if(retObj.messages.length > 0) {
        analyticsService.create(req,serviceActions.get_latest_device_loc_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        res.json(retObj);
    }else {
        Events.getLatestLocation(req.jwt, req.params.deviceId,req, function(result) {
            res.json(result);
        });
    }

});

OpenRouter.get('/get/srlogistics', function (request, res) {
    var urlParams = url.parse(request.url, true);
    var startDate  = urlParams.query.startDate;
    var endDate = urlParams.query.endDate;
    var retObj = {};
    retObj.messages = [];
    if(!startDate){
        retObj.status = false;
        retObj.messages.push('Missing param startDate(YYYY-MM-dd)');
    } else {
        var timestamp=Date.parse(startDate);
        if (isNaN(timestamp)==false) {
            startDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid start date format; valid format 'YYYY-MM-dd'");
        }
    }

    if(!endDate){
        retObj.status = false;
        retObj.messages.push('Missing param endDate(YYYY-MM-dd);');
    }else {
        var timestamp=Date.parse(endDate);
        if (isNaN(timestamp)==false) {
            endDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid end date format; valid format 'YYYY-MM-dd'");
        }
    }
    if(retObj.messages.length > 0) {
        analyticsService.create(request,serviceActions.get_srlogistics_err,{body:JSON.stringify(request.params),accountId:request.jwt.id,success:false,messages:retObj.messages},function(response){ });
        res.json(retObj);
    }else {
        Events.getEventData('s.rlogistics@yahoo.com', startDate.getTime()/1000, endDate.getTime()/1000,request, function(result) {
            res.json(result);
        });
    }
});


OpenRouter.get('/get/srlogistics/latestLocations', function (request, res) {
    var urlParams = url.parse(request.url, true);
    var startDate  = urlParams.query.startDate;
    var endDate = urlParams.query.endDate;
    var retObj = {};
    retObj.messages = [];

    if(retObj.messages.length > 0) {
        analyticsService.create(request,serviceActions.get_srlogistics_lat_loc_err,{body:JSON.stringify(request.params),accountId:request.jwt.id,success:false,messages:retObj.messages},function(response){ });
        res.json(retObj);
    }else {
        Events.getLatestLocations('s.rlogistics@yahoo.com', function(result) {
            res.json(result);
        });
    }

});


OpenRouter.get('/get/srlogistics/reload', function (request, res) {
    var urlParams = url.parse(request.url, true);
    var startDate  = urlParams.query.startDate;
    var endDate = urlParams.query.endDate;
    var retObj = {};
    retObj.messages = [];
    if(!startDate){
        retObj.status = false;
        retObj.messages.push('Missing param startDate(YYYY-MM-dd)');
    } else {
        var timestamp=Date.parse(startDate);
        if (isNaN(timestamp)==false) {
            startDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid start date format; valid format 'YYYY-MM-dd'");
        }
    }

    if(!endDate){
        retObj.status = false;
        retObj.messages.push('Missing param endDate(YYYY-MM-dd);');
    }else {
        var timestamp=Date.parse(endDate);
        if (isNaN(timestamp)==false) {
            endDate=new Date(timestamp);
        } else {
            retObj.messages.push("Invalid end date format; valid format 'YYYY-MM-dd'");
        }
    }
    if(retObj.messages.length > 0) {
        res.json(retObj);
    }else {
        EventData.deleteAll(function(){
            Events.getEventData('s.rlogistics@yahoo.com', startDate.getTime()/1000, endDate.getTime()/1000,request, function(response) {
                //retObj.results = results.eventData.concat(results.eventDataTemp);
                var eventData = response.results;
                for(var i=0; i< eventData.length;i++) {
                    EventData.createEventData(eventData[i]);
                }
                res.json(response);
            });
        });

    }
});

OpenRouter.post('/syncAccountWithUserLogins', function (req, res) {
    Events.syncAccountWithUserLogins(req, function (result) {
        res.json(result);
    });
});

OpenRouter.get('/get/groupMap', function (request, res) {
    EventData.getGroupMapEvents(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/trackEvents/:vehicleNumber', function (request, res) {
    EventData.getTrackEvents(request.params.vehicleNumber,request, function(results){
        res.json(results);
    });
});

/*OpenRouter.get('/get/user', function (request, res) {
    Events.getUserData(function(results){
        //console.log(results);
        res.json(results);
    });
});*/

OpenRouter.get('/get/accounts', function (request, res) {
    Events.getAccountData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/accountGroups', function (request, res) {
    Events.getAccountGroupData(request,function(results){
        //console.log(results);
        // res.json(results);
    });
});

OpenRouter.get('/get/accountGroupsIntoGroups', function (request, res) {
    Events.getAccountGroupDataIntoGroups(request,function(results){
        //console.log(results);
        // res.json(results);
    });
});

OpenRouter.get('/get/mappingGpsStatusToAccount', function (request, res) {
    Events.updateAccountGPSStatus(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/trucks', function (request, res) {
    Events.createTruckFromEGTruck(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/deviceTrucks', function (request, res) {
    Events.createTruckFromDevices(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/devicePlans', function (request, res) {
    Events.getDevicePlans(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/devicePlansHistory', function (request, res) {
    Events.devicePlansHistory(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/franchise', function (request, res) {
    Events.getFranchise(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/adminRoles', function (request, res) {
    Events.getAdminRoles(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/adminPermissions', function (request, res) {
    Events.getAdminPermissions(request,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/employees', function (request, res) {
    Events.getEmployeeData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/customers', function (request, res) {
    Events.getCustomerData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/completeData',function (request,res) {
    Events.getCompleteData(request,function (results) {
        res.json(results);
    })
});

OpenRouter.get('/get/alternateContact',function (req,res) {
    Events.getAlternateContact(req, function (results) {
        res.json(results);
    })
});

OpenRouter.get('/get/AccountOperatingRoutes', function (request, res) {
    Events.getAccountOperatingRoutes(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/trucksType', function (request, res) {
    Events.getTrucksTypeData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/goodsType', function (request, res) {
    Events.getGoodsTypeData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/loadsType', function (request, res) {
    Events.getLoadsTypeData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/orderStatus', function (request, res) {
    Events.getOrderStatusData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/customerLeads', function (request, res) {
    Events.getCustomerLeadsData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/CustomerOperatingRoutes', function (request, res) {
    Events.getCustomerOperatingRoutes(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/junkLeads', function (request, res) {
    Events.getJunkLeadsData(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/mapInstalledByToDevice', function (request, res) {
    Events.getMapInstalledByToDevice(request,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/getDevicesFromTracker', function (request, res) {
    Events.getDevicesFromTracker(function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.post('/get/addDeviceToTracker', function (request, res) {
    Events.addDeviceToTracker(req.body,function(results){
        //console.log(results);
        res.json(results);
    });
});

OpenRouter.get('/get/generateReportsByAccount', function (req, res) {
    Events.generateReportsByAccount(req.query,function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/generateReportsGroupByTruck',function (req,res) {
   Events.generateReportsGroupByTruck(req.query,function (result) {
       res.json(result);
   })
});

OpenRouter.get('/get/gpsSettingFromAccount',function (req,res) {
    Events.gpsSettingFromAccount(function (result) {
        res.json(result);
    })
});

AuthRouter.post('/uploadFile',multipartyMiddleware,function (req,res) {
    S3Bucket.UploadFile(req,function (result) {
        res.json(result);
    })
});

AuthRouter.delete("/deleteFile",function (req,res) {
   S3Bucket.deleteFileFromS3Bucket(req,function (result) {
       res.json(result);
   })
});
module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};