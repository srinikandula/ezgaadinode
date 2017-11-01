var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var RolesColl = require('./../models/schemas').Roles;

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Roles = function () {
};

Roles.prototype.addRole = function (jwt, roleDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!roleDetails.roleName || !_.isString(roleDetails.roleName)) {
        retObj.messages.push("Please provide valid role name");
        callback(retObj);
    }

    if (!retObj.messages.length) {
        RolesColl.findOne({roleName: roleDetails.roleName}, function (err, role) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (role) {
                retObj.messages.push("Role already exists");
                callback(retObj);
            } else {
                roleDetails.createdBy = jwt.id;
                roleDetails.updatedBy = jwt.id;

                var insertDoc = new RolesColl(roleDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.messages.push("Error, try Again");
                        callback(retObj);
                    } else {
                        retObj.status = false;
                        retObj.messages.push("Successfully Added");
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Roles.prototype.getRoles = function (pageNumber, callback) {
    var result = {
        status: false,
        messages: []
    };

    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.messages.push('Invalid page number');
        return callback(result);
    }

    var skipNumber = (pageNumber - 1) * pageLimits.rolesPaginationLimit;
    async.parallel({
        roles: function (accountsCallback) {
            RolesColl
                .find({})
                .sort({createdAt: 1})
                .skip(skipNumber)
                .limit(pageLimits.rolesPaginationLimit)
                .lean()
                .exec(function (err, roles) {
                    Utils.populateNameInUsersColl(roles, "createdBy", function (response) {
                        if (response.status) {
                            accountsCallback(err, response.documents);
                        } else {
                            accountsCallback(err, null);
                        }
                    });
                });
        },
        count: function (countCallback) {
            RolesColl.count(function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            result.messages.push('Error retrieving roles');
            callback(result);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.count = results.count;
            result.roles = results.roles;
            callback(result);
        }
    });
};

Roles.prototype.getAllRoles = function (callback) {
    var result = {
        status: false,
        messages: []
    };
    RolesColl.find({}, {roleName: 1}, function (err, roles) {
        if (err) {
            result.messages.push('Error getting roles');
            callback(result);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.roles = roles;
            callback(result);
        }
    });
};

Roles.prototype.getRole = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    RolesColl.findOne({_id: id}, function (err, role) {
        if (err) {
            retObj.messages.push('Error getting role');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.role = role;
            callback(retObj);
        }
    });
};

Roles.prototype.updateRole = function (jwt, roleDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    roleDetails = Utils.removeEmptyFields(roleDetails);

    RolesColl.findOneAndUpdate(
        {_id: roleDetails._id},
        {$set: roleDetails},
        {new: true},
        function (err, role) {
            if (err) {
                retObj.messages.push("Error while updating role, try Again");
                callback(retObj);
            } else if (role) {
                retObj.status = true;
                retObj.messages.push("Role updated successfully");
                callback(retObj);
            } else {
                retObj.messages.push("Error, finding role");
                callback(retObj);
            }
        });
};

Roles.prototype.deleteRole = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    RolesColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.messages.push('Error deleting role');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Successfully Deleted !!');
            callback(retObj);
        }
    });
};

module.exports = new Roles();