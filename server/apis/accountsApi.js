var async = require('async');
var _ = require('underscore');
var fs = require('fs');

var Utils = require('./utils');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var pageLimits = require('./../config/pagination');
var AccountsColl = require('./../models/schemas').AccountsColl;
var GroupsColl = require('./../models/schemas').GroupsColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var OperatingRoutesColl = require('./../models/schemas').OperatingRoutesColl;

var Trips = require('./tripsApi');
var Expenses = require('./expensesApi');
var PaymentsReceived = require('./paymentsReceivedAPI');
var Trucks = require('./truckAPIs');
var Receipts = require('./receiptsApi');
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');

var Accounts = function () {
};

Accounts.prototype.addAccount = function (jwtObj, accountInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountInfo.userName || !_.isString(accountInfo.userName)) {
        retObj.messages.push('Invalid User Name');
    }

    if (!accountInfo.password || accountInfo.password.trim().length < 5) {
        retObj.messages.push('Invalid password. Password has to be atleast 5 characters');
    }

    if (!accountInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
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
    } else {
        AccountsColl.findOne({userName: accountInfo.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account with same userName already exists');
                analyticsService.create(req, serviceActions.add_account_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                accountInfo.createdBy = jwtObj.id;
                accountInfo.type = "account";
                (new AccountsColl(accountInfo)).save(function (err, savedAcc) {
                    if (err) {
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
                        accountInfo.accountId = savedAcc._id;
                        accountInfo.type = "account";
                        retObj.status = true;
                        retObj.messages.push('Success');
                        analyticsService.create(req, serviceActions.add_account, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                        /*(new GroupsColl(accountInfo)).save(function (err) {
                            if (err) {
                                retObj.messages.push('Error saving user');
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push('Success');
                                callback(retObj);
                            }
                        });*/

                    }
                });
            }
        });
    }
};

