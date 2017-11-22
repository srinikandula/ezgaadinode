var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');


const ObjectId = mongoose.Types.ObjectId;

var TripCollection = require('./../models/schemas').TripCollection;
var ExpenseCostColl = require('./../models/schemas').ExpenseCostColl;
var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');

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


    if (!tripDetails.partyId) {
        retObj.messages.push("Please select a party");
    }

    if (!_.isNumber(tripDetails.freightAmount)) {
        retObj.messages.push("Please add Freight Amount");
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        if (jwt.type === "account") {
            tripDetails.createdBy = jwt.id;
            tripDetails.accountId = jwt.accountId;
        }
        else {
            tripDetails.createdBy = jwt.id;
            tripDetails.groupId = jwt.id;
            tripDetails.accountId = jwt.accountId;
        }
        tripDetails.tripId = "TR" + parseInt(Math.random() * 100000);
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
                truckNo: function (truckscallback) {
                    Utils.populateNameInTrucksColl([trip], 'registrationNo', function (response) {
                        truckscallback(response.err, response.documents);
                    })
                }
            }, function (populateErr, populateResults) {
                retObj.status = true;
                retObj.messages.push("Trip found successfully");
                retObj.trip = trip;
                callback(retObj);
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

/** this is to be used with super user login
 *
 * @param jwt
 * @param req
 * @param pageNumber
 * @param callback
 */
Trips.prototype.getAll = function (jwt, params, callback) {
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
            var sort = params.sort ? JSON.parse(params.sort) : {};
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
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Success');
                    retObj.count = results.count;
                    retObj.trips = results.trips.createdbyname; //as trips is callby reference
                    //callback(retObj);
                }
            });
        }
    }
};

Trips.prototype.getAllAccountTrips = function (jwt, params, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!params.page) {
        params.page = 1;
    }

    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {};
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
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.trips = results.trips.createdbyname; //as trips is callby reference
            callback(retObj);
        }
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

/**
 * Api for trip report
 * fields for filter
 * @param fromDate
 * @param toDate
 * @param registrationNo (optional)
 * @param driver (optional)
 * **/
Trips.prototype.getReport = function (jwt, filter, callback) {
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
            driver: 1,
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
                }, function (populateErr, populateResults) {
                    if (populateErr) {
                        retObj.messages.push('Error retrieving trips');
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
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Trips.prototype.sendEmail = function (jwt, data, callback) {

    var retObj = {
        status: false,
        messages: []
    };
    new Trips().getReport(jwt, data, function (dataToEmail) {
        if (!dataToEmail.status) {
            retObj.messages.push('Error retrieving trips');
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
                callback(response);
            });
        }
    });
};

/**
 * Find the Total fright from the trips in the account
 */

