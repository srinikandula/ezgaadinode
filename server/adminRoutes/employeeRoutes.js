var express = require('express');
var AuthRouter = express.Router();
var Employees = require('../adminApis/employeeApi');
var logger = require('./../winston/logger')(module);

/*Author SVPrasadK*/
/*Employee Start*/
AuthRouter.get('/getEmployee', function (req, res) {
    Employees.getEmployee(req, function (result) {
        res.json(result);
    });
});

AuthRouter.post('/addEmployee', function (req, res) {
    Employees.addEmployee(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getEmployeeDetails', function (req, res) {
    Employees.getEmployeeDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateEmployee', function (req, res) {
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
/*Role End*/
/*Author SVPrasadK*/
/*Franchise Start*/
AuthRouter.get('/getFranchise', function (req, res) {
    Employees.getFranchise(req, function (result) {
        res.json(result)
    });
});

AuthRouter.post('/addFranchise', function (req, res) {
    Employees.addFranchise(req, function (result) {
        res.json(result);
    });
});

AuthRouter.get('/getFranchiseDetails', function (req, res) {
    Employees.getFranchiseDetails(req, function (result) {
        res.json(result);
    });
});

AuthRouter.put('/updateFranchise', function (req, res) {
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

module.exports = {
    AuthRouter: AuthRouter
};
