var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var analytics = require('../apis/analyticsApi');

OpenRouter.get('/getLoginReports/:from/:to', function (req, res) {
    analytics.getLoginCounts(req.params.from,req.params.to,function (result) {
        res.send(result);
    });
});

OpenRouter.get('/getReports/:action/:from/:to', function (req, res) {
    analytics.getReports(req.params.action,req.params.from,req.params.to,function (result) {
        res.send(result);
    });
});

OpenRouter.get('/getCounts/:action/:from/:to', function (req, res) {
    analytics.getCounts(req.params.action,req.params.from,req.params.to,function (result) {
        res.send(result);
    });
});

OpenRouter.get('/getReportsByUserAgent/:userAgent/:from/:to',function (req,res) {
    analytics.getReportsByUserAgent(req.params.userAgent,req.params.from,req.params.to,function (result) {
        res.send(result);
    });
});

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};
