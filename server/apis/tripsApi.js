var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');
var nodeMailer = require('nodemailer');
var Velocity = require('velocityjs');
var fs = require('fs');

var TripCollection = require('./../models/schemas').TripCollection;
var paymentsApi = require('./../apis/paymentApi');
var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var Trips = function () {
};

Trips.prototype.addTrip = function (jwt, tripDetails, callback) {
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

    if (!tripDetails.registrationNo) {
        retObj.messages.push("Please add Registration No");
    }

    if (!tripDetails.driver) {
        retObj.messages.push("Please add driver");
    }

    /*if (!tripDetails.bookedFor) {
        retObj.messages.push("Please add bookedFor");
    }

    if (!_.isNumber(tripDetails.freightAmount)) {
        retObj.messages.push("Please add Freight Amount");
    }

    if (!_.isNumber(tripDetails.advance)) {
        retObj.messages.push("Please add Advance");
    }

    if (!_.isNumber(tripDetails.balance)) {
        retObj.messages.push("Please add Balance");
    }

    if (!tripDetails.tripLane) {
        retObj.messages.push("Please add Trip Lane");
    }

    if (!_.isNumber(tripDetails.tripExpenses)) {
        retObj.messages.push('Please add tripExpenses');
    }
    if (!_.isNumber(tripDetails.bookLoad)) {
        retObj.messages.push('Please add bookLoad');
    }
    if (!_.isNumber(tripDetails.dieselAmount)) {
        retObj.messages.push('Please add dieselAmount');
    }
    if (!_.isNumber(tripDetails.tollgateAmount)) {
        retObj.messages.push('Please add tollgateAmount');
    }
    if (!tripDetails.from) {
        retObj.messages.push('Please add from');
    }
    if (!tripDetails.to) {
        retObj.messages.push('Please add to');
    }
    if (!_.isNumber(tripDetails.tonnage)) {
        retObj.messages.push('Please add tonnage');
    }
    if (!_.isNumber(tripDetails.rate)) {
        retObj.messages.push('Please add rate');
    }
    if (!tripDetails.paymentType) {
        retObj.messages.push('Please add paymentType');
    }
    if (!tripDetails.remarks) {
        retObj.messages.push('Please add remarks');
    }*/
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        tripDetails.createdBy = jwt.id;
        tripDetails.updatedBy = jwt.id;
        tripDetails.accountId = jwt.accountId;
        tripDetails.tripId = "TR"+parseInt(Math.random()*100000);
        var tripDoc = new TripCollection(tripDetails);
        tripDoc.save(function (err) {
            if (err) {
                retObj.messages.push("Error while adding trip, try Again");
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Trip Added Successfully");
                callback(retObj);
            }
        });
    }
};

Trips.prototype.findTrip = function (jwt, tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    TripCollection.findOne({_id: tripId, accountId: jwt.accountId}, function (err, trip) {
        if (err) {
            retObj.messages.push("Error while finding trip, try Again");
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
                triplane: function (triplaneCallback) {
                    Utils.populateNameInTripLaneColl([trip], 'tripLane', function (response) {
                        triplaneCallback(response.err, response.documents);
                    });
                },
                truckNo: function (truckscallback) {
                    Utils.populateNameInTrucksColl([trip], 'registrationNo', function (response) {
                        truckscallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
                paymentsApi.getPaymentsOfTrip(jwt.accountId, tripId, function (payments) {
                    if(!payments.status) {
                        retObj.messages.push("Error while finding trip payments, try Again");
                        callback(retObj);
                    } else {
                        trip['paymentHistory'] = payments.payments;
                        retObj.status = true;
                        retObj.messages.push("Trip found successfully");
                        retObj.trip = trip;
                        callback(retObj);
                    }
                });
            });
        } else {
            retObj.messages.push("Trip is not found!");
            callback(retObj);
        }
    });
};

Trips.prototype.updateTrip = function (jwt, tripDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    tripDetails = Utils.removeEmptyFields(tripDetails);

    TripCollection.findOneAndUpdate({_id: tripDetails._id},
        {$set: tripDetails},
        {new: true}, function (err, trip) {
            if (err) {
                retObj.messages.push("Error while updating Trip, try Again");
                callback(retObj);
            } else if (trip) {
                retObj.status = true;
                retObj.messages.push("Trip updated successfully");
                retObj.trip = trip;
                callback(retObj);
            } else {
                retObj.messages.push("Error, finding trip");
                callback(retObj);
            }
        });
};

Trips.prototype.getAll = function (jwt, req, pageNumber, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!pageNumber) {
        pageNumber = 1;
    }

    if (!_.isNumber(Number(pageNumber))) {
        retObj.messages.push('Invalid page number');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (pageNumber - 1) * pageLimits.tripsPaginationLimit;
        async.parallel({
            trips: function (tripsCallback) {
                TripCollection
                    .find({'accountId':jwt.accountId})
                    .sort({createdAt: 1})
                    .skip(skipNumber)
                    .limit(pageLimits.tripsPaginationLimit)
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
                                Utils.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                                    bookedforCallback(response.err, response.documents);
                                });
                            },
                            triplane: function (triplaneCallback) {
                                Utils.populateNameInTripLaneColl(trips, 'tripLane', function (response) {
                                    triplaneCallback(response.err, response.documents);
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
                retObj.trips = results.trips.createdbyname; //as trips is callby reference
                callback(retObj);
            }
        });
    }
};

