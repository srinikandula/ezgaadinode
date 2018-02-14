var express = require('express');
var AuthRouter = express.Router();
var Employees = require('../adminApis/employeeApi');
var logger = require('./../winston/logger')(module);
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

/*Author SVPrasadK*/
/*Employee Start*/
AuthRouter.get('/countEmployee', function (req, res) {
    Employees.countEmployee(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getEmployee', function (req, res) {
    Employees.getEmployee(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addEmployee', multipartyMiddleware, function (req, res) {
    Employees.addEmployee(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getEmployeeDetails', function (req, res) {
    Employees.getEmployeeDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateEmployee', multipartyMiddleware, function (req, res) {
    Employees.updateEmployee(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteEmployee', function (req, res) {
    Employees.deleteEmployee(req, function (result) {
        res.send(result);
    });
});
/*Employee End*/
/*Author SVPrasadK*/
/*Role Start*/
AuthRouter.get('/countRole', function (req, res) {
    Employees.countRole(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getRole', function (req, res) {
    Employees.getRole(req, function (result) {
        res.json(result)
    });
});

AuthRouter.post('/addRole', function (req, res) {
    Employees.addRole(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getRoleDetails', function (req, res) {
    Employees.getRoleDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateRole', function (req, res) {
    Employees.updateRole(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteRole', function (req, res) {
    Employees.deleteRole(req, function (result) {
        res.json(result);
    });
});
/*Role End*/
/*Author SVPrasadK*/
/*Franchise Start*/
AuthRouter.get('/countFranchise', function (req, res) {
    Employees.countFranchise(req, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getFranchise', function (req, res) {
    Employees.getFranchise(req, function (result) {
        res.json(result)
    });
});

AuthRouter.post('/addFranchise', multipartyMiddleware, function (req, res) {
    Employees.addFranchise(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getFranchiseDetails', function (req, res) {
    Employees.getFranchiseDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/updateFranchise', multipartyMiddleware, function (req, res) {
    Employees.updateFranchise(req, function (result) {
        res.json(result);
    });
});

AuthRouter.delete('/deleteFranchise', function (req, res) {
    Employees.deleteFranchise(req, function (result) {
        res.send(result);
    });
});
/*Franchise End*/
/*Author SVPrasadK*/
/*Drop Down Start*/
AuthRouter.get('/adminRolesDropDown', function (req, res) {
    Employees.adminRolesDropDown(req, function (result) {
        res.json(result)
    });
});

AuthRouter.get('/franchiseDropDown', function (req, res) {
    Employees.franchiseDropDown(req, function (result) {
        res.json(result)
    });
});
/*Drop Down Stop*/

module.exports = {
    AuthRouter: AuthRouter
};
