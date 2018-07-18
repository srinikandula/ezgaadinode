var _ = require('underscore');
var async = require('async');
var devicePostions = require('./../models/schemas').GpsColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var GpsFencesReportsColl = require('./../models/schemas').GpsFencesReportsColl;


/**
 * Finding GeoFence locations for devices in an account
 * */
function findingGeoFenceLocationsFromEachAccount(trucks, accountId, coordinates, startTime, endTime, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    async.eachSeries(trucks, function (truck, deviceCallback) {
        console.log("deviceId=====>", truck.deviceId);
        devicePostions.find({
            deviceId: truck.deviceId,
            deviceTime: {$gte: startTime, $lte: endTime},

            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $centerSphere: 150000,
                    spherical: true

                }
            }

        }, function (err, locations) {
            if (err) {
                console.log("error at device postions");
                retObj.messages.push("Error" + JSON.stringify(err.message));
                deviceCallback(retObj);
            } else {
                if (locations.length > 0) {
                    var geoFenceObj = {
                        truckId: truck._id,
                        accountId: accountId,
                        startTime: new Date(locations[0].deviceTime),
                        endTime: new Date(locations[locations.length - 1].deviceTime)
                    };
                    var geo = new GpsFencesReportsColl(geoFenceObj);
                    geo.save(function (err, doc) {
                        if (err) {
                            console.log("err", err);
                        }
                    });
                    retObj.status = true;
                    retObj.messages.push("success");
                    deviceCallback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push("success");
                    deviceCallback(retObj);
                }

            }
        })
    }, function (err) {
        if (!err.status) {
            callback(err);
        } else {

            callback(err)
        }
    })

}

/**
 * Finding route config enabled  accounts
 * */
function findingRouteConfigEnabledAccounts() {
    AccountsColl.find({routeConfigEnabled: true}, {_id: 1}).then(accounts => {
        if (accounts.length > 0) {
            var start = new Date(1527425432000.0);
            var end = new Date(1527425432000.0);
            start.setMinutes(start.getMinutes() - 32);
            start.setMinutes(start.getMinutes() + 2);
            var startTime = new Date(start) - 0;
            var endTime = new Date(end) - 0;
            console.log(startTime, endTime);
            async.eachSeries(accounts, function (account, accountCallback) {
                /*finding device ids from each account*/
                TrucksColl.find({accountId: account._id, deviceId: {$exists: true}}, {
                    deviceId: 1,
                    _id: 1
                }).then(trucks => {
                    console.log("trucks", trucks);
                    if (trucks.length > 0) {
                        var coordinates = [15.221716,80.02317];

                        /*finding matched GeoFenceLocations for each account*/
                        findingGeoFenceLocationsFromEachAccount(trucks,account._id, coordinates, startTime, endTime, function (response) {
                            if (response.status) {
                                accountCallback(null);
                            } else {
                                accountCallback(response);
                            }
                        })
                    } else {
                        accountCallback(null);
                    }
                }).catch(error => {
                    console.log("error at finding device ids");
                    accountCallback(error);
                })
            }, function (err) {
                if (err) {
                    console.log("error", err);
                } else {
                    console.log("All accounts  successfuly completed")
                }
            })
        } else {
            console.log("There is no route config enabled accounts");
        }
    }).catch(error => {
        console.log("error", error);
    })

}


findingRouteConfigEnabledAccounts()//start Job