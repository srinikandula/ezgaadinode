var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var url = require('url');

var Events = require('./../apis/eventsApi');

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


module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};