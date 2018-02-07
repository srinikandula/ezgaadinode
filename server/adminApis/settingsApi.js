var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var analyticsService = require('./../apis/analyticsApi');
var serviceActions = require('./../constants/constants');
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
    if (!params.type) {
        retObj.messages.push("Please enter truck type");
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
    if (!params.type) {
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
    if (!params.type) {
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
    if (!params.type) {
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
    if (!params.type) {
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
    if (!params.type) {
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
module.exports = new Settings();