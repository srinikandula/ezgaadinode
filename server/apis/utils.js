var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var UsersColl = require('./../models/schemas').UsersColl;
var DriversColl = require('./../models/schemas').DriversColl;

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
    UsersColl.find({'_id':{$in: ids}},{"userName":1},function (err, names) {
        if(err){
            result.status = false;
            result.message = 'Error retrieving users';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            // if(!item.createdBy) item.createdBy = '59f33aa384d7b9b87842eb9f';
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
        result.status = true;
        result.message = 'Error retrieving users';
        result.documents = documents;
        callback(result);
    });
};

Utils.prototype.populateNameInDriversColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    DriversColl.find({'_id':{$in: ids}},{"fullName":1},function (err, names) {
        if(err){
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            // if(!item.createdBy) item.createdBy = '59f33aa384d7b9b87842eb9f';
            var driver = _.find(names, function (users) {
                return users._id.toString() === item.createdBy.toString();
            });
            if (driver) {
                if (!item.attrs) {
                    item.attrs = {};
                }
                item.attrs.driverName = driver.fullName;
            }
        }
        result.status = true;
        result.message = 'Error retrieving names';
        result.documents = documents;
        callback(result);
    });
};

module.exports = new Utils();