var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var CustomerLeadsColl = require("../models/schemas").CustomerLeadsColl;
var AccountsColl = require("../models/schemas").AccountsColl;
var OperatingRoutesColl = require("../models/schemas").OperatingRoutesColl;
var trafficManagerColl = require("../models/schemas").trafficManagerColl;
var TrucksColl = require("../models/schemas").TrucksColl;

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
    var condition = {};
    if (params.customerLeadSearch) {
        condition = {
            $or:
                [
                    {"firstName": new RegExp(params.customerLeadSearch, "gi")},
                    {"leadStatus": new RegExp(params.customerLeadSearch, "gi")},
                ], "status": {$eq: null}
        };

    } else if (params.leadStatus) {
        condition = {"leadStatus": params.leadStatus, "status": {$eq: null}}
    } else {
        condition = {"status": {$eq: null}}

    }

    async.parallel({
        customerLeads: function (customerLeadsCallback) {
            CustomerLeadsColl.find(condition).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    customerLeadsCallback(err, docs);

                })
        },
        count: function (countCallback) {
            CustomerLeadsColl.count(condition, function (err, count) {
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
    CustomerLeadsColl.count({"status": {$eq: null}}, function (err, doc) {
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
    var params = req.body.content;
    if (!params.firstName) {
        retObj.messages.push("Please enter full name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || params.contactPhone.length != 10) {
        retObj.messages.push("Please enter contact number");
    }


    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_customer_lead_err, {
            body: JSON.stringify(params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({contactPhone: params.contactPhone}, function (err, acc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_customer_lead_err, {
                    body: JSON.stringify(params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (acc) {
                retObj.messages.push("Mobile number already exist's");
                analyticsService.create(req, serviceActions.add_customer_lead_err, {
                    body: JSON.stringify(params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {

                if (!params.alternatePhone[params.alternatePhone.length - 1]) {
                    params.alternatePhone.splice(params.alternatePhone.length - 1, 1)
                }
                if (!params.operatingRoutes) {
                    params.operatingRoutes = [];
                }

                if (req.files.files) {
                    Utils.uploadDocuments(req.files.files, function (uploadResp) {
                        if (uploadResp.status) {
                            params.createdBy = req.jwt.id;
                            params.documentFiles = uploadResp.fileNames;
                            saveCustomerLead(req, params, callback);
                        } else {
                            retObj.messages.push("Document uploading failed");
                            analyticsService.create(req, serviceActions.add_customer_lead_err, {
                                body: JSON.stringify(params),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
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
    params.createdBy = req.jwt.id;
    Utils.removeEmptyFields(params);
    var customerLead = new CustomerLeadsColl(params);
    customerLead.save(function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.add_customer_lead_err, {
                body: JSON.stringify(params),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            /* if there is any operatingRoutes added to operatingRoutes collection ,else return success */
            if (params.operatingRoutes && params.operatingRoutes.length > 0) {
                async.map(params.operatingRoutes, function (operatingRoute, routesCallback) {
                    operatingRoute.accountId = doc._id;
                    operatingRoute.destinationLocation = [parseFloat(operatingRoute.destinationLocation[0]), parseFloat(operatingRoute.destinationLocation[1])];
                    operatingRoute.sourceLocation = [parseFloat(operatingRoute.sourceLocation[0]), parseFloat(operatingRoute.sourceLocation[1])];
                    var route = new OperatingRoutesColl(operatingRoute);
                    route.save(function (err, saveRoute) {
                        routesCallback(err);
                    })
                }, function (err) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.add_customer_lead_err, {
                            body: JSON.stringify(params),
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
                            body: JSON.stringify(params),
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
                    body: JSON.stringify(params),
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

        async.parallel({
            customerData: function (customerCallback) {
                CustomerLeadsColl.findOne({_id: params._id}, function (err, doc) {
                    customerCallback(err, doc)
                })
            },
            operatingRoutes: function (operatingRoutesCallback) {
                OperatingRoutesColl.find({accountId: params._id}, function (err, docs) {
                    operatingRoutesCallback(err, docs);
                })
            }


        }, function (err, result) {
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
            } else if (result) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = result;
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
    var params = req.body.content;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (!params.firstName) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter contact number");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        if (req.files.files) {
            Utils.uploadDocuments(req.files.files, function (uploadResp) {
                if (uploadResp.status) {
                    if (!req.body.content.documentFiles) {
                        req.body.content.documentFiles = []
                    }
                    req.body.content.documentFiles = req.body.content.documentFiles.concat(uploadResp.fileNames);

                    updateCustomerLead(req, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
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
        } else {
            updateCustomerLead(req, callback);
        }
    }

};

function updateCustomerLead(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params.alternatePhone[params.alternatePhone.length - 1]) {
        params.alternatePhone.splice(params.alternatePhone.length - 1, 1)
    }
    Utils.removeEmptyFields(params);
    CustomerLeadsColl.findOneAndUpdate({_id: params._id}, {$set: params}, {new: true},
        function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_customer_lead_err, {
                    body: JSON.stringify(req.body.content),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                if (params.operatingRoutes && params.operatingRoutes.length > 0) {
                    async.map(params.operatingRoutes, function (route, routeCallback) {
                        if (route.destinationLocation[0]) {
                            route.destinationLocation = [parseFloat(route.destinationLocation[0]), parseFloat(route.destinationLocation[1])];
                        }
                        if (route.sourceLocation[0]) {
                            route.sourceLocation = [parseFloat(route.sourceLocation[0]), parseFloat(route.sourceLocation[1])];
                        }
                        var query = {};
                        if (!route._id) {
                            query = {_id: mongoose.Types.ObjectId()};
                            route.createdBy = req.jwt.id;
                            route.accountId = params._id;
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
                            retObj.messages.push("CustomerLead updated successfully");
                            analyticsService.create(req, serviceActions.update_commission_agent, {
                                body: JSON.stringify(req.body.content),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = true;
                    retObj.messages.push("CustomerLead updated successfully");
                    analyticsService.create(req, serviceActions.update_customer_lead, {
                        body: JSON.stringify(req.body.content),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }

            } else {
                retObj.messages.push("Customer lead not updated");
                analyticsService.create(req, serviceActions.update_customer_lead_err, {
                    body: JSON.stringify(req.body.content),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
}

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
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var condition = {};
    if (params.truckOwnerSearch) {
        condition = {
            $or:
                [
                    {"userId": new RegExp(params.truckOwnerSearch, "gi")},
                    {"firstName": new RegExp(params.truckOwnerSearch, "gi")},
                    {"companyName": new RegExp(params.truckOwnerSearch, "gi")},
                    {"userName": new RegExp(params.truckOwnerSearch, "gi")},
                    // {"mobile": new RegExp(parseFloat(params.guest),"gi")},
                ], role: 'Truck Owner'
        };
    } else if (params.status) {
        if (params.status === 'gps') {
            condition = {role: 'Truck Owner', "gpsEnabled": true}
        } else if (params.status === 'erp') {
            condition = {role: 'Truck Owner', "erpEnabled": true}
        } else if (params.status === 'both') {
            condition = {
                $and:
                    [
                        {"gpsEnabled": true},
                        {"erpEnabled": true},
                    ], role: 'Truck Owner'
            };
        } else {
            condition = {role: 'Truck Owner', "isActive": params.status}
        }
    } else {
        condition = {role: 'Truck Owner'}
    }
    async.parallel({
        truckOwners: function (truckOwnersCallback) {
            AccountsColl.find(condition).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    truckOwnersCallback(err, docs);

                })
        },
        count: function (countCallback) {
            AccountsColl.count(condition, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_truck_owners_list_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (results.truckOwners.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = results.truckOwners;
                retObj.count = results.count;
                analyticsService.create(req, serviceActions.get_truck_owners_list, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No Truck owners found");
                analyticsService.create(req, serviceActions.get_truck_owners_list_err, {
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

CustomerLeads.prototype.countTruckOwners = function (req, callback) {
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
    if (params.status === 'Accepted' && !params.leadType) {
        retObj.messages.push("Please select lead type");
    }
    if (params.status === 'Accepted' && !params.userName) {
        retObj.messages.push("Please enter user name");
    }
    if (params.status === "Accepted" && !params.password) {
        retObj.messages.push("Please enter password");
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
                                userName: params.userName,
                                firstName: customerLead.firstName,
                                contactPhone: customerLead.contactPhone,
                                password: customerLead.password,
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
                                role: params.leadType,
                                leadType: params.leadType,
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

                            generateUniqueUserId(params.leadType, function (userIdResp) {
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
                                            retObj.messages.push("Please try again");
                                            analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                                                body: JSON.stringify(req.body),
                                                accountId: req.jwt.id,
                                                success: false,
                                                messages: retObj.messages
                                            }, function (response) {
                                            });
                                            callback(retObj);
                                        } else {
                                            OperatingRoutesColl.update(
                                                {accountId: customerLead._id},
                                                {accountId: saveAcc._id},
                                                {multi: true}, function (err, operRoutes) {
                                                    if (err) {
                                                        retObj.messages.push("Customer lead not updated");
                                                        analyticsService.create(req, serviceActions.change_customer_lead_status_err, {
                                                            body: JSON.stringify(req.body),
                                                            accountId: req.jwt.id,
                                                            success: false,
                                                            messages: retObj.messages
                                                        }, function (response) {
                                                        });
                                                        callback(retObj);
                                                    } else {
                                                        CustomerLeadsColl.findOneAndUpdate({_id: params._id}, {
                                                            status: params.status,
                                                            comment: params.comment,
                                                            leadType: params.leadType
                                                        }, function (err, customerLead) {
                                                            if (err) {
                                                                retObj.messages.push("Customer lead not updated");
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
                                                        });

                                                    }
                                                });

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
            });
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
        async.parallel({
            truckOwnerData: function (accountDataCallback) {
                AccountsColl.findOne({_id: params._id}, function (err, doc) {
                    accountDataCallback(err, doc);
                });
            },
            operatingRoutes: function (operatingRoutesDataCallback) {
                OperatingRoutesColl.find({accountId: params._id}, function (err, doc) {
                    operatingRoutesDataCallback(err, doc);
                });
            }
        }, function (err, result) {
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
            } else if (result) {
                retObj.messages.push("Success");
                retObj.data = result;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_truck_owner_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck owners not found");
                analyticsService.create(req, serviceActions.get_truck_owner_details_err, {
                    body: JSON.stringify(req.query),
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

CustomerLeads.prototype.updateTruckOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    // console.log("params....",req.body.content);
    // if(params.routeConfigEnabled){
    //     if(!params.homeLocation){
    //         retObj.messages.push('Please enter Home Location');
    //     }
    // }
    if (!params._id) {
        retObj.messages.push('Please try again,Invalid truck owner');
    }
    if (!params.userName) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.messages.push("Please enter phone number");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {

        if (params.alternatePhone[params.alternatePhone.length - 1] === "") {
            params.alternatePhone.splice(params.alternatePhone.length - 1, 1)
        }
        if (!params.operatingRoutes) {
            params.operatingRoutes = [];
        }
        if (req.files.files) {
            Utils.uploadDocuments(req.files.files, function (uploadResp) {
                if (uploadResp.status) {
                    if (!req.body.content.documentFiles) {
                        req.body.content.documentFiles = [];
                    }
                    req.body.content.documentFiles = req.body.content.documentFiles.concat(uploadResp.fileNames);

                    updateTruckOwner(req, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
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
        } else {
            updateTruckOwner(req, callback);
        }
    }

};

function updateTruckOwner(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    Utils.removeEmptyFields(params);
    if (params.routeConfigEnabled === "true" && !params.homeLocation.homeAddress) {
        retObj.messages.push("please enter home location...");
        callback(retObj);
        return;
    }
    AccountsColl.findOneAndUpdate({_id: params._id}, {$set: params}, {new: true},
        function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_truck_owner_details_err, {
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
                        if (route.destinationLocation[0]) {
                            route.destinationLocation = [parseFloat(route.destinationLocation[0]), parseFloat(route.destinationLocation[1])];
                        }
                        if (route.sourceLocation[0]) {
                            route.sourceLocation = [parseFloat(route.sourceLocation[0]), parseFloat(route.sourceLocation[1])];
                        }

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
                            // console.log("err",err);
                            retObj.messages.push("Please try again");
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
                            retObj.messages.push("Truck owner updated successfully");
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
                    retObj.messages.push("Truck owner updated successfully");
                    analyticsService.create(req, serviceActions.update_truck_owner_details, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            } else {
                retObj.messages.push("Truck owner not updated");
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
};


CustomerLeads.prototype.deleteTruckOwner = function (req, callback) {
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
        AccountsColl.remove({_id: params._id}, function (err, doc) {
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

// CustomerLeads.prototype.deleteTruckOwner = function (req, callback) {
//     var retObj = {
//         status: false,
//         messages: []
//     };
//     var params = req.query;
//     if (!params._id || !ObjectId.isValid(params._id)) {
//         retObj.messages.push("Invalid truck owner");
//     }
//
//     if (retObj.messages.length > 0) {
//         callback(retObj);
//     } else {
//         AccountsColl.findOneAndRemove({_id: params._id}, function (err, doc) {
//             if (err) {
//                 retObj.messages.push("please try again");
//                 analyticsService.create(req, serviceActions.delete_truck_owner_err, {
//                     body: JSON.stringify(req.query),
//                     accountId: req.jwt.id,
//                     success: false,
//                     messages: retObj.messages
//                 }, function (response) {
//                 });
//                 callback(retObj);
//             } else if (doc && doc.result.n == 1) {
//                 retObj.status = true;
//                 retObj.messages.push("Truck owner deleted successfully");
//                 analyticsService.create(req, serviceActions.delete_truck_owner, {
//                     body: JSON.stringify(req.query),
//                     accountId: req.jwt.id,
//                     success: true
//                 }, function (response) {
//                 });
//                 callback(retObj);
//             } else {
//                 retObj.messages.push("Truck owner not deleted");
//                 analyticsService.create(req, serviceActions.delete_truck_owner_err, {
//                     body: JSON.stringify(req.query),
//                     accountId: req.jwt.id,
//                     success: false,
//                     messages: retObj.messages
//                 }, function (response) {
//                 });
//                 callback(retObj);
//             }
//         })
//     }
// };

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

    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (params.transporter) {
            condition = {
                $or:
                    [
                        {"userId": new RegExp(params.transporter, "gi")},
                        {"firstName": new RegExp(params.transporter, "gi")},
                        {"companyName": new RegExp(params.transporter, "gi")},
                        {"userName": new RegExp(params.transporter, "gi")}

                        // {"mobile": new RegExp(parseFloat(params.guest),"gi")},
                    ], role: 'Transporter'
            };
        } else if (params.status) {
            if (params.status === 'gps') {
                condition = {role: 'Transporter', "gpsEnabled": true}
            } else if (params.status === 'erp') {
                condition = {role: 'Transporter', "erpEnabled": true}
            } else if (params.status === 'both') {
                condition = {
                    $and:
                        [
                            {"gpsEnabled": true},
                            {"erpEnabled": true},
                        ], role: 'Transporter'
                };
            } else {
                condition = {role: 'Transporter', "isActive": params.status}
            }
        } else {
            condition = {role: 'Transporter'}
        }

        async.parallel({
            Transporters: function (transportersCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, transporters) {
                        transportersCallback(err, transporters);
                    });
            },
            count: function (countCallback) {
                AccountsColl.count(condition, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving transporter');
                analyticsService.create(req, serviceActions.get_transporter_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.Transporters;
                analyticsService.create(req, serviceActions.get_transporter, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

CustomerLeads.prototype.getTransporterDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params.transporterId || !ObjectId.isValid(params.transporterId)) {
        retObj.messages.push("Invalid transporter");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            accountData: function (accountDataCallback) {
                AccountsColl.findOne({_id: params.transporterId}, function (err, doc) {
                    accountDataCallback(err, doc);
                });
            },
            operatingRoutesData: function (operatingRoutesDataCallback) {
                OperatingRoutesColl.find({accountId: params.transporterId}, function (err, doc) {
                    operatingRoutesDataCallback(err, doc);
                });
            },
            trafficManagersData: function (trafficManagersDataCallback) {
                trafficManagerColl.find({accountId: params.transporterId}, function (err, doc) {
                    trafficManagersDataCallback(err, doc);
                });
            }
        }, function (err, result) {
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
            } else if (result) {
                retObj.messages.push("Success");
                retObj.data = result;
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
        });
    }

};

CustomerLeads.prototype.updateTransporter = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;

    if (!params._id) {
        retObj.messages.push('Please try again,Invalid transporter');
    }
    if (!params.leadType) {
        retObj.messages.push("Please Select Customer Type");
    }
    if (!params.firstName) {
        retObj.messages.push("Please Provide Full Name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter phone number");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.update_transporter_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        if (req.files.files) {
            Utils.uploadDocuments(req.files.files, function (uploadResp) {
                if (uploadResp.status) {
                    if (!req.body.content.documentFiles) {
                        req.body.content.documentFiles = [];
                    }
                    // params.documentFile = uploadResp.fileName;
                    req.body.content.documentFiles = req.body.content.documentFiles.concat(uploadResp.fileNames);
                    req.body.content.updatedBy = req.jwt.id;
                    updateTransporter(req, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
                    analyticsService.create(req, serviceActions.update_transporter_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            req.body.content.updatedBy = req.jwt.id;
            updateTransporter(req, callback);
        }
    }

};

function updateTransporter(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params.operatingRoutes) {
        params.operatingRoutes = [];
    }
    if (!params.trafficManagers) {
        params.trafficManagers = [];
    }
    AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
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
                    if (route.destinationLocation[0]) {
                        route.destinationLocation = [parseFloat(route.destinationLocation[0]), parseFloat(route.destinationLocation[1])];
                    }
                    if (route.sourceLocation[0]) {
                        route.sourceLocation = [parseFloat(route.sourceLocation[0]), parseFloat(route.sourceLocation[1])];
                    }
                    if (!route._id) {
                        query = {_id: mongoose.Types.ObjectId()};
                        route.createdBy = req.jwt.id;
                        route.accountId = params._id;
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
                        analyticsService.create(req, serviceActions.update_transporter_err, {
                            body: JSON.stringify(req.query),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        if (params.trafficManagers.length > 0) {
                            async.map(params.trafficManagers, function (trafficManager, trafficManagerCallback) {
                                var query = {};
                                if (!trafficManager._id) {
                                    query = {_id: mongoose.Types.ObjectId()};
                                    trafficManager.createdBy = req.jwt.id;
                                    trafficManager.accountId = params._id;
                                } else {
                                    query = {_id: trafficManager._id}
                                }
                                trafficManager.updatedBy = req.jwt.id;
                                delete trafficManager.__v;
                                trafficManagerColl.update(query, trafficManager, {upsert: true}, function (err, doc) {
                                    if (err) {
                                        retObj.messages.push('Error adding/updating traffic manager');
                                        trafficManagerCallback(err);
                                    } else {
                                        trafficManagerCallback(null, 'saved');
                                    }
                                });
                            }, function (err) {
                                if (err) {
                                    retObj.messages.push("Please try again");
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
                                    retObj.messages.push("Transporter updated successfully");
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
                            retObj.messages.push("Transporter updated successfully");
                            analyticsService.create(req, serviceActions.update_transporter, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    }
                })
            } else {
                retObj.status = true;
                retObj.messages.push("Transporter updated successfully");
                analyticsService.create(req, serviceActions.update_transporter, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        } else {
            retObj.messages.push("Transporter not updated");
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

CustomerLeads.prototype.deleteTransporter = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.transporterId || !ObjectId.isValid(params.transporterId)) {
        retObj.messages.push("Invalid transporter");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOneAndRemove({_id: params.transporterId}, function (err, doc) {
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
    AccountsColl.count({role: 'Commission Agent'}, function (err, count) {
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

    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (params.commissionAgent) {
            condition = {
                $or:
                    [
                        {"userId": new RegExp(params.commissionAgent, "gi")},
                        {"firstName": new RegExp(params.commissionAgent, "gi")},
                        {"companyName": new RegExp(params.commissionAgent, "gi")},
                        {"userName": new RegExp(params.commissionAgent, "gi")},
                        {"mobile": new RegExp(parseFloat(params.commissionAgent), "gi")},
                    ], role: 'Commission Agent'
            };
        } else if (params.status) {
            condition = {role: 'Commission Agent', "isActive": params.status}
        } else {
            condition = {role: 'Commission Agent'}
        }

        async.parallel({
            commissionAgents: function (commissionAgentsCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, commissionAgents) {
                        commissionAgentsCallback(err, commissionAgents);
                    });
                ``
            },
            count: function (countCallback) {
                AccountsColl.count({role: 'Commission Agent'}, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving commission agent');
                analyticsService.create(req, serviceActions.get_commission_agent_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.commissionAgents;
                analyticsService.create(req, serviceActions.get_commission_agent, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

CustomerLeads.prototype.getCommissionAgentDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params.commissionAgentId || !ObjectId.isValid(params.commissionAgentId)) {
        retObj.messages.push("Invalid commission agent");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            accountData: function (accountDataCallback) {
                AccountsColl.findOne({_id: params.commissionAgentId}, function (err, doc) {
                    accountDataCallback(err, doc);
                });
            },
            operatingRoutesData: function (operatingRoutesDataCallback) {
                OperatingRoutesColl.find({accountId: params.commissionAgentId}, function (err, doc) {
                    operatingRoutesDataCallback(err, doc);
                });
            }
        }, function (err, result) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_commission_agent_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (result) {
                retObj.messages.push("Success");
                retObj.data = result;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_commission_agent_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Commission Agent not found");
                analyticsService.create(req, serviceActions.get_commission_agent_details_err, {
                    body: JSON.stringify(req.query),
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

CustomerLeads.prototype.updateCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params._id) {
        retObj.messages.push('Please try again,Invalid commission agent');
    }
    if (!params.leadType) {
        retObj.messages.push("Please Select Customer Type");
    }
    if (!params.firstName) {
        retObj.messages.push("Please Provide Full Name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter phone number");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.update_commission_agent_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        if (req.files.files) {
            Utils.uploadDocuments(req.files.files, function (uploadResp) {
                if (uploadResp.status) {
                    if (!req.body.content.documentFiles) {
                        req.body.content.documentFiles = [];
                    }
                    // params.documentFile = uploadResp.fileName;
                    req.body.content.documentFiles = req.body.content.documentFiles.concat(uploadResp.fileNames);
                    req.body.content.updatedBy = req.jwt.id;
                    updateCommissionAgent(req, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
                    analyticsService.create(req, serviceActions.update_commission_agent_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            req.body.content.updatedBy = req.jwt.id;
            updateCommissionAgent(req, callback);
        }
    }

};

function updateCommissionAgent(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params.operatingRoutes) {
        params.operatingRoutes = [];
    }
    AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
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
                    if (route.destinationLocation[0]) {
                        route.destinationLocation = [parseFloat(route.destinationLocation[0]), parseFloat(route.destinationLocation[1])];
                    }
                    if (route.sourceLocation[0]) {
                        route.sourceLocation = [parseFloat(route.sourceLocation[0]), parseFloat(route.sourceLocation[1])];
                    }
                    if (!route._id) {
                        query = {_id: mongoose.Types.ObjectId()};
                        route.createdBy = req.jwt.id;
                        route.accountId = params._id;
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
                        retObj.messages.push("Commission Agent updated successfully");
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
                retObj.messages.push("Commission Agent updated successfully");
                analyticsService.create(req, serviceActions.update_commission_agent, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        } else {
            retObj.messages.push("Commission Agent not updated");
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

CustomerLeads.prototype.deleteCommissionAgent = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.commissionAgentId || !ObjectId.isValid(params.commissionAgentId)) {
        retObj.messages.push("Invalid commission agent");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.remove({_id: params.commissionAgentId}, function (err, doc) {
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
    AccountsColl.count({role: 'Factory Owners'}, function (err, count) {
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

    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (params.factoryOwner) {
            condition = {
                $or:
                    [
                        {"userId": new RegExp(params.factoryOwner, "gi")},
                        {"firstName": new RegExp(params.factoryOwner, "gi")},
                        {"companyName": new RegExp(params.factoryOwner, "gi")},
                        {"userName": new RegExp(params.factoryOwner, "gi")},
                        // {"mobile": new RegExp(parseFloat(params.guest),"gi")},
                        {"email": new RegExp(params.factoryOwner, "gi")},
                        {"city": new RegExp(params.factoryOwner, "gi")},
                    ], role: 'Factory Owners'
            };
        } else if (params.status) {
            condition = {role: 'Factory Owners', "isActive": params.status}
        } else {
            condition = {role: 'Factory Owners'}
        }

        async.parallel({
            factoryOwners: function (factoryOwnersCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, factoryOwners) {
                        factoryOwnersCallback(err, factoryOwners);
                    });
            },
            count: function (countCallback) {
                AccountsColl.count({role: 'Factory Owners'}, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving factory owner');
                analyticsService.create(req, serviceActions.get_factory_owner_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.factoryOwners;
                analyticsService.create(req, serviceActions.get_factory_owner, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

CustomerLeads.prototype.getFactoryOwnerDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params.factoryOwnerId || !ObjectId.isValid(params.factoryOwnerId)) {
        retObj.messages.push("Invalid factory owner");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            accountData: function (accountDataCallback) {
                AccountsColl.findOne({_id: params.factoryOwnerId}, function (err, doc) {
                    accountDataCallback(err, doc);
                });
            },
            operatingRoutesData: function (operatingRoutesDataCallback) {
                OperatingRoutesColl.find({accountId: params.factoryOwnerId}, function (err, doc) {
                    operatingRoutesDataCallback(err, doc);
                });
            }
        }, function (err, result) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_factory_owner_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (result) {
                retObj.messages.push("Success");
                retObj.data = result;
                retObj.status = true;
                analyticsService.create(req, serviceActions.get_factory_owner_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Factory Owner not found");
                analyticsService.create(req, serviceActions.get_factory_owner_details_err, {
                    body: JSON.stringify(req.query),
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

CustomerLeads.prototype.updateFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params._id) {
        retObj.messages.push('Please try again,Invalid factory owner');
    }
    if (!params.leadType) {
        retObj.messages.push("Please Select Customer Type");
    }
    if (!params.firstName) {
        retObj.messages.push("Please Provide Full Name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter phone number");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.update_factory_owner_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        if (req.files.files) {
            Utils.uploadDocuments(req.files.files, function (uploadResp) {
                if (uploadResp.status) {
                    if (!req.body.content.documentFiles) {
                        req.body.content.documentFiles = [];
                    }
                    // params.documentFile = uploadResp.fileName;
                    req.body.content.documentFiles = req.body.content.documentFiles.concat(uploadResp.fileNames);
                    req.body.content.updatedBy = req.jwt.id;
                    updateFactoryOwner(req, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
                    analyticsService.create(req, serviceActions.update_factory_owner_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            req.body.content.updatedBy = req.jwt.id;
            updateFactoryOwner(req, callback);
        }
    }

};

function updateFactoryOwner(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params.operatingRoutes) {
        params.operatingRoutes = [];
    }
    AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
        if (err) {
            retObj.messages.push("Please try again");
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
                    if (route.destinationLocation[0]) {
                        route.destinationLocation = [parseFloat(route.destinationLocation[0]), parseFloat(route.destinationLocation[1])];
                    }
                    if (route.sourceLocation[0]) {
                        route.sourceLocation = [parseFloat(route.sourceLocation[0]), parseFloat(route.sourceLocation[1])];
                    }
                    if (!route._id) {
                        query = {_id: mongoose.Types.ObjectId()};
                        route.createdBy = req.jwt.id;
                        route.accountId = params._id;
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
                        retObj.messages.push("Factory Owner updated successfully");
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
                retObj.messages.push("Factory Owner updated successfully");
                analyticsService.create(req, serviceActions.update_factory_owner, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        } else {
            retObj.messages.push("Factory Owner not updated");
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

CustomerLeads.prototype.deleteFactoryOwner = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.factoryOwnerId || !ObjectId.isValid(params.factoryOwnerId)) {
        retObj.messages.push("Invalid factory owner");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.remove({_id: params.factoryOwnerId}, function (err, doc) {
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
    AccountsColl.count({role: 'Guest'}, function (err, count) {
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

    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (params.guest) {
            condition = {
                $or:
                    [
                        {"userId": new RegExp(params.guest, "gi")},
                        {"firstName": new RegExp(params.guest, "gi")},
                        {"companyName": new RegExp(params.guest, "gi")},
                        // {"mobile": new RegExp(parseFloat(params.guest),"gi")},
                        {"email": new RegExp(params.guest, "gi")},
                        {"city": new RegExp(params.guest, "gi")},
                    ], role: 'Guest'
            };
        } else if (params.status) {
            condition = {role: 'Guest', "isActive": params.status}
        } else {
            condition = {role: 'Guest'}
        }

        async.parallel({
            guests: function (guestsCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, guests) {
                        guestsCallback(err, guests);
                    });
            },
            count: function (countCallback) {
                AccountsColl.count({role: 'Guest'}, function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving guest');
                analyticsService.create(req, serviceActions.get_guest_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.guests;
                analyticsService.create(req, serviceActions.get_guest, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
};

CustomerLeads.prototype.getGuestDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params.guestId || !ObjectId.isValid(params.guestId)) {
        retObj.messages.push("Invalid guest");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.findOne({_id: params.guestId}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_guest_details_err, {
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
                analyticsService.create(req, serviceActions.get_guest_details, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Guest not found");
                analyticsService.create(req, serviceActions.get_guest_details_err, {
                    body: JSON.stringify(req.query),
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

CustomerLeads.prototype.updateGuest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id) {
        retObj.messages.push('Please try again,Invalid guest');
    }
    if (!params.leadType) {
        retObj.messages.push("Please Select Customer Type");
    }
    if (!params.firstName) {
        retObj.messages.push("Please Provide Full Name");
    }
    if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
        retObj.messages.push("Please enter phone number");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.update_guest_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params = Utils.removeEmptyFields(params);
        params.updatedBy = req.jwt.id;
        AccountsColl.findOneAndUpdate({_id: params._id}, params, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_guest_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("Guest updated successfully");
                analyticsService.create(req, serviceActions.update_guest, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Guest not updated");
                analyticsService.create(req, serviceActions.update_guest_err, {
                    body: JSON.stringify(req.query),
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

CustomerLeads.prototype.deleteGuest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.guestId || !ObjectId.isValid(params.guestId)) {
        retObj.messages.push("Invalid guest");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AccountsColl.remove({_id: params.guestId}, function (err, doc) {
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

/*Delete operating routes*/
CustomerLeads.prototype.deleteOperatingRoutes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid operating route");
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

/*Delete Traffic Manager*/
CustomerLeads.prototype.deleteTrafficManagers = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid traffic manager");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        trafficManagerColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_traffic_manager_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Traffic Manager deleted successfully");
                analyticsService.create(req, serviceActions.delete_traffic_manager, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Traffic Manager not deleted");
                analyticsService.create(req, serviceActions.delete_traffic_manager_err, {
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


/*Delete Documents*/
CustomerLeads.prototype.removeDoc = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid document");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        Utils.removeDoc(params.file, function (removeResp) {
            if (removeResp.status) {
                AccountsColl.update(
                    {_id: params._id},
                    {$pull: {documentFiles: params.file}},
                    {safe: true}, function (err, doc) {
                        if (err) {
                            retObj.messages.push("please try again");
                            analyticsService.create(req, serviceActions.delete_document_file_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else if (doc) {
                            retObj.status = true;
                            retObj.messages.push("Document deleted successfully");
                            analyticsService.create(req, serviceActions.delete_document_file, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.messages.push("Document not deleted");
                            analyticsService.create(req, serviceActions.delete_document_file_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
            } else {
                retObj.messages.push("Document not deleted");
                analyticsService.create(req, serviceActions.delete_document_file_err, {
                    body: JSON.stringify(req.query),
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

/*Author:Naresh D
* Get Rest Of All */
CustomerLeads.prototype.getRestOfAll = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    var condition = {};
    if (params.junkLeadSearch) {
        condition = {
            $or:
                [
                    {"firstName": new RegExp(params.junkLeadSearch, "gi")},
                    {"companyName": new RegExp(params.junkLeadSearch, "gi")},
                ], leadStatus: 'Junk Lead'
        };
    } else if (params.status) {
        if (params.status === 'gps') {
            condition = {leadStatus: 'Junk Lead', "gpsEnabled": true}
        } else if (params.status === 'erp') {
            condition = {leadStatus: 'Junk Lead', "erpEnabled": true}
        } else if (params.status === 'both') {
            condition = {
                $and:
                    [
                        {"gpsEnabled": true},
                        {"erpEnabled": true},
                    ], leadStatus: 'Junk Lead'
            };
        } else if (params.status === 'load') {
            condition = {leadStatus: 'Junk Lead', "loadEnabled": true}
        }
    } else {
        condition = {leadStatus: 'Junk Lead'}
    }
    async.parallel({
        customerLeads: function (customerLeadsCallback) {
            CustomerLeadsColl.find(condition).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    customerLeadsCallback(err, docs);

                })
        },
        count: function (countCallback) {
            CustomerLeadsColl.count({"leadStatus": "Junk Lead"}, function (err, count) {
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

CustomerLeads.prototype.getCountRestOfAll = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    CustomerLeadsColl.count({"leadStatus": "Junk Lead"}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting customer leads count');
            analyticsService.create(req, serviceActions.count_rest_of_all_err, {
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
            analyticsService.create(req, serviceActions.count_rest_of_all, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

CustomerLeads.prototype.deleteRestOfAllDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid rest of all lead");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_rest_of_all_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        CustomerLeadsColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_rest_of_all, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Rest of all details deleted successfully");
                analyticsService.create(req, serviceActions.delete_rest_of_all, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Rest of all details not deleted");
                analyticsService.create(req, serviceActions.delete_rest_of_all_err, {
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

/*Author:Naresh
**Delete Customer lead Documents*/
CustomerLeads.prototype.removeCustomerLeadDocFile = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id) || !params.file) {
        retObj.messages.push("Invalid document");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        Utils.removeDoc(params.file, function (removeResp) {
            if (removeResp.status) {
                CustomerLeadsColl.update(
                    {_id: params._id},
                    {$pull: {documentFiles: params.file}},
                    {safe: true}, function (err, doc) {
                        if (err) {
                            retObj.messages.push("please try again");
                            analyticsService.create(req, serviceActions.delete_document_file_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else if (doc) {
                            retObj.status = true;
                            retObj.messages.push("Document deleted successfully");
                            analyticsService.create(req, serviceActions.delete_document_file, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.messages.push("Document not deleted");
                            analyticsService.create(req, serviceActions.delete_document_file_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    })
            } else {
                retObj.messages.push("Document not deleted");
                analyticsService.create(req, serviceActions.delete_document_file_err, {
                    body: JSON.stringify(req.query),
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
/*Author : Naresh d
* Get Trucks by truck owner*/
CustomerLeads.prototype.getTrucksByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    if (!params.truckOwnerId || !ObjectId.isValid(params.truckOwnerId)) {
        retObj.messages.push("Invalid Truck owner");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            trucks:function (trucksCallback) {
                TrucksColl.find({accountId: params.truckOwnerId})
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, docs) {
                    trucksCallback(err, docs);

                })
            },
            count:function (countCallback) {
                TrucksColl.count({accountId: params.truckOwnerId}, function (err, count) {
                    countCallback(err, count);
                });
            }
        },function(err,result){
            if(err){
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_trucks_by_admin_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else{
                retObj.status = true;
                retObj.data = result.trucks;
                retObj.count=result.count;
                retObj.messages.push("Success");
                analyticsService.create(req, serviceActions.get_trucks_by_admin, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }

        });

    }
};

/*Author : Naresh d
* Get Total Trucks by admin*/
CustomerLeads.prototype.getTotalTrucksByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.truckOwnerId || !ObjectId.isValid(params.truckOwnerId)) {
        retObj.messages.push("Invalid Truck owner");
    }
    if (retObj.messages.length > 0) {

        callback(retObj);
    } else {
        TrucksColl.count({accountId: params.truckOwnerId}, function (err, count) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_total_trucks_by_admin_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.data = count;
                retObj.messages.push("Success");
                analyticsService.create(req, serviceActions.get_total_trucks_by_admin, {
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

/*Author :Naresh D
* Add truck by admin*/
CustomerLeads.prototype.addTruckByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var truckDetails = req.body;
    if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
        retObj.messages.push("Please fill all the required truck details");
    }

    if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
        retObj.messages.push("Please provide valid registration number");
    }

    if (!truckDetails.truckType) {
        retObj.messages.push("Please select Truck type");
    }
    if (!truckDetails.vehicleType) {
        retObj.messages.push("Please select vehicle type");
    }

    if (!truckDetails.accountId || !ObjectId.isValid(truckDetails.accountId)) {
        retObj.messages.push("Invalid truck owner");
    }


    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_truck_by_admin_err, {
            body: JSON.stringify(req.body),
            accountId: jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksColl.find({registrationNo: truckDetails.registrationNo}, function (err, truck) {
            if (err) {
                retObj.messages.push("Error, try again!");
                analyticsService.create(req, serviceActions.add_truck_by_admin_err, {
                    body: JSON.stringify(req.body),
                    accountId: jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (truck && truck.length > 0) {
                retObj.messages.push("Truck already exists");
                analyticsService.create(req, serviceActions.add_truck_by_admin_err, {
                    body: JSON.stringify(req.body),
                    accountId: jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                truckDetails.createdBy = jwt.id;
                truckDetails = Utils.removeEmptyFields(truckDetails);
                var truckDoc = new TrucksColl(truckDetails);
                truckDoc.save(function (err, truck) {
                    if (err) {
                        retObj.messages.push("Error while adding truck, try Again");
                        analyticsService.create(req, serviceActions.add_truck_by_admin_err, {
                            body: JSON.stringify(req.body),
                            accountId: jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Truck Added Successfully");
                        retObj.data = truck;
                        analyticsService.create(req, serviceActions.add_truck_by_admin, {
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
        });
    }
};

/*Author : Naresh d
* Get Truck Details by admin*/
CustomerLeads.prototype.getTruckDetailsByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Truck");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_truck_details_by_admin_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_details_by_truck_owner_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.data = doc;
                retObj.messages.push("Success");
                analyticsService.create(req, serviceActions.get_total_trucks_by_admin, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck details not found");
                analyticsService.create(req, serviceActions.get_truck_details_by_admin_err, {
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

/*Author : Naresh d
* Delete truck by admin*/
CustomerLeads.prototype.deleteTruckByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    console.log(params);
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Truck ");
    }
    if (retObj.messages.length > 0) {

        callback(retObj);
    } else {
        TrucksColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.delete_truck_by_admin_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.data = doc;
                retObj.messages.push("Truck Deleted successfully");
                analyticsService.create(req, serviceActions.delete_truck_by_admin, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck not deleted");
                analyticsService.create(req, serviceActions.delete_truck_by_admin_err, {
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

/*Author : Naresh d
* Update by Admin*/
CustomerLeads.prototype.updateTruckDetailsByAdmin = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var truckDetails = req.body;
    if (!_.isObject(truckDetails) || _.isEmpty(truckDetails)) {
        retObj.messages.push("Please fill all the required truck details");
    }

    if (!truckDetails.registrationNo || !_.isString(truckDetails.registrationNo)) {
        retObj.messages.push("Please provide valid registration number");
    }

    if (!truckDetails.truckType) {
        retObj.messages.push("Please provide valid Truck type");
    }

    if (!truckDetails.accountId || !ObjectId.isValid(truckDetails.accountId)) {
        retObj.messages.push("Invalid truck owner");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        truckDetails = Utils.removeEmptyFields(truckDetails);
        truckDetails.updatedBy = jwt.id;
        TrucksColl.findOneAndUpdate({_id: truckDetails._id},
            {
                $set: truckDetails
            },
            {new: true}, function (err, truck) {
                if (err) {
                    retObj.messages.push("Error while updating truck, try Again");
                    analyticsService.create(req, serviceActions.update_truck_by_admin_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (truck) {
                    retObj.status = true;
                    retObj.messages.push("Truck updated successfully");
                    retObj.data = truck;
                    analyticsService.create(req, serviceActions.update_truck_by_admin, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.status = false;
                    retObj.messages.push("Error, finding truck");
                    analyticsService.create(req, serviceActions.update_truck_by_admin_err, {
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

module.exports = new CustomerLeads();