Accounts.prototype.getAccounts = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var query = {"type": "account"};
    if (params.filter && params.filter.trim().length > 0) {
        query = {"userName": {$regex: params.filter.trim()}};
    }
    async.parallel({
        accounts: function (accountsCallback) {
            AccountsColl
                .find(query)
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
    }, function (err, results) {
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
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.accounts = results.accounts;
            analyticsService.create(req, serviceActions.get_accounts, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.getAllAccounts = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({}, {name: 1}, function (err, accounts) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_all_accounts_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.accounts = accounts;
            analyticsService.create(req, serviceActions.get_all_accounts, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.getAllAccountsForDropdown = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = params.size ? parseInt(params.size) : 0;
    if (params.name) {
        condition = {userName: {$regex: '.*' + params.name + '.*'},role: "Truck Owner"}
    } else {
        condition = {role: "Truck Owner"}
    }
    AccountsColl.find(condition, {userName: 1})
        .sort({userName:1})
        .skip(skipNumber)
        .limit(10).exec( function (err, accounts) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_all_accounts_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.accounts = accounts;
            analyticsService.create(req, serviceActions.get_all_accounts, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountDetails = function (accountId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

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
        AccountsColl.findOne({"_id": ObjectId(accountId)}, function (err, account) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                analyticsService.create(req, serviceActions.get_account_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.account = account;
                analyticsService.create(req, serviceActions.get_account_details, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_account_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccount = function (jwtObj, accountInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!Utils.isValidObjectId(accountInfo.profile._id)) {
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
                _id: accountInfo.profile._id,
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
                    accountInfo.profile.password = accountInfo.newPassword;
                    updateAccounts(jwtObj, accountInfo, req, callback)
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
            updateAccounts(jwtObj, accountInfo, req, callback)
        }
    }
};
Accounts.prototype.updateNewAccount = function (jwtObj, accountInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.findOneAndUpdate(
        {_id: accountInfo._id},
        {$set: accountInfo},
        {new: true},
        function (err, account) {
            if (err) {
                retObj.messages.push("Error while updating Account, try Again");
                callback(retObj);
            } else if (account) {
                retObj.status = true;
                retObj.messages.push("Account updated successfully");
                callback(retObj);
            } else {
                retObj.messages.push("Account doesn\\'t exist");
                callback(retObj);
            }
        });

};

function updateAccounts(jwtObj, accountInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    accountInfo.updatedBy = jwtObj.id;
    AccountsColl.findOneAndUpdate({_id: accountInfo.profile._id}, {$set: accountInfo.profile}, function (err, oldAcc) {
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

Accounts.prototype.erpDashBoardContent = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};

    ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.erp_dashboard_content_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (erpSettings) {

            async.parallel({
                expensesTotal: function (expensesTotalCallback) {
                    Expenses.findTotalExpenses(Utils.getErpSettings(erpSettings.expense, erpSettings.accountId), req, function (response) {
                        expensesTotalCallback(response.error, response.totalExpenses);
                    });
                },
                totalRevenue: function (totalRevenueCallback) {
                    Trips.findTotalRevenue(Utils.getErpSettings(erpSettings.revenue, erpSettings.accountId), req, function (response) {

                        totalRevenueCallback(response.error, response.totalRevenue);
                    });
                },
                pendingDue: function (pendingDueCallback) {
                    PaymentsReceived.findPendingDueForAccount(Utils.getErpSettings(erpSettings.payment, erpSettings.accountId), req, function (response) {
                        pendingDueCallback(response.error, response.pendingDue);
                    });
                },
                expiring: function (expiringCallback) {
                    Trucks.findExpiryCount(Utils.getErpSettings(erpSettings.expiry, erpSettings.accountId), req, function (response) {
                        expiringCallback(response.error, response.expiryCount);
                    });
                },
                paybleAmount: function (paybleCallback) {
                    Expenses.findPaybleAmountForAccount(Utils.getErpSettings(erpSettings.expense, erpSettings.accountId), req, function (response) {
                        paybleCallback(response.error, response.paybleCount);
                    });
                },
                receiptsAmount: function (receiptsAmountCallback) {
                    Receipts.findTotalReceipts(Utils.getErpSettings(erpSettings.revenue, erpSettings.accountId), req, function (response) {
                        receiptsAmountCallback(!response.status, response.totalReceipts);
                    });
                }
            }, function (error, dashboardContent) {
                if (error) {
                    retObj.status = true;
                    retObj.messages.push(JSON.stringify(error));
                    analyticsService.create(req, serviceActions.erp_dashboard_content_err, {
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.result = dashboardContent;
                    analyticsService.create(req, serviceActions.erp_dashboard_content, {
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            retObj.status = false;
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.erp_dashboard_content_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Accounts.prototype.countAccounts = function (jwt, req, callback) {
    var result = {};
    AccountsColl.count(function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req, serviceActions.count_accounts_err, {
                accountId: req.jwt.id,
                success: false,
                messages: result.messages
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req, serviceActions.count_accounts, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        }
    })
};

Accounts.prototype.countAccountGroups = function (jwt, req, callback) {
    var result = {};
    AccountsColl.count({"accountId": ObjectId(jwt.accountId), "type": "group"}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req, serviceActions.count_acc_grps_err, {
                accountId: req.jwt.id,
                success: false,
                messages: result.messages
            }, function (response) {
            });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req, serviceActions.count_acc_grps, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(result);
        }
    })
};

Accounts.prototype.userProfile = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    async.parallel({
        profile: function (profileCallback) {
            Accounts.prototype.getAccountDetails(jwt.id, req, function (response) {
                profileCallback(response.error, response.account);
            });
        },
        accountGroupsCount: function (accountGroupCountCallback) {
            Accounts.prototype.countAccountGroups(jwt, req, function (response) {
                accountGroupCountCallback(response.error, response.count);
            });
        },
        accountTrucksCount: function (accountTrucksCountCallback) {
            Trucks.countTrucks(jwt, req, function (response) {
                accountTrucksCountCallback(response.error, response.count);
            });
        },
    }, function (error, userProfileContent) {
        if (error) {
            retObj.status = true;
            retObj.messages.push(JSON.stringify(error));
            analyticsService.create(req, serviceActions.get_profile_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('User Profile Found');
            retObj.result = userProfileContent;
            analyticsService.create(req, serviceActions.get_profile, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Accounts.prototype.addAccountGroup = function (jwtObj, accountGroupInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!accountGroupInfo.userName) {
        retObj.messages.push('Invalid User Name');
    }

    if (!accountGroupInfo.password) {
        retObj.messages.push('Invalid password');
    }

    if (!accountGroupInfo.contactPhone) {
        retObj.messages.push('Invalid Mobile Number');
    }

    if (accountGroupInfo.truckIds.length <= 0) {
        retObj.messages.push('Please select at least one truck');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        AccountsColl.findOne({userName: accountGroupInfo.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                analyticsService.create(req, serviceActions.add_acc_grp_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account Group with same userName already exists');
                analyticsService.create(req, serviceActions.add_acc_grp_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                accountGroupInfo.createdBy = jwtObj.id;
                accountGroupInfo.accountId = jwtObj.id;
                (new AccountsColl(accountGroupInfo)).save(function (err, savedAcc) {
                    if (err) {
                        retObj.messages.push('Error saving account');
                        analyticsService.create(req, serviceActions.add_acc_grp_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        accountGroupInfo.accountId = savedAcc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.accountGroup = savedAcc;
                        analyticsService.create(req, serviceActions.add_acc_grp, {
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
};

Accounts.prototype.getAllAccountGroup = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var query = {"type": "group", "accountId": jwt.id};

    async.parallel({
        accountGroup: function (accountGroupCallback) {
            AccountsColl
                .find(query)
                .populate("accountId")
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, accounts) {
                    accountGroupCallback(err, accounts);
                });
        },
        count: function (countCallback) {
            AccountsColl.count(query, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving accounts');
            analyticsService.create(req, serviceActions.get_all_acc_grps_err, {
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
            retObj.count = results.count;
            retObj.accountGroup = results.accountGroup;
            analyticsService.create(req, serviceActions.get_all_acc_grps, {
                body: JSON.stringify(req.params),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountGroup = function (accountGroupId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(accountGroupId)) {
        retObj.messages.push('Invalid accountGroupId');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_acc_grp_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({"_id": ObjectId(accountGroupId)}).lean().exec(function (err, accountGroup) {
            if (err) {
                retObj.messages.push('Error retrieving account');
                analyticsService.create(req, serviceActions.get_acc_grp_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (accountGroup) {
                retObj.status = true;
                retObj.messages.push('Success');
                accountGroup.confirmPassword = accountGroup.password;
                retObj.accountGroup = accountGroup;
                analyticsService.create(req, serviceActions.get_acc_grp, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_acc_grp_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.updateAccountGroup = function (jwtObj, accountGroupInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!Utils.isValidObjectId(accountGroupInfo._id)) {
        retObj.messages.push('Invalid account Group Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_acc_grp_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        accountGroupInfo.updatedBy = jwtObj.id;
        AccountsColl.findOneAndUpdate({_id: accountGroupInfo._id}, {$set: accountGroupInfo}, function (err, oldAcc) {
            if (err) {
                retObj.messages.push('Error updating the account group');
                analyticsService.create(req, serviceActions.update_acc_grp_err, {
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
                analyticsService.create(req, serviceActions.update_acc_grp, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account Group doesn\'t exist');
                analyticsService.create(req, serviceActions.update_acc_grp_err, {
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
};

Accounts.prototype.uploadUserProfilePic = function (accountId, body, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!accountId || !ObjectId.isValid(accountId)) {
        retObj.status = false;
        retObj.message.push("Please try again later");
        callback(retObj);
    } else if (!body.image) {
        retObj.status = false;
        retObj.message.push("Invalid Image");
        callback(retObj);
    } else {
        var base64Data = body.image.replace(/^data:image\/[a-z]+;base64,/, "");
        fs.writeFile('./client/images/profile-pics/' + accountId + '.jpg', base64Data, 'base64', function (err) {
            if (err) {
                retObj.status = false;
                retObj.message = "Please upload valid image";
                analyticsService.create(req, serviceActions.upld_usr_profile_pic_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                AccountsColl.findOneAndUpdate({_id: accountId}, {
                    profilePic: accountId + '.jpg'
                }, function (err, data) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = "Please try again";
                        analyticsService.create(req, serviceActions.upld_usr_profile_pic_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else if (data) {
                        retObj.status = true;
                        retObj.message.push("Image uploaded successfully");
                        retObj.profilePic = accountId + '.jpg';
                        analyticsService.create(req, serviceActions.upld_usr_profile_pic, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.message.push("Please try again latter");
                        analyticsService.create(req, serviceActions.upld_usr_profile_pic_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                })
            }
        });

    }
};

Accounts.prototype.getErpSettings = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(jwt.accountId)) {
        retObj.messages.push('Invalid accountId');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_erp_settings_err, {
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        ErpSettingsColl.findOne({"accountId": ObjectId(jwt.accountId)}, function (err, erpSettings) {
            if (err) {
                retObj.messages.push('Error retrieving Settings');
                analyticsService.create(req, serviceActions.get_erp_settings_err, {
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (erpSettings) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.erpSettings = erpSettings;
                analyticsService.create(req, serviceActions.get_erp_settings, {
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Account with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_erp_settings_err, {
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

Accounts.prototype.getAccountHomeLocation = function (jwt, req, callback) {
    console.log("get account home location...", jwt);
    var retObj = {
        status: false,
        messages: [],
    };
    var query = {"_id": ObjectId(jwt.id)};
    AccountsColl.findOne(query, {'homeLocation': 1}, function (err, data) {
        if (err) {
            retObj.messages.push('Error in finding account home location');
            callback(retObj);
        } else if (data) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = data;
            callback(retObj);
        }
    });
};

Accounts.prototype.updateErpSettings = function (params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    ErpSettingsColl.findOne({_id: params._id}, function (err, oldAcc) {
        if (err) {
            retObj.messages.push('Please Try Again');
            analyticsService.create(req, serviceActions.update_erp_settings_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldAcc) {
            params.updatedBy = params._id;
            ErpSettingsColl.findOneAndUpdate({_id: params._id}, {$set: params}, function (err, updatedData) {
                if (err) {
                    retObj.messages.push('Error in updating the settings');
                    analyticsService.create(req, serviceActions.update_erp_settings_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (updatedData) {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    analyticsService.create(req, serviceActions.update_erp_settings, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push('Account doesn\'t exist');
                    analyticsService.create(req, serviceActions.update_erp_settings_err, {
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
            retObj.messages.push('Invalid Account Id');
            analyticsService.create(req, serviceActions.update_erp_settings_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });

};

Accounts.prototype.getEmployees = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.find({role: "employee"}, function (errEmployee, employees) {
        if (errEmployee) {
            retObj.messages.push("Unable to employees");
            analyticsService.create(req, serviceActions.get_account_data_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages = "Success";
            retObj.employees = employees;
            analyticsService.create(req, serviceActions.get_account_data, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

Accounts.prototype.getAccountRoutes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    OperatingRoutesColl.find({accountId: req.jwt.accountId}, function (err, docs) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.data = docs;
            retObj.messages.push("Success");
            callback(retObj);
        }
    })

};


Accounts.prototype.updateAccountRoutes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var operatingRoutes = req.body;
    if (operatingRoutes && operatingRoutes.length > 0) {
        async.map(operatingRoutes, function (route, routeCallback) {
            var query = {};
            if (!route._id) {
                query = {_id: mongoose.Types.ObjectId()};
                route.createdBy = req.jwt.id;
                route.accountId = req.jwt.accountId;
            } else {
                query = {_id: route._id}
            }
            route.updatedBy = req.jwt.id;
            delete route.__v;
            OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                if (err) {
                    retObj.messages.push('Error adding/updating route');
                    routeCallback(err);
                } else {
                    routeCallback(null, 'saved');
                }
            });
        }, function (err) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_account_operating_routes_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Account routes successfully");
                analyticsService.create(req, serviceActions.update_account_operating_routes, {
                    body: JSON.stringify(req.body.content),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    } else {
        retObj.status = false;
        retObj.messages.push("Please add operating routes");
        analyticsService.create(req, serviceActions.update_account_operating_routes_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
};

Accounts.prototype.deleteOperatingRoutes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid operating route123");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        OperatingRoutesColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_operating_route_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Operating route deleted successfully");
                analyticsService.create(req, serviceActions.delete_operating_route, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Operating route not deleted");
                analyticsService.create(req, serviceActions.delete_operating_route_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

module.exports = new Accounts();