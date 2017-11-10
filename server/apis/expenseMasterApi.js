var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var ExpenseMasterColl = require('./../models/schemas').expenseMasterColl;

var config = require('./../config/config');
var Utils = require('./utils');

var ExpenseMaster = function () {
};

ExpenseMaster.prototype.addExpense = function (jwt, details, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!details.expenseName || !_.isString(details.expenseName)) {
        retObj.messages.push("Please provide valid expense name");
        callback(retObj);
    }
    if (!retObj.messages.length) {
        ExpenseMasterColl.findOne({expenseName: details.expenseName}, function (err, expense) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (expense) {
                retObj.messages.push("Expense already exists");
                callback(retObj);
            } else {
                details.createdBy = jwt.id;
                details.updatedBy = jwt.id;
                var insertDoc = new ExpenseMasterColl(details);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.messages.push("Error, try Again");
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Successfully Added");
                        callback(retObj);
                    }
                });
            }
        });
    }
};

ExpenseMaster.prototype.getAllExpenses = function (callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ExpenseMasterColl.find({}, {expenseName: 1}, function (err, expenses) {
        if (err) {
            retObj.messages.push('Error getting expenses');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.expenses = expenses;
            callback(retObj);
        }
    });
};

ExpenseMaster.prototype.updateExpense = function (jwt, expenseDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseDetails = Utils.removeEmptyFields(expenseDetails);
    expenseDetails.updatedBy = jwt.id;
    ExpenseMasterColl.findOneAndUpdate({_id: expenseDetails._id}, {$set: expenseDetails}, {new: true}, function (err, expense) {
        if (err) {
            retObj.messages.push("Error while updating expense, try Again");
            callback(retObj);
        } else if (expense) {
            retObj.status = true;
            retObj.messages.push("Expense updated successfully");
            callback(retObj);
        } else {
            retObj.messages.push("Error, finding expense");
            callback(retObj);
        }
    });
};

ExpenseMaster.prototype.deleteExpense = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    ExpenseMasterColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.messages.push('Error deleting expense');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Successfully Deleted !!');
            callback(retObj);
        }
    });
};

module.exports = new ExpenseMaster();