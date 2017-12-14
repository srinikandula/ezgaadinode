var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

const ObjectId = mongoose.Types.ObjectId;

var TripCollection = require('./../models/schemas').TripCollection;
var ExpenseCostColl = require('./../models/schemas').ExpenseCostColl;

var Reports = function () {
};

Reports.prototype.getReport = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var totalFreight = 0;
    var totalExpense = 0;

    async.parallel({
        Revenue: function (revenueCallback) {
            async.parallel({
                totalFreight: function (totalFreightCallback) {
                    TripCollection.aggregate([{$match: {"accountId": ObjectId(jwt.accountId)}},
                            {$group: {_id: null, totalFreight: {$sum: "$freightAmount"}}}],
                        function (err, totalFreight) {
                            totalFreightCallback(err, totalFreight);
                        });
                },
                totalExpense: function (totalExpenseCallback) {
                    ExpenseCostColl.aggregate({$match: {"accountId": ObjectId(jwt.accountId)}},
                        {$group: {_id: null, totalExpenses: {$sum: "$cost"}}},
                        function (err, totalExpense) {
                            totalExpenseCallback(err, totalExpense);
                        });
                }
            }), function (error, result) {
                if(error) {
                    retObj.status = false;
                    retObj.messages.push(JSON.stringify(error));
                    callback(retObj);
                } else {
                    if(result) {
                        if(result.totalFreight[0]){
                            totalFreight = result.totalFreight[0].totalFreight;
                        }
                        if(result.totalExpense[0]){
                            totalExpense = result.totalExpense[0].totalExpense;
                        }
                        retObj.totalRevenue = totalFreight- totalExpense;
                    } else {
                        retObj.totalRevenue = 0;
                    }
                    callback(retObj);
                }
            }
        },
        Expenses: function (expenseCallback) {

        },
        Payments: function (paymentCallback) {

        },
        Expiry: function (expiryCallback) {

        }
    })
};

module.exports = new Reports();