Trips.prototype.findTotalRevenue = function (jwt, callback) {
    async.parallel({
        tripFreightTotal: function (callback) {
            //it is not working now
            TripCollection.aggregate([{$match: {"accountId": ObjectId(jwt.accountId)}},
                {$group: {_id: null, totalFreight: {$sum: "$freightAmount"}}}],
                function (err, totalFreight) {
                    //console.log(totalFreight);
                    callback(err, totalFreight);
                });
        },
        expensesTotal: function (callback) {
            ExpenseCostColl.aggregate({$match: {"accountId": ObjectId(jwt.accountId)}},
                {$group: {_id: null, totalExpenses: {$sum: "$cost"}}},
                function (err, totalExpenses) {
                    //console.log(totalExpenses);
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
            callback(retObj);
        } else {
            retObj.status = true;
            var totalFright = 0;
            var totalExpenses = 0;
            if(populateResults){
                if(populateResults.tripFreightTotal[0]){
                    totalFright = populateResults.tripFreightTotal[0].totalFreight;
                }
                if(populateResults.expensesTotal[0]){
                    totalExpenses = populateResults.expensesTotal[0].totalExpenses;
                }
                retObj.totalRevenue = totalFright- totalExpenses;
            } else {
                retObj.totalRevenue = 0//populateResults.tripFreightTotal[0].totalFreight - populateResults.expensesTotal[0].totalExpenses;
            }
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
Trips.prototype.findRevenueByParty = function (jwt, callback) {
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
                callback(retObj);
            } else {
                Utils.populateNameInPartyColl(revenue, '_id', function (response) {
                    //console.log(response);
                    retObj.status = true;
                    retObj.revenue = response.documents;
                    callback(retObj);
                });
            }
        });
}

/**
 * Find revenue by Vehicle
 * @param jwt
 * @param callback
 */
Trips.prototype.findRevenueByVehicle = function (jwt, callback) {
    async.parallel({
        tripFreightTotal: function (callback) {
            //TODO add match
            //it is not working now
            TripCollection.aggregate({$match: {"accountId": ObjectId(jwt.accountId)}},
                {$group: {_id: "$registrationNo", totalFreight: {$sum: "$freightAmount"}}},
                function (err, totalFreight) {
                    //console.log(totalFreight);
                    callback(err, totalFreight);
                });
        },
        expensesTotal: function (callback) {
            ExpenseCostColl.aggregate({$match: {"accountId": ObjectId(jwt.accountId)}},
                {$group: {_id: "$vehicleNumber", totalExpenses: {$sum: "$cost"}}},
                function (err, totalExpenses) {
                    //console.log(totalExpenses);
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
            //console.log(populateResults);
            var vehicleIds = _.pluck(populateResults.tripFreightTotal, "_id");
            //console.log(vehicleIds);
            var vehicles = [];
            for (var i = 0; i < vehicleIds.length; i++) {
                var vehicle = {"registrationNo": vehicleIds[i]};
                //console.log(vehicle);
                var vehicleInfo = _.find(populateResults.tripFreightTotal, function (freight) {
                    if (freight._id === vehicle.registrationNo) {
                        return freight;
                    }
                });
                if (vehicleInfo) {
                    vehicle.totalFreight = vehicleInfo.totalFreight;
                    //console.log(vehicle.totalFreight);
                } else {
                    vehicle.totalFreight = 0;
                }
                vehicleInfo = _.find(populateResults.expensesTotal, function (expense) {
                    if (expense._id === vehicle.registrationNo) {
                        return expense;
                    }
                });
                if (vehicleInfo) {
                    vehicle.totalExpense = vehicleInfo.totalExpenses;
                    //console.log(vehicle.totalExpense);
                } else {
                    vehicle.totalExpense = 0;
                }


                vehicle.totalRevenue = parseFloat(vehicle.totalFreight) - parseFloat(vehicle.totalExpense);

                vehicles.push(vehicle);
            }

            Utils.populateNameInTrucksColl(vehicles, 'registrationNo', function (result) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.revenue = result.documents;
                callback(retObj);
            })
        }
    });
    /*TripCollection.aggregate({ $match: {"accountId":ObjectId(jwt.accountId)}},
        { $group: { _id : "$partyId" , totalFreight : { $sum: "$freightAmount" }} },
        function (error, revenue) {
            var retObj = {
                status: false,
                messages: []
            };
            if(error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                callback(retObj);
            } else {
                Utils.populateNameInPartyColl(revenue, '_id', function (response) {
                    //console.log(response);
                    retObj.status = true;
                    retObj.revenue = response.documents;
                    callback(retObj);
                });
            }
        });*/
}

Trips.prototype.findTripsByParty = function (jwt, partyId, callback) {
    TripCollection.find({"accountId": jwt.accountId, "partyId": partyId},
        function (error, trips) {
            //console.log(trips);
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                callback(retObj)
            } else {
                Utils.populateNameInTrucksColl(trips, "registrationNo", function (tripDocuments) {
                    retObj.status = true;
                    retObj.trips = tripDocuments.documents;
                    callback(retObj)
                });
            }
        });
}

Trips.prototype.findTripsByVehicle = function (jwt, vehicleId, callback) {
    TripCollection.find({"accountId": jwt.accountId, "registrationNo": vehicleId},
        function (error, trips) {
            //console.log(trips);
            var retObj = {
                status: false,
                messages: []
            };
            if (error) {
                retObj.status = false;
                retObj.messages.push(JSON.stringify(error));
                callback(retObj)
            } else {
                Utils.populateNameInTrucksColl(trips, "registrationNo", function (tripDocuments) {
                    retObj.status = true;
                    retObj.trips = tripDocuments.documents;
                    callback(retObj)
                });
            }
        });
}

Trips.prototype.countTrips = function (jwt, callback) {
    var result = {};
    TripCollection.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.count = data;
            callback(result);
        }
    })
};
module.exports = new Trips();