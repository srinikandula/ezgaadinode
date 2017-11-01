var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var RolesColl = require('./../models/schemas').Roles;

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');

var Roles = function () {
};

Roles.prototype.addRole = function (jwt, roleDetails, callback) {
    console.log('roles',roleDetails);
    var result = {};
    if (!roleDetails.roleName || !_.isString(roleDetails.roleName)) {
        result.status = false;
        result.message = "Please provide valid role name";
        callback(result);
    } else {
        RolesColl.findOne({roleName: roleDetails.roleName}, function (err, role) {
            if (err) {
                result.status = false;
                result.message = "Error, try again!";
                callback(result);
            } else if (role) {
                result.status = false;
                result.message = "Role already exists";
                console.log(result);
                callback(result);
            } else {
                roleDetails.createdBy = jwt.id;
                roleDetails.updatedBy = jwt.id;
                var insertDoc = new RolesColl(roleDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        result.status = false;
                        result.message = "Error, try Again";
                        callback(result);
                    } else {
                        result.status = true;
                        result.message = "Successfully Added";
                        callback(result);
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
                        if(response.status) {
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
    RolesColl.find({},{roleName:1},function (err, roles) {
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
    var result = {};
    RolesColl.findOne({_id:id}, function (err, role) {
        if (err) {
            result.status = false;
            result.message = 'Error getting role';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Success';
            result.role = role;
            callback(result);
        }
    });
};

Roles.prototype.updateRole = function (jwt, roleDetails, callback) {
    console.log('==>',roleDetails);
    var result = {};
    roleDetails = Utils.removeEmptyFields(roleDetails);
    RolesColl.findOneAndUpdate({_id:roleDetails._id},
        {$set:roleDetails},
        {new: true}, function (err, role) {
            if(err) {
                result.status = false;
                result.message = "Error while updating role, try Again";
                callback(result);
            } else if(role) {
                result.status = true;
                result.message = "Role updated successfully";
                // result.truck = role;
                callback(result);
            } else {
                result.status = false;
                result.message = "Error, finding role";
                callback(result);
            }
        });
};

Roles.prototype.deleteRole = function (id, callback) {
    var result = {};
    RolesColl.remove({_id:id}, function (err) {
        if (err) {
            result.status = false;
            result.message = 'Error deleting role';
            callback(result);
        } else {
            result.status = true;
            result.message = 'Successfully Deleted !!';
            callback(result);
        }
    });
};

module.exports = new Roles();