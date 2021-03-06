var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var TruckRequestColl = require("../models/schemas").TruckRequestColl;
var AccountsColl = require("../models/schemas").AccountsColl;
var OperatingRoutesColl = require("../models/schemas").OperatingRoutesColl;
var TrucksColl = require("../models/schemas").TrucksColl;
var DriversColl = require("../models/schemas").DriversColl;
var TruckRequestQuoteColl = require("../models/schemas").TruckRequestQuoteColl;
var TripCollection = require("../models/schemas").TripCollection;
var TruckRequestCommentsColl = require("../models/schemas").TruckRequestCommentsColl;
var adminLoadRequestColl = require("../models/schemas").adminLoadRequestColl;
var CustomerLeadsColl = require("../models/schemas").CustomerLeadsColl;
var AdminTripsColl = require("../models/schemas").AdminTripsColl;
var OrderPaymentsColl = require("../models/schemas").OrderPaymentsColl;
var OrderCommentsColl = require("../models/schemas").OrderCommentsColl;
var OrderTransactionsColl = require("../models/schemas").OrderTransactionsColl;
var OrderLocationColl = require("../models/schemas").OrderLocationColl;

var customerLeadsApi = require("./customerLeadsApi");
var Utils = require("./../apis/utils");
var emailService = require('./../apis/mailerApi');
var SmsService = require('./../apis/smsApi');
var fse = require('fs-extra');

