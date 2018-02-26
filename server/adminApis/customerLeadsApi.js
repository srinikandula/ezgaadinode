var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var CustomerLeadsColl = require("../models/schemas").CustomerLeadsColl;
var AccountsColl = require("../models/schemas").AccountsColl;
var OperatingRoutesColl = require("../models/schemas").OperatingRoutesColl;

var Utils = require('../apis/utils');
var CustomerLeads = function () {
};

CustomerLeads.prototype.getCustomerLeads = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        customerLeads: function (customerLeadsCallback) {
            CustomerLeadsColl.find({"status": {$eq: null}}).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    customerLeadsCallback(err, docs);

                })
        },
        count: function (countCallback) {
            CustomerLeadsColl.count({"status": ""}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_customer_leads_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (results.customerLeads.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = results.customerLeads;
                retObj.count = results.count;
                analyticsService.create(req, serviceActions.get_customer_leads, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No Customer leads found");
                analyticsService.create(req, serviceActions.get_customer_leads_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        }
    });

};

CustomerLeads.prototype.totalCustomerLeads = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    CustomerLeadsColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting customer leads count');
            analyticsService.create(req, serviceActions.count_customer_leads_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = doc;
            analyticsService.create(req, serviceActions.count_customer_leads, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.addCustomerLead = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.userName) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || params.contactPhone.length != 10) {
        retObj.messages.push("Please enter contact number");
    }
    if (!params.leadType) {
        retObj.messages.push("Please select lead type");
    }

    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_customer_lead_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({userName: params.userName}, function (err, account) {
            if (err) {
                retObj.messages.push('Error fetching account');
                analyticsService.create(req, serviceActions.add_customer_lead_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (account) {
                retObj.messages.push('Account with same user Name already exists');
                analyticsService.create(req, serviceActions.add_customer_lead_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                if (req.files.files) {
                    Utils.uploadDocument(req.files.files[0], function (uploadResp) {
                        if (uploadResp.status) {
                            params.createdBy = req.jwt.id;
                            params.operatingRoutes = JSON.parse(params.operatingRoutes);
                            params.documentFile = uploadResp.fileName;
                            saveCustomerLead(req, params, callback);
                        } else {
                            retObj.messages.push("Document uploading failed");
                            analyticsService.create(req, serviceActions.add_customer_lead_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    params.createdBy = req.jwt.id;
                    if (params.operatingRoutes) {
                        params.operatingRoutes = JSON.parse(params.operatingRoutes);

                    }
                    saveCustomerLead(req, params, callback);
                }
            }
        });


    }


};

function saveCustomerLead(req, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var customerLead = new CustomerLeadsColl(params);
    customerLead.save(function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.add_customer_lead_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            /* if there is any operatingRoutes added to operatingRoutes collection ,else return success */
            if (params.operatingRoutes.length > 0) {
                async.map(params.operatingRoutes, function (operatingRoute, routesCallback) {
                    operatingRoute.accountId = doc._id;
                    var route = new OperatingRoutesColl(operatingRoute);
                    route.save(function (err, saveRoute) {
                        routesCallback(err);
                    })
                }, function (err) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.add_customer_lead_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Customer lead added successfully");
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.get_customer_leads, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                })
            } else {
                retObj.status = true;
                retObj.messages.push("Customer lead added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_customer_leads, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        }
    })
}

CustomerLeads.prototype.getCustomerLeadDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_customer_lead_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {


        CustomerLeadsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_customer_lead_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_customer_lead_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Customer details not found");
                analyticsService.create(req, serviceActions.get_customer_lead_details_err, {
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

CustomerLeads.prototype.updateCustomerLead = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    params.operatingRoutes = JSON.parse(params.operatingRoutes);
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (!params.name) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter contact number");
    }
    if (!params.leadType) {
        retObj.messages.push("Please select lead type");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        CustomerLeadsColl.findOneAndUpdate({_id: params._id}, {$set: params}, {new: true},
            function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.update_customer_lead_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (doc) {
                    retObj.status = true;
                    retObj.messages.push("Customer lead updated successfully");
                    retObj.data = doc;
                    analyticsService.create(req, serviceActions.get_customer_leads, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push("Customer lead not updated");
                    analyticsService.create(req, serviceActions.update_customer_lead_err, {
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

};

CustomerLeads.prototype.deleteCustomerLead = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_customer_lead_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        CustomerLeadsColl.remove({_id: params._id}, function (err, doc) {
            console.log(doc.result);
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_customer_lead_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Customer lead deleted successfully");
                analyticsService.create(req, serviceActions.delete_customer_lead, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Customer lead not deleted");
                analyticsService.create(req, serviceActions.delete_customer_lead_err, {
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

CustomerLeads.prototype.getTruckOwners = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({type: 'account', role: 'Truck Owner'}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving truck owners');
            analyticsService.create(req, serviceActions.get_truck_owners_list_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_truck_owners_list, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('No truck owners found');
            analyticsService.create(req, serviceActions.get_truck_owners_list_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

CustomerLeads.prototype.getTotalTruckOwners = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({type: 'account', role: 'Truck Owner'}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_total_truck_owners_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = count;
            analyticsService.create(req, serviceActions.get_total_truck_owners, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.convertCustomerLead = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.status) {
        retObj.messages.push("Please select status type");
    }
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (!params.comment) {
        retObj.messages.push("Please enter comment");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        if (params.status === 'Rejected') {
            CustomerLeadsColl.findOneAndUpdate({_id: params._id}, {
                status: params.status,
                comment: params.comment
            }, function (err, customerLead) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (customerLead) {
                    retObj.status = true;
                    retObj.messages.push("Customer lead updated successfully");
                    analyticsService.create(req, serviceActions.change_customer_lead_status, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push("Customer lead not updated");
                    analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            })

        } else {
            CustomerLeadsColl.findOne({_id: params._id}, function (err, customerLead) {
                if (err) {

                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (customerLead) {
                    var accountParams = {
                        _id: customerLead._id,
                        userName: customerLead.userName,
                        contactPhone: customerLead.contactPhone,
                        password: customerLead.contactPhone,
                        email: customerLead.email,
                        type: "account",
                        accountId: customerLead._id,
                        city: customerLead.city,
                        state: customerLead.state,
                        updatedBy: req.jwt.id,
                        createdBy: req.jwt.id,
                        isActive: true,
                        gpsEnabled: customerLead.gpsEnabled,
                        erpEnabled: customerLead.erpEnabled,
                        loadEnabled: customerLead.loadEnabled,
                        alternatePhone: customerLead.alternatePhone,
                        companyName: customerLead.companyName,
                        pincode: customerLead.pinCode,
                        role: customerLead.leadType,
                        documentType: customerLead.documentType,
                        documentFile: customerLead.documentFile,
                        paymentType: customerLead.paymentType,
                        loadPaymentToPayPercent: customerLead.loadPaymentToPayPercent,
                        loadPaymentAdvancePercent: customerLead.loadPaymentAdvancePercent,
                        loadPaymentPodDays: customerLead.loadPaymentPodDays,
                        tdsDeclarationDoc: customerLead.tdsDeclarationDoc,
                        yearInService: customerLead.yearInService,
                        leadSource: customerLead.leadSource
                    };

                    generateUniqueUserId(customerLead.type, function (userIdResp) {
                        if (!userIdResp.status) {
                            analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: userIdResp.messages
                            }, function (response) {
                            });
                            callback(userIdResp);
                        } else {
                            accountParams.userId = userIdResp.userId;
                            var account = new AccountsColl(accountParams);
                            account.save(function (err, saveAcc) {
                                if (err) {
                                    retObj.messages("Please try again");
                                    analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                                        body: JSON.stringify(req.body),
                                        accountId: req.jwt.id,
                                        success: false,
                                        messages: retObj.messages
                                    }, function (response) {
                                    });
                                    callback(retObj);
                                } else {
                                    retObj.status = true;
                                    retObj.messages.push("Customer lead updated successfully");
                                    analyticsService.create(req, serviceActions.change_customer_lead_status, {
                                        body: JSON.stringify(req.body),
                                        accountId: req.jwt.id,
                                        success: true
                                    }, function (response) {
                                    });
                                    callback(retObj);
                                }
                            })

                        }
                    });

                } else {
                    retObj.messages.push("Customer lead not updated");
                    analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
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

CustomerLeads.prototype.getTruckOwnerDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck owner");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_owner_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.messages.push("Success");
                retObj.data = doc;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_truck_owner_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck owner not found");
                analyticsService.create(req, serviceActions.get_truck_owner_details_err, {
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

CustomerLeads.prototype.updateTruckOwnerDetails = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.message.push('Please try again,Invalid truck owner');
    }
    if (!params.userName) {
        retObj.message.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.message.push("Please enter phone number");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.update_truck_owner_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else if(doc){
                if(params.operatingRoutes.length>0){
                    async.map(params.operatingRoutes,function (route, routeCallback) {
                        var query={};
                        if(!route._id){
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId=params._id;
                        } else {
                            query = {_id: route._id}
                        }
                        OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                            routeCallback(err);
                        });
                    }, function (err) {
                        if (err) {
                            retObj.message.push("Please try again");
                            analyticsService.create(req, serviceActions.update_truck_owner_details_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.message.push("Truck owner updated successfully");
                            analyticsService.create(req, serviceActions.update_truck_owner_details, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.message.push("Truck owner updated successfully");
                    analyticsService.create(req, serviceActions.update_truck_owner_details, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.message.push("Truck owner not updated");
                analyticsService.create(req, serviceActions.update_truck_owner_details_err, {
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

CustomerLeads.prototype.deleteTruckOwner=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  var params=req.query;
  if(!params._id || !ObjectId.isValid(params._id)){
      retObj.messages.length("Invalid truck owner");
  }

  if(retObj.messages.length>0){
      callback(retObj);
  }else{
      AccountsColl.findOneAndRemove({_id:params._id},function (err,doc) {
          if (err) {
              retObj.messages.push("please try again");
              analyticsService.create(req, serviceActions.delete_truck_owner_err, {
                  body: JSON.stringify(req.query),
                  accountId: req.jwt.id,
                  success: false,
                  messages: retObj.messages
              }, function (response) {
              });
              callback(retObj);
          } else if (doc && doc.result.n == 1) {
              retObj.status = true;
              retObj.messages.push("Truck owner deleted successfully");
              analyticsService.create(req, serviceActions.delete_truck_owner, {
                  body: JSON.stringify(req.query),
                  accountId: req.jwt.id,
                  success: true
              }, function (response) {
              });
              callback(retObj);
          } else {
              retObj.messages.push("Truck owner not deleted");
              analyticsService.create(req, serviceActions.delete_truck_owner_err, {
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

CustomerLeads.prototype.deleteTruckOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.length("Invalid truck owner");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_truck_owner_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Truck owner deleted successfully");
                analyticsService.create(req, serviceActions.delete_truck_owner, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck owner not deleted");
                analyticsService.create(req, serviceActions.delete_truck_owner_err, {
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

/*Author SVPrasadK*/
/*Transporter Start*/
CustomerLeads.prototype.countTransporter = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({type: 'account', role: 'Transporter'}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.count_transporter_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = count;
            analyticsService.create(req, serviceActions.count_transporter, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.getTransporter = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({type: 'account', role: 'Transporter'}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving transporters');
            analyticsService.create(req, serviceActions.get_transporter_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_transporter, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('No transporters found');
            analyticsService.create(req, serviceActions.get_transporter_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

CustomerLeads.prototype.getTransporterDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid transporter");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_transporter_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.messages.push("Success");
                retObj.data = doc;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_transporter_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Transporter not found");
                analyticsService.create(req, serviceActions.get_transporter_details_err, {
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

CustomerLeads.prototype.updateTransporter = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.message.push('Please try again,Invalid transporter');
    }
    if (!params.userName) {
        retObj.message.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.message.push("Please enter phone number");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.update_transporter_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                if (params.operatingRoutes.length > 0) {
                    async.map(params.operatingRoutes, function (route, routeCallback) {
                        var query = {};
                        if (!route._id) {
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId = params._id;
                        } else {
                            query = {_id: route._id}
                        }
                        OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                            routeCallback(err);
                        });
                    }, function (err) {
                        if (err) {
                            retObj.message.push("Please try again");
                            analyticsService.create(req, serviceActions.update_transporter_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.message.push("Transporter updated successfully");
                            analyticsService.create(req, serviceActions.update_transporter, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.message.push("Transporter updated successfully");
                    analyticsService.create(req, serviceActions.update_transporter, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.message.push("Transporter not updated");
                analyticsService.create(req, serviceActions.update_transporter_err, {
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

CustomerLeads.prototype.deleteTransporter = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.length("Invalid transporter");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_transporter_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Transporter deleted successfully");
                analyticsService.create(req, serviceActions.delete_transporter, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Transporter not deleted");
                analyticsService.create(req, serviceActions.delete_transporter_err, {
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
/*Transporter End*/
/*Author SVPrasadK*/
/*Commission Agent Start*/
CustomerLeads.prototype.countCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({type: 'account', role: 'Commission Agent'}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.count_commission_agent_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = count;
            analyticsService.create(req, serviceActions.count_commission_agent, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.getCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({type: 'account', role: 'Commission Agent'}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving transporters');
            analyticsService.create(req, serviceActions.get_commission_agent_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_commission_agent, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('No transporters found');
            analyticsService.create(req, serviceActions.get_commission_agent_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

CustomerLeads.prototype.getCommissionAgentDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid transporter");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_commission_agent_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.messages.push("Success");
                retObj.data = doc;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_commission_agent, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Commission Agent not found");
                analyticsService.create(req, serviceActions.get_commission_agent_err, {
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

CustomerLeads.prototype.updateCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.message.push('Please try again,Invalid commission agent');
    }
    if (!params.userName) {
        retObj.message.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.message.push("Please enter phone number");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.update_commission_agent_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                if (params.operatingRoutes.length > 0) {
                    async.map(params.operatingRoutes, function (route, routeCallback) {
                        var query = {};
                        if (!route._id) {
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId = params._id;
                        } else {
                            query = {_id: route._id}
                        }
                        OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                            routeCallback(err);
                        });
                    }, function (err) {
                        if (err) {
                            retObj.message.push("Please try again");
                            analyticsService.create(req, serviceActions.update_commission_agent_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.message.push("Commission Agent updated successfully");
                            analyticsService.create(req, serviceActions.update_commission_agent, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.message.push("Commission Agent updated successfully");
                    analyticsService.create(req, serviceActions.update_commission_agent, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.message.push("Commission Agent not updated");
                analyticsService.create(req, serviceActions.update_commission_agent_err, {
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

CustomerLeads.prototype.deleteCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.length("Invalid commission agent");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_commission_agent_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Commission Agent deleted successfully");
                analyticsService.create(req, serviceActions.delete_commission_agent, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Commission Agent not deleted");
                analyticsService.create(req, serviceActions.delete_commission_agent_err, {
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
/*Commission Agent End*/
/*Author SVPrasadK*/
/*Factory Owner Start*/
CustomerLeads.prototype.countFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({type: 'account', role: 'Factory Owners'}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.count_factory_owner_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = count;
            analyticsService.create(req, serviceActions.count_factory_owner, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.getFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({type: 'account', role: 'Factory Owners'}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving factory owner');
            analyticsService.create(req, serviceActions.get_factory_owner_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_factory_owner, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('No factory owner found');
            analyticsService.create(req, serviceActions.get_factory_owner_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

CustomerLeads.prototype.getFactoryOwnerDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid factory owner");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_factory_owner_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.messages.push("Success");
                retObj.data = doc;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_factory_owner, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Factory Owner not found");
                analyticsService.create(req, serviceActions.get_factory_owner_err, {
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

CustomerLeads.prototype.updateFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.message.push('Please try again,Invalid factory owner');
    }
    if (!params.userName) {
        retObj.message.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.message.push("Please enter phone number");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.update_factory_owner_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                if (params.operatingRoutes.length > 0) {
                    async.map(params.operatingRoutes, function (route, routeCallback) {
                        var query = {};
                        if (!route._id) {
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId = params._id;
                        } else {
                            query = {_id: route._id}
                        }
                        OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                            routeCallback(err);
                        });
                    }, function (err) {
                        if (err) {
                            retObj.message.push("Please try again");
                            analyticsService.create(req, serviceActions.update_factory_owner_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.message.push("Factory Owner updated successfully");
                            analyticsService.create(req, serviceActions.update_factory_owner, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.message.push("Factory Owner updated successfully");
                    analyticsService.create(req, serviceActions.update_factory_owner, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.message.push("Factory Owner not updated");
                analyticsService.create(req, serviceActions.update_factory_owner_err, {
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

CustomerLeads.prototype.deleteFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.length("Invalid factory owner");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_factory_owner_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Factory Owner deleted successfully");
                analyticsService.create(req, serviceActions.delete_factory_owner, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Factory Owner not deleted");
                analyticsService.create(req, serviceActions.delete_factory_owner_err, {
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
/*Factory Owner End*/
/*Author SVPrasadK*/
/*Guest Start*/
CustomerLeads.prototype.countGuest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({type: 'account', role: 'Guest'}, function (err, count) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.count_guest_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = count;
            analyticsService.create(req, serviceActions.count_guest, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.getGuest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.find({type: 'account', role: 'Guest'}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error retrieving guest');
            analyticsService.create(req, serviceActions.get_guest_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_guest, {
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push('No guest found');
            analyticsService.create(req, serviceActions.get_guest_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
};

CustomerLeads.prototype.getGuestDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid guest");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_guest_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.messages.push("Success");
                retObj.data = doc;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_guest, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Guest not found");
                analyticsService.create(req, serviceActions.get_guest_err, {
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

CustomerLeads.prototype.updateGuest = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.message.push('Please try again,Invalid guest');
    }
    if (!params.userName) {
        retObj.message.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.message.push("Please enter phone number");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
                analyticsService.create(req, serviceActions.update_guest_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                if (params.operatingRoutes.length > 0) {
                    async.map(params.operatingRoutes, function (route, routeCallback) {
                        var query = {};
                        if (!route._id) {
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId = params._id;
                        } else {
                            query = {_id: route._id}
                        }
                        OperatingRoutesColl.update(query, route, {upsert: true}, function (err, doc) {
                            routeCallback(err);
                        });
                    }, function (err) {
                        if (err) {
                            retObj.message.push("Please try again");
                            analyticsService.create(req, serviceActions.update_guest_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.message.push("Guest updated successfully");
                            analyticsService.create(req, serviceActions.update_guest, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.message.push("Guest updated successfully");
                    analyticsService.create(req, serviceActions.update_guest, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.message.push("Guest not updated");
                analyticsService.create(req, serviceActions.update_guest_err, {
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

CustomerLeads.prototype.deleteGuest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.length("Invalid guest");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_guest_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Guest deleted successfully");
                analyticsService.create(req, serviceActions.delete_guest, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Guest not deleted");
                analyticsService.create(req, serviceActions.delete_guest_err, {
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
/*Guest End*/
>>>>>>> pull request

module.exports = new CustomerLeads();
