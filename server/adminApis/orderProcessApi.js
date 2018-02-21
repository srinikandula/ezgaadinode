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


var customerLeadsApi = require("./customerLeadsApi");
var Utils = require("./../apis/utils");

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
            TruckRequestColl.aggregate([
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'customer',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $lookup: {
                        from: 'customerLeads',
                        localField: 'customerLeadId',
                        foreignField: '_id',
                        as: 'customerLeadId'
                    }
                },
                {
                    $project: {
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
                        customer: {
                            $cond: {"if": '$customer', "then": "$customer", "else": "$customerLeadId"}
                        }
                    }

                }, {"$sort": {createdAt: -1}}], function (err, docs) {
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
OrderProcess.prototype.totalTruckRequests = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TruckRequestColl.count(function (err, doc) {
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
    if (params.customerType === "UnRegistered" && !params.name) {
        retObj.messages.push("Please select name1");
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
            params.leadType = "Truck Owner";

            customerLeadsApi.addCustomerLead(req, function (custLeadResp) {
                if (!custLeadResp.status) {
                    callback(custLeadResp);
                } else {
                    params.customerLeadId = custLeadResp.data._id;
                    saveTruckRequest(req, callback);
                }

            })
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
            console.log("err", err);
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
                    retObj.messages = "Customer lead updated successfully";
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
            console.log(doc.result);
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
    console.log('sicug', params.source);
    OperatingRoutesColl.find({
        sourceAddress: {$regex: '.*' + params.source + '.*'},
        destinationLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coordinates
                },
                $maxDistance: 150000,
                spherical: true

            }
        }

    }).lean().exec(function (err, docs) {
        console.log(err, docs.length);
        if (err) {
            retObj.messages.push("Please try again");
            callback(retObj);
        } else if (docs.length > 0) {

            var accountIds = docs.map(function (doc) {
                return doc.accountId;
            });
            TrucksColl.aggregate({$match: {accountId: {$in: accountIds}}},
                {
                    "$lookup": {
                        "from": "accounts",
                        "localField": "accountId",
                        "foreignField": "_id",
                        "as": "accountId"
                    }
                }, {"$unwind": "$accountId"}, {
                    $group: {
                        _id: "$accountId",
                        count: {$sum: 1}
                    }
                }, {"$sort": {createdAt: -1}}, function (err, trucks) {
                    if (err) {
                        retObj.messages.push("Please try again");
                        callback(retObj);
                    } else if (trucks.length > 0) {
                        docs.forEach(function (doc) {
                            doc.acc = trucks.filter(function (item) {
                                if (doc.accountId && item._id._id) {
                                    return doc.accountId.toString() === item._id._id.toString();
                                } else {
                                    return false
                                }


                            })[0];
                        });
                        retObj.status = true;
                        retObj.data = docs;
                        retObj.messages.push("success");
                        callback(retObj);
                    } else {
                        retObj.messages.push("No trucks found");
                        callback(retObj);
                    }
                })
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
        TruckRequestQuoteColl.find({truckRequestId: params.truckRequestId}).populate({path: "accountId"}).exec(function (err, docs) {
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
    if (!params._id) {
        query = {_id: mongoose.Types.ObjectId()};
        params.createdBy = req.jwt.id;
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
        TripCollection.update(query, params, {upsert: true}, function (err, doc) {
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
            }
        })
    }

};

OrderProcess.prototype.getLoadBookingDetails = function (req, callback) {
    var retObj = {
        status: false,
        message: []
    };
    var params = req.query;
    if (!params.truckRequestId || !ObjectId.isValid(params.truckRequestId)) {
        retObj.message.push("Invalid truck request");
    }
    if (retObj.message.length > 0) {
        callback(retObj);
    } else {
        TripCollection.findOne({truckRequestId: params.truckRequestId}, function (err, doc) {
            if (err) {
                retObj.message.push("Please try again");
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
                retObj.message = "success";
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_load_booking_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.message.push("Load booking not available");
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
                if(params.notifiedStatus==='YES'){
                    var customer={};
                    TruckRequestColl.findOne({_id:params.truckRequestId}).populate('customer').populate('customerLeadId').exec(function (err,truckReq) {
                        if(err){
                            retObj.messages.push("Please try again");
                            callback(retObj);
                        }else if(truckReq){
                            if(truckReq.customerType==='Registered'){
                                customer=truckReq.customer;
                            }else{
                                customer=truckReq.customerLeadId
                            }
                            console.log("customer",customer);
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
                        }else{
                            retObj.messages.push("Please try again");
                            callback(retObj);
                        }

                    });
                }else{
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

        TruckRequestCommentsColl.find({truckRequestId:params.truckRequestId},function (err,docs) {
            if(err){
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_request_comments_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }else if(docs.length>0){
                retObj.status=true;
                retObj.messages.push("Success");
                retObj.data=docs;
                analyticsService.create(req, serviceActions.get_truck_request_comments, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }else{
                retObj.data=docs;
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

OrderProcess.prototype.updateTruckRequestDetails=function (req,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  var params=req.body;
  if(!params._id || !ObjectId.isValid(params._id)){
      retObj.messages.push("Invalid truck request");
  }
  if(retObj.messages.length>0){
      callback(retObj);
  }else{
      var body=Utils.removeEmptyFields(params);
      TruckRequestColl.update({_id:params._id},body,function (err,doc) {
          if(err){
              retObj.messages.push("Please try again");
              callback(retObj);
          }else if(doc){
              retObj.status=true;
              retObj.messages.push("truck request details saved successfully");
              analyticsService.create(req, serviceActions.update_truck_request, {
                  body: JSON.stringify(req.body),
                  accountId: req.jwt.id,
                  success: true
              }, function (response) {
              });
              callback(retObj);
          }else{
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
module.exports = new OrderProcess();