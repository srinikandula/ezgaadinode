var express = require('express');
var AuthRouter = express.Router();
var Settings = require('../adminApis/settingsApi');
var logger = require('./../winston/logger')(module);

AuthRouter.get('/getTruckTypes', function (req, res) {
    Settings.getTruckTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/totalTruckTypes',function (req,res) {
    Settings.totalTruckTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addTruckType', function (req, res) {
    Settings.addTruckType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateTruckType', function (req, res) {
    Settings.updateTruckType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteTruckType', function (req, res) {
    Settings.deleteTruckType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckTypeDetails', function (req, res) {
    Settings.getTruckTypeDetails(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getGoodsTypes', function (req, res) {
    Settings.getGoodsTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/totalGoodsTypes',function (req,res) {
    Settings.totalGoodsTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addGoodsType', function (req, res) {
    Settings.addGoodsType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateGoodsType', function (req, res) {
    Settings.updateGoodsType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteGoodsType', function (req, res) {
    Settings.deleteGoodsType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getGoodsTypeDetails', function (req, res) {
    Settings.getGoodsTypeDetails(req, function (result) {
        res.send(result);
    })
});
AuthRouter.get('/getLoadTypes', function (req, res) {
    Settings.getLoadTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/totalLoadsTypes',function (req,res) {
    Settings.totalLoadsTypes(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addLoadType', function (req, res) {
    Settings.addLoadType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.put('/updateLoadType', function (req, res) {
    Settings.updateLoadType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteLoadType', function (req, res) {
    Settings.deleteLoadType(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getLoadTypeDetails', function (req, res) {
    Settings.getLoadTypeDetails(req, function (result) {
        res.send(result);
    })
});
/*Author SVPrasadK*/

AuthRouter.get('/getPlan', function (req, res) {
    Settings.getPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addPlan', function (req, res) {
    Settings.addPlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getPlanDetails', function (req, res) {
    Settings.getPlanDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updatePlan', function (req, res) {
    Settings.updatePlan(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deletePlan', function (req, res) {
    Settings.deletePlan(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/planCount', function (req, res) {
    Settings.planCount(req, function (result) {
        res.send(result);
    });
});

module.exports = {
    AuthRouter: AuthRouter
};
