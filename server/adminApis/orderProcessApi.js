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

var customerLeadsApi = require("./customerLeadsApi");
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
    if (!params.customer) {
        retObj.messages.push("Please enter customer name");
    }
    if (!params.customerType) {
        retObj.messages.push("Please enter customer type");
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
        TruckRequestColl.findOne({_id: params._id}).populate("accountId").populate("customerLeadId").lean().exec(function (err, doc) {
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

    OperatingRoutesColl.find({
        sourceAddress: params.source,
        destinationAddress: {
            $geoNear:
                {
                    near: {
                        type: "Point",
                        coordinates: params.destination
                    },
                    distanceField: "distance",
                    maxDistance: 100,
                    spherical: true
                }
        }
    },{accountId:1} ,function (err, docs) {
        console.log(docs.length);
        if(err){
            retObj.messages.push("Please try again");
            callback(retObj);
        }else{
            var accountIds=docs.map(function (doc) { return doc.accountId; });
            TrucksColl.aggregate({$match: {accountId:{$in:accountIds}}},
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
                }, {"$sort": {createdAt: -1}},function (err,trucks) {
                if(err){
                    retObj.messages.push("Please try again");
                    callback(retObj);
                }else if(trucks.length>0){
                    retObj.status=true;
                    retObj.data=trucks;
                    retObj.messages.push("success");
                    callback(retObj);
                }else{
                    retObj.messages.push("No trucks found");
                    callback(retObj);
                }
            })
        }
    })

};

module.exports = new OrderProcess();