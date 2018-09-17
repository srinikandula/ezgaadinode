var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
const ObjectId = mongoose.Types.ObjectId;
var log4js = require('log4js')
    , logger = log4js.getLogger("file-log");
var AccountsCollection = require('./../models/schemas').AccountsColl;
var OtpColl = require('./../models/schemas').OtpColl;
var ErpSettingsColl = require('./../models/schemas').ErpSettingsColl;
var serviceActions=require('./../constants/constants');
var analyticsService=require('./../apis/analyticsApi');
var keysColl = require('./../models/schemas').keysColl;
log4js.configure(__dirname + '/../config/log4js_config.json', {reloadSecs: 60});
var config = require('./../config/config');
var userLoginsCollection = require('./../models/schemas').userLogins;
var AccessPermissionsColl = require('./../models/schemas').accessPermissionsColl;

var config_msg91 = config.msg91;
var msg91 = require("msg91")(config_msg91.auth_Key, config_msg91.sender_id, config_msg91.route);

var Groups = function () {
};
function create(req,action,attrs){
    analyticsService.create(req,action,attrs,function(response){ });
}

function logInSuccess(userName,user,req,callback){
    var retObj = {
        status: false,
        messages: []
    };
    retObj.status = true;
    retObj._id = user._id;
    retObj.userName = userName;
    retObj.gpsEnabled = user.accountId.gpsEnabled;
    retObj.erpEnabled = user.accountId.erpEnabled;
    retObj.loadEnabled = user.accountId.loadEnabled;
    retObj.editAccounts = user.accountId.editAccounts;
    retObj.profilePic = user.profilePic;
    retObj.routeConfigEnabled = user.accountId.routeConfigEnabled;
    retObj.type = user.type;
    retObj.role = user.role;
    retObj.permissions = user.userPermissions;



    var obj = {
        id: user._id,
        accountId: user.accountId._id,
        userName: user.userName,
        contactPhone: user.contactPhone,
        type: user.type,
        role: user.role,
    };
    if(user.type === "group") {
        obj.accountId = user.accountId._id;
    };
    user.lastLogin=new Date();
    //save user with last login time
    userLoginsCollection.findOneAndUpdate({},{$set:{"lastLogin": new Date()}}, function (err) {
        if(err){
            retObj.messages.push('Please try again');
            callback(retObj);
        }else{
            jwt.sign(obj, config.jwt.secret, config.jwt.options, function (err, token, options) {
                if (err) {
                    retObj.messages.push('Please try again');
                    callback(retObj);
                } else {
                    retObj.token = token;
                    // callback(retObj);
                    ErpSettingsColl.findOne({accountId: user.accountId._id}, function (err, settingsData) {
                        if (err) {
                            retObj.messages.push('Please try again');
                            callback(retObj);
                        } else if (settingsData) {
                            callback(retObj);
                        } else {
                            var erpSettings = new ErpSettingsColl({accountId: user.accountId._id});
                            erpSettings.save(function (err, saveSettings) {
                                if (err) {
                                    retObj.messages.push('Please try again');
                                    callback(retObj);
                                } else if (saveSettings) {
                                    callback(retObj);
                                } else {
                                    retObj.messages.push('Please try again');
                                    callback(retObj);
                                }
                            })
                        }
                    })
                }
            });


        }
    });
    //create analytics entry for login success
    create(req,serviceActions.login_successful,{body:JSON.stringify(req.body),accountId:user._id,success:true});
};

Groups.prototype.login = function (userName, password, contactPhone,req, callback) {
    logger.info("logging in user:" + userName);

    var retObj = {
        status: false,
        messages: []
    };

    if (!userName) {
        retObj.messages.push('Please provide the Username');
    }

    if (!password) {
        retObj.messages.push('Please provide valid Password');
    }

    if (!contactPhone) {
        retObj.messages.push('Please provide Mobile Number');
    }

    if (retObj.messages.length) {
        create(req,serviceActions.invalid_login_params,{body:JSON.stringify(req.body),success:false,messages:retObj.messages});
        return callback(retObj);
    } else {
        var query = {
            userName: userName,
            password: password,
            contactPhone: parseInt(contactPhone),
        };
        userLoginsCollection.findOne(query).populate("accountId").exec(function(err,user){
            if(err || !user){
                retObj.messages.push('Invalid login details');
                create(req,serviceActions.invalid_user,{body:JSON.stringify(req.body),success:false,error:err});
                callback(retObj);
            }else if(user.password === password ){
                logInSuccess(userName,user,req,callback);
            }
        });

    }
};

