var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
var erpGpsPlansColl = require('../models/schemas').erpGpsPlansColl;
var TrucksTypesColl = require("../models/schemas").TrucksTypesColl;
var LoadTypesColl = require("../models/schemas").LoadTypesColl;
var GoodsTypesColl = require("../models/schemas").GoodsTypesColl;

var Settings = function () {
};

/*author : Naresh d*/
Settings.prototype.getTruckTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    TrucksTypesColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_types_err, {
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
                analyticsService.create(req, serviceActions.get_truck_types, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages = "No truck types found";
                analyticsService.create(req, serviceActions.get_truck_types_err, {
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

/*author : Naresh d*/
Settings.prototype.addTruckType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.title) {
        retObj.messages.push("Please enter truck type");
    }
    if (!params.tonnes) {
        retObj.messages.push("Please enter tonnes");
    }
    if (!params.mileage) {
        retObj.messages.push("Please enter mileage");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_truck_type_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var truckType = new TrucksTypesColl(params);
        truckType.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_truck_type_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages .push("Truck type added successfully") ;
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_truck_type, {
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

/*author : Naresh d*/
Settings.prototype.getTruckTypeDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_truck_type_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksTypesColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_truck_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_truck_type_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck type not found");
                analyticsService.create(req, serviceActions.get_truck_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

/*author : Naresh d*/
Settings.prototype.updateTruckType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck type");
    }
    if (!params.title) {
        retObj.messages.push("Please enter truck type");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        TrucksTypesColl.findOneAndUpdate({_id: params._id},
            {$set: params},
            {new: true},
            function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.update_truck_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (doc) {
                    retObj.status = true;
                    retObj.messages = "Truck type updated successfully";
                    retObj.data = doc;
                    analyticsService.create(req, serviceActions.update_truck_type, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push("Truck type lead not updated");
                    analyticsService.create(req, serviceActions.update_truck_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            })
    }

};

/*author : Naresh d*/
Settings.prototype.deleteTruckType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid truck type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_truck_type_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksTypesColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_truck_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Truck type deleted successfully");
                analyticsService.create(req, serviceActions.delete_truck_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Truck type not deleted");
                analyticsService.create(req, serviceActions.delete_truck_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })

    }

};

/*author : Naresh d*/
Settings.prototype.getGoodsTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    GoodsTypesColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_goods_types_err, {
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
                analyticsService.create(req, serviceActions.get_goods_types, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages = "No goods types found";
                analyticsService.create(req, serviceActions.get_goods_types_err, {
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

/*author : Naresh d*/
Settings.prototype.addGoodsType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.title) {
        retObj.messages.push("Please enter goods type");
    }

    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_goods_type_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var goodsType = new GoodsTypesColl(params);
        goodsType.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_goods_type_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Goods type added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_goods_type, {
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

/*author : Naresh d*/
Settings.prototype.getGoodsTypeDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid goods type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_goods_type_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        GoodsTypesColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_goods_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_goods_type_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Goods type not found");
                analyticsService.create(req, serviceActions.get_goods_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

/*author : Naresh d*/
Settings.prototype.updateGoodsType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid goods type");
    }
    if (!params.title) {
        retObj.messages.push("Please enter goods type");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        GoodsTypesColl.findOneAndUpdate({_id: params._id},
            {$set: params},
            {new: true},
            function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.update_goods_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (doc) {
                    retObj.status = true;
                    retObj.messages = "Goods type updated successfully";
                    retObj.data = doc;
                    analyticsService.create(req, serviceActions.update_goods_type, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push("Goods type lead not updated");
                    analyticsService.create(req, serviceActions.update_goods_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            })
    }

};

/*author : Naresh d*/
Settings.prototype.deleteGoodsType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid goods type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_goods_type_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksTypesColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_goods_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Goods type deleted successfully");
                analyticsService.create(req, serviceActions.delete_goods_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Goods type not deleted");
                analyticsService.create(req, serviceActions.delete_goods_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })

    }

};

/*author : Naresh d*/
Settings.prototype.getLoadTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    var skipNumber = (params.page - 1) * params.size;
    var limit = params.size ? parseInt(params.size) : Number.MAX_SAFE_INTEGER;
    var sort = params.sort ? JSON.parse(params.sort) : {createdAt: -1};
    LoadTypesColl.find({}).sort(sort)
        .skip(skipNumber)
        .limit(limit)
        .exec(function (err, docs) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_load_types_err, {
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
                analyticsService.create(req, serviceActions.get_load_types, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages = "No load types found";
                analyticsService.create(req, serviceActions.get_load_types_err, {
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

/*author : Naresh d*/
Settings.prototype.addLoadType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params.title) {
        retObj.messages.push("Please enter load type");
    }

    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.add_load_type_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        params.createdBy = req.jwt.id;
        var loadType = new LoadTypesColl(params);
        loadType.save(function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.add_load_type_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages .push( "Load type added successfully");
                retObj.data = doc;
                analyticsService.create(req, serviceActions.add_load_type, {
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

/*author : Naresh d*/
Settings.prototype.getLoadTypeDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid load type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.get_load_type_details_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        LoadTypesColl.findOne({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("Please try again");
                analyticsService.create(req, serviceActions.get_load_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc) {
                retObj.status = true;
                retObj.messages = "Success";
                retObj.data = doc;
                analyticsService.create(req, serviceActions.get_goods_type_details, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Goods type not found");
                analyticsService.create(req, serviceActions.get_goods_type_details_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })
    }
};

/*author : Naresh d*/
Settings.prototype.updateLoadType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.body;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid load type");
    }
    if (!params.title) {
        retObj.messages.push("Please enter loda type");
    }

    if (retObj.messages.length > 0) {
        callback(retObj);
    } else {
        LoadTypesColl.findOneAndUpdate({_id: params._id},
            {$set: params},
            {new: true},
            function (err, doc) {
                if (err) {
                    retObj.messages.push("Please try again");
                    analyticsService.create(req, serviceActions.update_load_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                } else if (doc) {
                    retObj.status = true;
                    retObj.messages = "Load type updated successfully";
                    retObj.data = doc;
                    analyticsService.create(req, serviceActions.update_load_type, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: true
                    }, function (response) {
                    });
                    callback(retObj);
                } else {
                    retObj.messages.push("Load type  not updated");
                    analyticsService.create(req, serviceActions.update_load_type_err, {
                        body: JSON.stringify(req.body),
                        accountId: req.jwt.id,
                        success: false,
                        messages: retObj.messages
                    }, function (response) {
                    });
                    callback(retObj);
                }
            })
    }

};

/*author : Naresh d*/
Settings.prototype.deleteLoadType = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var params = req.query;
    if (!params._id || !ObjectId.isValid(params._id)) {
        retObj.messages.push("Invalid load type");
    }
    if (retObj.messages.length > 0) {
        analyticsService.create(req, serviceActions.delete_load_type_err, {
            body: JSON.stringify(req.query),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        TrucksTypesColl.remove({_id: params._id}, function (err, doc) {
            if (err) {
                retObj.messages.push("please try again");
                analyticsService.create(req, serviceActions.delete_load_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (doc && doc.result.n == 1) {
                retObj.status = true;
                retObj.messages.push("Load type deleted successfully");
                analyticsService.create(req, serviceActions.delete_load_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push("Load type not deleted");
                analyticsService.create(req, serviceActions.delete_load_type_err, {
                    body: JSON.stringify(req.query),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            }
        })

    }

};

/*Author : SVPrasadK*/
/*Plan Start*/
Settings.prototype.getPlan = function (req, callback) {
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

        if (!params.planName) {
            condition = {accountId: req.jwt.accountId}
        } else {
            condition = {accountId: req.jwt.accountId, fullName: {$regex: '.*' + params.planName + '.*'}}
        }

        async.parallel({
            gpsPlans: function (gpsPlansCallback) {
                erpGpsPlansColl
                    .find(condition)
                    .sort(sort)
                    .skip(skipNumber)
                    .limit(limit)
                    .lean()
                    .exec(function (err, gpsPlans) {
                        Utils.populateNameInUsersColl(gpsPlans, "createdBy", function (response) {
                            if (response.status) {
                                gpsPlansCallback(err, response.documents);
                            } else {
                                gpsPlansCallback(err, null);
                            }
                        });
                    });
            },
            count: function (countCallback) {
                erpGpsPlansColl.count(function (err, count) {
                    countCallback(err, count);
                });
            }
        }, function (err, docs) {
            if (err) {
                retObj.messages.push('Error retrieving gps plan');
                analyticsService.create(req, serviceActions.get_plan_err, {
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
                retObj.userId = req.jwt.id;
                retObj.userType = req.jwt.type;
                retObj.data = docs.gpsPlans;
                analyticsService.create(req, serviceActions.get_plan, {
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

Settings.prototype.addPlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var planInfo = req.body;

    if (!planInfo.planName || !_.isString(planInfo.planName)) {
        retObj.messages.push('Invalid Plan Name');
    }
    if (!planInfo.durationInMonths || !_.isNumber(planInfo.durationInMonths)) {
        retObj.messages.push('Invalid Duration Period');
    }
    if (!planInfo.amount || !_.isNumber(planInfo.amount)) {
        retObj.messages.push('Invalid Amount');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.add_plan_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    }
    else {
        erpGpsPlansColl.findOne({planName: planInfo.planName}, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Error retrieving gps plan');
                analyticsService.create(req, serviceActions.add_plan_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                retObj.messages.push('GPS Plan already exists');
                analyticsService.create(req, serviceActions.add_plan_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else {
                planInfo.createdBy = req.jwt.id;
                planInfo.accountId = req.jwt.id;
                (new erpGpsPlansColl(planInfo)).save(function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error saving plan');
                        analyticsService.create(req, serviceActions.add_plan_err, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: false,
                            messages: retObj.messages
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        planInfo.planId = doc._id;
                        retObj.status = true;
                        retObj.messages.push('Success');
                        retObj.data = doc;
                        analyticsService.create(req, serviceActions.add_plan, {
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

Settings.prototype.getPlanDetails = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var gpsPlanId = req.query.gpsPlanId;

    if (!Utils.isValidObjectId(gpsPlanId)) {
        retObj.messages.push('Invalid gps plan id');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.get_plan_err, {
            body: JSON.stringify(req.params),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        erpGpsPlansColl.findOne({"_id": ObjectId(gpsPlanId)}, function (err, doc) {
            if (err) {
                retObj.messages.push('Error retrieving gps plan');
                analyticsService.create(req, serviceActions.get_plan_err, {
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
                analyticsService.create(req, serviceActions.get_plan, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: true
                }, function (response) {
                });
                callback(retObj);
            } else {
                retObj.messages.push('GPS plan with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.get_plan_err, {
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

Settings.prototype.updatePlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var planInfo = req.body;

    if (!Utils.isValidObjectId(planInfo.gpsPlanId)) {
        retObj.messages.push('Invalid gps plan Id');
    }
    if (!planInfo.planName || !_.isString(planInfo.planName)) {
        retObj.messages.push('Invalid Plan Name');
    }
    if (!planInfo.durationInMonths || !_.isNumber(planInfo.durationInMonths)) {
        retObj.messages.push('Invalid Duration Period');
    }
    if (!planInfo.amount || !_.isNumber(planInfo.amount)) {
        retObj.messages.push('Invalid Amount');
    }

    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.update_plan_err, {
            body: JSON.stringify(req.body),
            accountId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        erpGpsPlansColl.findOne({
            _id: planInfo.gpsPlanId,
        }, function (err, oldDoc) {
            if (err) {
                retObj.messages.push('Please Try Again');
                analyticsService.create(req, serviceActions.update_plan_err, {
                    body: JSON.stringify(req.body),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (oldDoc) {
                planInfo.updatedBy = req.jwt.id;
                erpGpsPlansColl.findOneAndUpdate({_id: planInfo.gpsPlanId}, {$set: planInfo}, function (err, doc) {
                    if (err) {
                        retObj.messages.push('Error updating the gps plan');
                        analyticsService.create(req, serviceActions.update_plan_err, {
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
                        analyticsService.create(req, serviceActions.update_plan, {
                            body: JSON.stringify(req.body),
                            accountId: req.jwt.id,
                            success: true
                        }, function (response) {
                        });
                        callback(retObj);
                    } else {
                        retObj.messages.push('GPS plan with Id doesn\'t exist');
                        analyticsService.create(req, serviceActions.update_plan_err, {
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
                retObj.messages.push('GPS plan with Id doesn\'t exist');
                analyticsService.create(req, serviceActions.update_plan_err, {
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

Settings.prototype.deletePlan = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var jwt = req.jwt;
    var gpsPlanId = req.body.gpsPlanId;
    var condition = {};
    var giveAccess = false;

    if (!Utils.isValidObjectId(gpsPlanId)) {
        retObj.messages.push('Invalid gps plan id');
    }
    if (retObj.messages.length) {
        analyticsService.create(req, serviceActions.delete_plan_err, {
            body: JSON.stringify(req.params),
            gpsPlanId: req.jwt.id,
            success: false,
            messages: retObj.messages
        }, function (response) {
        });
        callback(retObj);
    } else {
        erpGpsPlansColl.remove({_id: gpsPlanId}, function (err, returnValue) {
            if (err) {
                retObj.messages.push('Error deleting gps plan');
                analyticsService.create(req, serviceActions.delete_plan_err, {
                    body: JSON.stringify(req.params),
                    accountId: req.jwt.id,
                    success: false,
                    messages: retObj.messages
                }, function (response) {
                });
                callback(retObj);
            } else if (returnValue.result.n === 0) {
                retObj.status = false;
                retObj.messages.push('Unauthorized access or Error deleting gps plan');
                analyticsService.create(req, serviceActions.delete_plan_err, {
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
                analyticsService.create(req, serviceActions.delete_plan, {
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

/*Plan End*/

/*Counts started*/
/*Author : Naresh d*/
Settings.prototype.totalTruckTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    TrucksTypesColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting truck types count');
            analyticsService.create(req, serviceActions.count_truck_types_err, {
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
            analyticsService.create(req, serviceActions.count_truck_types, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

/*Author : Naresh d*/
Settings.prototype.totalGoodsTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    GoodsTypesColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting goods types count');
            analyticsService.create(req, serviceActions.count_goods_types_err, {
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
            analyticsService.create(req, serviceActions.count_goods_types, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};

/*Author : Naresh d*/
Settings.prototype.totalLoadsTypes = function (req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    LoadTypesColl.count(function (err, doc) {
        if (err) {
            retObj.messages.push('Error getting load types count');
            analyticsService.create(req, serviceActions.count_load_types_err, {
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
            analyticsService.create(req, serviceActions.count_load_types, {
                accountId: req.id,
                success: true
            }, function (response) {
            });
            callback(retObj);
        }
    })
};
module.exports = new Settings();