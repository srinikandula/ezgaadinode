var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var async = require('async');

var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
var GroupsColl = require('./../models/schemas').GroupsColl;
var TrucksColl = require('./../models/schemas').TrucksColl;

log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});

var config = require('./../config/config');
var Utils = require('./utils');
var pageLimits = require('./../config/pagination');
var trucksAPI = require('./truckAPIs');

var Groups = function () {
};

Groups.prototype.addGroup = function (jwt, regDetails, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var unAssignedTrucks = {
        trucks: []
    };

    if (!_.isObject(regDetails) || _.isEmpty(regDetails)) {
        retObj.messages.push("Please fill all the required details");
    }

    if (!regDetails.userName || !_.isString(regDetails.userName)) {
        retObj.messages.push("Please provide user name");
    }

    if (!regDetails.password) {
        retObj.messages.push("Please provide valid password");
    }

    if (retObj.messages.length) {
        callback(retObj);
    } else {
        GroupsColl.findOne({userName: regDetails.userName, name: regDetails.name}, function (err, user) {
            if (err) {
                retObj.messages.push("Error, try again!");
                callback(retObj);
            } else if (user) {
                retObj.messages.push("User already exists");
                callback(retObj);
            } else {
                for (var i = 0; i < regDetails.checkedTrucks.length; i++) {
                    var truck = regDetails.checkedTrucks[i];
                    trucksAPI.findTruck(jwt, truck, function (retTruck) {
                        if (retTruck.truck.groupId) {
                            retObj.messages.push("Truck is already assigned for a group");
                        }
                        else {
                            unAssignedTrucks.trucks.push(retTruck.truck._id)
                        }
                    })
                }
                if (retObj.messages.length) {
                    callback(retObj);
                }
                else {
                    regDetails.createdBy = jwt.id;
                    regDetails.updatedBy = jwt.id;
                    regDetails.accountId = jwt.accountId;
                    regDetails.type = "group";

                    var insertDoc = new GroupsColl(regDetails);
                    insertDoc.save(function (err, group) {
                        if (err) {
                            retObj.messages.push("Error, try Again");
                            callback(retObj);
                        } else {
                            var groupId = group._id;
                            for (var i = 0; i < unAssignedTrucks.trucks.length; i++) {
                                var newTruck = unAssignedTrucks.trucks[i];
                                TrucksColl.findOneAndUpdate({_id: newTruck}, {$set: {"groupId": groupId}}, {new: true}, function (err, truck) {
                                    if (err) {
                                        retObj.messages.push("Error while updating truck, try Again");
                                        callback(retObj);
                                    } else if (truck) {
                                        retObj.messages.push("Truck updated successfully");

                                    } else {
                                        retObj.status = false;
                                        retObj.message.push("Error, finding truck");
                                        callback(retObj);
                                    }
                                })
                            }
                            retObj.status = true;
                            retObj.messages.push("Successfully Created and Added Trucks to the Group");
                            callback(retObj);
                        }
                    });
                }
            }
        });
    }
};

Groups.prototype.login = function (accountName, userName, password, callback) {
    logger.info("logging in user:" + userName);
    var retObj = {
        status: false,
        messages: []
    };

    if (!_.isString(userName)) {
        retObj.messages.push('Please provide the username');
    }

    if (!_.isString(accountName)) {
        retObj.messages.push('Please provide account name');
    }

    if (!Utils.isValidPassword(password)) {
        retObj.messages.push('Please provide valid password');
    }

    if (retObj.messages.length) {
        return callback(retObj);
    } else {

        var query = {
            userName: userName,
            name: accountName
        };
        GroupsColl
            .findOne(query)
            .populate('accountId')
            .exec(function (err, user) {
                if (err) {
                    retObj.messages.push('Error finding user');
                    callback(retObj);
                } else if (!user) {
                    retObj.messages.push("User doesn't exist");
                    callback(retObj);
                } else if ((user.password === password)) {
                    jwt.sign({
                        id: user._id,
                        accountId: user.accountId._id,
                        name: user.name,
                        type: user.type
                    }, config.jwt.secret, config.jwt.options, function (err, token) {
                        if (err) {
                            retObj.messages.push('Please try again');
                            callback(retObj);
                        } else {
                            retObj.status = true;
                            retObj.messages.push("Success");
                            retObj.token = token;
                            retObj.userName = userName;
                            callback(retObj);
                        }
                    });

                } else {
                    retObj.messages.push("Invalid Credentials");
                    callback(retObj);
                }
            });
    }
};

Groups.prototype.update = function (jwt, group, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    group = Utils.removeEmptyFields(group);
    group.updatedBy = jwt.id;
    group.accountId = jwt.accountId;

    GroupsColl.findOneAndUpdate({_id: group._id}, {$set: group}).exec(function (err, savedGroup) {
        if (err) {
            retObj.messages.push("Error, updating group");
            callback(retObj);
        } else if (savedGroup) {
            retObj.status = true;
            retObj.messages.push("Group updated successfully");
            callback(retObj);
        } else {
            retObj.messages.push("Error, finding group");
            callback(retObj);
        }
    });
};


Groups.prototype.getGroups = function (jwt, params, callback) {
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
    //var skipNumber = (pageNumber - 1) * pageLimits.groupsPaginationLimit;
    async.parallel({
        users: function (usersCallback) {
            GroupsColl
                .find({accountId: jwt.accountId, type: "group"})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, users) {
                    async.parallel({
                        createdbyname: function (createdbyCallback) {
                            Utils.populateNameInUsersColl(users, "createdBy", function (response) {
                                createdbyCallback(response.err, response.documents);
                            });
                        },
                        rolesNames: function (rolesCallback) {
                            Utils.populateNameInRolesColl(users, "role", function (response) {
                                rolesCallback(response.err, response.documents);
                            });
                        }
                        // rolesname:
                    }, function (populateErr, populateResults) {
                        usersCallback(populateErr, populateResults);
                    });
                });
        },
        count: function (countCallback) {
            GroupsColl.count({accountId: jwt.accountId, type: "group"}, function (err, count) {
                countCallback(err, count);
            });
        }
    }, function (err, results) {
        if (err) {
            retObj.messages.push('Error retrieving groups');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = results.count;
            retObj.groups = results.users.createdbyname;
            callback(retObj);

        }
    });
};

Groups.prototype.getGroup = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    GroupsColl.findOne({_id: id}, function (err, group) {
        if (err) {
            retObj.messages.push('Error getting Group');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.group = group;
            callback(retObj);
        }
    });
};
//
Groups.prototype.deleteGroup = function (id, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    GroupsColl.remove({_id: id}, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Error deleting group');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            callback(retObj);
        }
    });
};
Groups.prototype.countGroups = function (jwt, callback) {
    var result = {};
    GroupsColl.count({"accountId": jwt.accountId}, function (err, data) {
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

module.exports = new Groups();