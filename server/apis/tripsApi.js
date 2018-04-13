var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
var json2xls = require('json2xls');


const ObjectId = mongoose.Types.ObjectId;

var TripCollection = require('./../models/schemas').TripCollection;
var ExpenseCostColl = require('./../models/schemas').ExpenseCostColl;
var PartyCollection = require('./../models/schemas').PartyCollection;
var NotificationColl = require('./../models/schemas').NotificationColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var DriversColl = require('./../models/schemas').DriversColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var LoadRequestColl = require('./../models/schemas').LoadRequestColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');


var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');
var SmsService = require('./smsApi');

var Trips = function () {
};
function value(x){
    if(x){
        return x;
    }else{
        return '--';
    }
}
function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}
function addTripDetailsToNotification(data, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var notification = new NotificationColl(data);
    notification.save(function (err, notiData) {
        if (err) {
            retObj.status = false;
            retObj.messages.push("Please try again");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push("Trip Added Successfully");
            callback(retObj);
        }
    });
}

function shareTripDetails(tripDetails, trip, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PartyCollection.findOne({_id: tripDetails.partyId}, function (err, partyData) {
        if (err) {
            retObj.messages.push("Error while share details, try Again");
            callback(retObj);
        } else if (partyData) {
            TrucksColl.findOne({_id: tripDetails.registrationNo}, function (err, truckData) {
                if (err) {
                    retObj.messages.push("Error while share details, try Again");
                    callback(retObj);
                } else if (truckData) {
                    DriversColl.findOne({_id: tripDetails.driverId}, function (err, driverData) {
                        if (err) {
                            retObj.messages.push("Error while share details, try Again");
                            callback(retObj);
                        } else if (driverData) {
                            var notificationParams = {
                                accountId: tripDetails.accountId,
                                notificationType: 0,
                                content: "Party Name: " + partyData.name + "," +
                                "Date : " + new Date(tripDetails.date).toLocaleDateString() + "," +
                                "Vehicle No:" + truckData.registrationNo + "," +
                                "Driver Name:" + driverData.fullName + "," +
                                "Driver Number:" + driverData.mobile + "," +
                                "Source:" + tripDetails.source + "," +
                                "Destination:" + tripDetails.destination + "," +
                                "Tonnage :" + tripDetails.tonnage + "," +
                                "Rate:" + tripDetails.rate + "," +
                                "Amount:" + tripDetails.freightAmount,
                                status: true,
                                tripId: trip._id,
                                message: "success"
                            };
                            if (partyData.isSms) {
                                var smsParams = {
                                    contact: partyData.contact,
                                    message: "Hi " + partyData.name + ",\n" +
                                    "Date : " + new Date(tripDetails.date).toDateString() + ",\n" +
                                    "Vehicle No:" + truckData.registrationNo.toUpperCase() + ",\n" +
                                    "Driver Name:" + driverData.fullName.toUpperCase() + ",\n" +
                                    "Driver Number:" + driverData.mobile + ",\n" +
                                    "Source:" + tripDetails.source + ",\n" +
                                    "Destination:" + tripDetails.destination + ",\n" +
                                    "Tonnage :" + tripDetails.tonnage + ",\n" +
                                    "Rate:" + tripDetails.rate + ",\n" +
                                    "Amount:" + tripDetails.freightAmount
                                };
                                SmsService.sendSMS(smsParams, function (smsResponse) {
                                    if (smsResponse.status) {
                                        if (partyData.isEmail) {
                                            notificationType = 2;
                                            var emailparams = {
                                                templateName: 'addTripDetails',
                                                subject: "Easygaadi Trip Details",
                                                to: partyData.email,
                                                data: {
                                                    "date": new Date(tripDetails.date).toDateString(),
                                                    "name": partyData.name.toUpperCase(),
                                                    "vehicleNo": truckData.registrationNo.toUpperCase(),
                                                    "driverName": driverData.fullName.toUpperCase(),
                                                    "driverNumber": driverData.mobile,
                                                    "source": tripDetails.source,
                                                    "destination": tripDetails.destination,
                                                    "Tonnage": tripDetails.tonnage,
                                                    "Rate": tripDetails.rate,
                                                    "Amount": tripDetails.freightAmount
                                                }//dataToEmail.tripsReport
                                            };
                                            emailService.sendEmail(emailparams, function (emailResponse) {

                                                if (emailResponse.status) {
                                                    notificationParams.notificationType = 2;
                                                    notificationParams.status = true;
                                                    notificationParams.message = "success";
                                                    addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                                        notificationResponse.trips = trip;
                                                        callback(notificationResponse);
                                                    })
                                                } else {
                                                    notificationParams.notificationType = 2;
                                                    notificationParams.status = false;
                                                    notificationParams.message = "SMS sent,but email failed";
                                                    addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                                        notificationResponse.trips = trip;
                                                        callback(notificationResponse);
                                                    })
                                                }

                                            })
                                        } else {
                                            notificationParams.notificationType = 0;
                                            notificationParams.status = true;
                                            notificationParams.message = "success";
                                            addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                                notificationResponse.trips = trip;
                                                callback(notificationResponse);
                                            })
                                        }
                                    } else {
                                        notificationParams.notificationType = 0;
                                        notificationParams.status = false;
                                        notificationParams.message = "SMS failed";
                                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                            notificationResponse.trips = trip;
                                            callback(notificationResponse);
                                        })
                                    }
                                })
                            } else if (partyData.isEmail) {
                                var emailparams = {
                                    templateName: 'addTripDetails',
                                    subject: "Easygaadi Trip Details",
                                    to: partyData.email,
                                    data: {
                                        "date": new Date(tripDetails.date).toLocaleDateString(),
                                        "name": partyData.name,
                                        "vehicleNo": truckData.registrationNo,
                                        "driverName": driverData.fullName,
                                        "driverNumber": driverData.mobile,
                                        "source": tripDetails.source,
                                        "destination": tripDetails.destination,
                                        "Tonnage": tripDetails.tonnage,
                                        "Rate": tripDetails.rate,
                                        "Amount": tripDetails.freightAmount
                                    }//dataToEmail.tripsReport
                                };
                                emailService.sendEmail(emailparams, function (emailResponse) {
                                    if (emailResponse.status) {
                                        notificationParams.notificationType = 1;
                                        notificationParams.status = true;
                                        notificationParams.message = "success";
                                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                            notificationResponse.trips = trip;
                                            callback(notificationResponse);
                                        })
                                    } else {
                                        notificationParams.notificationType = 1;
                                        notificationParams.status = false;
                                        notificationParams.message = "email failed";
                                        addTripDetailsToNotification(notificationParams, function (notificationResponse) {
                                            notificationResponse.trips = trip;
                                            callback(notificationResponse);
                                        })
                                    }
                                })
                            }

                        } else {
                            retObj.messages.push("Error while share details, try Again");
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.messages.push("Error while share details, try Again");
                    callback(retObj);
                }
            })
        } else {
            retObj.messages.push("Error while share details, try Again");
            callback(retObj);
        }
    })
}

