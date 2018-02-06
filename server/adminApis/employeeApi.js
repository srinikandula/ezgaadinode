var async = require('async');
var _ = require('underscore');
var Utils = require('./../apis/utils');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var AccountsColl = require("../models/schemas").AccountsColl;
var franchiseColl = require("../models/schemas").franchiseColl;
var adminRoleColl = require("../models/schemas").adminRoleColl;

var Employees = function () {
};

/*Author : SVPrasadK*/
/*Franchise Start*/
Employees.prototype.getFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.params;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (!params.contactName) {
            condition = {accountId: req.jwt.accountId}
        } else {
            condition = {accountId: req.jwt.accountId, status: {$regex: '.*' + params.status + '.*'}}
        }

        async.parallel({
            Franchises: function (franchisesCallback) {
                franchiseColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, franchises) {
                        Utils.populateNameInUsersColl(franchises, "createdBy", function (response) {
                            if (response.status) {
                                franchisesCallback(err, response.documents);
                            } else {
                                franchisesCallback(err, null);
                            }
                        });
                    });
            },
            count: function (countCallback) {
                franchiseColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving franchise');
                analyticsService.create(req, serviceActions.get_franchise_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.Franchises;
                analyticsService.create(req, serviceActions.get_franchise, {
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

Employees.prototype.addFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var franchiseInfo = req.body;

    if (!franchiseInfo.fullName || !_.isString(franchiseInfo.fullName)) {
        retObj.messages.push('Invalid Full Name');
    }
    if (!franchiseInfo.account) {
        retObj.messages.push('Invalid Account');
    }
    if (!franchiseInfo.mobile || !_.isNumber(franchiseInfo.mobile)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!franchiseInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!franchiseInfo.address) {
        retObj.messages.push('Invalid Address');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_franchise_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        franchiseColl.findOne({mobile: franchiseInfo.mobile}, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Error retrieving franchise');
                analyticsService.create(req, serviceActions.add_franchise_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                retObj.messages.push('Franchise already exists');
                analyticsService.create(req, serviceActions.add_franchise_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                franchiseInfo.createdBy = req.jwt.id;
                franchiseInfo.accountId = req.jwt.id;
                (new franchiseColl(franchiseInfo)).save(function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error saving franchise');
                        analyticsService.create(req, serviceActions.add_franchise_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        franchiseInfo.franchiseId = doc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.add_franchise, {
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

Employees.prototype.getFranchiseDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var franchiseId = req.query.franchiseId;

    if (!Utils.isValidObjectId(franchiseId)) {
        retObj.messages.push('Invalid franchise Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_franchise_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        franchiseColl.findOne({"_id": ObjectId(franchiseId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving franchise');
                analyticsService.create(req, serviceActions.get_franchise_err, {
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
                analyticsService.create(req, serviceActions.get_franchise, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Franchise with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_franchise_err, {
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

Employees.prototype.updateFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var franchiseInfo = req.body;

    if (!franchiseInfo.fullName || !_.isString(franchiseInfo.fullName)) {
        retObj.messages.push('Invalid Full Name');
    }
    if (!franchiseInfo.account) {
        retObj.messages.push('Invalid Account');
    }
    if (!franchiseInfo.mobile || !_.isNumber(franchiseInfo.mobile)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!franchiseInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!franchiseInfo.address) {
        retObj.messages.push('Invalid Address');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_franchise_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        franchiseColl.findOne({
            _id: franchiseInfo.franchiseId,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_franchise_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                franchiseInfo.updatedBy = req.jwt.id;
                franchiseColl.findOneAndUpdate({_id: franchiseInfo.franchiseId}, {$set: franchiseInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the franchise');
                        analyticsService.create(req, serviceActions.update_franchise_err, {
                            body: JSON.stringify(req.body),
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
                        analyticsService.create(req, serviceActions.update_franchise, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('Franchise with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_franchise_err, {
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
                retObj.messages.push('Franchise with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_franchise_err, {
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

Employees.prototype.deleteFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var franchiseId = req.body.franchiseId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(franchiseId)) {
        retObj.messages.push('Invalid franchise Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_franchise_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        franchiseColl.remove({_id: franchiseId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting franchise');
                analyticsService.create(req, serviceActions.delete_franchise_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting franchise');
                analyticsService.create(req, serviceActions.delete_franchise_err, {
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
                analyticsService.create(req, serviceActions.delete_franchise, {
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
/*Franchise Stop*/
/*Author : SVPrasadK*/
/*Role Start*/
Employees.prototype.getRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.params;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (!params.contactName) {
            condition = {accountId: req.jwt.accountId}
        } else {
            condition = {accountId: req.jwt.accountId, role: {$regex: '.*' + params.role + '.*'}}
        }

        async.parallel({
            Roles: function (rolesCallback) {
                adminRoleColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, roles) {
                        Utils.populateNameInUsersColl(roles, "createdBy", function (response) {
                            if (response.status) {
                                rolesCallback(err, response.documents);
                            } else {
                                rolesCallback(err, null);
                            }
                        });
                    });
            },
            count: function (countCallback) {
                adminRoleColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving role');
                analyticsService.create(req, serviceActions.get_role_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.type = req.jwt.type;
                retObj.data = docs.Roles;
                analyticsService.create(req, serviceActions.get_role, {
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

Employees.prototype.addRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var roleInfo = req.body;

    if (!roleInfo.role) {
        retObj.messages.push('Invalid Role');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_role_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        adminRoleColl.findOne({role: roleInfo.role}, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Error retrieving role');
                analyticsService.create(req, serviceActions.add_role_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                retObj.messages.push('Role already exists');
                analyticsService.create(req, serviceActions.add_role_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                roleInfo.createdBy = req.jwt.id;
                roleInfo.accountId = req.jwt.id;
                (new adminRoleColl(roleInfo)).save(function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error saving role');
                        analyticsService.create(req, serviceActions.add_role_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        roleInfo.roleId = doc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.add_role, {
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

Employees.prototype.getRoleDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var roleId = req.query.roleId;

    if (!Utils.isValidObjectId(roleId)) {
        retObj.messages.push('Invalid role Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_role_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        adminRoleColl.findOne({"_id": ObjectId(roleId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving role');
                analyticsService.create(req, serviceActions.get_role_err, {
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
                analyticsService.create(req, serviceActions.get_role, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Role with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_role_err, {
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

Employees.prototype.updateRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var roleInfo = req.body;

    if (!Utils.isValidObjectId(roleInfo.roleId)) {
        retObj.messages.push('Invalid role Id');
    }
    if (!roleInfo.role) {
        retObj.messages.push('Invalid Role');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_role_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        adminRoleColl.findOne({
            _id: roleInfo.roleId,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_role_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                roleInfo.updatedBy = req.jwt.id;
                adminRoleColl.findOneAndUpdate({_id: roleInfo.roleId}, {$set: roleInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the role');
                        analyticsService.create(req, serviceActions.update_role_err, {
                            body: JSON.stringify(req.body),
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
                        analyticsService.create(req, serviceActions.update_role, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('Role with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_role_err, {
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
                retObj.messages.push('Role with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_role_err, {
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
/*Role Stop*/
/*Author : SVPrasadK*/
/*Employee Start*/
Employees.prototype.getEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.params;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (!params.contactName) {
            condition = {accountId: req.jwt.accountId}
        } else {
            condition = {accountId: req.jwt.accountId, role: {$regex: '.*' + params.role + '.*'}}
        }

        async.parallel({
            Employees: function (employeesCallback) {
                AccountsColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, employees) {
                        Utils.populateNameInUsersColl(employees, "createdBy", function (response) {
                            if (response.status) {
                                employeesCallback(err, response.documents);
                            } else {
                                employeesCallback(err, null);
                            }
                        });
                    });
            },
            count: function (countCallback) {
                AccountsColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving employee');
                analyticsService.create(req, serviceActions.get_employee_err, {
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
                retObj.count = docs.count;
                retObj.accountId = req.jwt.id;
                retObj.type = req.jwt.type;
                retObj.data = docs.Employees;
                analyticsService.create(req, serviceActions.get_employee, {
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

Employees.prototype.addEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeInfo = req.body;

    if (!employeeInfo.firstName || !_.isString(employeeInfo.firstName)) {
        retObj.messages.push('Invalid First Name');
    }
    if (!employeeInfo.lastName || !_.isString(employeeInfo.lastName)) {
        retObj.messages.push('Invalid Last Name');
    }
    if (!employeeInfo.password) {
        retObj.messages.push('Invalid Password');
    }
    if (!employeeInfo.confirmPassword) {
        retObj.messages.push('Invalid Confirm Password');
    }
    if (!employeeInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!employeeInfo.contactPhone || !_.isNumber(employeeInfo.contactPhone)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!employeeInfo.adminRoleId) {
        retObj.messages.push('Invalid Role');
    }
    if (!employeeInfo.franchiseId) {
        retObj.messages.push('Invalid Franchise');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_employee_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        AccountsColl.findOne({email: employeeInfo.email}, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Error retrieving employee');
                analyticsService.create(req, serviceActions.add_employee_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                retObj.messages.push('Employee already exists');
                analyticsService.create(req, serviceActions.add_employee_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                employeeInfo.createdBy = req.jwt.id;
                employeeInfo.accountId = req.jwt.id;
                employeeInfo.type = "employee";
                employeeInfo.userName = employeeInfo.email;
                employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
                (new AccountsColl(employeeInfo)).save(function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error saving employee');
                        analyticsService.create(req, serviceActions.add_employee_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        employeeInfo.employeeId = doc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.add_employee, {
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

Employees.prototype.getEmployeeDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeId = req.query.employeeId;

    if (!Utils.isValidObjectId(employeeId)) {
        retObj.messages.push('Invalid employee Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_employee_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({"_id": ObjectId(employeeId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving employee');
                analyticsService.create(req, serviceActions.get_employee_err, {
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
                analyticsService.create(req, serviceActions.get_employee, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Employee with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_employee_err, {
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

Employees.prototype.updateEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeInfo = req.body;

    if (!Utils.isValidObjectId(employeeInfo.employeeId)) {
        retObj.messages.push('Invalid employee Id');
    }
    if (!employeeInfo.firstName || !_.isString(employeeInfo.firstName)) {
        retObj.messages.push('Invalid First Name');
    }
    if (!employeeInfo.lastName || !_.isString(employeeInfo.lastName)) {
        retObj.messages.push('Invalid Last Name');
    }
    if (!employeeInfo.password) {
        retObj.messages.push('Invalid Password');
    }
    if (!employeeInfo.confirmPassword) {
        retObj.messages.push('Invalid Confirm Password');
    }
    if (!employeeInfo.email) {
        retObj.messages.push('Invalid Email');
    }
    if (!employeeInfo.contactPhone || !_.isNumber(employeeInfo.contactPhone)) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!employeeInfo.adminRoleId) {
        retObj.messages.push('Invalid Role');
    }
    if (!employeeInfo.franchiseId) {
        retObj.messages.push('Invalid Franchise');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_employee_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.findOne({
            _id: employeeInfo.employeeId,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_employee_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                employeeInfo.updatedBy = req.jwt.id;
                employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
                employeeInfo.userName = employeeInfo.email;
                AccountsColl.findOneAndUpdate({_id: employeeInfo.employeeId}, {$set: employeeInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the employee');
                        analyticsService.create(req, serviceActions.update_employee_err, {
                            body: JSON.stringify(req.body),
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
                        analyticsService.create(req, serviceActions.update_employee, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('Employee with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_employee_err, {
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
                retObj.messages.push('Employee with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_employee_err, {
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

Employees.prototype.deleteEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var employeeId = req.body.employeeId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(employeeId)) {
        retObj.messages.push('Invalid employee Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_employee_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        AccountsColl.remove({_id: employeeId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting employee');
                analyticsService.create(req, serviceActions.delete_employee_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting employee');
                analyticsService.create(req, serviceActions.delete_employee_err, {
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
                analyticsService.create(req, serviceActions.delete_employee, {
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
/*Employee Stop*/

module.exports = new Employees();