var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var Utils = require('./../apis/utils');
var mongoose = require('mongoose');
var pageLimits = require('./../config/pagination');
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/adminConstants');
var AccountsColl = require('./../models/schemas').AccountsColl;
var keysColl = require('./../models/schemas').keysColl;
var OperatingRoutesColl = require('./../models/schemas').OperatingRoutesColl;
var AccountDevicePlanHistoryColl = require('./../models/schemas').AccountDevicePlanHistoryColl;
var ErpPlanHistoryColl = require('./../models/schemas').ErpPlanHistoryColl;
var PaymentsColl = require('./../models/schemas').PaymentsColl;
var GpsSettingsColl = require('./../models/schemas').GpsSettingsColl;
var DeviceColl = require('./../models/schemas').DeviceColl;

const uuidv1 = require('uuid/v1');

const ObjectId = mongoose.Types.ObjectId;

var Accounts = function () {
};

Accounts.prototype.totalAccounts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var query = {};
    var params = req.params;
    if (params.type === 'gps') {
        query = {gpsEnabled: true};
    } else if (params.type === 'erp') {
        query = {erpEnabled: true}
    } else if (params.type === 'both') {
        query = {erpEnabled: true, gpsEnabled: true}
    } else if (params.type === 'accounts') {
        query = {type: 'account', role: {$nin: ['employee']}}
    }
    AccountsColl.count(query, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_accounts_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = doc;
            analyticsService.create(req, serviceActions.count_accounts, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Accounts.prototype.getAccounts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var query = {};
    if (params.type === 'gps') {
        query = {gpsEnabled: true};
    } else if (params.type === 'erp') {
        query = {erpEnabled: true}
    } else if (params.type === 'both') {
        query = {erpEnabled: true, gpsEnabled: true}
    } else if (params.type === 'accounts') {
        query = {type: 'account', role: {$nin: ['employee']}}
    }
    if (params.sortableString === 'smsEnabled') query.smsEnabled = true;
    else if (params.sortableString === 'smsDisabled') query.smsEnabled = false;
    else if (params.sortableString === 'statusEnabled') query.isActive = true;
    else if (params.sortableString === 'statusDisbled') query.isActive = false;
    else if (params.sortableString === 'Trucks') query.truckType = 'Trucks';
    else if (params.sortableString === 'Non Trucks') query.truckType = 'Non Trucks';
    else if (params.sortableString === 'Both') query.truckType = 'Both';
    if (params.searchString) query.$or = [{"contactName": new RegExp(params.searchString, "gi")}];
    async.parallel({
        accounts: function (accountsCallback) {
            AccountsColl
                .find(query).populate('createdBy', {userName: 1})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, accounts) {
                    Utils.populateNameInUsersColl(accounts, "createdBy", function (response) {
                        if (response.status) {
                            accountsCallback(err, response.documents);
                        } else {
                            accountsCallback(err, null);
                        }
                    });
                });
        },
        count: function (countCallback) {
            AccountsColl.count(query, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_accounts_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (params.type === 'accounts') {

                async.map(docs.accounts, function (account, asynCalback) {
                    async.parallel({
                        gpsDate: function (gpsCallback) {
                            AccountDevicePlanHistoryColl.findOne({accountId: account._id}, function (errGps, gpsDateOfAccount) {
                                gpsCallback(errGps, gpsDateOfAccount);
                            });
                        },
                        erpDate: function (gpsCallback) {
                            ErpPlanHistoryColl.findOne({accountId: account._id}, function (errErp, erpDateOfAccount) {
                                gpsCallback(errErp, erpDateOfAccount);
                            });
                        }
                    }, function (errDates, dates) {
                        if (dates.gpsDate) account.gpsDate = dates.gpsDate.createdAt;
                        else account.gpsDate = '--';
                        if (dates.erpDate) account.erpDate = dates.erpDate.createdAt;
                        else account.erpDate = '--';

                        asynCalback(errDates, dates);

                    });
                }, function (errAllDates, allDates) {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = docs.count;
                    retObj.accounts = docs.accounts;
                    analyticsService.create(req, serviceActions.get_accounts, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                });
            }
            else {
                /*Get gps enabled trucks count in account*/
                async.map(docs.accounts, function (account, asynCalback) {
                    DeviceColl.count({accountId: account._id}, function (errTruck, noOfTruck) {
                        if(!errTruck){
                            account.noOfTrucks=noOfTruck;
                        }
                        asynCalback(errTruck, noOfTruck);
                    })
                },function (err) {
                    if(err){
                        retObj.messages.push('Error retrieving accounts');
                        analyticsService.create(req, serviceActions.get_accounts_err, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    }else{
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.count = docs.count;
                        retObj.accounts = docs.accounts;
                        analyticsService.create(req, serviceActions.get_accounts, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);

                    }
                });
            }
        }
    });
};

Accounts.prototype.checkAvailablity = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var query = {userName: req.body.userName};
    if (req.body._id) query = {userName: req.body.userName, _id: {$nin: [req.body._id]}};
    AccountsColl.findOne(query, function (erruser, user) {
        if (erruser) {
            retObj.messages.push('Error checking availability');
            analyticsService.create(req, serviceActions.add_account_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (user) {
            retObj.messages.push('Username already exists');
            analyticsService.create(req, serviceActions.add_account_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Username available');
            analyticsService.create(req, serviceActions.add_account_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.deleteRoute = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    OperatingRoutesColl.remove({_id: req.params.id}, function (err, removed) {
        if (err) {
            retObj.messages.push('unable to remove operating route');
            analyticsService.create(req, serviceActions.remove_operating_route, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('operating route removed');
            analyticsService.create(req, serviceActions.remove_operating_route, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.addAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body.account;
    var routes = req.body.routes;
    var query = {};
    if (!accountInfo._id) {
        query = {_id: mongoose.Types.ObjectId()};
        accountInfo.createdBy = req.jwt.id;
    } else {
        query = {_id: accountInfo._id}
    }
    accountInfo.updatedBy = req.jwt.id;

    if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.messages.push('Invalid User Name');
    }
    if (!accountInfo.contactName || !_.isString(accountInfo.contactName)) {
        retObj.messages.push('Invalid Full Name');
    }
    if (!accountInfo.password || accountInfo.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be at least 5 characters');
    }
    if (!accountInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }
    if (!accountInfo.role) {
        retObj.messages.push('Invalid role');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        accountInfo.type = 'account';
        generateUniqueUserId(accountInfo.role, function (newId) {
            if (!newId.status) {
                retObj.messages.push('Error saving account.');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                accountInfo.userId = newId.userId;
                delete accountInfo.__v;
                AccountsColl.update(query, accountInfo, {upsert: true},
                    function (errSaved, saved) {
                    if (errSaved) {
                        retObj.messages.push('Error saving account');
                        analyticsService.create(req, serviceActions.add_account_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        async.map(routes, function (route, asynCallback) {
                            var routeQuery = {accountId: query._id};
                            if (route._id) {
                                routeQuery._id = route._id;
                            } else {
                                routeQuery = {_id: mongoose.Types.ObjectId()};
                                route.createdBy = req.jwt.id;
                            }
                            route.updatedBy = req.jwt.id;
                            delete route.__v;
                            OperatingRoutesColl.update(routeQuery, route, {upsert: true}, function (errroute, routeSaved) {
                                if (errroute) {
                                    retObj.messages.push('Error adding/updating route');
                                    asynCallback(errroute);
                                } else {
                                    asynCallback(null, 'saved');
                                }
                            });
                        }, function (errasync, async) {
                            if (errasync) {
                                retObj.messages.push('Error adding/updating routes');
                                analyticsService.create(req, serviceActions.add_account_err, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: false,
                                    messages: retObj.messages
                                }, function (response) {
                                });
                                callback(retObj);
                            } else {
                                addGpsSettings(accountInfo.gpsEnabled, accountInfo._id, function (gpsAdded) {
                                    if (!gpsAdded.status) {
                                        retObj.messages.push(gpsAdded.message);
                                        analyticsService.create(req, serviceActions.add_account_err, {
                                            body: JSON.stringify(req.body),
                                            accountId: req.jwt.id,
                                            success: false,
                                            messages: retObj.messages
                                        }, function (response) {
                                        });
                                        callback(retObj);
                                    } else {
                                        retObj.status = true;
                                        retObj.messages.push('Success');
                                        analyticsService.create(req, serviceActions.add_account, {
                                            body: JSON.stringify(req.body),
                                            accountId: req.jwt.id,
                                            success: true
                                        }, function (response) {
                                        });
                                        callback(retObj);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

function generateUniqueUserId(userType, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (userType === 'Truck Owner') {
        retObj.userId = "TO" + parseInt(Math.random() * 100000);
    } else if (userType === 'Manufacturer') {
        retObj.userId = "MF" + parseInt(Math.random() * 100000);
    } else if (userType === 'Commission Agent') {
        retObj.userId = "CA" + parseInt(Math.random() * 100000);
    } else if (userType === 'Transporter') {
        retObj.userId = "TR" + parseInt(Math.random() * 100000);
    } else if (userType === 'Factory Owners') {
        retObj.userId = "FO" + parseInt(Math.random() * 100000);
    }
    AccountsColl.findOne({userId: retObj.userId}, function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (doc) {
            generateUniqueUserId(userType, callback);
        } else {
            retObj.status = true;
            callback(retObj);
        }
    })
}

function addGpsSettings(enabled, id, callback) {
    if (enabled) {
        GpsSettingsColl.findOne({accountId: id}, function (errSetting, setting) {
            if (errSetting) {
                callback({status: false, message: 'error getting settings'});
            } else if (setting) {
                callback({status: true, message: 'already added'});
            } else {
                var gpsDoc = new GpsSettingsColl({accountId: id});
                gpsDoc.save(function (errGpsSaved, gpsSaved) {
                    callback({status: true, message: 'gps settings added'});
                });
            }
        });
    } else {
        callback({status: true, message: 'already added'});
    }
}

Accounts.prototype.getAccountDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountId = req.params.accountId;
    if (!Utils.isValidObjectId(accountId)) {
        retObj.messages.push('Invalid accountId');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_account_details_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        async.parallel({
            accountInfo: function (accountsInfoCallback) {
                AccountsColl.findOne({"_id": ObjectId(accountId)}, function (err, account) {
                    if (err) {
                        retObj.messages.push('Error retrieving account');
                        accountsInfoCallback(err);
                    } else if (account) {
                        retObj.messages.push('Successfully retrieved account');
                        accountsInfoCallback(null, account);
                    } else {
                        retObj.messages.push('Account with Id doesn\'t exist');
                        accountsInfoCallback('Account with Id doesn\'t exist');
                    }
                });
            },
            operatingRoutes: function (routesCallback) {
                OperatingRoutesColl.find({accountId: ObjectId(accountId)}, function (errroutes, routes) {
                    if (errroutes) {
                        retObj.messages.push('Error retrieving routes');
                        routesCallback(errroutes);
                    } else {
                        retObj.messages.push('Successfully retrieved routes');
                        routesCallback(null, routes);
                    }
                });
            },
            assignedPlans: function (plansCallback) {
                ErpPlanHistoryColl.find({accountId: ObjectId(accountId)}).populate('planId', {
                    planName: 1,
                    amount: 1
                }).sort({expiryTime: -1}).exec(function (errplans, plans) {
                    if (errplans) {
                        retObj.messages.push('Error retrieving plans');
                        plansCallback(errplans);
                    } else {
                        retObj.messages.push('Successfully retrieved plans');
                        plansCallback(null, plans);
                    }
                });
            }
        }, function (errdetails, accountDetails) {
            if (errdetails) {
                analyticsService.create(req, serviceActions.get_account_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.accountDetails = accountDetails.accountInfo;
                retObj.accountRoutes = accountDetails.operatingRoutes;
                retObj.assignedPlans = accountDetails.assignedPlans;
                retObj.enableForm = true;
                if (accountDetails.assignedPlans.length) {
                    var expiryDate = new Date(accountDetails.assignedPlans[accountDetails.assignedPlans.length - 1].expiryTime);
                    var today = new Date();
                    var daysRemaining = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysRemaining > 30) retObj.enableForm = false;
                    // console.log($scope.daysRemaining);
                }
                analyticsService.create(req, serviceActions.get_account_details, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body;
    if (!Utils.isValidObjectId(accountInfo.accountId)) {
        retObj.messages.push('Invalid account Id');
    }

    if (accountInfo.oldPassword) {
        if (!accountInfo.newPassword) {
            retObj.messages.push('Please Provide New Password');
        }
        if (accountInfo.confirmPassword !== accountInfo.newPassword) {
            retObj.messages.push('Passwords Not Matched');
        }
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_account_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (accountInfo.oldPassword) {
            AccountsColl.findOne({
                _id: accountInfo.accountId,
                password: accountInfo.oldPassword
            }, function (err, oldAcc) {
                if (err) {
                    retObj.messages.push('Please Try Again');
                    analyticsService.create(req, serviceActions.update_account_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (oldAcc) {
                    accountInfo.password = accountInfo.newPassword;
                    updateAccounts(req, callback)
                } else {
                    retObj.messages.push('Invalid Password');
                    analyticsService.create(req, serviceActions.update_account_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            updateAccounts(req, callback)
        }
    }
};

function updateAccounts(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var accountInfo = req.body;
    accountInfo.updatedBy = req.jwt.id;
    AccountsColl.findOneAndUpdate({_id: accountInfo.accountId}, {$set: accountInfo}, function (err, oldAcc) {
        if (err) {
            retObj.messages.push('Error updating the account');
            analyticsService.create(req, serviceActions.update_account_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldAcc) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = oldAcc;
            analyticsService.create(req, serviceActions.update_account, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('Account doesn\'t exist');
            analyticsService.create(req, serviceActions.update_account_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Accounts.prototype.deleteAccount = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var accountId = req.body.accountId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(accountId)) {
        retObj.messages.push('Invalid account id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_account_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.remove({_id: accountId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting account');
                analyticsService.create(req, serviceActions.delete_account_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting account Record');
                analyticsService.create(req, serviceActions.delete_account_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                analyticsService.create(req, serviceActions.delete_account, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.assignPlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.planDetails;
    if (!params.planId) {
        retObj.messages.push('Select a plan');
    }
    if (!params.startTime) {
        retObj.messages.push('Select start date');
    }
    if (!params.expiryTime) {
        retObj.messages.push('Select expiry date');
    }
    if (params.expiryTime < params.startTime) {
        retObj.messages.push('expiry date should be greater than start date');
    }
    if (!params.amount) {
        retObj.messages.push('select an amount');
    }
    if (retObj.messages.length < 1) {
        params.creationTime = new Date();
        params.received = true;
        async.parallel({
            assignPlan: function (assignCallback) {
                params.createdBy = req.jwt.id;
                params.updatedBy = req.jwt.id;
                var doc = {};
                if (req.body.type === 'gps') doc = new AccountDevicePlanHistoryColl(params);
                else doc = new ErpPlanHistoryColl(params);
                doc.save(function (errAssign, assigned) {
                    if (errAssign) {
                        retObj.messages.push(errAssign);
                        assignCallback(errAssign);
                    } else {
                        assignCallback(null, assigned);
                    }
                });
            },
            createPayment: function (paymentCallback) {
                var paymentData = {
                    accountId: params.accountId,
                    planId: params.planId,
                    amountPaid: params.amount,
                    createdBy: req.jwt.id,
                    updatedBy: req.jwt.id
                };
                if (params.type === 'gps') paymentData.type = 'gps';
                else paymentData.type = 'erp';
                var doc = new PaymentsColl(paymentData);
                doc.save(function (errPayment, payment) {
                    if (errPayment) {
                        retObj.messages.push('errPayment');
                        paymentCallback(errPayment);
                    } else {
                        paymentCallback(null, payment);
                    }
                });
            }
        }, function (errSaving, saved) {
            if (errSaving) {
                retObj.status = false;
                retObj.messages.push('Please try again');
                analyticsService.create(req, serviceActions.assign_erp_plan_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Success');
                analyticsService.create(req, serviceActions.assign_erp_plan_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.createKeys = function (accountId, access, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var apiKey = new ObjectId();
    var secretKey = uuidv1();
    var data = {accountId: accountId, apiKey: apiKey, secretKey: secretKey, globalAccess: access};
    var keysData = new keysColl(data);
    keysData.save(function (err, result) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Please try again');
            analyticsService.create(req, serviceActions.cre_key_pair_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = result;
            analyticsService.create(req, serviceActions.cre_key_pair, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Accounts.prototype.getKeyPairsForAccount = function (accountId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    keysColl.find({accountId: accountId}, function (err, keys) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Please try again');
            analyticsService.create(req, serviceActions.get_acc_key_pairs_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.results = keys;
            analyticsService.create(req, serviceActions.get_acc_key_pairs, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })

};

Accounts.prototype.deleteKeyPair = function (id, accountId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    keysColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Please try again');
            analyticsService.create(req, serviceActions.del_key_pair_err, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Keypair deleted successfully');
            analyticsService.create(req, serviceActions.del_key_pair, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

module.exports = new Accounts();