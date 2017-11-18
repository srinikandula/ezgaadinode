var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var nodeMailer = require('nodemailer');
var ObjectId = mongoose.Types.ObjectId;
var config = require('./../config/config');
var UsersColl = require('./../models/schemas').UsersColl;
var GroupsColl = require('./../models/schemas').GroupsColl;
var DriversColl = require('./../models/schemas').DriversColl;
var PartyColl = require('./../models/schemas').PartyCollection;
var TripLaneColl = require('./../models/schemas').TripLanesCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;
var RolesColl = require('./../models/schemas').Roles;
var DriversCollection = require('./../models/schemas').DriversColl;
var TripsColl = require('./../models/schemas').TripCollection;
var ExpenseMasterColl = require('./../models/schemas').expenseMasterColl;

var Payments = require('./../apis/paymentApi');


var Utils = function () {
};

Utils.prototype.isEmail = function (email) {
    return _.isString(email) && /^[a-zA-Z]\S+@\S+.\S+/.test(email);
};

Utils.prototype.isMobile = function (mob) {
    return /[0-9]{10}/.test(mob);
};

Utils.prototype.isValidPassword = function (password) {
    return _.isString(password) && (password.trim().length > 7);
};

Utils.prototype.isPincode = function (pincode) {
    return /[1-9][0-9]{5}/.test(pincode);
};

Utils.prototype.isValidObjectId = function (id) {
    return id && ObjectId.isValid(id);
};

Utils.prototype.removeEmptyFields = function (obj) {
    var outputObj = {};
    for (var prop in obj) {
        if (_.isString(obj[prop]) && obj[prop].length) {
            outputObj[prop] = obj[prop];
        } else if (!_.isString(obj[prop])) {
            outputObj[prop] = obj[prop];
        }
    }

    return outputObj;
};

Utils.prototype.isValidPhoneNumber = function (phNumber) {
    return phNumber && /^[1-9]\d{9}$/.test(phNumber);
};

Utils.prototype.isValidDateStr = function (dateStr) {
    dateStr = dateStr.substr(0, 10);
    return dateStr && moment(dateStr, 'YYYY-MM-DD', true).isValid();
};

Utils.prototype.populateNameInUsersColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    if(documents === null) documents=[];
    var ids = _.pluck(documents, fieldTopopulate);