var OrderProcess = function () {
};
/*author : Naresh d*/
OrderProcess.prototype.getTruckRequests = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        truckRequests: function (truckRequestsCallback) {
            TruckRequestColl.find({}, {
                createdBy: 1,
                customerType: 1,
                source: 1,
                destination: 1,
                goodsType: 1,
                truckType: 1,
                date: 1,
                pickupPoint: 1,
                comment: 1,
                expectedPrice: 1,
                trackingAvailable: 1,
                insuranceAvailable: 1,
                status: 1,
                title: 1,
                customerName: 1
            }).populate({path: "truckType", select: "title tonnes"})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    truckRequestsCallback(err, docs);

                })
        },
        count: function (countCallback) {
            TruckRequestColl.count({}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_truck_requests_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (results.truckRequests.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = results.truckRequests;
                retObj.count = results.count;
                analyticsService.create(req, serviceActions.get_truck_requests, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No truck requests found");
                analyticsService.create(req, serviceActions.get_truck_requests_err, {
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

/*Author : Naresh d*/
OrderProcess.prototype.countTruckRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TruckRequestColl.count({}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting truck request count');
            analyticsService.create(req, serviceActions.count_truck_request_err, {
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
            analyticsService.create(req, serviceActions.count_truck_request, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

/*author : Naresh d*/
OrderProcess.prototype.addTruckRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    if (!params.customerType) {
        retObj.messages.push("Please enter customer type");
    }
    if (params.customerType === "Registered" && !params.customer) {
        retObj.messages.push("Please select customer");
    }
    if (params.customerType === "UnRegistered" && !params.firstName) {
        retObj.messages.push("Please enter name");
    }
    if (params.customerType === "UnRegistered" && !params.contactPhone) {
        retObj.messages.push("Please enter phone");
    }
    if (!params.truckDetails || !params.truckDetails.length > 0 || !checkTruckDetails(params.truckDetails)) {
        retObj.messages.push("Please enter truck details");
    }
    /*if (params.customerType === 'Registered' && !params.accountId) {
     retObj.messages.push("Please select customer");
     }*/
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_truck_request_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (params.customerType === 'Registered') {
            saveTruckRequest(req, callback);
        } else if (params.customerType === 'UnRegistered') {
            params.createdBy = req.jwt.id;
            Utils.removeEmptyFields(params);
            var customerLead = new CustomerLeadsColl(params);
            customerLead.save(function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again1");
                    analyticsService.create(req, serviceActions.add_customer_lead_err, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    params.customerLeadId = doc._id;
                    retObj.messages.push("Customer lead added successfully");
                    analyticsService.create(req, serviceActions.get_customer_leads, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    saveTruckRequest(req, callback);
                }
            });
        }
    }


};

function checkTruckDetails(truckDetails) {
    for (var i = 0; i < truckDetails.length; i++) {
        if (!truckDetails[i].source || !truckDetails[i].destination) {
            return false;
        }
        if (i === truckDetails.length - 1) {
            return true;
        }

    }
}

function saveTruckRequest(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    params.createdBy = req.jwt.id;
    async.map(params.truckDetails, function (truckDetails, truckCallback) {
        params.source = truckDetails.source;
        params.destination = truckDetails.destination;
        params.goodsType = truckDetails.goodsType;
        params.truckType = truckDetails.truckType;
        params.date = truckDetails.date;
        params.pickupPoint = truckDetails.pickupPoint;
        params.comment = truckDetails.comment;
        params.expectedPrice = truckDetails.expectedPrice;
        params.trackingAvailable = truckDetails.trackingAvailable;
        params.insuranceAvailable = truckDetails.insuranceAvailable;
        params = Utils.removeEmptyFields(params);
        var truckRequest = new TruckRequestColl(params);

        truckRequest.save(function (err, doc) {
            if (err) {

                truckCallback(err);
            } else {
                truckCallback(false);
            }
        })
    }, function (err) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.add_truck_request_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Truck request added successfully");
            analyticsService.create(req, serviceActions.add_truck_request, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }

    });

}

/*author : Naresh d*/
OrderProcess.prototype.getTruckRequestDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_truck_request_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TruckRequestColl.findOne({_id: params._id}).populate("customer").populate("customerLeadId").lean().exec(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_request_details_err, {
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
                if (doc.customerType === 'Registered') {
                    retObj.data.customerDetails = doc.accountId;
                } else {
                    retObj.data.customerDetails = doc.customerLeadId;
                }
                retObj.data.accountId = "";
                retObj.data.customerLeadId = "";
                analyticsService.create(req, serviceActions.get_truck_request_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck request details not found");
                analyticsService.create(req, serviceActions.get_truck_request_details_err, {
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

/*author : Naresh d*/
OrderProcess.prototype.updateTruckRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (!params.name) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone || !params.contactPhone.length > 0) {
        retObj.messages.push("Please enter contact number");
    }
    if (!params.leadType) {
        retObj.messages.push("Please select lead type");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        CustomerLeadsColl.findOneAndUpdate({_id: params._id},
            {$set: params},
            {new: true},
            function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.update_customer_lead_err, {
                        body: JSON.stringify(req.body),
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

/*author : Naresh d*/
OrderProcess.prototype.deleteTruckRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_truck_request_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TruckRequestColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_truck_request_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Truck request deleted successfully");
                analyticsService.create(req, serviceActions.delete_truck_request, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck request not deleted");
                analyticsService.create(req, serviceActions.delete_truck_request_err, {
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

/*author : Naresh d*/

OrderProcess.prototype.searchTrucksForRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var condition = {};
    if (!params.source) {
        retObj.messages.push('please select source');
        callback(retObj);
    }
    if (!params.destination) {
        retObj.messages.push('please select destination');
        callback(retObj);
    }

    /*if (params.truckType && params.trackingAvailable) {

     } else if (params.truckType) {

     } else if (params.trackingAvailable) {

     }*/
    var coordinates = [parseFloat(params.destination[0]), parseFloat(params.destination[1])];
    OperatingRoutesColl.find({
        sourceAddress: {$regex: '.*' + params.source + '.*'},
        destinationLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coordinates
                },
                $centerSphere: 150000,
                spherical: true

            }
        }

    }).lean().exec(function (err, operatingRoutes) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (operatingRoutes.length > 0) {

            var accountIds = operatingRoutes.map(function (doc) {
                return doc.accountId;
            });
            var condition = {};
            if (params.truckType) {
                condition = {truckTypes: { $elemMatch: {$eq:params.truckType}}, _id: {$in: accountIds}}
            } else {
                condition = {_id: {$in: accountIds}}
            }
            AccountsColl.find(condition, function (err, accountsList) {
                if (err) {
                    retObj.messages.push("No trucks found");
                    callback(retObj);
                } else if (accountsList.length > 0) {
                    retObj.status = true;
                    retObj.data = accountsList;
                    retObj.messages.push("success");
                    callback(retObj);
                } else {
                    retObj.messages.push("No trucks found");
                    callback(retObj);
                }
            });
        } else {
            retObj.messages.push("No trucks found");
            callback(retObj);
        }
    })

};

/*author : Naresh d*/
OrderProcess.prototype.addTruckRequestQuote = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var params = req.body;

    if (!params.quote) {
        retObj.messages.push("Please enter quote");
    }
    if (!params.comment) {
        retObj.messages.push("Please enter comment");

    }
    if (!params.accountId) {
        retObj.messages.push("Please select customer");
    }
    if (!params.truckRequestId) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var truckRequestQuote = new TruckRequestQuoteColl(params);
        truckRequestQuote.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_truck_request_quote_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Quote added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_truck_request_quote, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

/*author : Naresh d*/
OrderProcess.prototype.getTruckRequestQuotes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.truckRequestId || !ObjectId.isValid(params.truckRequestId)) {
        retObj.messages.push("Please select valid truck request");
    }
    if (retObj.messages.length) {
        callback(retObj)
    } else {
        TruckRequestQuoteColl.find({truckRequestId: params.truckRequestId}).populate({
            path: "accountId",
            select: "contactPhone firstName"
        }).exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_request_quotes_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages.push("Success");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_request_quotes, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No truck request quotes found");
                analyticsService.create(req, serviceActions.get_truck_request_quotes_err, {
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

/*author : Naresh d*/
OrderProcess.prototype.loadBookingForTruckRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var query = {};
    var params = req.body;
    if (!params.loadOwnerType) {
        retObj.messages.push("select load owner type");
    }
    if (!params.truckOwnerId) {
        retObj.messages.push("Please select truck owner");
    }
    if (params.loadOwnerType === "Registered" && !params.loadOwnerId) {
        retObj.messages.push("Please select load owner customer");
    }

    if (!params.truckType) {
        retObj.messages.push("Please select truck type");
    }
    if (!params.source) {
        retObj.messages.push("Please enter source");
    }
    if (!params.destination) {
        retObj.messages.push("Please enter destination");
    }
    if (!params.registrationNo) {
        retObj.messages.push("Please enter truck number");
    }

    if (!params.to_bookedAmount) {
        retObj.messages.push("Please truck booked amount");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else {            console.log("params",params);

        if (!params._id) {
            saveTripOrder(req, params, function (resp) {
                console.log(resp);
                callback(resp);
            });
        }else{
            retObj.messages.push("Load already booked");
            callback(retObj);
        }
    }

    /*if (!params._id) {
        query = {_id: mongoose.Types.ObjectId()};
        params.createdBy = req.jwt.id;
        saveTripOrder(req,params,callback);
    } else {
        query = {_id: params._id}
    }
    params.updatedBy = req.jwt.id;
    if (!params.registrationNo) {
        retObj.messages.push("Please select truck");
    }
    if (!params.freightAmount) {
        retObj.messages.push("Please enter amount");
    }
    if (!params.tripLane) {
        retObj.messages.push("Please enter pickup point");
    }
    if (!params.accountId || !ObjectId.isValid(params.accountId)) {
        retObj.messages.push("Please select truck provider");
    }
    if (!params.driverId) {
        retObj.messages.push("Please select driver");
    }
    if (!params.date) {
        retObj.messages.push("Please select pickup date");
    }
    if (!params.truckRequestId) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AdminTripsColl.update(query, params, {upsert: true}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_load_booking_for_truck_request_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Load booked successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_load_booking_for_truck_request, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
                async.parallel({
                    truckRequest: function (truckReqCallback) {
                        TruckRequestColl.findOne({_id: params.truckRequestId}).populate('customer').populate('customerLeadId').exec(function (err, truckReq) {
                            truckReqCallback(err, truckReq);
                        });
                    },
                    tripDetails: function (tripCallback) {
                        AdminTripsColl.findOne({truckRequestId: params.truckRequestId}).populate('driverId').populate('accountId').exec(function (err, tripDoc) {
                            tripCallback(err, tripDoc);
                        })
                    }
                }, function (err, result) {
                    if (err) {

                    } else {
                        if (result.truckRequest.customerType === 'Registered') {
                            customer = result.truckRequest.customer;

                        } else {
                            customer = result.truckRequest.customerLeadId
                        }
                        if (customer.contactPhone) {
                            var smsParams = {
                                contact: customer.contactPhone,
                                message: 'Hi ' + customer.userName + '\n' +
                                'your truck request from ' + result.truckRequest.source + ' to ' + result.truckRequest.destination + ' \n truck number:' + result.tripDetails.registrationNo + ' \n Driver Name:' + result.tripDetails.driverId.fullName + ' \n driver number:' + result.tripDetails.driverId.mobile
                            };
                            SmsService.sendSMS(smsParams, function (smsResp) {
                                console.log(smsResp);
                            })

                        }
                        if (customer.email) {
                            var emailparams = {
                                templateName: 'truckRequestTripDetails',
                                subject: "Easygaadi truck request details",
                                to: customer.email,
                                data: {

                                    "name": customer.userName,
                                    "source": result.truckRequest.source,
                                    "destination": result.truckRequest.destination,
                                    "registraionNo": result.tripDetails.registrationNo,
                                    "driver": result.tripDetails.driverId.fullName,
                                    "driverMobile": result.tripDetails.driverId.mobile
                                }//dataToEmail.tripsReport
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                console.log(emailResponse);
                            })

                        }
                    }
                });
            }
        })
    }*/

};

OrderProcess.prototype.getLoadBookingDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.truckRequestId || !ObjectId.isValid(params.truckRequestId)) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AdminTripsColl.findOne({truckRequestId: params.truckRequestId}).populate({
            path: "accountId",
            select: "firstName contactPhone"
        }).exec(function (err, doc) {
            if (err) {
                retObj.messages
                    .push("Please try again");
                analyticsService.create(req, serviceActions.get_load_booking_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("success");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_load_booking_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Load booking not available");
                analyticsService.create(req, serviceActions.get_load_booking_details_err, {
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

OrderProcess.prototype.getTrucksAndDriversByAccountId = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;

    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Please select customer");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        async.parallel({
            trucksList: function (trucksCallback) {
                TrucksColl.find({accountId: params._id}, function (err, trucks) {
                    trucksCallback(err, trucks);
                })
            },
            driversList: function (driversCallback) {
                DriversColl.find({accountId: params._id}, function (err, drivers) {
                    driversCallback(err, drivers);
                })
            }
        }, function (err, result) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_trucks_and_drivers_by_accountId_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.data = result;
                analyticsService.create(req, serviceActions.get_trucks_and_drivers_by_accountId, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

OrderProcess.prototype.addTruckRequestComment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.truckRequestId || !ObjectId.isValid(params.truckRequestId)) {
        retObj.messages.push("Invalid truck request");
    }
    if (!params.status) {
        retObj.messages.push("Please enter status");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        var truckReqComment = new TruckRequestCommentsColl(params);
        truckReqComment.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_truck_request_comment_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                TruckRequestColl.update({_id: params.truckRequestId}, {status: params.status}, function (err, updateDoc) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.add_truck_request_comment_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        if (params.notifiedStatus === 'YES') {
                            var customer = {};

                            retObj.status = true;
                            retObj.messages.push("Comment added successfully");
                            retObj.data = doc;
                            analyticsService.create(req, serviceActions.add_truck_request_comment, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                            TruckRequestColl.findOne({_id: params.truckRequestId}).populate('customer').populate('customerLeadId').exec(function (err, truckReq) {
                                if (err) {
                                    retObj.messages.push("Please try again");
                                    callback(retObj);
                                } else if (truckReq) {
                                    if (truckReq.customerType === 'Registered') {
                                        customer = truckReq.customer;

                                    } else {
                                        customer = truckReq.customerLeadId
                                    }
                                    if (customer.contactPhone) {
                                        var smsParams = {
                                            contact: customer.contactPhone,
                                            message: 'Hi ' + customer.firstName + '\n' +
                                            'your truck request from ' + truckReq.source + ' to ' + truckReq.destination + ' \n status:' + params.status + ' \n comment:' + params.comment
                                        };
                                        SmsService.sendSMS(smsParams, function (smsResp) {
                                            console.log(smsResp);
                                        })

                                    }
                                    if (customer.email) {
                                        var emailparams = {
                                            templateName: 'truckRequestComment',
                                            subject: "Easygaadi truck request details",
                                            to: customer.email,
                                            data: {

                                                "name": customer.firstName,
                                                "source": truckReq.source,
                                                "destination": truckReq.destination,
                                                "status": params.status,
                                                "comment": params.comment
                                            }//dataToEmail.tripsReport
                                        };
                                        emailService.sendEmail(emailparams, function (emailResponse) {
                                            console.log(emailResponse);
                                        })

                                    }


                                } else {
                                    retObj.messages.push("Please try again");
                                    callback(retObj);
                                }

                            });
                        } else {
                            retObj.status = true;
                            retObj.messages.push("Comment added successfully");
                            retObj.data = doc;
                            analyticsService.create(req, serviceActions.add_truck_request_comment, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);

                        }
                    }
                });
            }
        })
    }
};


OrderProcess.prototype.getTruckRequestComments = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.truckRequestId || !ObjectId.isValid(params.truckRequestId)) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {

        TruckRequestCommentsColl.find({truckRequestId: params.truckRequestId}).sort({createdAt: -1}).exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_request_comments_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages.push("Success");
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_truck_request_comments, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.data = docs;
                retObj.messages.push("Comments not found");
                analyticsService.create(req, serviceActions.get_truck_request_comments_err, {
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

OrderProcess.prototype.updateTruckRequestDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        var body = Utils.removeEmptyFields(params);
        TruckRequestColl.update({_id: params._id}, body, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push("truck request details saved successfully");
                analyticsService.create(req, serviceActions.update_truck_request, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_truck_request_err, {
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

/*Author SVPrasadK
 * Load Request Start*/
OrderProcess.prototype.countLoadRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    adminLoadRequestColl.count({}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting load request count');
            analyticsService.create(req, serviceActions.count_load_request_err, {
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
            analyticsService.create(req, serviceActions.count_load_request, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

OrderProcess.prototype.getLoadRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        loadRequests: function (loadRequestsCallback) {
            adminLoadRequestColl.find({}).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    loadRequestsCallback(err, docs);

                })
        },
        count: function (countCallback) {
            adminLoadRequestColl.count({}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_load_request_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (results.loadRequests.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = results.loadRequests;
                retObj.count = results.count;
                analyticsService.create(req, serviceActions.get_load_request, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No load requests found");
                analyticsService.create(req, serviceActions.get_load_request_err, {
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

OrderProcess.prototype.addLoadRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.customerType) {
        retObj.messages.push("Please select customer type");
    }
    if (params.customerType === "Registered" && !params.customer) {
        retObj.messages.push("Please select customer");
    }
    if (params.customerType === "UnRegistered" && !params.firstName) {
        retObj.messages.push("Please provide name");
    }
    if (params.customerType === "UnRegistered" && !params.contactPhone) {
        retObj.messages.push("Please provide mobile");
    }
    if (!params.truckDetails || !params.truckDetails.length > 0 || !checkTruckDetailss(params.truckDetails)) {
        retObj.messages.push("Please enter truck details");
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_load_request_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        if (params.customerType === 'Registered') {
            saveLoadRequest(req, callback);
        } else if (params.customerType === 'UnRegistered') {
            params.leadType = "Transporter";
            req.query = params;
            req.files = {files: false};
            var customerLead = new CustomerLeadsColl(params);
            customerLead.save(function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again1");
                    analyticsService.create(req, serviceActions.add_customer_lead_err, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    params.customerLeadId = doc._id;
                    retObj.messages.push("Customer lead added successfully");
                    analyticsService.create(req, serviceActions.get_customer_leads, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    saveLoadRequest(req, callback);
                }
            });
        }
    }
};

function checkTruckDetailss(truckDetails) {
    for (var i = 0; i < truckDetails.length; i++) {
        if (!truckDetails[i].sourceAddress || truckDetails[i].destination.length === 0 || !truckDetails[i].truckType || !truckDetails[i].registrationNo) {
            return false;
        }
        if (i === truckDetails.length - 1) {
            return true;
        }

    }
}

function saveLoadRequest(req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    params.createdBy = req.jwt.id;
    async.map(params.truckDetails, function (truckDetails, truckCallback) {
        params.sourceAddress = truckDetails.sourceAddress;
        params.destination = truckDetails.destination;
        params.truckType = truckDetails.truckType;
        params.registrationNo = truckDetails.registrationNo;
        params.makeYear = truckDetails.makeYear;
        params.driverInfo = truckDetails.driverInfo;
        params.dateAvailable = truckDetails.dateAvailable;
        params.expectedDateReturn = truckDetails.expectedDateReturn;
        params = Utils.removeEmptyFields(params)
        var adminLoadRequest = new adminLoadRequestColl(params);

        adminLoadRequest.save(function (err, doc) {
            if (err) {
                truckCallback(err);
            } else {
                truckCallback(false);
            }
        })
    }, function (err) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.add_truck_request_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Load request added successfully");
            analyticsService.create(req, serviceActions.add_truck_request, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }

    });

}

OrderProcess.prototype.getLoadRequestDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.loadRequestId || !ObjectId.isValid(params.loadRequestId)) {
        retObj.messages.push("Invalid load request");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_load_request_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        adminLoadRequestColl.findOne({_id: params.loadRequestId}).populate("customerId").populate("customerLeadId").lean().exec(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_load_request_details_err, {
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
                if (doc.customerType === 'Registered') {
                    retObj.data.customerDetails = doc.customerId;
                } else {
                    retObj.data.customerDetails = doc.customerLeadId;
                }
                retObj.data.customerId = "";
                retObj.data.customerLeadId = "";
                analyticsService.create(req, serviceActions.get_load_request_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Load request details not found");
                analyticsService.create(req, serviceActions.get_load_request_details_err, {
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

OrderProcess.prototype.updateLoadRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid customer lead");
    }
    if (!params.firstName) {
        retObj.messages.push("Please enter name");
    }
    if (!params.contactPhone) {
        retObj.messages.push("Please enter contact number");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {

        var loadRequestData = {
            updatedBy: req.jwt.id,
            customerType: params.customerType,
            firstName: params.firstName,
            contactPhone: params.contactPhone,
            sourceAddress: params.sourceAddress,
            destination: params.destination,
            truckType: params.truckType,
            registrationNo: params.registrationNo,
            makeYear: params.makeYear,
            driverInfo: params.driverInfo,
            dateAvailable: params.dateAvailable,
            expectedDateReturn: params.expectedDateReturn,
        }
        if (params.customerType === 'Registered') {
            loadRequestData.customerId = params.customerDetails._id;
        } else {
            loadRequestData.customerLeadId = params.customerDetails._id;
        }
        adminLoadRequestColl.findOneAndUpdate({_id: params._id}, {$set: loadRequestData}, {new: true}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_customer_lead_err, {
                    body: JSON.stringify(req.body),
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

OrderProcess.prototype.deleteLoadRequest = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params.loadRequestId || !ObjectId.isValid(params.loadRequestId)) {
        retObj.messages.push("Invalid load request");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_load_request_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        adminLoadRequestColl.remove({_id: params.loadRequestId}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_load_request_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Load request deleted successfully");
                analyticsService.create(req, serviceActions.delete_load_request, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Load request not deleted");
                analyticsService.create(req, serviceActions.delete_load_request_err, {
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
/*Load Request End*/

OrderProcess.prototype.getAllAccountsExceptTruckOwners = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = params.size ? parseInt(params.size) : 0;
    var sort = {createdAt: -1};
    var condition = {};
    if (params.name) {
        condition = {firstName: {$regex: '.*' + params.name + '.*'}, role: {$ne: "Truck Owner"}}
    } else {
        condition = {role: {$ne: "Truck Owner"}}
    }
    AccountsColl.find(condition, {firstName: 1, contactPhone: 1, contactName: 1, userName: 1})

        .skip(skipNumber)
        .limit(10).exec(function (err, loadOwnersList) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (loadOwnersList.length) {
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = loadOwnersList;
            callback(retObj);
        } else {
            retObj.messages.push("No load owners found");
            callback(retObj);
        }
    })

};

/*Author : Naresh d*/
OrderProcess.prototype.totalAdminTruckOrders = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AdminTripsColl.count({}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting orders count');
            analyticsService.create(req, serviceActions.count_admin_orders_err, {
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
            analyticsService.create(req, serviceActions.count_admin_orders, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

/*Author : Naresh getAdminTruckOrdersList*/
OrderProcess.prototype.getAdminTruckOrdersList = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    async.parallel({
        ordersList: function (ordersListCallback) {
            AdminTripsColl.find({}).populate({path: "createdBy", select: "firstName"}).sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .exec(function (err, docs) {
                    ordersListCallback(err, docs);

                })
        },
        count: function (countCallback) {
            AdminTripsColl.count({}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_admin_orders_list_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {

            if (results.ordersList.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = results.ordersList;
                retObj.count = results.count;
                analyticsService.create(req, serviceActions.get_admin_orders_list, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No orders found");
                analyticsService.create(req, serviceActions.get_admin_orders_list_err, {
                    body: JSON.stringify(req.query),
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

/*Author Naresh*/

OrderProcess.prototype.createOrder = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.loadOwnerType) {
        retObj.messages.push("select load owner type");
    }
    if (!params.truckOwnerId) {
        retObj.messages.push("Please select truck owner");
    }
    if (params.loadOwnerType === "Registered" && !params.loadOwnerId) {
        retObj.messages.push("Please select load owner customer");
    }
    if (params.loadOwnerType === "UnRegistered" && !params.loadOwner_firstName) {
        retObj.messages.push("Please enter load owner name");
    }
    if (params.loadOwnerType === "UnRegistered" && !params.loadOwner_contactPhone) {
        retObj.messages.push("Please enter load owner phone");
    }
    if (!params.truckType) {
        retObj.messages.push("Please select truck type");
    }
    if (!params.source) {
        retObj.messages.push("Please enter source");
    }
    if (!params.destination) {
        retObj.messages.push("Please enter destination");
    }
    if (!params.registrationNo) {
        retObj.messages.push("Please enter truck number");
    }
    if (!params.egCommission) {
        retObj.messages.push("Please enter easygaadi commission");
    }
    if (!params.to_bookedAmount) {
        retObj.messages.push("Please truck booked amount");
    }
    if (!params.to_advance) {
        retObj.messages.push("Please truck booked amount");
    }
    if (!params.applyTds) {
        retObj.messages.push("select apply Tds type");
    }
    if (retObj.messages.length > 0) {

        callback(retObj);
    } else {
        if (params.loadOwnerType === 'Registered') {
            saveTripOrder(req, params, callback);
        } else if (params.loadOwnerType === 'UnRegistered') {
            params.createdBy = req.jwt.id;
            Utils.removeEmptyFields(params);
            var customerLead = new CustomerLeadsColl(params);
            customerLead.save(function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again1");
                    analyticsService.create(req, serviceActions.add_customer_lead_err, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    params.customerLeadId = doc._id;
                    retObj.messages.push("Customer lead added successfully");
                    analyticsService.create(req, serviceActions.get_customer_leads, {
                        body: JSON.stringify(params),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    saveTripOrder(req, params, callback);
                }
            });
        }

    }

};

function saveTripOrder(req, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    params.createdBy = req.jwt.id;
    var adminTrip = new AdminTripsColl(params);
    adminTrip.save(function (err, saveDoc) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.create_order_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            var loadOwnerId = "";
            if (saveDoc.loadOwnerType === "Registered") {
                loadOwnerId = params.loadOwnerId;
            } else {
                loadOwnerId = params.loadCustomerLeadId;
            }

            async.parallel({
                to_bookedAmount: function (to_bookedAmountCallBack) {
                    if (params.to_bookedAmount) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: params.to_bookedAmount,
                            prefix: "+",
                            comment: "Booked Amount"

                        });
                        orderPayment.save(function (err, saved) {
                            to_bookedAmountCallBack(err, saved);
                        });
                    } else {
                        to_bookedAmountCallBack(false, "Empty");
                    }
                },
                to_loadingCharge: function (to_loadingChargeCallBack) {
                    if (params.to_loadingCharge) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: params.to_loadingCharge,
                            prefix: "-",
                            comment: "Loading Charges"

                        });
                        orderPayment.save(function (err, saved) {
                            to_loadingChargeCallBack(err, saved);
                        });
                    } else {
                        to_loadingChargeCallBack(false, "Empty");
                    }
                },
                to_unloadingCharge: function (to_unloadingChargeCallBack) {
                    if (params.to_unloadingCharge) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: params.to_unloadingCharge,
                            prefix: "-",
                            comment: "Unloading Charges"

                        });
                        orderPayment.save(function (err, saved) {
                            to_unloadingChargeCallBack(err, saved);

                        });
                    } else {
                        to_unloadingChargeCallBack(false, "Empty");
                    }
                },
                to_commission: function (to_bookedAmountCallBack) {
                    if (params.to_commission) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: params.to_commission,
                            prefix: "-",
                            comment: "Commission"

                        });
                        orderPayment.save(function (err, saved) {
                            to_bookedAmountCallBack(err, saved);

                        });
                    } else {
                        to_bookedAmountCallBack(false, "Empty");
                    }
                },
                applyTds: function (to_bookedAmountCallBack) {
                    if (params.applyTds === 'Yes') {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: 100,
                            prefix: "-",
                            comment: "Deduct TDS"

                        });
                        orderPayment.save(function (err, saved) {
                            to_bookedAmountCallBack(err, saved);

                        });
                    } else {
                        to_bookedAmountCallBack(false, "Empty");
                    }
                },
                to_advance: function (to_advanceCallBack) {
                    if (params.to_advance) {
                        var orderTran = new OrderTransactionsColl({
                            orderId: saveDoc._id,
                            truckOwnerId: params.truckOwnerId,
                            amount: params.to_advance,
                            prefix: "+",
                            comment: "Advance paid"

                        });
                        orderTran.save(function (err, saved) {
                            to_advanceCallBack(err, saved);
                        });
                    } else {
                        to_advanceCallBack(false, "Empty");
                    }
                },
                egBookedAmount: function (egBookedAmountCallBack) {
                    if (params.to_bookedAmount) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            loadOwnerId: loadOwnerId,
                            amount: params.egBookedAmount,
                            prefix: "+",
                            comment: "Booked Amount"

                        });
                        orderPayment.save(function (err, saved) {
                            egBookedAmountCallBack(err, saved);

                        });
                    } else {
                        egBookedAmountCallBack(false, "Empty");
                    }
                },
                lo_loadingCharge: function (lo_loadingChargeCallBack) {
                    if (params.lo_loadingCharge) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            loadOwnerId: loadOwnerId,
                            amount: params.lo_loadingCharge,
                            prefix: "-",
                            comment: "Loading Charges"

                        });
                        orderPayment.save(function (err, saved) {
                            lo_loadingChargeCallBack(err, saved);

                        });
                    } else {
                        lo_loadingChargeCallBack(false, "Empty");
                    }
                },
                lo_unloadingCharge: function (lo_unloadingChargeCallBack) {
                    if (params.lo_unloadingCharge) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            loadOwnerId: loadOwnerId,
                            amount: params.lo_unloadingCharge,
                            prefix: "-",
                            comment: "Unloading Charges"

                        });
                        orderPayment.save(function (err, saved) {
                            lo_unloadingChargeCallBack(err, saved);
                        });
                    } else {
                        lo_unloadingChargeCallBack(false, "Empty");
                    }
                },
                lo_commission: function (lo_bookedAmountCallBack) {
                    if (params.lo_commission) {
                        var orderPayment = new OrderPaymentsColl({
                            orderId: saveDoc._id,
                            loadOwnerId: loadOwnerId,
                            amount: params.lo_commission,
                            prefix: "-",
                            comment: "Commission"

                        });
                        orderPayment.save(function (err, saved) {
                            lo_bookedAmountCallBack(err, saved);
                        });
                    } else {
                        lo_bookedAmountCallBack(false, "Empty");
                    }
                },

                lo_advance: function (lo_advanceCallBack) {
                    if (params.lo_advance) {
                        var orderTran = new OrderTransactionsColl({
                            orderId: saveDoc._id,
                            loadOwnerId: loadOwnerId,
                            amount: params.lo_advance,
                            prefix: "+",
                            comment: "Advance paid"

                        });
                        orderTran.save(function (err, saved) {
                            lo_advanceCallBack(err, saved);
                        });
                    } else {
                        lo_advanceCallBack(false, "Empty");
                    }
                }

            }, function (err, result) {

                if (err) {
                    retObj.messages.push("Oder created,Failed to save payment details");
                    analyticsService.create(req, serviceActions.create_order_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);

                } else {
                    retObj.status = true;
                    retObj.messages.push("Order created successfully");
                    retObj.data = saveDoc;
                    analyticsService.create(req, serviceActions.create_order, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });

        }
    })
}

/*Payments calculator*/
var calculator = {
    '+': function (total, current) {
        return total + current
    },
    '-': function (total, current) {
        return total - current
    }

};
OrderProcess.prototype.getTruckOwnerOrderDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Order request");
    }

    if (retObj.messages.length > 0) {
    } else {
        AdminTripsColl.findOne({_id: params._id}).populate({
            path: 'truckOwnerId',
            select: "firstName contactPhone email userId companyName contactAddress city state"
        }).exec(function (err, orderDetails) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_trip_order_details_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (orderDetails) {

                async.parallel({
                    paymentsDetails: function (paymentsCallback) {
                        OrderPaymentsColl.find({orderId: params._id, truckOwnerId: orderDetails.truckOwnerId},
                            function (err, docs) {
                                if (err) {
                                    paymentsCallback(err, docs);

                                } else {
                                    var total = 0;
                                    if (docs.length > 0) {
                                        for (var i = 0; i < docs.length; i++) {
                                            total = calculator[docs[i].prefix](total, docs[i].amount);

                                            if (i === docs.length - 1) {
                                                paymentsCallback(err, {payments: docs, total: total});
                                            }
                                        }
                                    } else {
                                        paymentsCallback(err, {payments: [], total: 0});
                                    }


                                }
                            })
                    },
                    transactionsDetails: function (transactionsCallback) {
                        OrderTransactionsColl.find({orderId: params._id, truckOwnerId: orderDetails.truckOwnerId}).populate({path:'paymentBy',select:'firstName'}).exec(function (err, docs) {
                                if (err) {
                                    transactionsCallback(err, docs);

                                } else {
                                    var total = 0;
                                    if (docs.length > 0) {
                                        for (var i = 0; i < docs.length; i++) {
                                            total = calculator[docs[i].prefix](total, docs[i].amount);

                                            if (i === docs.length - 1) {
                                                transactionsCallback(err, {transactions: docs, total: total});
                                            }
                                        }
                                    } else {
                                        transactionsCallback(err, {transactions: [], total: 0});

                                    }


                                }
                            })
                    },
                    comments: function (commentsCallback) {
                        OrderCommentsColl.find({
                            orderId: params._id,
                            truckOwnerId: orderDetails.truckOwnerId
                        }).populate({path: "createdBy", select: "firstName"}).exec(
                            function (err, docs) {
                                commentsCallback(err, docs);
                            })
                    },
                    locations: function (locationCallback) {
                        OrderLocationColl.find({orderId: orderDetails._id},
                            function (err, docs) {
                                locationCallback(err, docs);
                            })
                    }
                }, function (err, result) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.get_trip_order_details_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.orderDetails = orderDetails;
                        retObj.paymentsDetails = result.paymentsDetails;
                        retObj.transactionsDetails = result.transactionsDetails;
                        retObj.comments = result.comments;
                        retObj.locations=result.locations;
                        retObj.messages.push("Success");
                        analyticsService.create(req, serviceActions.get_trip_order_details, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                });

            } else {
                retObj.messages.push("Order details not found");
                analyticsService.create(req, serviceActions.get_trip_order_details_err, {
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

OrderProcess.prototype.getLoadOwnerOrderDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Order request");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        AdminTripsColl.findOne({_id: params._id}).populate({
            path: 'loadOwnerId',
            select: "firstName contactPhone email userId companyName contactAddress city state"
        }).populate({
            path: 'loadCustomerLeadId',
            select: "firstName contactPhone email userId companyName contactAddress city state"
        }).lean().exec(function (err, orderDetails) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_trip_order_details_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (orderDetails) {
                var condition = {};
                if (orderDetails.loadOwnerType == "Registered") {
                    condition = {orderId: params._id, loadOwnerId: orderDetails.loadOwnerId._id}
                    orderDetails.loadOwnerDetails=orderDetails.loadOwnerId;
                    orderDetails.loadOwnerId=orderDetails.loadOwnerId._id;
                } else {
                    condition = {orderId: params._id, loadOwnerId: orderDetails.loadCustomerLeadId._id};
                    orderDetails.loadOwnerDetails=orderDetails.loadCustomerLeadId;
                    orderDetails.loadCustomerLeadId=orderDetails.loadCustomerLeadId._id;
                }
                async.parallel({
                    paymentsDetails: function (paymentsCallback) {
                        OrderPaymentsColl.find(condition,
                            function (err, docs) {
                                if (err) {
                                    paymentsCallback(err, docs);

                                } else {
                                    var total = 0;
                                    if (docs.length > 0) {
                                        for (var i = 0; i < docs.length; i++) {
                                            total = calculator[docs[i].prefix](total, docs[i].amount);

                                            if (i === docs.length - 1) {
                                                paymentsCallback(err, {payments: docs, total: total});
                                            }
                                        }
                                    } else {
                                        paymentsCallback(err, {payments: [], total: 0});
                                    }


                                }
                            })
                    },
                    transactionsDetails: function (transactionsCallback) {
                        OrderTransactionsColl.find(condition,
                            function (err, docs) {
                                if (err) {
                                    transactionsCallback(err, docs);

                                } else {
                                    var total = 0;
                                    if (docs.length > 0) {
                                        for (var i = 0; i < docs.length; i++) {
                                            total = calculator[docs[i].prefix](total, docs[i].amount);

                                            if (i === docs.length - 1) {
                                                transactionsCallback(err, {transactions: docs, total: total});
                                            }
                                        }
                                    } else {
                                        transactionsCallback(err, {transactions: [], total: 0});

                                    }


                                }
                            })
                    },
                    comments: function (commentsCallback) {
                        OrderCommentsColl.find(condition).populate({path: "createdBy", select: "firstName"}).exec(
                            function (err, docs) {
                                commentsCallback(err, docs);
                            })
                    },
                    locations: function (locationCallback) {
                        OrderLocationColl.find({orderId: orderDetails._id},
                            function (err, docs) {
                                locationCallback(err, docs);
                            })
                    }

                }, function (err, result) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        analyticsService.create(req, serviceActions.get_trip_order_details_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.orderDetails = orderDetails;
                        retObj.paymentsDetails = result.paymentsDetails;
                        retObj.transactionsDetails = result.transactionsDetails;
                        retObj.comments = result.comments;
                        retObj.locations=result.locations;
                        retObj.messages.push("Success");
                        analyticsService.create(req, serviceActions.get_trip_order_details, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                });

            } else {
                retObj.messages.push("Order details not found");
                analyticsService.create(req, serviceActions.get_trip_order_details_err, {
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

OrderProcess.prototype.addOrderComment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    if (!params.orderId || !ObjectId.isValid(params.orderId)) {
        retObj.messages.push("Invalid order");
    }
    if (!params.comment) {
        retObj.messages.push("Please enter comment");
    }
    if (!params.ownerType) {
        retObj.messages.push("Invalid owner type");
    }
    if (params.ownerType === "Load Owner" && !params.loadOwnerId) {
        retObj.messages.push("Invalid load owner Id");
    }
    if (params.ownerType === "Truck Owner" && !params.truckOwnerId) {
        retObj.messages.push("Invalid truck owner Id");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var orderComment = new OrderCommentsColl(params);
        orderComment.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_order_comment_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                OrderCommentsColl.find({
                    orderId: params.orderId,
                    truckOwnerId: params.truckOwnerId
                }).populate({path: "createdBy", select: "firstName"}).exec(
                    function (err, docs) {
                        if (err) {
                            retObj.messages.push("Please try again");
                            analyticsService.create(req, serviceActions.add_order_comment_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else if (docs.length > 0) {
                            retObj.status = true;
                            retObj.messages.push("Comment added successfully");
                            retObj.data = docs;
                            analyticsService.create(req, serviceActions.add_order_comment, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push("Comment added successfully");
                            retObj.data = [];
                            analyticsService.create(req, serviceActions.add_order_comment, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    });

            }
        })
    }
};

OrderProcess.prototype.addOrderPayment = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    if (!params.orderId || !ObjectId.isValid(params.orderId)) {
        retObj.messages.push("Invalid order");
    }
    if (!params.comment) {
        retObj.messages.push("Please enter comment");
    }
    if (!params.ownerType) {
        retObj.messages.push("Invalid owner type");
    }
    if (!params.prefix) {
        retObj.messages.push("Invalid Prefix");
    }
    if (!params.amount) {
        retObj.messages.push("Enter amount");
    }
    if (params.ownerType === "Load Owner" && !params.loadOwnerId) {
        retObj.messages.push("Invalid load owner");
    }
    if (params.ownerType === "Truck Owner" && !params.truckOwnerId) {
        retObj.messages.push("Invalid owner type");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var orderPayment = new OrderPaymentsColl(params);
        orderPayment.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_order_payment_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                var condition = {};
                if (params.ownerType === "Truck Owner") {
                    condition = {orderId: params.orderId, truckOwnerId: params.truckOwnerId};
                } else {
                    condition = {orderId: params.orderId, loadOwnerId: params.loadOwnerId};

                }
                OrderPaymentsColl.find(condition,
                    function (err, docs) {
                        if (err) {
                            retObj.messages.push("Please try again");
                            analyticsService.create(req, serviceActions.add_order_payment_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);

                        } else {
                            var total = 0;
                            if (docs.length > 0) {
                                for (var i = 0; i < docs.length; i++) {
                                    retObj.status = true;
                                    total = calculator[docs[i].prefix](total, docs[i].amount);
                                    if (i === docs.length - 1) {
                                        retObj.messages.push("Payment added successfully");
                                        retObj.data = {payments: docs, total: total};
                                        analyticsService.create(req, serviceActions.add_order_payment, {
                                            body: JSON.stringify(req.body),
                                            accountId: req.jwt.id,
                                            success: true
                                        }, function (response) {
                                        });
                                        callback(retObj);
                                    }
                                }
                            } else {
                                retObj.status = true;
                                retObj.messages.push("Payment added successfully");
                                retObj.data = {payments: [], total: 0};
                                analyticsService.create(req, serviceActions.add_order_payment, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: true
                                }, function (response) {
                                });
                                callback(retObj);
                            }


                        }
                    });

            }
        })
    }
};

OrderProcess.prototype.addOrderTransaction = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    if (!params.orderId || !ObjectId.isValid(params.orderId)) {
        retObj.messages.push("Invalid order");
    }
    if (!params.comment) {
        retObj.messages.push("Please select comment");
    }
    if (!params.ownerType) {
        retObj.messages.push("Invalid owner type");
    }
    if (!params.prefix) {
        retObj.messages.push("Invalid Prefix");
    }
    if (!params.paymentType) {
        retObj.messages.push("Select Payment type")
    }
    if (!params.transactionDate) {
        retObj.messages.push("Please enter Transaction Date")
    }
    if (params.paymentType === "Cheque" && !params.chequeNo) {
        retObj.messages.push("Enter cheque no")
    }
    if (params.paymentType === "Cash" && !params.paymentBy) {
        retObj.messages.push("Select payment by person")
    }
    if (params.paymentType === "Account Transfer" && !params.bank) {
        retObj.messages.push("Select bank")
    }
    if (!params.amount) {
        retObj.messages.push("Enter amount");
    }
    if (params.ownerType === "Load Owner" && !params.loadOwnerId) {
        retObj.messages.push("Invalid load owner");
    }
    if (params.ownerType === "Truck Owner" && !params.truckOwnerId) {
        retObj.messages.push("Invalid owner type");
    }
    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var orderTransaction = new OrderTransactionsColl(params);
        orderTransaction.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_order_transaction_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                var condition = {};
                if (params.ownerType === "Truck Owner") {
                    condition = {orderId: params.orderId, truckOwnerId: params.truckOwnerId};
                } else {
                    condition = {orderId: params.orderId, loadOwnerId: params.loadOwnerId};
                }
                OrderTransactionsColl.find(condition,
                    function (err, docs) {
                        if (err) {
                            retObj.messages.push("Please try again");
                            analyticsService.create(req, serviceActions.add_order_payment_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);

                        } else {
                            var total = 0;
                            if (docs.length > 0) {
                                for (var i = 0; i < docs.length; i++) {
                                    total = calculator[docs[i].prefix](total, docs[i].amount);

                                    if (i === docs.length - 1) {
                                        retObj.status = true;
                                        retObj.messages.push("Transaction added successfully");
                                        retObj.data = {transactions: docs, total: total};
                                        analyticsService.create(req, serviceActions.add_order_transaction, {
                                            body: JSON.stringify(req.body),
                                            accountId: req.jwt.id,
                                            success: true
                                        }, function (response) {
                                        });
                                        callback(retObj);
                                    }
                                }
                            } else {
                                retObj.status = true;
                                retObj.messages.push("Transaction added successfully");
                                retObj.data = {transactions: [], total: 0};
                                analyticsService.create(req, serviceActions.add_order_transaction, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: true
                                }, function (response) {
                                });
                                callback(retObj);
                            }


                        }
                    });
            }
        })
    }
};

OrderProcess.prototype.addOrderLocation = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;

    if (!params.orderId || !ObjectId.isValid(params.orderId)) {
        retObj.messages.push("Invalid order");
    }
    if (!params.location) {
        retObj.messages.push("Please enter location");
    }
    if (!params.date) {
        retObj.messages.push("select date");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var orderLocation = new OrderLocationColl(params);
        orderLocation.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_order_location_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Location details added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_order_location, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

OrderProcess.prototype.updateOrderPOD = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body.content;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid order");
    }
    if (!params.dateOfPOD) {
        retObj.messages.push("Please select POD date");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        if (req.files.files) {
            async.parallel({
                frontImage: function (frontImageCallback) {
                    if(req.files.files[0]){
                        var file = req.files.files[0];
                        var fileName = new Date() - 0 + "_" + file.originalFilename;
                        fse.copy(file.path, './client/assets/PodFiles/' + fileName, function (err) {
                            if (err) {
                                frontImageCallback(err, "");
                            } else {
                                fse.remove(file.path, function (err) {
                                    if (err) {
                                        frontImageCallback(err, "");
                                    } else {
                                        frontImageCallback(err, fileName);
                                    }
                                });

                            }
                        })
                    }else{
                        frontImageCallback("", "");

                    }

                },
                backImage: function (backImagesCallback) {
                    if(req.files.files[1]){
                        var file = req.files.files[1];
                        var fileName = new Date() - 0 + "_" + file.originalFilename;
                        fse.copy(file.path, './client/assets/PodFiles/' + fileName, function (err) {
                            if (err) {
                                frontImageCallback(err, "");
                            } else {
                                fse.remove(file.path, function (err) {
                                    if (err) {
                                        backImagesCallback(err, "");
                                    } else {
                                        backImagesCallback(err, fileName);
                                    }
                                });

                            }
                        })
                    }else{
                        backImagesCallback("", "");
                    }

                }
            }, function (err, result) {
                if (err) {
                    retObj.messages("Uploading files failed");
                    callback(retObj);
                } else {
                    var update = {
                        dateOfPOD: params.dateOfPOD
                    };
                    if (result.frontImage) {
                        update.podFront = result.frontImage;
                    }
                    if (result.backImage) {
                        update.podBack = result.backImage;
                    }
                    AdminTripsColl.findOneAndUpdate({_id: params._id}, update
                        , function (err, savedDoc) {
                            if (err) {
                                retObj.messages.push("Please try again");
                                analyticsService.create(req, serviceActions.update_order_pod_err, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: false,
                                    messages: retObj.messages
                                }, function (response) {
                                });
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.data = savedDoc;
                                retObj.messages.push("Updated order POD successfully");
                                analyticsService.create(req, serviceActions.update_order_pod, {
                                    body: JSON.stringify(req.body),
                                    accountId: req.jwt.id,
                                    success: true
                                }, function (response) {
                                });
                                callback(retObj);
                            }
                        })

                }
            })
        } else {
            var params = {
                dateOfPOD: params.deteOfPOD,
            };
            AdminTripsColl.findOneAndUpdate({_id: params._id}, params
                , function (err, savedDoc) {
                    if (err) {
                        retObj.messages("Please try again");
                        analyticsService.create(req, serviceActions.update_order_pod_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.data = savedDoc;
                        retObj.messages("Updated order POD successfully");
                        analyticsService.create(req, serviceActions.update_order_pod, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    }
                })
        }
    }


};

OrderProcess.prototype.getEasygaadiEmployeesList = function (req, callback) {
    var retObj = {
        status: false,
        messages: []

    };
    AccountsColl.find({role: 'employee'}, function (err, docs) {
        if (err) {
            retObj.messages.push("Please try again");
            analyticsService.create(req, serviceActions.get_easygaadi_employee_list_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (docs.length > 0) {
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = docs;
            analyticsService.create(req, serviceActions.get_easygaadi_employee_list, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.messages.push("No Easygaadi employees found");
            analyticsService.create(req, serviceActions.get_easygaadi_employee_list_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    })

};

OrderProcess.prototype.updateOrderProcess=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };

    var params=req.body;

    if(!params._id || !ObjectId.isValid(params._id)){
        retObj.messages.push("Invalid order request");
    }
    if(retObj.messages.length>0){
        callback(retObj);
    }else{
        AdminTripsColl.findOneAndUpdate({_id:params._id},params,function (err,doc){
            if(err){
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.update_view_order_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else {
                retObj.status=true;
                retObj.messages.push("Orders details updated successfully");
                analyticsService.create(req, serviceActions.update_view_order, {
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

OrderProcess.prototype.deleteOrderLocation=function (req,callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid Location");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        OrderLocationColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_order_location_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Location deleted successfully");
                analyticsService.create(req, serviceActions.delete_order_location, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Location not deleted");
                analyticsService.create(req, serviceActions.delete_order_location_err, {
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

OrderProcess.prototype.getTruckOwnersAndCommisionAgents = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = params.size ? parseInt(params.size) : 0;
    var sort = {createdAt: -1};
    var condition = {};
    if (params.name){
        condition = {$and:[{$or:[{firstName:{$regex: params.name, $options: 'i'}},{userName:{$regex: params.name, $options: 'i'}}]},{role: {$in: ["Truck Owner","Commission Agent"]}}]}

        //
    } else {
        condition = {role: {$in: ["Truck Owner","Commission Agent"]}}
    }
    AccountsColl.find(condition, {firstName: 1, contactPhone: 1, contactName: 1, userName: 1})

        .skip(skipNumber)
        .limit(10).exec(function (err, truckOwnersList) {
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (truckOwnersList.length) {
            retObj.status = true;
            retObj.messages.push("Success");
            retObj.data = truckOwnersList;
            callback(retObj);
        } else {
            retObj.messages.push("No truck owners found");
            callback(retObj);
        }
    })

};

module.exports = new OrderProcess();



