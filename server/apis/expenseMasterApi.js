var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var ExpenseMasterColl = require('./../models/schemas').expenseMasterColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');

var config = require('./../config/config');
var Utils = require('./utils');

var ExpenseMaster = function () {
};

ExpenseMaster.prototype.addExpenseType = function (jwt, expenseMasterdetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!expenseMasterdetails.expenseName || !_.isString(expenseMasterdetails.expenseName)) {
        retObj.messages.push("Please provide valid expense name");
        analyticsService.create(req,serviceActions.add_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }
    if (!retObj.messages.length) {
        ExpenseMasterColl.findOne({'accountId':jwt.accountId, expenseName: expenseMasterdetails.expenseName}, function (err, expense) {
            if (err) {
                retObj.messages.push("Error, try again!");
                analyticsService.create(req,serviceActions.add_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (expense) {
                retObj.messages.push("Expense already exists");
                analyticsService.create(req,serviceActions.add_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                expenseMasterdetails.createdBy = jwt.id;
                expenseMasterdetails.updatedBy = jwt.id;
                expenseMasterdetails.accountId = jwt.accountId;
                var insertDoc = new ExpenseMasterColl(expenseMasterdetails);
                insertDoc.save(function (err, newDoc) {
                    if (err) {
                        retObj.messages.push("Error, try Again");
                        analyticsService.create(req,serviceActions.add_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Successfully Added");
                        retObj.newDoc = newDoc;
                        analyticsService.create(req,serviceActions.add_expense_type,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                        callback(retObj);
                    }
                });
            }
        });
    }
};

ExpenseMaster.prototype.getAllAccountExpenses = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {}
    if (!params.page) {
        params.page = 1;
    } else if (!_.isNumber(Number(params.page))) {
        retObj.status = false;
        retObj.messages.push('Invalid page number');
        analyticsService.create(req,serviceActions.get_all_acc_expenses_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        return callback(retObj);
    }
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.limit ? parseInt(params.limit) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) :{createdAt: -1};

    ExpenseMasterColl
        .find({$or:[{'accountId': jwt.accountId},{isDefault:true}]})
        .sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .lean()
        .exec(function (err, expenses) {
            if(expenses){
                Utils.populateNameInUsersColl(expenses, "createdBy", function (response) {
                    if (!response.status) {
                        retObj.messages.push('Error getting expenses');
                        analyticsService.create(req,serviceActions.get_all_acc_expenses_err,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.expenses = response.documents;
                        analyticsService.create(req,serviceActions.get_all_acc_expenses,{body:JSON.stringify(req.query),accountId:req.jwt.id,success:true},function(response){ });
                        callback(retObj);
                    }
                });
            }
        });
    /*ExpenseMasterColl.find({accountId:jwt.accountId}, {expenseName: 1}, function (err, expenses) {
        if (err) {
            retObj.messages.push('Error getting expenses');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.expenses = expenses;
            callback(retObj);
        }
    });*/
};

ExpenseMaster.prototype.getExpenseType = function (jwt, id,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ExpenseMasterColl.findOne({_id:id}, function (err, expenseType) {
        if (err) {
            retObj.messages.push('Error getting expenseType');
            analyticsService.create(req,serviceActions.get_expense_type_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.expenseType = expenseType;
            analyticsService.create(req,serviceActions.get_expense_type,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

ExpenseMaster.prototype.updateExpenseType = function (jwt, expenseMasterdetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseMasterdetails = Utils.removeEmptyFields(expenseMasterdetails);
    expenseMasterdetails.updatedBy = jwt.id;
    ExpenseMasterColl.findOneAndUpdate({
        accountId: jwt.accountId,
        _id: expenseMasterdetails._id
    }, {$set: expenseMasterdetails}, {new: true}, function (err, expense) {
        if (err) {
            retObj.messages.push("Error while updating expense, try Again");
            analyticsService.create(req,serviceActions.update_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (expense) {
            retObj.status = true;
            retObj.messages.push("Expense updated successfully");
            analyticsService.create(req,serviceActions.update_expense_type,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.messages.push("Error, finding expense");
            analyticsService.create(req,serviceActions.update_expense_type_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
};

ExpenseMaster.prototype.deleteExpenseType = function (jwt, id,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    ExpenseMasterColl.remove({accountId: jwt.accountId, _id: id}, function (err,result) {
        if (err) {
            retObj.messages.push('Error deleting expense');
            analyticsService.create(req,serviceActions.delete_expense_type_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if(result && result.n == 1){
            retObj.status = true;
            retObj.messages.push('Successfully Deleted !!');
            analyticsService.create(req,serviceActions.delete_expense_type,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }else {
            retObj.status = false;
            retObj.messages.push('Error deleting expense');
            analyticsService.create(req,serviceActions.delete_expense_type_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
};

ExpenseMaster.prototype.count = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ExpenseMasterColl.find({accountId: jwt.accountId}, function (err, expensesCount) {
        if (err) {
            retObj.messages.push('Error getting expenses count');
            analyticsService.create(req,serviceActions.count_expense_types_err,{accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = expensesCount.length;
            analyticsService.create(req,serviceActions.count_expense_types,{accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

module.exports = new ExpenseMaster();