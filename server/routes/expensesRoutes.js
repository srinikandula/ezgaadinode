var express = require('express');
var OpenRouter = express.Router();
var AuthRouter = express.Router();
var ExpenseCost = require('../apis/expensesApi');

AuthRouter.post('/addExpense', function (req, res) {
    ExpenseCost.addExpense(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

// AuthRouter.get('/:pageNumber', function (req, res) {
//     ExpenseCost.getExpenseCosts(req.params, req.jwt, function (result) {
//         res.send(result);
//     });
// });

AuthRouter.get('/all/accountExpense', function (req, res) {
    ExpenseCost.getAllAccountExpenseCosts(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAll', function (req, res) {
    ExpenseCost.getAll(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/getAllExpenses', function (req, res) {
    ExpenseCost.getExpenseCosts(req.jwt, req.query, function (result) {
        res.json(result);
    });
});


AuthRouter.get('/getExpense/:expenseId', function (req, res) {
    ExpenseCost.findExpenseRecord(req.jwt,req.params.expenseId, function (result) {
        res.send(result);
    });
});


AuthRouter.put('/updateExpense', function (req, res) {
    ExpenseCost.updateExpenseCost(req.jwt, req.body, function (result) {
        res.send(result);
    });
});

AuthRouter.delete('/:expenseId', function (req, res) {
    ExpenseCost.deleteExpenseRecord(req.jwt,req.params.expenseId, function (result) {
        res.send(result);
    });
});
AuthRouter.get('/total/count', function (req, res) {
    ExpenseCost.countExpense(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/total', function (req, res) {
    ExpenseCost.findTotalExpenses(req.jwt, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/groupByVehicle', function (req, res) {
    ExpenseCost.findExpensesByVehicles(req.jwt, req.query, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/vehicleExpense/:vehicleId', function (req, res) {
    ExpenseCost.findExpensesForVehicle(req.jwt,req.params.vehicleId, function (result) {
        res.send(result);
    });
});

AuthRouter.get('/shareExpensesDetailsViaEmail',function(req,res){
    ExpenseCost.shareExpensesDetailsViaEmail(req.jwt,req.query, function (result) {
        res.send(result);
    });
})
AuthRouter.get('/downloadExpenseDetailsByVechicle',function(req,res){
    ExpenseCost.downloadExpenseDetailsByVechicle(req.jwt,req.query, function (result) {
        if(result.status){
            res.xls('expense'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }   
    });
})

AuthRouter.get('/downloadPaybleDetailsByParty',function(req,res){
    ExpenseCost.downloadPaybleDetailsByParty(req.jwt,req.query, function (result) {
        if(result.status){
            res.xls('payble'+new Date().toLocaleDateString()+'.xlsx', result.data);
        }else{
            res.send(result);
        }   
    });
})
AuthRouter.get('/getPaybleAmountByParty',function(req,res){
    ExpenseCost.getPaybleAmountByParty(req.jwt,req.query,function(result){
        res.send(result);
    })
})

AuthRouter.get('/sharePayableDetailsViaEmail',function(req,res){
    ExpenseCost.sharePayableDetailsViaEmail(req.jwt,req.query, function (result) {
        res.send(result);
    });
})

AuthRouter.get('/getPaybleAmountByPartyId',function(req,res){
    ExpenseCost.getPaybleAmountByPartyId(req.jwt,req.query, function (result) {
        res.send(result);
    });
})

module.exports = {
    OpenRouter: OpenRouter,
    AuthRouter: AuthRouter
};