var express = require('express');
var AuthRouter = express.Router();
var CustomerLeads = require('../adminApis/customerLeadsApi');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

AuthRouter.get('/getCustomerLeads', function (req, res) {
    CustomerLeads.getCustomerLeads(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/totalCustomerLeads', function (req, res) {
    CustomerLeads.totalCustomerLeads(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/addCustomerLead', multipartyMiddleware, function (req, res) {
    CustomerLeads.addCustomerLead(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/updateCustomerLead',multipartyMiddleware, function (req, res) {
    CustomerLeads.updateCustomerLead(req, function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteCustomerLead', function (req, res) {
    CustomerLeads.deleteCustomerLead(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getCustomerLeadDetails', function (req, res) {
    CustomerLeads.getCustomerLeadDetails(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckOwners', function (req, res) {
    CustomerLeads.getTruckOwners(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/countTruckOwners', function (req, res) {
    CustomerLeads.countTruckOwners(req, function (result) {
        res.send(result);
    })
});

AuthRouter.post('/convertCustomerLead', function (req, res) {
    CustomerLeads.convertCustomerLead(req, function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getTruckOwnerDetails',function (req,res) {
    CustomerLeads.getTruckOwnerDetails(req,function (result) {
        res.send(result);
    })
});

AuthRouter.post('/updateTruckOwner',multipartyMiddleware,function (req,res) {
   CustomerLeads.updateTruckOwner(req,function (result) {
       res.send(result);
   })
});

AuthRouter.delete('/deleteTruckOwner', function (req, res) {
    CustomerLeads.deleteTruckOwner(req, function (result) {
        res.send(result);
    })
});

/*Author SVPrasadK*/
/*Transporter Start*/
AuthRouter.get('/countTransporter', function (req, res) {
    CustomerLeads.countTransporter(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getTransporter', function (req, res) {
    CustomerLeads.getTransporter(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getTransporterDetails', function (req, res) {
    CustomerLeads.getTransporterDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateTransporter', multipartyMiddleware, function (req, res) {
    CustomerLeads.updateTransporter(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteTransporter', function (req, res) {
    CustomerLeads.deleteTransporter(req, function (result) {
        res.send(result);
    });
});
/*Transporter End*/
/*Author SVPrasadK*/
/*Commission Agent Start*/
AuthRouter.get('/countCommissionAgent', function (req, res) {
    CustomerLeads.countCommissionAgent(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getCommissionAgent', function (req, res) {
    CustomerLeads.getCommissionAgent(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getCommissionAgentDetails', function (req, res) {
    CustomerLeads.getCommissionAgentDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateCommissionAgent', multipartyMiddleware, function (req, res) {
    CustomerLeads.updateCommissionAgent(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteCommissionAgent', function (req, res) {
    CustomerLeads.deleteCommissionAgent(req, function (result) {
        res.send(result);
    });
});
/*Commission Agent End*/
/*Author SVPrasadK*/
/*Factory Owners Start*/
AuthRouter.get('/countFactoryOwner', function (req, res) {
    CustomerLeads.countFactoryOwner(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getFactoryOwner', function (req, res) {
    CustomerLeads.getFactoryOwner(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getFactoryOwnerDetails', function (req, res) {
    CustomerLeads.getFactoryOwnerDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateFactoryOwner', multipartyMiddleware, function (req, res) {
    CustomerLeads.updateFactoryOwner(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteFactoryOwner', function (req, res) {
    CustomerLeads.deleteFactoryOwner(req, function (result) {
        res.send(result);
    });
});
/*Factory Owners End*/
/*Author SVPrasadK*/
/*Guest Start*/
AuthRouter.get('/countGuest', function (req, res) {
    CustomerLeads.countGuest(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getGuest', function (req, res) {
    CustomerLeads.getGuest(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getGuestDetails', function (req, res) {
    CustomerLeads.getGuestDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateGuest', function (req, res) {
    CustomerLeads.updateGuest(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteGuest', function (req, res) {
    CustomerLeads.deleteGuest(req, function (result) {
        res.send(result);
    });
});
/*Guest End*/
AuthRouter.delete('/deleteOperatingRoutes',function (req,res) {
    CustomerLeads.deleteOperatingRoutes(req,function (result) {
        res.send(result);
    })
});

AuthRouter.delete('/deleteTrafficManager',function (req,res) {
    CustomerLeads.deleteTrafficManager(req,function (result) {
        res.send(result);
    })
});

AuthRouter.get('/getEmployeesList',function (req,res) {
   CustomerLeads.getEmployeesList(req,function (result) {
       res.send()
   })
});

AuthRouter.get('/removeDoc',function (req,res) {
    CustomerLeads.removeDoc(req,function (result) {
        res.send()
    })
});

module.exports = {
    AuthRouter: AuthRouter
};