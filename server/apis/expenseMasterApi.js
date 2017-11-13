var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var ExpenseMasterColl = require('./../models/schemas').expenseMasterColl;

var config = require('./../config/config');
var Utils = require('./utils');

var ExpenseMaster = function () {
};

ExpenseMaster.prototype.addExpense = function (jwt, expenseMasterdetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!expenseMasterdetails.expenseName || !_.isString(expenseMasterdetails.expenseName)) {
        retObj.messages.push("Please provide valid expense name");
        callback(retObj);
    }
    if (!retObj.messages.length) {
        ExpenseMasterColl.findOne({expenseName: expenseMasterdetails.expenseName}, function (err, expense) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (expense) {
                retObj.messages.push("Expense already exists");
                callback(retObj);
            } else {
                expenseMasterdetails.createdBy = jwt.id;
                expenseMasterdetails.updatedBy = jwt.id;
                expenseMasterdetails.accountId = jwt.accountId;
                var insertDoc = new ExpenseMasterColl(expenseMasterdetails);
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

ExpenseMaster.prototype.getAllAccountExpenses = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    ExpenseMasterColl.find({accountId:jwt.accountId}, {expenseName: 1}, function (err, expenses) {
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

ExpenseMaster.prototype.updateExpense = function (jwt, expenseMasterdetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    expenseMasterdetails = Utils.removeEmptyFields(expenseMasterdetails);
    expenseMasterdetails.updatedBy = jwt.id;
    ExpenseMasterColl.findOneAndUpdate({accountId:jwt.accountId, _id: expenseMasterdetails._id}, {$set: expenseMasterdetails}, {new: true}, function (err, expense) {
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

ExpenseMaster.prototype.deleteExpense = function (jwt, id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    ExpenseMasterColl.remove({accountId:jwt.accountId, _id: id}, function (err) {
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