Groups.prototype.forgotPassword = function (contactPhone,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!contactPhone || !/^\d{10}$/.test(contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else {
        AccountsCollection.findOne({contactPhone: contactPhone}, function (err, data) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Error finding user");
                callback(retObj);
            } else if (data) {
                var d = new Date();
                d.setMinutes(d.getMinutes() + 6);
                var otp = Math.floor(100000 + Math.random() * 9000);
                var otpCollection = new OtpColl({
                    otp: otp,
                    contactPhone: contactPhone,
                    accountId: data._id,
                    expaireIn: new Date(d) - 0
                });
                otpCollection.save(function (err, otpData) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push("Error finding user");
                        callback(retObj);
                    } else if (otpData) {
                        var message = 'Hi, ' + data.userName + ' \n Your one time password for EasyGaadi is : ' + otp;
                        msg91.send(contactPhone, message, function (err, response) {
                            if (err) {
                                retObj.status = false;
                                retObj.messages.push("Error finding user");
                                callback(retObj);
                            } else {
                                retObj.status = true;
                                retObj.messages.push("OTP sent successfully");
                                retObj.otp = otp;
                                callback(retObj);
                            }
                        });

                    } else {
                        retObj.status = false;
                        retObj.messages.push("Error finding user");
                        callback(retObj);
                    }
                })

            } else {
                retObj.status = false;
                retObj.messages.push("Phone number not found");
                callback(retObj);
            }

        })
    }
};

Groups.prototype.verifyOtp = function (body,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!body.contactPhone || !/^\d{10}$/.test(body.contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else if (!body.otp) {
        retObj.status = false;
        retObj.messages.push("Please enter OTP");
        callback(retObj);
    } else {
        OtpColl.findOne({contactPhone: body.contactPhone, otp: body.otp}, function (err, data) {
            if (err) {
                retObj.status = false;
                retObj.messages.push("Error while verifying OTP");
                callback(retObj);
            } else if (data) {
                if (data.expaireIn < new Date() - 0) {
                    retObj.status = false;
                    retObj.messages.push("OTP Expired");
                    callback(retObj);
                } else {
                    AccountsCollection.findOne({contactPhone: body.contactPhone}, function (err, userData) {
                        if (err) {
                            retObj.status = false;
                            retObj.messages.push("Error while verifying OTP");
                            callback(retObj);
                        } else if (userData) {
                            var message = 'Hi, ' + userData.userName + ' \n Your password for EasyGaadi is : ' + userData.password;
                            msg91.send(body.contactPhone, message, function (err, response) {
                                if (err) {
                                    retObj.status = false;
                                    retObj.messages.push("Error finding user");
                                    callback(retObj);
                                } else {
                                    OtpColl.findOneAndRemove({contactPhone: body.contactPhone}, function (err, otpData) {
                                        if (err) {
                                            retObj.status = false;
                                            retObj.messages.push("Error while reset password");
                                            callback(retObj);
                                        } else if (otpData) {
                                            retObj.status = true;
                                            retObj.messages.push("OTP verified successfully,Password sent to phone");
                                            callback(retObj);
                                        } else {
                                            retObj.status = false;
                                            retObj.messages.push("Error while reset password");
                                            callback(retObj);
                                        }
                                    })
                                }
                            });

                        } else {
                            retObj.status = false;
                            retObj.messages.push("Error while verifying OTP");
                            callback(retObj);
                        }
                    })


                }

            } else {
                retObj.status = false;
                retObj.messages.push("Please enter valid OTP");
                callback(retObj);
            }
        })
    }
}

Groups.prototype.resetPasword = function (body,req, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    if (!body.contactPhone || !/^\d{10}$/.test(body.contactPhone)) {
        retObj.status = false;
        retObj.messages.push("Please enter valid phone number");
        callback(retObj);
    } else if (!body.password) {
        retObj.status = false;
        retObj.messages.push("Please enter password");
        callback(retObj);
    } else {
        AccountsCollection.findOneAndUpdate(
            {contactPhone: body.contactPhone}, {password: body.password}, function (err, data) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push("Error while reset password");
                    callback(retObj);
                } else if (data) {
                    OtpColl.findOneAndRemove({contactPhone: body.contactPhone}, function (err, otpData) {
                        if (err) {
                            retObj.status = false;
                            retObj.messages.push("Error while reset password");
                            callback(retObj);
                        } else if (otpData) {
                            retObj.status = true;
                            retObj.messages.push("Your Password reseted sucessfully");
                            callback(retObj);
                        } else {
                            retObj.status = false;
                            retObj.messages.push("Error while reset password");
                            callback(retObj);
                        }
                    })
                } else {
                    retObj.status = false;
                    retObj.messages.push("Error while reset password");
                    callback(retObj);
                }
            })

    }
}

