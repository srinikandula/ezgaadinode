var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var UsersColl = require('./../models/schemas').UsersColl;
var DriversColl = require('./../models/schemas').DriversColl;
var PartyColl = require('./../models/schemas').PartyCollection;
var TripLaneColl = require('./../models/schemas').TripLanesCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;
var RolesColl = require('./../models/schemas').Roles;

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
    var ids = _.pluck(documents, fieldTopopulate);
    UsersColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            // if(!item.createdBy) item.createdBy = '59f33aa384d7b9b87842eb9f';
            if(item.createdBy) {
                var user = _.find(names, function (users) {
                    return users._id.toString() === item.createdBy.toString();
                });
                if (user) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.createdByName = user.userName;
                }
            }
        }
        result.status = true;
        result.message = 'Error retrieving users';
        result.err = err;
        result.documents = documents;
        callback(result);
    });
};

Utils.prototype.populateNameInDriversCollmultiple = function (documents, fieldTopopulate, fieldToGet, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    var conditions = {};
    conditions[fieldToGet] = 1;
    console.log(documents,ids);
    DriversColl.find({'_id': {$in: ids}}, conditions, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var driver = _.find(names, function (users) {
                    if(users._id && item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                    else return '';
                });
                if (driver) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs[fieldToGet] = driver[fieldToGet];
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

Utils.prototype.populateNameInPartyColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    PartyColl.find({'_id': {$in: ids}}, {"name": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            var party = _.find(names, function (users) {
                return users._id.toString() === item.bookedFor.toString();
            });
            if (party) {
                if (!item.attrs) {
                    item.attrs = {};
                }
                item.attrs.partyName = party.name;
            }
        }
        result.status = true;
        result.message = 'Error retrieving names';
        result.documents = documents;
        result.err = err;
        callback(result);
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
                return users._id.toString() === item[fieldTopopulate].toString();
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
                    return users._id.toString() === item[fieldTopopulate].toString();
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
                    return users._id.toString() === item[fieldTopopulate].toString();
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

module.exports = new Utils();