var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');

var RolesColl = require('./../models/schemas').Roles;

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');

var Roles = function () {
};

Roles.prototype.addRole = function (jwt, roleDetails,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    if (!roleDetails.roleName || !_.isString(roleDetails.roleName)) {
        retObj.messages.push("Please provide valid role name");
        analyticsService.create(req,serviceActions.add_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }

    if (!retObj.messages.length) {
        RolesColl.findOne({roleName: roleDetails.roleName}, function (err, role) {
            if (err) {
                retObj.messages.push("Error, try again!");
                analyticsService.create(req,serviceActions.add_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (role) {
                retObj.messages.push("Role already exists");
                analyticsService.create(req,serviceActions.add_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else {
                roleDetails.createdBy = jwt.id;
                roleDetails.updatedBy = jwt.id;

                var insertDoc = new RolesColl(roleDetails);
                insertDoc.save(function (err) {
                    if (err) {
                        retObj.messages.push("Error, try Again");
                        analyticsService.create(req,serviceActions.add_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.messages.push("Successfully Added");
                        analyticsService.create(req,serviceActions.add_role,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                        callback(retObj);
                    }
                });
            }
        });
    }
};

Roles.prototype.getRoles = function (pageNumber,req, callback) {
    var result = {
        status: false,
        messages: []
    };

    if (!pageNumber) {
        pageNumber = 1;
    } else if (!_.isNumber(Number(pageNumber))) {
        result.messages.push('Invalid page number');
        analyticsService.create(req,serviceActions.get_roles_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.messages},function(response){ });
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
            analyticsService.create(req,serviceActions.get_roles_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:result.messages},function(response){ });
            callback(result);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.count = results.count;
            result.roles = results.roles;
            analyticsService.create(req,serviceActions.get_roles,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(result);
        }
    });
};

Roles.prototype.getAllRoles = function (req,callback) {
    var result = {
        status: false,
        messages: []
    };
    RolesColl.find({}, {roleName: 1}, function (err, roles) {
        if (err) {
            result.messages.push('Error getting roles');
            analyticsService.create(req,serviceActions.get_all_roles_err,{accountId:req.jwt.id,success:false,messages:result.messages},function(response){ });
            callback(result);
        } else {
            result.status = true;
            result.messages.push('Success');
            result.roles = roles;
            analyticsService.create(req,serviceActions.get_all_roles,{accountId:req.jwt.id,success:true},function(response){ });
            callback(result);
        }
    });
};

Roles.prototype.getRole = function (id,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    RolesColl.findOne({_id: id}, function (err, role) {
        if (err) {
            retObj.messages.push('Error getting role');
            analyticsService.create(req,serviceActions.get_role_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.role = role;
            analyticsService.create(req,serviceActions.get_role,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

Roles.prototype.updateRole = function (jwt, roleDetails,req, callback) {
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
                analyticsService.create(req,serviceActions.update_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            } else if (role) {
                retObj.status = true;
                retObj.messages.push("Role updated successfully");
                analyticsService.create(req,serviceActions.update_role,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            } else {
                retObj.messages.push("Error, finding role");
                analyticsService.create(req,serviceActions.update_role_err,{body:JSON.stringify(req.body),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }
        });
};

Roles.prototype.deleteRole = function (id,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    RolesColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.messages.push('Error deleting role');
            analyticsService.create(req,serviceActions.delete_role_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Successfully Deleted !!');
            analyticsService.create(req,serviceActions.delete_role,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
            callback(retObj);
        }
    });
};

module.exports = new Roles();