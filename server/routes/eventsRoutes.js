var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var url = require('url');

var Events = require('./../apis/eventsApi');

var EventData = require('./../apis/eventDataApi');

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
        res.json(retObj);
    }else {
        Events.getEventData(request.params.accountId, startDate.getTime()/1000, endDate.getTime()/1000, function(result) {
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
        res.json(retObj);
    }else {
        Events.getEventData('s.rlogistics@yahoo.com', startDate.getTime()/1000, endDate.getTime()/1000, function(result) {
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
            Events.getEventData('s.rlogistics@yahoo.com', startDate.getTime()/1000, endDate.getTime()/1000, function(response) {
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

OpenRouter.get('/get/groupMap', function (request, res) {
    EventData.getGroupMapEvents(function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/trackEvents/:vehicleNumber', function (request, res) {
    EventData.getTrackEvents(request.params.vehicleNumber, function(results){
        res.json(results);
    });
});

OpenRouter.get('/get/user', function (request, res) {
    Events.getUserData(function(results){
        //console.log(results);
        res.json(results);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};