Groups.prototype.googleLogin = function (userData, callback) {
    console.log('email', userData['email']);
    var retObj = {
        status: false,
        messages: []
    };
    // console.log('userData', userData);
    var query = {
        email: userData['email'],
    };
    AccountsCollection
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                retObj.messages.push('Error finding user');
                callback(retObj);
            }
            if (user) {     //user exists
                jwt.sign({
                    id: user._id,
                    accountId: user._id,
                    // groupAccountId: user.accountId,
                    // userName: user.userName,        //username ??
                    // contactPhone: user.contactPhone,    //contact number??
                    role: user.role
                }, config.jwt.secret, config.jwt.options, function (err, token, options) {
                    if (err) {
                        retObj.messages.push('Please try again');
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj._id = user._id;
                        retObj.token = token;
                        // retObj.userName = userName;
                        retObj.gpsEnabled = user.gpsEnabled;
                        retObj.erpEnabled = user.erpEnabled;
                        retObj.loadEnabled = user.loadEnabled;
                        retObj.editAccounts = user.editAccounts;
                        retObj.profilePic = user.profilePic;
                        retObj.role = user.role;
                        callback(retObj);
                    }
                });
            } else {
                var newId = mongoose.Types.ObjectId();
                var document = {_id:newId, email:userData['email']};
                console.log('document', document);
                var newaccount = new AccountsCollection(document);
                newaccount.save(function (err) {
                    console.log(err);
                    if(err) {
                        retObj.messages.push('Error adding account');
                        callback(retObj);
                    } else {
                        var erpSettings = new ErpSettingsColl({accountId: newId});
                        erpSettings.save(function (err) {
                            if(err) {
                                retObj.messages.push('Error adding Erp settings');
                                callback(retObj);
                            } else {
                                jwt.sign({
                                    id: newId,
                                    accountId: newId,
                                    // groupAccountId: user.accountId,
                                    // userName: user.userName,        //username ??
                                    // contactPhone: user.contactPhone,    //contact number??
                                    type: 'account'
                                }, config.jwt.secret, config.jwt.options, function (err, token, options) {
                                    if (err) {
                                        retObj.messages.push('Please try again');
                                        callback(retObj);
                                    } else {
                                        retObj.status = true;
                                        retObj._id = newId;
                                        retObj.token = token;
                                        // retObj.userName = userName;
                                        retObj.gpsEnabled = false;
                                        retObj.erpEnabled = false;
                                        retObj.loadEnabled = false;
                                        retObj.editAccounts = false;
                                        // retObj.profilePic = user.profilePic;
                                        retObj.type = 'account';
                                        callback(retObj);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
};

Groups.prototype.loginByKeys = function (apiKey,secretKey,req,callback) {
    var retObj={
        status: false,
        messages: []
    };
    var globalAccess=false;
    keysColl.findOne({apiKey:apiKey,secretKey:secretKey},function (err,keyData) {
        if(err){
            retObj.status=false;
            retObj.messages.push('Please try again');
            callback(retObj);
        }else if(keyData){
            globalAccess=keyData.globalAccess;
            var groups=new Groups();
            AccountsCollection.findOne({_id:ObjectId(keyData.accountId)},function (err,account) {
                if(err){
                    retObj.status=false;
                    retObj.messages.push('Please try again');
                    callback(retObj);
                }else if(account){
                    groups.login(account.userName,account.password,account.contactPhone,req,function (accData) {
                        if(accData.status){
                            accData.globalAccess=globalAccess;
                            callback(accData);
                        }else{
                            retObj.status=false;
                            retObj.messages.push('Please try again');
                            callback(retObj);
                        }
                    })
                }else{
                    retObj.status=false;
                    retObj.messages.push('Invalid API or Secret Key');
                    callback(retObj);
                }
            });
        }   else{
            retObj.status=false;
            retObj.messages.push('Invalid API or Secret Key');
            callback(retObj);
        }
    })
};

module.exports = new Groups();