Trips.prototype.addTrip = function (jwt, tripDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    tripDetails = Utils.removeEmptyFields(tripDetails);
    if (!_.isObject(tripDetails) || _.isEmpty(tripDetails)) {
        retObj.messages.push("Please fill all the required trip details");
    }
    if (!tripDetails.date) {
        retObj.messages.push("Please add date");
    }
    if (!tripDetails.partyId) {
        retObj.messages.push("Please select a party");
    }
    if (!tripDetails.driverId) {
        retObj.messages.push("Please select a driver");
    }
    if (!tripDetails.registrationNo) {
        retObj.messages.push("Please select a vechile");
    }

    if (!_.isNumber(tripDetails.freightAmount)) {
        retObj.messages.push("Please add Freight Amount");
    }
    if(!tripDetails.source){
        retObj.messages.push("Enter source");
    }
    if(!tripDetails.destination){
        retObj.messages.push("Enter destination");
    }
    if (retObj.messages.length) {
        analyticsService.create(req,serviceActions.add_trip_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        tripDetails.createdBy = jwt.id;
        tripDetails.groupId = jwt.id;
        tripDetails.accountId = jwt.accountId;
        tripDetails.tripId = "TR" + parseInt(Math.random() * 100000);
        //tripDetails.tripLane = tripDetails.tripLane.name;
        var tripDoc = new TripCollection(tripDetails);
        tripDoc.save(function (err, trip) {
            if (err) {
                retObj.messages.push("Error while adding trip, try Again");
                analyticsService.create(req,serviceActions.add_trip_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                if (tripDetails.share) {
                    retObj.status = true;
                    retObj.messages.push("Trip Added Successfully");
                    retObj.trips = trip;
                    analyticsService.create(req,serviceActions.add_trip,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                    shareTripDetails(tripDetails, trip, function (shareResponse) {
                        // callback(shareResponse);
                    })

                } else {
                    retObj.status = true;
                    retObj.messages.push("Trip Added Successfully");
                    retObj.trips = trip;
                    analyticsService.create(req,serviceActions.add_trip,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                }
            }
        });
    }
};

Trips.prototype.findTrip = function (jwt, tripId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TripCollection.findOne({_id: tripId}, function (err, trip) {
        if (err) {
            retObj.messages.push("Error while finding trip, try Again");
            analyticsService.create(req,serviceActions.find_trip_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else if (trip) {
            async.parallel({
                createdbyname: function (createdbyCallback) {
                    Utils.populateNameInUsersColl([trip], "createdBy", function (response) {
                        createdbyCallback(response.err, response.documents);
                    });
                },
                driversname: function (driversnameCallback) {
                    Utils.populateNameInDriversCollmultiple([trip], 'driver', ['fullName'], function (response) {
                        driversnameCallback(response.err, response.documents);
                    });
                },
                bookedfor: function (bookedforCallback) {
                    Utils.populateNameInPartyColl([trip], 'bookedFor', function (response) {
                        bookedforCallback(response.err, response.documents);
                    });
                },
                truckNo: function (truckscallback) {
                    Utils.populateNameInTrucksColl([trip], 'registrationNo', function (response) {
                        truckscallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
                retObj.status = true;
                retObj.messages.push("Trip found successfully");
                analyticsService.create(req,serviceActions.find_trip,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                retObj.trip = trip;
                callback(retObj);
            });
        } else {
            retObj.messages.push("Trip is not found!");
            analyticsService.create(req,serviceActions.find_trip_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        }
    });
};

Trips.prototype.updateTrip = function (jwt, tripDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var giveAccess = false;
    if (jwt.type === "account" && tripDetails.accountId === jwt.accountId) {
        giveAccess = true;
    } else if (jwt.type === "group" && tripDetails.createdBy === jwt.id) {
        giveAccess = true;

    } else {
        retObj.status = false;
        retObj.message = "Unauthorized access";
        analyticsService.create(req,serviceActions.update_trips_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.message},function(response){ });
        callback(retObj);
    }
    if (giveAccess) {
        tripDetails = Utils.removeEmptyFields(tripDetails);
       /* tripDetails.tripLane = tripDetails.tripLane.name;*/
        TripCollection.findOneAndUpdate({_id: tripDetails._id},
            {$set: tripDetails},
            {new: true}, function (err, trip) {
                if (err) {
                    retObj.messages.push("Error while updating Trip, try Again");
                    analyticsService.create(req,serviceActions.update_trips_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.message},function(response){ });
                    callback(retObj);
                } else if (trip) {
                    if (tripDetails.share) {
                        retObj.status = true;
                        retObj.messages.push("Trip updated successfully");
                        retObj.trip = trip;
                        analyticsService.create(req,serviceActions.update_trips,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                        shareTripDetails(tripDetails, trip, function (shareResponse) {

                            if (shareResponse.status) {
                                retObj.status = true;
                                retObj.messages.push("Trip updated successfully");
                                retObj.trip = trip;
                                analyticsService.create(req,serviceActions.update_trips,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                                // callback(retObj);
                            } else {
                                shareResponse.trip = trip;
                                //callback(shareResponse);
                            }
                        })
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Trip updated successfully");
                        retObj.trip = trip;
                        analyticsService.create(req,serviceActions.update_trips,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                    }
                } else {
                    retObj.messages.push("Error, finding trip");
                    analyticsService.create(req,serviceActions.update_trips_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.message},function(response){ });
                    callback(retObj);
                }
            });
    }
};

/** this is to be used with super user login
 *
 * @param jwt
 * @param req
 * @param pageNumber
 * @param callback
 */
Trips.prototype.getAll = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        if (jwt.type = "account") {
            var skipNumber = (params.page - 1) * params.size;
            var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
            var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
            async.parallel({
                trips: function (tripsCallback) {
                    TripCollection
                        .find({'accountId': jwt.accountId})
                        .sort(sort)
                        .skip(skipNumber)
                        .limit(limit)
                        .lean()
                        .exec(function (err, trips) {
                            async.parallel({
                                createdbyname: function (createdbyCallback) {
                                    Utils.populateNameInUsersColl(trips, "createdBy", function (response) {
                                        createdbyCallback(response.err, response.documents);
                                    });
                                },
                                driversname: function (driversnameCallback) {
                                    Utils.populateNameInDriversCollmultiple(trips, 'driver', ['fullName', 'mobile'], function (response) {
                                        driversnameCallback(response.err, response.documents);
                                    });
                                },
                                bookedfor: function (bookedforCallback) {
                                    Utils.populateNameInPartyColl(trips, 'partyId', function (response) {
                                        bookedforCallback(response.err, response.documents);
                                    });
                                },
                                truckNo: function (truckscallback) {
                                    Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                                        truckscallback(response.err, response.documents);
                                    })
                                }
                            }, function (populateErr, populateResults) {
                                tripsCallback(populateErr, populateResults);
                            });
                        });
                },
                count: function (countCallback) {
                    TripCollection.count(function (err, count) {
                        countCallback(err, count);
                    });

                }
            }, function (err, results) {
                if (err) {
                    retObj.messages.push('Error retrieving trips');
                    analyticsService.create(req,serviceActions.all_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = results.count;
                    retObj.trips = results.trips.createdbyname; //as trips is callby reference
                    analyticsService.create(req,serviceActions.all_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                }
            });
        }

        else {
            // var skipNumber = (pageNumber - 1) * pageLimits.tripsPaginationLimit;
            async.parallel({
                trips: function (tripsCallback) {
                    TripCollection
                        .find({'accountId': jwt.accountId, 'groupId': jwt.id})
                        .sort(sort)
                        .skip(skipNumber)
                        .limit(limit)
                        .lean()
                        .exec(function (err, trips) {
                            async.parallel({
                                createdbyname: function (createdbyCallback) {
                                    Utils.populateNameInUsersColl(trips, "createdBy", function (response) {
                                        createdbyCallback(response.err, response.documents);
                                    });
                                },
                                driversname: function (driversnameCallback) {
                                    Utils.populateNameInDriversCollmultiple(trips, 'driver', ['fullName'], function (response) {
                                        driversnameCallback(response.err, response.documents);
                                    });
                                },
                                bookedfor: function (bookedforCallback) {
                                    Utils.populateNameInPartyColl(trips, 'party', function (response) {
                                        bookedforCallback(response.err, response.documents);
                                    });
                                },
                                truckNo: function (truckscallback) {
                                    Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                                        truckscallback(response.err, response.documents);
                                    })
                                }
                            }, function (populateErr, populateResults) {
                                tripsCallback(populateErr, populateResults);
                            });
                        });
                },
                count: function (countCallback) {
                    TripCollection.count(function (err, count) {
                        countCallback(err, count);
                    });

                }
            }, function (err, results) {
                if (err) {
                    retObj.messages.push('Error retrieving trips');
                    analyticsService.create(req,serviceActions.all_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = results.count;
                    retObj.trips = results.trips.createdbyname; //as trips is callby reference
                    analyticsService.create(req,serviceActions.all_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                    //callback(retObj);
                }
            });
        }
    }
};

Trips.prototype.getAllAccountTrips = function (jwt, params,req, callback) {
    var result = {
        status:false,
        messages:[]
    };

    if (!params.truckNumber) {
        getTrips({'accountId': jwt.accountId}, jwt, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.account_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.account_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        })
    } else {
        TrucksColl.find({registrationNo: new RegExp("^" + params.truckNumber, "i")}, function (err, truckData) {
            if (err) {
                result.status = false;
                result.messages.push('Error retrieving expenses Costs');
                analyticsService.create(req,serviceActions.account_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:result.messages},function(response){ });
                callback(result);
            } else if (truckData) {
                var ids=_.pluck(truckData,"_id");
                getTrips({
                    'accountId': jwt.accountId,
                    'registrationNo': {$in:ids}
                }, jwt, params, function (response) {
                    if(response.status){
                        analyticsService.create(req,serviceActions.account_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.account_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
                    }
                    callback(response);
                })
            } else {
                result.status = true;
                result.messages.push('Success');
                result.count = 0;
                result.trips = [];
                analyticsService.create(req,serviceActions.account_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                callback(result);
            }
        })
    }
};

function getTrips(condition, jwt, params, callback) {
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

    async.parallel({
        trips: function (tripsCallback) {
            TripCollection
                .find(condition)
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, trips) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Utils.populateNameInUsersColl(trips, "createdBy", function (response) {
                                createdbyCallback(response.err, response.documents);
                            });
                        },
                        driversname: function (driversnameCallback) {
                            Utils.populateNameInDriversCollmultiple(trips, 'driverId', ['fullName', 'mobile'], function (response) {
                                driversnameCallback(response.err, response.documents);
                            });
                        },
                        bookedfor: function (bookedforCallback) {
                            Utils.populateNameInPartyColl(trips, 'partyId', function (response) {
                                bookedforCallback(response.err, response.documents);
                            });
                        },
                        truckNo: function (truckscallback) {
                            Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                                truckscallback(response.err, response.documents);
                            })
                        }
                    }, function (populateErr, populateResults) {
                        tripsCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            TripCollection.count(function (err, count) {
                countCallback(err, count);
            });

        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving trips');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.userId = jwt.id;
            retObj.userType = jwt.type;
            retObj.trips = results.trips.createdbyname; //as trips is callby reference
            callback(retObj);
        }
    });
}

Trips.prototype.deleteTrip = function (jwt, tripId,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var giveAccess = false;
    if (jwt.type === "account") {
        condition = {_id: tripId, accountId: jwt.accountId};
        giveAccess = true;
    } else if (jwt.type === "group") {
        condition = {_id: tripId, createdBy: jwt.id};
        giveAccess = true;
    } else {

        retObj.messages.push('Unauthorized access');
        analyticsService.create(req,serviceActions.delete_trip_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }
    if (giveAccess) {
        if (!Utils.isValidObjectId(tripId)) {
            retObj.messages.push('Invalid trip id');
        }

        if (retObj.messages.length) {
            callback(retObj);
        } else {
            TripCollection.find(condition, function (err) {
                if (err) {
                    retObj.messages.push('No Trips Found');
                    callback(retObj);
                } else {
                    TripCollection.remove(condition, function (err, data) {
                        if (err) {
                            retObj.messages.push('Unauthorized access or Error deleting trip');
                            analyticsService.create(req,serviceActions.delete_trip_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else if (data.result.n === 0) {
                            retObj.status = false;
                            retObj.messages.push('Unauthorized access or Error deleting trip');
                            analyticsService.create(req,serviceActions.delete_trip_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            analyticsService.create(req,serviceActions.delete_trip,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                            callback(retObj);
                        }
                    })
                }
            });
        }
    }
};

/**
 * Api for trip report
 * fields for filter
 * @param fromDate
 * @param toDate
 * @param registrationNo (optional)
 * @param driver (optional)
 * **/
Trips.prototype.getReport = function (jwt, filter,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!filter.fromDate) {
        retObj.messages.push("Please select from date");
    }
    if (!filter.toDate) {
        retObj.messages.push("Please select to date");
    }
    if (retObj.messages.length) {
        analyticsService.create(req,serviceActions.get_report_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        var query = {date: {$gte: filter.fromDate, $lte: filter.toDate}};
        if (filter.registrationNo) {
            query.registrationNo = filter.registrationNo;
        }
        if (filter.driver) {
            query.driver = filter.driver;
        }
        TripCollection.find(query, {
            date: 1,
            registrationNo: 1,
            driverId: 1,
            bookedFor: 1,
            freightAmount: 1,
            advance: 1,
            balance: 1,
            from: 1,
            to: 1,
            tripId: 1,
            createdBy: 1
        }, function (err, trips) {
            if (err) {
                retObj.messages.push('Error finding trips');
                analyticsService.create(req,serviceActions.get_report_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                async.parallel({
                    createdbyname: function (createdbyCallback) {
                        Utils.populateNameInUsersColl(trips, "createdBy", function (response) {
                            createdbyCallback(response.err, response.documents);
                        });
                    },
                    driversname: function (driversnameCallback) {
                        Utils.populateNameInDriversCollmultiple(trips, 'driverId', ['fullName', 'mobile'], function (response) {
                            driversnameCallback(response.err, response.documents);
                        });
                    },
                    bookedfor: function (bookedforCallback) {
                        Utils.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                            bookedforCallback(response.err, response.documents);
                        });
                    },
                    truckNo: function (truckscallback) {
                        Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                            truckscallback(response.err, response.documents);
                        })
                    }
                }, function (populateErr, populateResults) {
                    if (populateErr) {
                        retObj.messages.push('Error retrieving trips');
                        analyticsService.create(req,serviceActions.get_report_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    } else {
                        var tripsSimplified = [];
                        for (var i = 0; i < trips.length; i++) {
                            tripsSimplified.push({
                                trip: {
                                    registrationNo: trips[i].attrs.truckName,
                                    date: trips[i].date,
                                    bookedFor: trips[i].attrs.partyName,
                                    from: trips[i].from,
                                    to: trips[i].to,
                                    driverName: trips[i].attrs.fullName,
                                    mobile: trips[i].attrs.mobile,
                                    tripId: trips[i].tripId,
                                    payments: {
                                        freightAmount: trips[i].freightAmount,
                                        advance: trips[i].advance,
                                        balance: trips[i].balance
                                    }
                                }
                            });
                        }
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.tripsReport = tripsSimplified;
                        analyticsService.create(req,serviceActions.get_report,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Trips.prototype.sendEmail = function (jwt, data,req, callback) {

    var retObj = {
        status: false,
        messages: []
    };
    new Trips().getReport(jwt, data, function (dataToEmail) {
        if (!dataToEmail.status) {
            retObj.messages.push('Error retrieving trips');
            analyticsService.create(req,serviceActions.trips_send_email_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            var dataSimplifiedForEmail = [];
            for (var i = 0; i < dataToEmail.tripsReport.length; i++) {
                var trip = {};
                if (dataToEmail.tripsReport[i].trip.registrationNo) trip['Registration No'] = dataToEmail.tripsReport[i].trip.registrationNo;
                if (dataToEmail.tripsReport[i].trip.date) trip['Date'] = dataToEmail.tripsReport[i].trip.date;
                if (dataToEmail.tripsReport[i].trip.bookedFor) trip['Party'] = dataToEmail.tripsReport[i].trip.bookedFor;
                if (dataToEmail.tripsReport[i].trip.from) trip['From'] = dataToEmail.tripsReport[i].trip.from;
                if (dataToEmail.tripsReport[i].trip.to) trip['To'] = dataToEmail.tripsReport[i].trip.to;
                if (dataToEmail.tripsReport[i].trip.driverName) trip['Driver Name'] = dataToEmail.tripsReport[i].trip.driverName;
                if (dataToEmail.tripsReport[i].trip.mobile) trip['Mobile'] = dataToEmail.tripsReport[i].trip.mobile;
                if (dataToEmail.tripsReport[i].trip.tripId) trip['Trip Id'] = dataToEmail.tripsReport[i].trip.tripId;
                var payment = {};
                if (dataToEmail.tripsReport[i].trip.payments.freightAmount) payment['Freight Amount'] = dataToEmail.tripsReport[i].trip.payments.freightAmount;
                if (dataToEmail.tripsReport[i].trip.payments.advance) payment['Advance'] = dataToEmail.tripsReport[i].trip.payments.advance;
                if (dataToEmail.tripsReport[i].trip.payments.balance) payment['Balance'] = dataToEmail.tripsReport[i].trip.payments.balance;
                dataSimplifiedForEmail.push({trip: trip, payment: payment});
            }
            var params = {
                templateName: 'tripReport',
                subject: "Easygaadi Test",
                to: jwt.email,
                data: dataSimplifiedForEmail//dataToEmail.tripsReport
            };
            emailService.sendEmail(params, function (response) {
                if(response.status){
                    analyticsService.create(req,serviceActions.trips_send_email,{body:JSON.stringify(req.body),accountId:jwt.id,success:true},function(response){ });
                }else{
                    analyticsService.create(req,serviceActions.trips_send_email_err,{body:JSON.stringify(req.body),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
                }
                callback(response);
            });
        }
    });
};

/**
 * Find the Total fright from the trips in the account
 */

Trips.prototype.findTotalRevenue = function (erpSettingsCondition,req, callback) {
    //console.log('JWT ',erpSettingsCondition);
    async.parallel({
        tripFreightTotal: function (callback) {
            //it is not working now
            TripCollection.aggregate([{$match: erpSettingsCondition},
                    {$group: {_id: null, totalFreight: {$sum: "$freightAmount"}}}],
                function (err, totalFreight) {
                    callback(err, totalFreight);
                });
        },
        expensesTotal: function (callback) {
            ExpenseCostColl.aggregate({$match: erpSettingsCondition},
                {$group: {_id: null, totalCash: {$sum: "$cost"}, totalCredit: {$sum: "$totalAmount"}}},
                function (err, totalExpenses) {
                    callback(err, totalExpenses);
                });
        }
    }, function (populateErr, populateResults) {
        var retObj = {
            status: false,
            messages: []
        };
        if (populateErr) {
            retObj.status = false;
            retObj.messages.push(JSON.stringify(populateErr));
            analyticsService.create(req,serviceActions.find_total_revenue_err,{accountId:req.jwt.accountId,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            var totalFright = 0;
            var totalExpenses = 0;
            if (populateResults) {
                if (populateResults.tripFreightTotal[0]) {
                    totalFright = populateResults.tripFreightTotal[0].totalFreight;
                }
                if (populateResults.expensesTotal[0]) {
                    totalExpenses = populateResults.expensesTotal[0].totalCash + populateResults.expensesTotal[0].totalCredit;
                }
                retObj.totalRevenue = totalFright;
                //retObj.totalRevenue = totalFright - totalExpenses;
            } else {
                retObj.totalRevenue = 0//populateResults.tripFreightTotal[0].totalFreight - populateResults.expensesTotal[0].totalExpenses;
            }
            //retObj.totalRevenue = populateResults.tripFreightTotal.totalFreight - populateResults.expensesTotal.totalExpenses;
            //retObj.totalRevenue = populateResults.tripFreightTotal[0].totalFreight - populateResults.expensesTotal[0].totalExpenses;
            analyticsService.create(req,serviceActions.find_total_revenue,{accountId:req.jwt.accountId,success:true},function(response){ });
            callback(retObj);
        }
    });
    /*TripCollection.aggregate({ $match: {"accountId":ObjectId(jwt.accountId)}},
        { $group: { _id : null , totalFright : { $sum: "$freightAmount" }} },
        function (error, result) {
            var retObj = {
                status: false,
                messages: []
            };
            if(error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
            } else {
                retObj.status = true;
                retObj.totalRevenue= result[0].totalFright;
            }
            callback(retObj)
        });*/
}

/**
 * Find revenue by party
 * @param jwt
 * @param callback
 */
Trips.prototype.findRevenueByParty = function (jwt,req, callback) {
    TripCollection.aggregate({$match: {"accountId": ObjectId(jwt.accountId)}},
        {$group: {_id: "$partyId", totalFreight: {$sum: "$freightAmount"}}},
        function (error, revenue) {
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                analyticsService.create(req,serviceActions.find_total_revenue_by_party_err,{accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                Utils.populateNameInPartyColl(revenue, '_id', function (response) {
                    retObj.status = true;
                    retObj.revenue = response.documents;
                    analyticsService.create(req,serviceActions.find_total_revenue_by_party,{accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                });
            }
        });
}

/**
 * Find revenue by Vehicle
 * @param jwt
 * @param params
 * @param callback
 */

Trips.prototype.findRevenueByVehicle = function (jwt, params,req, callback) {
    var condition = {};
    var retObj = {
        status: false,
        messages: []
    };

    if (params.fromDate != '' && params.toDate != '' && params.regNumber != '') {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }, "registrationNo": params.regNumber
            }
        };
        getRevenueByVehicle(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.find_revenue_by_veh,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        });
    } else if (params.fromDate && params.toDate) {
        condition = {
            $match: {
                "accountId": ObjectId(jwt.accountId), date: {
                    $gte: new Date(params.fromDate),
                    $lte: new Date(params.toDate),
                }
            }
        }
        getRevenueByVehicle(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.find_revenue_by_veh,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        });
    } else if (params.regNumber) {
        condition = {$match: {"accountId": ObjectId(jwt.accountId), "registrationNo": params.regNumber}}
        getRevenueByVehicle(jwt, condition, params, function (response) {
            if(response.status){
                analyticsService.create(req,serviceActions.find_revenue_by_veh,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
            }else{
                analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
            }
            callback(response);
        });
    } else {
        ErpSettingsColl.findOne({accountId: jwt.accountId}, function (err, erpSettings) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (erpSettings) {
                condition = {$match: Utils.getErpSettings(erpSettings.revenue, erpSettings.accountId)}
                getRevenueByVehicle(jwt, condition, params, function (response) {
                    if(response.status){
                        analyticsService.create(req,serviceActions.find_revenue_by_veh,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                    }else{
                        analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:response.messages},function(response){ });
                    }
                    callback(response);
                });
            } else {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.find_revenue_by_veh_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });
    }

}

function getRevenueByVehicle(jwt, condition, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.parallel({
        tripFreightTotal: function (callback) {
            TripCollection.aggregate(condition,
                {$group: {_id: "$registrationNo", totalFreight: {$sum: "$freightAmount"}}},

                function (err, totalFreight) {
                   // console.log('error1', err);
                    callback(err, totalFreight);
                });
        },
        expensesTotal: function (callback) {
            ExpenseCostColl.aggregate(condition,
                {
                    $group: {
                        _id: JSON.parse(JSON.stringify("$vehicleNumber")),
                        totalCash: {$sum: "$cost"},
                        totalCredit: {$sum: "$totalAmount"}
                    }
                },
                function (err, totalExpenses) {
                    callback(err, totalExpenses);
                });
        }
    }, function (populateErr, populateResults) {
        var retObj = {
            status: false,
            messages: []
        };
        if (populateErr) {
            retObj.status = true;
            retObj.messages.push(JSON.stringify(populateErr));
            callback(retObj);
        } else {
            var vehicleIds = _.pluck(populateResults.tripFreightTotal, "_id");
            var vehicles = [];
            var grossFreight = 0;
            var grossExpenses = 0;
            var grossRevenue = 0;
            for (var i = 0; i < vehicleIds.length; i++) {
                var vehicle = {"registrationNo": vehicleIds[i]};
                var vehicleInfo = _.find(populateResults.tripFreightTotal, function (freight) {
                    if (freight._id === vehicle.registrationNo) {
                        return freight;
                    } else {
                        return false;
                    }
                });
                if (vehicleInfo) {
                    vehicle.totalFreight = vehicleInfo.totalFreight;
                } else {
                    vehicle.totalFreight = 0;
                }
                vehicleInfo = _.find(populateResults.expensesTotal, function (expense) {
                    if (JSON.parse(JSON.stringify(expense._id)) === vehicle.registrationNo) {
                        return expense;
                    } else {
                        return false;
                    }
                });

                if (vehicleInfo) {
                    vehicle.totalExpense = vehicleInfo.totalCash + vehicleInfo.totalCredit;
                } else {
                    vehicle.totalExpense = 0;
                }

                vehicle.totalRevenue = parseFloat(vehicle.totalFreight) - parseFloat(vehicle.totalExpense);

                grossFreight = grossFreight + vehicle.totalFreight;
                grossExpenses = grossExpenses + vehicle.totalExpense;
                grossRevenue = grossRevenue + vehicle.totalRevenue;

                vehicles.push(vehicle);
            }

            Utils.populateNameInTrucksColl(vehicles, 'registrationNo', function (result) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.revenue = result.documents;
                retObj.grossAmounts = {
                    grossFreight: grossFreight,
                    grossExpenses: grossExpenses,
                    grossRevenue: grossRevenue
                };
                callback(retObj);
            })
        }
    });
}

Trips.prototype.findTripsByParty = function (jwt, partyId,req, callback) {
    TripCollection.find({"accountId": jwt.accountId, "partyId": partyId},
        function (error, trips) {
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                analyticsService.create(req,serviceActions.find_trips_by_party_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj)
            } else {
                Utils.populateNameInTrucksColl(trips, "registrationNo", function (tripDocuments) {
                    retObj.status = true;
                    retObj.trips = tripDocuments.documents;
                    analyticsService.create(req,serviceActions.find_trips_by_party,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj)
                });
            }
        });
};

Trips.prototype.findTripsByVehicle = function (jwt, vehicleId,req, callback) {
    TripCollection.find({"accountId": ObjectId(jwt.accountId), "registrationNo": vehicleId},
        function (error, trips) {
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                analyticsService.create(req,serviceActions.find_trips_by_veh_err,{body:JSON.stringify(req.params),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj)
            } else {
                Utils.populateNameInTrucksColl(trips, "registrationNo", function (tripDocuments) {
                    retObj.status = true;
                    retObj.trips = tripDocuments.documents;
                    analyticsService.create(req,serviceActions.find_trips_by_veh,{body:JSON.stringify(req.params),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj)
                });
            }
        });
}

Trips.prototype.countTrips = function (jwt,req, callback) {
    var result = {};

    TripCollection.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req,serviceActions.count_trips_err,{accountId:jwt.id,success:false,messages:result.messages},function(response){ });
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            analyticsService.create(req,serviceActions.count_trips,{accountId:jwt.id,success:true},function(response){ });
            callback(result);
        }
    })
};

Trips.prototype.shareRevenueDetailsByVechicleViaEmail = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!params.email || !Utils.isEmail(params.email)) {
        retObj.status = false;
        retObj.messages.push('Please enter valid email');
        analyticsService.create(req,serviceActions.revenue_det_by_veh_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        Trips.prototype.findRevenueByVehicle(jwt, params,req, function (revenueResponse) {
            if (revenueResponse.status) {
                var emailparams = {
                    templateName: 'shareRevenueDetailsByVechicle',
                    subject: "Easygaadi Revenue Details",
                    to: params.email,
                    data: {
                        revenue: revenueResponse.revenue,
                        grossAmounts: revenueResponse.grossAmounts
                    }
                };
                emailService.sendEmail(emailparams, function (emailResponse) {
                    if (emailResponse.status) {
                        retObj.status = true;
                        retObj.messages.push('Revenue details share successfully');
                        analyticsService.create(req,serviceActions.revenue_det_by_veh_email,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                    } else {
                        analyticsService.create(req,serviceActions.revenue_det_by_veh_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:emailResponse.messages},function(response){ });
                        callback(emailResponse);
                    }
                });
            } else {
                analyticsService.create(req,serviceActions.revenue_det_by_veh_email_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:revenueResponse.messages},function(response){ });
                callback(revenueResponse);
            }
        })
    }

}

Trips.prototype.downloadRevenueDetailsByVechicle = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Trips.prototype.findRevenueByVehicle(jwt, params,req, function (revenueResponse) {
        if (revenueResponse.status) {
            var output = [];
            for (var i = 0; i < revenueResponse.revenue.length; i++) {
                output.push({
                    RegistrationNo: revenueResponse.revenue[i].attrs.truckName,
                    Total_Freight: revenueResponse.revenue[i].totalFreight,
                    Total_Expense: revenueResponse.revenue[i].totalExpense,
                    Total_Revenue: revenueResponse.revenue[i].totalRevenue
                });
                if (i === revenueResponse.revenue.length - 1) {
                    retObj.status = true;
                    output.push({
                        RegistrationNo: 'Total',
                        Total_Freight: revenueResponse.grossAmounts.grossFreight,
                        Total_Expense: revenueResponse.grossAmounts.grossExpenses,
                        Total_Revenue: revenueResponse.grossAmounts.grossRevenue
                    });
                    retObj.data = output;
                    analyticsService.create(req,serviceActions.revenue_det_by_veh_dwnld,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                    callback(retObj);
                }
            }

        } else {
            analyticsService.create(req,serviceActions.revenue_det_by_veh_dwnld_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:revenueResponse.messages},function(response){ });
            callback(revenueResponse);
        }
    })


}


Trips.prototype.getPartiesByTrips = function (jwt,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};

    if (!jwt.accountId || !ObjectId.isValid(jwt.accountId)) {
        retObj.status = false;
        retObj.messages.push("Invalid Login");
        analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        if (jwt.type === "account") {
            condition = {accountId: jwt.accountId};
        } else {
            condition = {accountId: jwt.groupAccountId}
        }
       /* TripCollection.distinct('partyId', condition, function (err, partyIds) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Please try again");
                analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (partyIds.length > 0) {*/
                PartyCollection.find(condition, {name: 1, contact: 1}, function (err, partyList) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push("Please try again");
                        analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    } else if (partyList.length > 0) {
                        retObj.status = true;
                        retObj.partyList = partyList;
                        retObj.messages.push("success");
                        analyticsService.create(req,serviceActions.get_parties_by_trips,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.messages.push("No parties found");
                        analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    }
                })

          /*  } else {
                retObj.status = false;
                retObj.messages.push("No parties found");
                analyticsService.create(req,serviceActions.get_parties_by_trips_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        })*/
    }

};

Trips.prototype.loockingForTripRequest = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    console.log()
    if (!params.truckId || !ObjectId.isValid(params.truckId)) {
        retObj.messages.push('Please select truck');
        analyticsService.create(req,serviceActions.looking_for_trip_req_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        params.accountId = jwt.accountId;
        params.createdBy = jwt.id;
        var loadRequest = new LoadRequestColl(params);
        loadRequest.save(function (err, data) {
            if (err) {
                retObj.messages.push('Please try again');
                analyticsService.create(req,serviceActions.looking_for_trip_req_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (data) {
                TrucksColl.findOneAndUpdate({_id: params.truckId},
                    {lookingForLoad: true},
                    function (err, updatedData) {
                        if (err) {
                            retObj.messages.push('Error while load request');
                            analyticsService.create(req,serviceActions.looking_for_trip_req_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        } else if (updatedData) {
                            analyticsService.create(req,serviceActions.looking_for_trip_req,{body:JSON.stringify(req.query),accountId:jwt.id,success:true},function(response){ });
                            shareLoadRequestDetailsToParties(jwt, params, callback)
                        } else {
                            retObj.messages.push('Error while load request');
                            analyticsService.create(req,serviceActions.looking_for_trip_req_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                            callback(retObj);
                        }
                    })
            } else {
                retObj.messages.push('Please try again');
                analyticsService.create(req,serviceActions.looking_for_trip_req_err,{body:JSON.stringify(req.query),accountId:jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        })

    }

};

function shareLoadRequestDetailsToParties(jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    PartyCollection.find({accountId: jwt.accountId, partyType: "Transporter"}, function (err, partList) {
        if (err) {
            retObj.messages.push("Error while sharing load request");
            callback(retObj);
        } else if (partList.length > 0) {
            async.each(partList, function (party, partyCallback) {
                if (party.isSms) {
                    shareLoadRequestDetailsViaSMS(party, params, function (smsResp) {
                        if (smsResp.status) {
                            if (party.isEmail) {
                                shareLoadRequestDetailsViaEmail(party, params, function (emailResp) {
                                    if (emailResp.status) {
                                        partyCallback(false);
                                    } else {
                                        partyCallback(emailResp)
                                    }
                                })
                            } else {
                                partyCallback(smsResp);
                            }
                        } else {
                            retObj.status = false;
                            retObj.messages.push('sms sending failed');
                            partyCallback(retObj);
                        }
                    });
                } else if (party.isEmail) {
                    shareLoadRequestDetailsViaEmail(party, params, function (emailResp) {
                        if (emailResp.status) {
                            partyCallback(false);
                        } else {
                            partyCallback(emailResp)
                        }
                    })
                }
            }, function (err) {
                if (err) {
                    return callback(retObj);
                } else {
                    console.log('finish request');
                    retObj.status = true;
                    retObj.messages.push('looking for request sent successfully');
                    callback(retObj);
                }
            })
        } else {
            retObj.messages.push("No Parties found to share load request");
            callback(retObj);
        }
    })
}

function shareLoadRequestDetailsViaEmail(partyData, trip, callback) {
    var emailparams = {
        templateName: 'lookingForLoad',
        subject: "Easygaadi Load Request",
        to: partyData.email,
        data: {

            "name": partyData.name,
            "tripLane": trip.tripLane

        }//dataToEmail.tripsReport

    };
    if (trip.possibleStartDate) {
        emailparams.data.possibleStartDate = new Date(trip.possibleStartDate).toLocaleDateString();
    }
    emailService.sendEmail(emailparams, function (emailResponse) {
        callback(emailResponse);
    });
}

function shareLoadRequestDetailsViaSMS(partyData, trip, callback) {
    var smsParams = {
        contact: partyData.contact,
        message: "Hi " + partyData.name + ",\n" +
        "We are looking for load. "
    };
    if (trip.tripLane) {
        smsParams.message = smsParams.message + "\nTrip lane : " + trip.tripLane
    }

    if (trip.possibleStartDate) {
        smsParams.message = smsParams.message + "\npossible date: " + trip.possibleStartDate

    }

    SmsService.sendSMS(smsParams, function (smsResponse) {
        callback(smsResponse);
    });

};
Trips.prototype.shareDetailsViaEmail = function (jwt,params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!params.email || !Utils.isEmail(params.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else{
        Trips.prototype.getAllAccountTrips(jwt,params,req,function(response){
            if(response.status){
                var output = [];
// console.log("response...",response);
                if(response.trips.length){
                    for(var i=0;i<response.trips.length;i++) {
                        output.push({
                            date:value(dateToStringFormat(response.trips[i].date)),
                            truckName:value(response.trips[i].attrs.truckName),
                            partyName:value(response.trips[i].attrs.partyName),
                            fullName:value(response.trips[i].attrs.fullName),
                            freightAmount:value(response.trips[i].freightAmount),
                            mobile:value(response.trips[i].attrs.mobile)
                        });
                        if (i === response.trips.length - 1) {
                            var emailparams = {
                                templateName: 'tripDetails',
                                subject: "Trip Details",
                                to: params.email,
                                data: output
                            };
                            emailService.sendEmail(emailparams, function (emailResponse) {
                                if (emailResponse.status) {
                                    retObj.status = true;
                                    retObj.messages.push(' Details shared successfully');
                                    callback(retObj);
                                } else {
                                    callback(emailResponse);
                                }
                            });
                        }
                    }
                }else{
                    retObj.messages.push("No records found....");
                    retObj.status = false;
                    callback(retObj);
                }

            }else{
                callback(response);

            }
        })
    }

};
Trips.prototype.downloadDetails = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Trips.prototype.getAllAccountTrips(jwt,params,req,function(response){
        console.log("response...trips....",response);
        if(response.status){
            var output = [];
            for(var i=0;i<response.trips.length;i++){
                output.push({
                    Trip_Date:dateToStringFormat(response.trips[i].date),
                    Reg_No:response.trips[i].attrs.truckName,
                    Party_Name:response.trips[i].attrs.partyName,
                    Driver:response.trips[i].attrs.fullName,
                    Freight:response.trips[i].freightAmount,
                    Contact:response.trips[i].attrs.mobile
                });
            }
            retObj.data = output;
            retObj.status=true;
            retObj.messages.push("successful..");
            callback(retObj);
        }else{
            callback(retObj);
        }
    })
};




module.exports = new Trips();