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
Employees.prototype.countFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    franchiseColl.count({}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_franchise_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = doc;
            analyticsService.create(req, serviceActions.count_franchise, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Employees.prototype.getFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (params.franchise) {
            condition = {
                $or:
                    [
                        {"fullName": new RegExp(params.franchise, "gi")},
                        {"account": new RegExp(params.franchise, "gi")},
                        // {"mobile": new RegExp(parseFloat(params.franchise),"gi")},
                        {"landLine": new RegExp(params.franchise, "gi")},
                        {"city": new RegExp(params.franchise, "gi")},
                        {"state": new RegExp(params.franchise, "gi")},
                    ]
            };
        } else if (params.status) {
            condition = {"status": params.status}
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
                        franchisesCallback(err, franchises);
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
    var franchiseInfo = req.query;

    if (!franchiseInfo.fullName || !_.isString(franchiseInfo.fullName)) {
        retObj.messages.push('Invalid Full Name');
    }
    if (!franchiseInfo.account) {
        retObj.messages.push('Invalid Account');
    }
    if (!franchiseInfo.mobile || !_.isNumber(parseInt(franchiseInfo.mobile))) {
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
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        if (req.files.files) {
            Utils.uploadProfilePic(req.files.files[0], function (uploadResp) {
                if (uploadResp.status) {
                    franchiseInfo.createdBy = req.jwt.id;
                    franchiseInfo.accountId = req.jwt.id;
                    franchiseInfo.profilePic = uploadResp.fileName;
                    saveFranchise(req, franchiseInfo, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
                    analyticsService.create(req, serviceActions.add_employee_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            franchiseInfo.createdBy = req.jwt.id;
            franchiseInfo.accountId = req.jwt.id;
            saveFranchise(req, franchiseInfo, callback);
        }
    }
};

function saveFranchise(req, franchiseInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    franchiseColl.findOne({mobile: franchiseInfo.mobile}, function (err, oldDoc) {
        if (err) {
            retObj.messages.push('Error retrieving franchise');
            analyticsService.create(req, serviceActions.add_franchise_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldDoc) {
            retObj.messages.push('Franchise already exists');
            analyticsService.create(req, serviceActions.add_franchise_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            (new franchiseColl(franchiseInfo)).save(function (err, doc) {
                if (err) {
                    retObj.messages.push('Error saving franchise');
                    analyticsService.create(req, serviceActions.add_franchise_err, {
                        body: JSON.stringify(req.query),
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
                        body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Franchise with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_franchise_err, {
                    body: JSON.stringify(req.query),
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
    var franchiseInfo = req.query;

    if (!franchiseInfo.fullName || !_.isString(franchiseInfo.fullName)) {
        retObj.messages.push('Invalid Full Name');
    }
    if (!franchiseInfo.account) {
        retObj.messages.push('Invalid Account');
    }
    if (!franchiseInfo.mobile || !_.isNumber(parseInt(franchiseInfo.mobile))) {
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
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (req.files.files) {
            Utils.removeProfilePic(franchiseInfo.profilePic, function (removeResp) {
                if (removeResp.status) {
                    Utils.uploadProfilePic(req.files.files[0], function (uploadResp) {
                        if (uploadResp.status) {
                            franchiseInfo.profilePic = uploadResp.fileName;
                            franchiseInfo.updatedBy = req.jwt.id;
                            updateFranchise(req, franchiseInfo, callback);
                        } else {
                            retObj.messages.push("Document uploading failed");
                            analyticsService.create(req, serviceActions.add_employee_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push("Document Removing failed");
                    analyticsService.create(req, serviceActions.add_employee_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            franchiseInfo.updatedBy = req.jwt.id;
            updateFranchise(req, franchiseInfo, callback);
        }
    }
};

function updateFranchise(req, franchiseInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    franchiseColl.findOne({
        _id: franchiseInfo._id,
    }, function (err, oldDoc) {
        if (err) {
            retObj.messages.push('Please Try Again');
            analyticsService.create(req, serviceActions.update_franchise_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldDoc) {
            franchiseColl.findOneAndUpdate({_id: franchiseInfo._id}, {$set: franchiseInfo}, function (err, doc) {
                if (err) {
                    retObj.messages.push('Error updating the franchise');
                    analyticsService.create(req, serviceActions.update_franchise_err, {
                        body: JSON.stringify(req.query),
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
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push('Franchise with Id doesn\'t exist');
                    analyticsService.create(req, serviceActions.update_franchise_err, {
                        body: JSON.stringify(req.query),
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
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Employees.prototype.deleteFranchise = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var franchiseId = req.query.franchiseId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(franchiseId)) {
        retObj.messages.push('Invalid franchise Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_franchise_err, {
            body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
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
                analyticsService.create(req, serviceActions.delete_franchise, {
                    body: JSON.stringify(req.query),
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
Employees.prototype.countRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    adminRoleColl.count({}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_role_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = doc;
            analyticsService.create(req, serviceActions.count_role, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Employees.prototype.getRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {};
    var params = req.query;

    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        var skipNumber = (params.page - 1) * params.size;
        var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
        var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

        if (!params.role) {
            condition = {}
        } else {
            condition = {role: {$regex: '.*' + params.role + '.*'}}
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
                        rolesCallback(err, roles);
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
    if (!roleInfo.status) {
        retObj.messages.push('Invalid Status');
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
            body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Role with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_role_err, {
                    body: JSON.stringify(req.query),
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

    if (!Utils.isValidObjectId(roleInfo._id)) {
        retObj.messages.push('Invalid role Id');
    }
    if (!roleInfo.role) {
        retObj.messages.push('Invalid Role');
    }
    if (!roleInfo.status) {
        retObj.messages.push('Invalid Status');
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
            _id: roleInfo._id,
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
                adminRoleColl.findOneAndUpdate({_id: roleInfo._id}, {$set: roleInfo}, function (err, doc) {
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

Employees.prototype.deleteRole = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var roleId = req.query.roleId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(roleId)) {
        retObj.messages.push('Invalid role Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_role_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        adminRoleColl.remove({_id: roleId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting role');
                analyticsService.create(req, serviceActions.delete_role_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting role');
                analyticsService.create(req, serviceActions.delete_role_err, {
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
                analyticsService.create(req, serviceActions.delete_role, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            }
        });
    }
}
/*Role Stop*/
/*Author : SVPrasadK*/
/*Employee Start*/
Employees.prototype.countEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.count({"role": "employee"}, function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting count');
            analyticsService.create(req, serviceActions.count_employee_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.count = doc;
            analyticsService.create(req, serviceActions.count_employee, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Employees.prototype.getEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var condition = {"role": "employee"};
    var params = req.query;
    if (!params.page) {
        params.page = 1;
    }
    if (retObj.messages.length) {
        callback(retObj);
    } else {
        if (params.employee || params.role) {
            adminRoleColl.find({$or: [{role: {$regex: '.*' + params.role + '.*'}}, {role: {$regex: '.*' + params.employee + '.*'}}]}, function (err, docs) {
                var roleIds = docs.map(function (doc) {
                    return doc._id;
                });

                if (params.employee) {
                    condition = {
                        $and: [{"role": "employee"}, {
                            $or:
                                [
                                    {"firstName": new RegExp(params.employee, "gi")},
                                    {"lastName": new RegExp(params.employee, "gi")},
                                    // {"contactPhone": new RegExp(parseFloat(params.employee),"gi")},
                                    {"email": new RegExp(params.employee, "gi")},
                                    {"city": new RegExp(params.employee, "gi")},
                                    {"state": new RegExp(params.employee, "gi")},
                                    {"adminRoleId": {$in: roleIds}},
                                ]
                        }]
                    };
                    getEmployee(req, condition, callback);
                } else if (params.role) {
                    condition = {"role": "employee", adminRoleId: {$in: roleIds}}
                    getEmployee(req, condition, callback);
                }
            });
        } else {
            getEmployee(req, condition, callback);
        }
    }
};

function getEmployee(req, condition, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};

    async.parallel({
        Employees: function (employeesCallback) {
            AccountsColl
                .find(condition)
                .populate({path: "adminRoleId", select: "role"})
                .sort(sort)
                .skip(skipNumber)
                .limit(limit)
                .lean()
                .exec(function (err, employees) {
                    employeesCallback(err, employees);
                });
        },
        count: function (countCallback) {
            AccountsColl.count({"role": "employee"}, function (err, count) {
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

Employees.prototype.addEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeInfo = req.query;
    if (!employeeInfo.firstName || !_.isString(employeeInfo.firstName)) {
        retObj.messages.push('Invalid First Name');
    }
    if (!employeeInfo.lastName || !_.isString(employeeInfo.lastName)) {
        retObj.messages.push('Invalid Last Name');
    }
    if (!employeeInfo.userName || !_.isString(employeeInfo.userName)) {
        retObj.messages.push('Invalid User Name');
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
    if (!employeeInfo.contactPhone || !_.isNumber(parseInt(employeeInfo.contactPhone))) {
        retObj.messages.push('Invalid Phone Number');
    }
    if (!employeeInfo.adminRoleId) {
        retObj.messages.push('Invalid Role');
    }
    if (!employeeInfo.franchiseId) {
        employeeInfo.franchiseId = undefined;
        //retObj.messages.push('Invalid Franchise');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_employee_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        if (req.files.files) {
            Utils.uploadProfilePic(req.files.files[0], function (uploadResp) {
                if (uploadResp.status) {
                    employeeInfo.profilePic = uploadResp.fileName;
                    employeeInfo.createdBy = req.jwt.id;
                    employeeInfo.accountId = req.jwt.id;
                    employeeInfo.type = "account";
                    employeeInfo.role = "employee";
                    //  employeeInfo.userName = employeeInfo.email;
                    employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
                    saveEmployee(req, employeeInfo, callback);
                } else {
                    retObj.messages.push("Document uploading failed");
                    analyticsService.create(req, serviceActions.add_employee_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            employeeInfo.createdBy = req.jwt.id;
            employeeInfo.accountId = req.jwt.id;
            employeeInfo.type = "account";
            employeeInfo.role = "employee";
            //  employeeInfo.userName = employeeInfo.email;
            employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
            saveEmployee(req, employeeInfo, callback);
        }
    }
};

function saveEmployee(req, employeeInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    }

    AccountsColl.findOne({email: employeeInfo.email, role: "employee"}, function (err, oldDoc) {
        if (err) {
            retObj.messages.push('Error retrieving employee');
            analyticsService.create(req, serviceActions.add_employee_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldDoc) {
            retObj.messages.push('Employee already exists');
            analyticsService.create(req, serviceActions.add_employee_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            (new AccountsColl(employeeInfo)).save(function (err, doc) {
                if (err) {
                    retObj.messages.push('Error saving employee');
                    analyticsService.create(req, serviceActions.add_employee_err, {
                        body: JSON.stringify(req.query),
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
                        body: JSON.stringify(req.query),
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

Employees.prototype.getEmployeeDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var employeeId = req.query.employeeId;

    if (!employeeId || !ObjectId.isValid(employeeId)) {
        retObj.messages.push('Invalid employee Id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_employee_err, {
            body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('Employee with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_employee_err, {
                    body: JSON.stringify(req.query),
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
    var employeeInfo = req.query;

    if (!Utils.isValidObjectId(employeeInfo._id)) {
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
    if (!employeeInfo.contactPhone || !_.isNumber(parseInt(employeeInfo.contactPhone))) {
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
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        if (req.files.files) {
            Utils.removeProfilePic(employeeInfo.profilePic, function (removeResp) {
                if (removeResp.status) {
                    Utils.uploadProfilePic(req.files.files[0], function (uploadResp) {
                        if (uploadResp.status) {
                            employeeInfo.profilePic = uploadResp.fileName;
                            employeeInfo.updatedBy = req.jwt.id;
                            employeeInfo.userName = employeeInfo.userName;
                            employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
                            updateEmployee(req, employeeInfo, callback);
                        } else {
                            retObj.messages.push("Document uploading failed");
                            analyticsService.create(req, serviceActions.add_employee_err, {
                                body: JSON.stringify(req.query),
                                accountId: req.jwt.id,
                                success: false,
                                messages: retObj.messages
                            }, function (response) {
                            });
                            callback(retObj);
                        }
                    });
                } else {
                    retObj.messages.push("Document Removing failed");
                    analyticsService.create(req, serviceActions.add_employee_err, {
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            });
        } else {
            employeeInfo.updatedBy = req.jwt.id;
            employeeInfo.userName = employeeInfo.userName;
            employeeInfo.contactName = employeeInfo.firstName + ' ' + employeeInfo.lastName;
            updateEmployee(req, employeeInfo, callback);
        }
    }
};

function updateEmployee(req, employeeInfo, callback) {
    var retObj = {
        status: false,
        messages: []
    };

    AccountsColl.findOne({
        _id: employeeInfo._id,
    }, function (err, oldDoc) {
        if (err) {
            retObj.messages.push('Please Try Again');
            analyticsService.create(req, serviceActions.update_employee_err, {
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else if (oldDoc) {
            AccountsColl.findOneAndUpdate({_id: employeeInfo._id}, {$set: employeeInfo}, function (err, doc) {
                if (err) {
                    retObj.messages.push('Error updating the employee');
                    analyticsService.create(req, serviceActions.update_employee_err, {
                        body: JSON.stringify(req.query),
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
                        body: JSON.stringify(req.query),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push('Employee with Id doesn\'t exist');
                    analyticsService.create(req, serviceActions.update_employee_err, {
                        body: JSON.stringify(req.query),
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
                body: JSON.stringify(req.query),
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        }
    });
}

Employees.prototype.deleteEmployee = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var employeeId = req.query.employeeId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(employeeId)) {
        retObj.messages.push('Invalid employee Id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_employee_err, {
            body: JSON.stringify(req.query),
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
                    body: JSON.stringify(req.query),
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
                analyticsService.create(req, serviceActions.delete_employee, {
                    body: JSON.stringify(req.query),
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

/*Drop Down API Start*/
Employees.prototype.adminRolesDropDown = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    adminRoleColl.find({}, {_id: 1, role: 1}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error getting roles');
            analyticsService.create(req, serviceActions.dropdown_role_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.dropdown_role, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

Employees.prototype.franchiseDropDown = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    franchiseColl.find({}, {_id: 1, fullName: 1}, function (err, docs) {
        if (err) {
            retObj.messages.push('Error getting franchises');
            analyticsService.create(req, serviceActions.dropdown_franchise_err, {
                accountId: req.jwt.id,
                success: false,
                messages: retObj.messages
            }, function (response) {
            });
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Success');
            retObj.data = docs;
            analyticsService.create(req, serviceActions.dropdown_franchise, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};
/*Drop Down API Stop*/

module.exports = new Employees();