Trips.prototype.getAllAccountTrips = function (jwt, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TripCollection
        .find({'accountId':jwt.accountId})
        .sort({createdAt: 1})
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
                    Utils.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                        bookedforCallback(response.err, response.documents);
                    });
                },
                triplane: function (triplaneCallback) {
                    Utils.populateNameInTripLaneColl(trips, 'tripLane', function (response) {
                        triplaneCallback(response.err, response.documents);
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
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.trips = trips; //as trips is callby reference
                    callback(retObj);
                }
            });
        });
};

Trips.prototype.deleteTrip = function (tripId, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!Utils.isValidObjectId(tripId)) {
        retObj.messages.push('Invalid trip id');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        TripCollection.find({_id: tripId}, function (err) {
            if (err) {
                retObj.messages.push('No Trips Found');
                callback(retObj);
            } else {
                TripCollection.remove({_id: tripId}, function (err) {
                    if (err) {
                        retObj.messages.push('Error deleting trip');
                        callback(retObj);
                    } else {
                        retObj.messages.push('Success');
                        callback(retObj);
                    }
                })
            }
        });
    }
};

Trips.prototype.getReport = function (jwt, details, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!details.fromDate) {
        retObj.messages.push("Please select from date");
    }
    if(!details.toDate) {
        retObj.messages.push("Please select to date");
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var query = {accountId:jwt.accountId,date:{$gte:details.fromDate, $lte:details.toDate}};
        if(details.registrationNo) query.registrationNo=details.registrationNo;
        if(details.driver) query.driver=details.driver;
        TripCollection.find(query,{date:1,registrationNo:1,driver:1,bookedFor:1,freightAmount:1,advance:1,balance:1,from:1,to:1,tripId:1,createdBy:1}, function (err, trips) {
            if (err) {
                retObj.messages.push('Error finding trips');
                callback(retObj);
            } else {
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
                        Utils.populateNameInPartyColl(trips, 'bookedFor', function (response) {
                            bookedforCallback(response.err, response.documents);
                        });
                    },
                    truckNo: function (truckscallback) {
                        Utils.populateNameInTrucksColl(trips, 'registrationNo', function (response) {
                            truckscallback(response.err, response.documents);
                        })
                    }
                    // ,
                    // payments: function (paymentsCallback) {
                    //     Utils.getPaymentsforTrips(jwt.accountId, trips, function (response) {
                    //         paymentsCallback(response.err, response.documents);
                    //     })
                    // }
                }, function (populateErr, populateResults) {
                    if (populateErr) {
                        retObj.messages.push('Error retrieving trips');
                        callback(retObj);
                    } else {
                        var tripsSimplified = [];
                        for(var i = 0;i < trips.length;i++) {
                            tripsSimplified.push({
                                trips: {
                                    registrationNo:trips[i].attrs.truckName,
                                    date:trips[i].date,
                                    bookedFor:trips[i].attrs.partyName,
                                    from:trips[i].from,
                                    to:trips[i].to,
                                    driverName:trips[i].attrs.fullName,
                                    mobile:trips[i].attrs.mobile
                                },
                                payments: {
                                    freightAmount:trips[i].freightAmount,
                                    advance:trips[i].advance,
                                    balance:trips[i].balance
                                }
                            });
                        }
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.tripsReport = tripsSimplified;
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Trips.prototype.sendEmail = function (jwt, details, callback) {
    console.log(details);
    var retObj = {
        status: false,
        messages: []
    };
    var template = null;
    if(!fs.existsSync(__dirname + '/../emailTemplates/tripReport.html')){
        retObj.status = false;
        retObj.messages.push("Error while sending report");
        callback(retObj);
    } else {
        template = fs.readFileSync(__dirname + '/../emailTemplates/tripReport.html', 'utf8');
        // var temp = Velocity.render(template, {a: 100, b: {c: 200}});
        var temp = Velocity.render(template, {emailData:details.tripsReport});
        var mailoptions = {
            email: 'sai@mtwlabs.com',
            subject: "Easygaadi Test",
            html: temp//"Hello User"
        };
        Utils.sendEmail(mailoptions, function (emailsuccess) {
            if (!emailsuccess.status) {
                retObj.status = false;
                retObj.messages.push("Error while sending report");
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Email sent successfully");
                callback(retObj);
            }
        });
    }
};

module.exports = new Trips();