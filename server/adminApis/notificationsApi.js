var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var NotificationColl = require("../models/schemas").NotificationColl;
var TruckNotificationColl = require("../models/schemas").TruckNotificationColl;
var LoadNotificationColl = require("../models/schemas").LoadNotificationColl;
var Utils = require("../apis/utils");

var Notifications = function () {
};

/* Notifications APIS Starts Here  ---- Author : Sravan G */

Notifications.prototype.getNotifications = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    NotificationColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_notifications_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_notifications, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push ("Notifications are not Found");
                analyticsService.create(req, serviceActions.get_notifications_err, {
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

Notifications.prototype.totalNumOfNotifications = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    NotificationColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting Notification Count');
            analyticsService.create(req, serviceActions.count_notifications_err, {
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
            analyticsService.create(req, serviceActions.count_notifications, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

/* Notifications APIS Ends Here  ---- Author : Sravan G */

/*  GPS Truck Notification APIS Starts Here -- author : Sravan G*/

Notifications.prototype.addGpsTruckNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.sourceCity) {
        retObj.messages.push("Please enter Source");
    }
    if (!params.destinationCity) {
        retObj.messages.push("Please enter Destination");
    }
    if (!params.numOfTrucks) {
        retObj.messages.push("Please enter Number of Trucks");
    }
    if (!params.dateAvailable) {
        retObj.messages.push("Please enter Date");
    }
    if (params.sendToAll === undefined) {
        retObj.messages.push('Select Send To All');
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_gps_truck_ntfn_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var truckType = new TruckNotificationColl(params);

        truckType.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_gps_truck_ntfn_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Truck Notification added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_gps_truck_ntfn, {
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

Notifications.prototype.getGpsTruckNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    TruckNotificationColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn_err, {
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
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("No truck Notifications found");
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn_err, {
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

Notifications.prototype.countOfTruckNtfns = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TruckNotificationColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting Truck Notification Count');
            analyticsService.create(req, serviceActions.count_truck_notifications_err, {
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
            analyticsService.create(req, serviceActions.count_truck_notifications, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Notifications.prototype.getGpsTruckNtfnDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var ntfnId = req.query.ntfnId;

    if (!Utils.isValidObjectId(ntfnId)) {
        retObj.messages.push('Invalid Truck Notification id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_gps_truck_ntfn_details_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TruckNotificationColl.findOne({"_id": ObjectId(ntfnId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving Truck Notification');
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn_details, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Truck Notificatoin with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_gps_truck_ntfn_details_err, {
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

Notifications.prototype.updateGpsTruckNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var truckNtfnInfo = req.body;
    console.log("Truck Info", truckNtfnInfo);

    if (!Utils.isValidObjectId(truckNtfnInfo._id)) {
        retObj.messages.push('Invalid gps plan Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_gps_truck_ntfn_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TruckNotificationColl.findOne({
            _id: truckNtfnInfo._id,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_gps_truck_ntfn_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                truckNtfnInfo.updatedBy = req.jwt.id;
                TruckNotificationColl.findOneAndUpdate({_id: truckNtfnInfo._id}, {$set: truckNtfnInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the GPS Truck Notification');
                        analyticsService.create(req, serviceActions.update_gps_truck_ntfn_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else if (doc) {
                        retObj.status = true;
                        retObj.messages.push('GPS Truck Notification Updated successfully');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.update_gps_truck_ntfn, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('GPS Truck Notification with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_gps_truck_ntfn_err, {
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
                retObj.messages.push('GPS Truck Notification with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_gps_truck_ntfn_err, {
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

Notifications.prototype.deleteTruckNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var truckNtfnId = req.query._id;

    if (!Utils.isValidObjectId(truckNtfnId)) {
        retObj.messages.push('Invalid GPS Truck Notification ID');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_gps_truck_ntfn_err, {
            body: JSON.stringify(req.params),
            gpsPlanId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TruckNotificationColl.remove({_id: truckNtfnId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting GPS Truck Notification');
                analyticsService.create(req, serviceActions.delete_gps_truck_ntfn_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting in GPS Truck Notification');
                analyticsService.create(req, serviceActions.delete_gps_truck_ntfn_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('GPS Truck Notification deleted successfully');
                analyticsService.create(req, serviceActions.delete_gps_truck_ntfn, {
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

/*  GPS Truck Notification APIS Ends Here */

/*  Load Notification APIS Starts Here -- author : Sravan G*/

Notifications.prototype.addLoadNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.sourceCity) {
        retObj.messages.push("Please enter Source");
    }
    if (!params.destinationCity) {
        retObj.messages.push("Please enter Destination");
    }
    if (!params.truckType) {
        retObj.messages.push("Please Select Truck Type");
    }
    if (!params.goodsType) {
        retObj.messages.push("Please Select Goods Type");
    }
    if (!params.dateAvailable) {
        retObj.messages.push("Please enter Date");
    }
    if (params.sendToAll === undefined) {
        retObj.messages.push('Select Send To All');
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_load_ntfn_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var loadNotification = new LoadNotificationColl(params);

        loadNotification.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_load_ntfn_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Load Notification added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_load_ntfn, {
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

Notifications.prototype.getLoadNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    LoadNotificationColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_load_ntfn_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (docs.length > 0) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = docs;
                analyticsService.create(req, serviceActions.get_load_ntfn, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages = "No Load Notifications found";
                analyticsService.create(req, serviceActions.get_load_ntfn_err, {
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

Notifications.prototype.countOfLoadNtfns = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    LoadNotificationColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting Load Notification Count');
            analyticsService.create(req, serviceActions.count_load_notifications_err, {
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
            analyticsService.create(req, serviceActions.count_load_notifications, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Notifications.prototype.getLoadNtfnDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var id = req.query.ntfnId;

    if (!Utils.isValidObjectId(id)) {
        retObj.messages.push('Invalid Load Notification id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_load_ntfn_details_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        LoadNotificationColl.findOne({"_id": ObjectId(id)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving Load Notification');
                analyticsService.create(req, serviceActions.get_load_ntfn_details_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages.push('Success');
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_load_ntfn_details, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Load Notificatoin with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_load_ntfn_details_err, {
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

Notifications.prototype.updateLoadNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var loadNtfnInfo = req.body;

    if (!Utils.isValidObjectId(loadNtfnInfo._id)) {
        retObj.messages.push('Invalid Load notification ID');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_load_ntfn_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        LoadNotificationColl.findOne({
            _id: loadNtfnInfo._id,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_load_ntfn_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                loadNtfnInfo.updatedBy = req.jwt.id;
                LoadNotificationColl.findOneAndUpdate({_id: loadNtfnInfo._id}, {$set: loadNtfnInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the Load Notification');
                        analyticsService.create(req, serviceActions.update_load_ntfn_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else if (doc) {
                        retObj.status = true;
                        retObj.messages.push('Load Notification Updated successfully');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.update_load_ntfn, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('Load Notification with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_load_ntfn_err, {
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
                retObj.messages.push('Load Notification with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_load_ntfn_err, {
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

Notifications.prototype.deleteLoadNtfn = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    var loadNtfnId = req.query._id;

    if (!Utils.isValidObjectId(loadNtfnId)) {
        retObj.messages.push('Invalid Load Notification ID');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_load_ntfn_err, {
            body: JSON.stringify(req.params),
            gpsPlanId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        LoadNotificationColl.remove({_id: loadNtfnId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting Load Notification');
                analyticsService.create(req, serviceActions.delete_load_ntfn_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting in Load Notification');
                analyticsService.create(req, serviceActions.delete_load_ntfn_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push('Load Notification deleted successfully');
                analyticsService.create(req, serviceActions.delete_load_ntfn, {
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

/*  GPS Truck Notification APIS Ends Here */

module.exports = new Notifications();


