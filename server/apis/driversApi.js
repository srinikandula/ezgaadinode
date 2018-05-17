var _ = require('underscore');
var async = require('async');

var DriversColl = require('./../models/schemas').DriversColl;
var TrucksColl = require('./../models/schemas').TrucksColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var emailService = require('./mailerApi');
var Utils = require('./utils');


var Drivers = function () {
};

function dateToStringFormat(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    } else {
        return '--';
    }
}
function value(x){
    if(!x)
        return '--';
else 
    return x;
}

Drivers.prototype.addDriver = function (jwt, driverInfo, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var errors = [];

    driverInfo = Utils.removeEmptyFields(driverInfo);
    if (!driverInfo.fullName || !_.isString(driverInfo.fullName)) {
        retObj.messages.push('Invalid full name');
    }
   /* if (!driverInfo.mobile || !Utils.isValidPhoneNumber(driverInfo.mobile)) {
        retObj.messages.push('Mobile number should be of ten digits');
    }*/
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_driver_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {

        driverInfo.createdBy = jwt.id;
        driverInfo.groupId = jwt.id;
        driverInfo.accountId = jwt.accountId;
        driverInfo.mobile = Number(driverInfo.mobile);
        driverInfo.driverId = "DR" + parseInt((Math.random() * 100000)); // Need to fix this
        delete driverInfo.joiningDate;

        //check if there is a driver with matching mobile number or fullName in the account
        DriversColl.find({
            accountId: driverInfo.accountId,
            $or: [{"mobile": driverInfo.mobile}, {"fullName": driverInfo.fullName}]
        }, function (err, drivers) {
            if (err) {
                retObj.messages.push('Error saving driver', err.message);
                analyticsService.create(req, serviceActions.add_driver_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (drivers && drivers.length > 0) {
                var duplicateFound = _.find(drivers, function (driver) {
                    return driver.mobile === driverInfo.mobile;
                });

                if (duplicateFound) {
                    retObj.messages.push('Mobile number is used by other driver in the account');
                    analyticsService.create(req, serviceActions.add_driver_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                }

                duplicateFound = _.find(drivers, function (driver) {
                    return driver.fullName === driverInfo.fullName;
                });

                if (duplicateFound) {
                    retObj.messages.push(" DUPLICATE!! Please choose a different name for the driver");
                    analyticsService.create(req, serviceActions.add_driver_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                }

                callback(retObj);
            } else {
                console.log("Driver Info", driverInfo);
                var driverDoc = new DriversColl(driverInfo);
                console.log("driverDoc", driverDoc);
                driverDoc.save(driverInfo, function (err, newDoc) {
                    if (err) {
                        retObj.messages.push('Error saving driver');
                        analyticsService.create(req, serviceActions.add_driver_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.driver = newDoc;
                        Utils.cleanUpTruckDriverAssignment(jwt, newDoc.truckId, newDoc._id);
                        analyticsService.create(req, serviceActions.add_driver, {
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

Drivers.prototype.getDrivers = function (jwt, params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
        if (!params.driverName) {
            condition = {accountId: jwt.accountId}
        } else {
                if(!isNaN(parseInt(params.driverName))){
                    condition = {
                        $and : [{accountId: jwt.accountId},
                            {mobile:parseInt(params.driverName)}]
                    }

                }else{
                    condition = {
                        $and : [{accountId: jwt.accountId},
                            {$or:[{fullName: new RegExp("^" + params.driverName, "i")},
                                {driverId: new RegExp("^" + params.driverName, "i")}
                            ]}]
                    }
                }

        }

        async.parallel({
            drivers: function (driversCallback) {
                DriversColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .populate('truckId')
                    .lean()
                    .exec(function (err, drivers) {
                        Utils.populateNameInUsersColl(drivers, "createdBy", function (response) {
                            if (response.status) {
                                driversCallback(err, response.documents);
                            } else {
                                driversCallback(err, null);
                            }
                        });
                        // driversCallback(err, drivers);
                    });
            },
            count: function (countCallback) {
                DriversColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, results) {
            if (err) {
                console.log(err);
                retObj.messages.push('Error retrieving accounts');
                analyticsService.create(req, serviceActions.get_drivers_err, {
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
                retObj.userId = jwt.id;
                retObj.userType = jwt.type;
                retObj.drivers = results.drivers;
                analyticsService.create(req, serviceActions.get_drivers, {
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

Drivers.prototype.getDriverDetails = function (jwt, driverId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    if (jwt.type === "account") {
        condition = {_id: driverId, 'accountId': jwt.accountId};
    } else {
        condition = {_id: driverId, 'createdBy': jwt.id};
    }
    if (!Utils.isValidObjectId(driverId)) {
        retObj.messages.push('Invalid driverId');
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        DriversColl.findOne(condition, function (err, driver) {
            if (err) {
                retObj.messages.push('Error retrieving driver');
                analyticsService.create(req, serviceActions.get_driver_det_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (driver) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.driver = driver;
                analyticsService.create(req, serviceActions.get_driver_det, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Unauthorized access or Driver with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_driver_det_err, {
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

Drivers.prototype.updateDriver = function (jwt, driverInfo, req, callback) {
    console.log(driverInfo);
    var retObj = {
        status: false,
        messages: []
    };
    var giveAccess = false;
    if (jwt.type === "account" && driverInfo.accountId === jwt.accountId) {
        giveAccess = true;
    } else if (jwt.type === "group" && driverInfo.createdBy === jwt.id) {
        giveAccess = true;

    } else {
        retObj.status = false;
        retObj.messages.push("Unauthorized access");
        callback(retObj);
    }
    if (giveAccess) {
        if (!driverInfo._id) {
            retObj.messages.push('Invalid driverId');
        }

     /*   if (!driverInfo.mobile || !Utils.isValidPhoneNumber(driverInfo.mobile)) {
            retObj.messages.push('Mobile number should be of ten digits');
        }*/

        if (retObj.messages.length) {
            analyticsService.create(req, serviceActions.update_driver_err, {
                body: JSON.stringify(req.body),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            driverInfo.updatedBy = jwt.id;
            driverInfo.mobile = Number(driverInfo.mobile);

            DriversColl.find({
                accountId: driverInfo.accountId,
                _id: {$ne: driverInfo._id},
                $or: [{"mobile": driverInfo.mobile}, {"fullName": driverInfo.fullName}]
            }, function (err, drivers) {
                if (err) {
                    retObj.messages.push('Error fetching accounts');
                    analyticsService.create(req, serviceActions.update_driver_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (!drivers.length) { // if no driver is found with the same phone number or full name
                    DriversColl.findOneAndUpdate({_id: driverInfo._id}, driverInfo, {new: true}, function (err, oldDriver) {
                        if (err) {
                            retObj.messages.push('Error saving driver');
                            analyticsService.create(req, serviceActions.update_driver_err, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        } else if (oldDriver) {
                            retObj.status = true;
                            retObj.messages.push('Success');
                            retObj.driver = oldDriver;
                            Utils.cleanUpTruckDriverAssignment(jwt, oldDriver.truckId, oldDriver._id);
                            analyticsService.create(req, serviceActions.update_driver, {
                                body: JSON.stringify(req.body),
                                accountId: req.jwt.id,
                                success: true
                            }, function (response) {
                            });
                            callback(retObj);
                        } else {
                            retObj.messages.push('Driver does\'t exist');
                            analyticsService.create(req, serviceActions.update_driver_err, {
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
                    var duplicateFound = _.find(drivers, function (driver) {
                        return driver.mobile === driverInfo.mobile;
                    });

                    if (duplicateFound) {
                        retObj.messages.push(" Mobile number is used by other driver in the account");
                    }

                    duplicateFound = _.find(drivers, function (driver) {
                        return driver.fullName === driverInfo.fullName;
                    });

                    if (duplicateFound) {
                        retObj.messages.push(" DUPLICATE!! Please choose a different name for the driver")
                    }

                    callback(retObj);
                    analyticsService.create(req, serviceActions.update_driver_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                }
            });
        }
    }
};


Drivers.prototype.deleteDriver = function (jwt, driverId, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var giveAccess = false;
    if (jwt.type === "account") {
        condition = {_id: driverId, accountId: jwt.accountId};
        giveAccess = true;
    } else if (jwt.type === "group") {
        condition = {_id: driverId, accountId: jwt.accountId};
        giveAccess = true;
    } else {
        retObj.status = false;
        retObj.messages.push('Unauthorized access');
        analyticsService.create(req, serviceActions.delete_driver_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    if (!Utils.isValidObjectId(driverId)) {
        retObj.messages.push('Invalid driver Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req,serviceActions.delete_driver_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    } else {
        DriversColl.remove(condition, function (err,returnValue) {
            if (err) {
                retObj.messages.push('Error deleting Driver');
                analyticsService.create(req,serviceActions.delete_driver_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting driver Record');
                analyticsService.create(req, serviceActions.delete_driver_err, {
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
                analyticsService.create(req, serviceActions.delete_driver, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
}

Drivers.prototype.countDrivers = function (jwt, req, callback) {
    var result = {};
    DriversColl.count({'accountId': jwt.accountId}, function (err, data) {
        if (err) {
            result.status = false;
            result.message = 'Error getting count';
            analyticsService.create(req, serviceActions.count_driver_err, {
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
            analyticsService.create(req, serviceActions.count_driver, {
                accountId: req.jwt.id,
                success: false,
                messages: result.messages
            }, function (response) {
            });
            callback(result);
        }
    })
};

Drivers.prototype.getAllDriversForFilter = function (jwt, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    DriversColl.find({'accountId': jwt.accountId}, {fullName: 1}, function (err, data) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error getting Drivers');
            analyticsService.create(req,serviceActions.get_drivers_for_filter_err,{accountId:jwt.accountId,success:false,messages:result.messages},function(response){ });
            callback(retObj);
        } else if (data) {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.drivers = data;
            analyticsService.create(req,serviceActions.get_drivers_for_filter,{accountId:jwt.accountId,success:true},function(response){ });
            callback(retObj);
        } else {
            retObj.status = false;
            retObj.messages.push('No Drivers Found');
            analyticsService.create(req,serviceActions.get_drivers_for_filter_err,{accountId:jwt.accountId,success:false,messages:result.messages},function(response){ });
            callback(retObj);
        }
    })
};
Drivers.prototype.shareDetailsViaEmail = function (jwt,params, req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if(!params.email || !Utils.isEmail(params.email)){
        retObj.messages.push("Invalid email....");
        callback(retObj);
    }else{
        Drivers.prototype.getDrivers(jwt,params,req,function(response){
            if(response.status){
                var output = [];
                if(response.drivers.length){
                    for(var i=0;i<response.drivers.length;i++) {
                        output.push({
                            fullName:response.drivers[i].fullName,
                            mobile:response.drivers[i].mobile,
                            licenseValidity:dateToStringFormat(response.drivers[i].licenseValidity),
                            salary:value(response.drivers[i].salary),
                            licenseNumber:value(response.drivers[i].licenseNumber)
                        });
                        if (i === response.drivers.length - 1) {
                            var emailparams = {
                                templateName: 'driverDetails',
                                subject: "Driver Details",
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
                    retObj.messages.push("No drivers found....");
                    retObj.status = false;
                    callback(retObj);
                }
            }else{
                callback(response);
            }
        })
    }
};
Drivers.prototype.downloadDetails = function (jwt, params,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    Drivers.prototype.getDrivers(jwt,params,req,function(response){
         if(response.status){
            var output = [];
            for(var i=0;i<response.drivers.length;i++){
                output.push({
                    fullName:response.drivers[i].fullName,
                    Mobile:response.drivers[i].mobile,
                    License_Validity:dateToStringFormat(response.drivers[i].licenseValidity),
                    Salary:response.drivers[i].salary,
                    License_Number:response.drivers[i].licenseNumber});
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

module.exports = new Drivers();