//  UsersColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
    GroupsColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var document = documents[i];
                // if(!item.createdBy) item.createdBy = '59f33aa384d7b9b87842eb9f';
                if (document.createdBy) {
                    var user = _.find(userNames, function (users) {
                        return users._id.toString() === document.createdBy.toString();
                    });

                    if (user) {
                        if (!document.attrs) {
                            document.attrs = {};
                        }
                        document.attrs.createdByName = user.userName;
                    }
                }
            }
            result.status = true;
            result.message = 'Error retrieving users';
            result.err = err;
            result.documents = documents;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInDriversCollmultiple = function (truckDocuments, fieldTopopulate, fieldsToGet, callback) {
    var result = {};
    var driverIds = _.pluck(truckDocuments, fieldTopopulate);
    if (!fieldsToGet) {
        return;
    }
    var conditions = {};
    for (var fieldIndex = 0; fieldIndex < fieldsToGet.length; fieldIndex++) {
        conditions[fieldsToGet[fieldIndex]] = 1;
    }
    DriversColl.find({'_id': {$in: driverIds}}, conditions, function (err, driverDocuments) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < truckDocuments.length; i++) {
                var truckDocument = truckDocuments[i];
                var driverDocument = _.find(driverDocuments, function (driver) {
                    if (driver._id && truckDocument[fieldTopopulate]) return driver._id.toString() === truckDocument[fieldTopopulate].toString();
                    else return '';
                });
                if (driverDocument) {
                    if (!truckDocument.attrs) {
                        truckDocument.attrs = {};
                    }
                    for (var fieldIndex = 0; fieldIndex < fieldsToGet.length; fieldIndex++) {
                        truckDocument.attrs[fieldsToGet[fieldIndex]] = driverDocument[fieldsToGet[fieldIndex]];
                    }
                }
            }
            result.status = true;
            result.message = 'Error retrieving names';
            result.documents = truckDocuments;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInPartyColl = function (documents, fieldTopopulate, callback) {
    //console.log("==>",documents, fieldTopopulate);
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    //console.log("==>",ids, fieldTopopulate);
    PartyColl.find({'_id': {$in: ids}}, {"name": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var party = _.find(names, function (users) {
                    if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                //console.log(party);
                if (party) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.partyName = party.name;
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInTripLaneColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TripLaneColl.find({'_id': {$in: ids}}, {"name": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            var tripLane = _.find(names, function (users) {
                if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
            });
            if (tripLane) {
                if (!item.attrs) {
                    item.attrs = {};
                }
                item.attrs.tripLaneName = tripLane.name;
            }
        }
        result.status = true;
        result.message = 'Error retrieving names';
        result.documents = documents;
        result.err = err;
        callback(result);
    });
};

Utils.prototype.populateNameInTrucksColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TrucksColl.find({'_id': {$in: ids}}, {"registrationNo": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Trucks';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trucks = _.find(names, function (users) {
                    if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trucks) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.truckName = Trucks.registrationNo;
                }
            }
            result.status = true;
            result.message = 'Error retrieving names';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInExpenseColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    ExpenseMasterColl.find({'_id': {$in: ids}}, {"expenseName": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving ExpenseNames';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trucks = _.find(names, function (users) {
                    if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trucks) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.expenseName = Trucks.expenseName;
                }
            }
            result.status = true;
            result.message = 'Error retrieving names';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInRolesColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    RolesColl.find({'_id': {$in: ids}}, {"roleName": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Roles';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Roles = _.find(names, function (users) {
                    if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Roles) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.roleName = Roles.roleName;
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.getPaymentsforTrips = function (accountId, documents, callback) {
    var result = {};
    var ids = _.pluck(documents, '_id');
    async.map(ids, function (id, asyncCallback) {
        Payments.getPaymentsOfTrip(accountId, id, function (tripPayments) {
            if (tripPayments.status) {
                var trip = _.find(documents, function (document) {
                    return document._id.toString() === id.toString();
                });
                if (trip) {
                    trip['paymentHistory'] = tripPayments.payments;
                }
            }
            asyncCallback(tripPayments.err, tripPayments.payments);
        });
    }, function (err, trips) {
        if (!trips.status) {
            result.status = false;
            result.message = 'Error retrieving trip payments';
            result.err = err;
            callback(result);
        } else {
            console.log('trips', trips);
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
}


/**
 * Module to clean up when a driver is assigned to truck or vice versa.
 * When a driver is assigned to a truck check if the driver is already assigned to a different truck, if so remove old
 * truck-driver association.
 *
 * Do it in the background, no callback is needed
 */
Utils.prototype.cleanUpTruckDriverAssignment = function (jwt, truckId, driverId) {
    //no valid data
    if (!truckId || !driverId) {
        return;
    }
    TrucksColl.update({
        "_id": {$ne: truckId},
        "accountId": jwt.accountId,
        "driverId": driverId
    }, {$set: {"driverId": null}}, function (err, trucks) {
        if (err) {
            console.error("Error cleaning up the trucks collection");
        }
    });
    TrucksColl.update({
        "_id": truckId,
        "accountId": jwt.accountId
    }, {$set: {"driverId": driverId}}, function (err, trucks) {
        if (err) {
            console.error("Error cleaning up the trucks collection");
        }
    });
    DriversColl.update({
        "_id": {$ne: driverId},
        "accountId": jwt.accountId,
        "truckId": truckId
    }, {$set: {"truckId": null}}, function (err, drivers) {
        console.error("Error cleaning up the drivers collection");
    });
    DriversColl.update({
        "_id": driverId,
        "accountId": jwt.accountId
    }, {$set: {"truckId": truckId}}, function (err, drivers) {
        console.error("Error cleaning up the drivers collection");
    });

};

Utils.prototype.populateNameInTripsColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TripsColl.find({'_id': {$in: ids}}, {"tripId": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Trips';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trips = _.find(names, function (users) {
                    if(item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trips) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.tripId = Trips.tripId;
                }
            }
            result.status = true;
            result.message = 'Error retrieving Trips';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

module.exports = new Utils();