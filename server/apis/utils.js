var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var nodeMailer = require('nodemailer');
var ObjectId = mongoose.Types.ObjectId;
var config = require('./../config/config');
var UsersColl = require('./../models/schemas').UsersColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var GroupsColl = require('./../models/schemas').GroupsColl;
var DriversColl = require('./../models/schemas').DriversColl;
var PartyColl = require('./../models/schemas').PartyCollection;
var TripLaneColl = require('./../models/schemas').TripLanesCollection;
var TrucksColl = require('./../models/schemas').TrucksColl;
var RolesColl = require('./../models/schemas').Roles;
var DriversCollection = require('./../models/schemas').DriversColl;
var TripsColl = require('./../models/schemas').TripCollection;
var ExpenseMasterColl = require('./../models/schemas').expenseMasterColl;
var adminRoleColl = require('./../models/schemas').adminRoleColl;

var fse = require('fs-extra');
var fs=require('fs');

var AWS = require('aws-sdk');

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId : config.s3.accessKeyId,
    secretAccessKey : config.s3.secretAccessKey,
    signatureVersion: 'v4',
    region: 'ap-south-1'
});

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
    if (documents === null) documents = [];
    var ids = _.pluck(documents, fieldTopopulate);
//  UsersColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
//  GroupsColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
    AccountsColl.find({'_id': {$in: ids}}, {"userName": 1}, function (err, userNames) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving users';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var document = documents[i];
                // if(!item.createdBy) item.createdBy = '59f33aa384d7b9b87842eb9f';
                if (document.createdBy) {
                    var user = _.find(userNames, function (users) {
                        return users._id.toString() === document.createdBy.toString();
                    });

                    if (user) {
                        if (!document.attrs) {
                            document.attrs = {};
                        }
                        document.attrs.createdByName = user.userName;
                    }
                }
            }
            result.status = true;
            result.message = 'Success';
            result.err = err;
            result.documents = documents;
            callback(result);
        }
    });
};


Utils.prototype.populateNameInDriversCollmultiple = function (truckDocuments, fieldTopopulate, fieldsToGet, callback) {
    var result = {};
    var driverIds = _.pluck(truckDocuments, fieldTopopulate);
    if (!fieldsToGet) {
        return;
    }
    var conditions = {};
    for (var fieldIndex = 0; fieldIndex < fieldsToGet.length; fieldIndex++) {
        conditions[fieldsToGet[fieldIndex]] = 1;
    }
    DriversColl.find({'_id': {$in: driverIds}}, conditions, function (err, driverDocuments) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < truckDocuments.length; i++) {
                var truckDocument = truckDocuments[i];
                var driverDocument = _.find(driverDocuments, function (driver) {
                    if (driver._id && truckDocument[fieldTopopulate]) return driver._id.toString() === truckDocument[fieldTopopulate].toString();
                    else return '';
                });
                if (driverDocument) {
                    if (!truckDocument.attrs) {
                        truckDocument.attrs = {};
                    }
                    for (var fieldIndex = 0; fieldIndex < fieldsToGet.length; fieldIndex++) {
                        truckDocument.attrs[fieldsToGet[fieldIndex]] = driverDocument[fieldsToGet[fieldIndex]];
                    }
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = truckDocuments;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInPartyColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    PartyColl.find({'_id': {$in: ids}}, {"name": 1, "contact": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var party = _.find(names, function (users) {
                    if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (party) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.partyName = party.name;
                    item.attrs.partyContact = party.contact;
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInTripLaneColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TripLaneColl.find({'_id': {$in: ids}}, {"name": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving names';
            result.err = err;
            callback(result);
        }
        for (var i = 0; i < documents.length; i++) {
            var item = documents[i];
            var tripLane = _.find(names, function (users) {
                if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
            });
            if (tripLane) {
                if (!item.attrs) {
                    item.attrs = {};
                }
                item.attrs.tripLaneName = tripLane.name;
            }
        }
        result.status = true;
        result.message = 'Error retrieving names';
        result.documents = documents;
        result.err = err;
        callback(result);
    });
};

Utils.prototype.populateNameInTrucksColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TrucksColl.find({'_id': {$in: ids}}, {"registrationNo": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Trucks';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trucks = _.find(names, function (users) {
                    if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trucks) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.truckName = Trucks.registrationNo;
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            callback(result);
        }
    });
};

Utils.prototype.populateNameInExpenseColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    ExpenseMasterColl.find({'_id': {$in: ids}}, {"expenseName": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving ExpenseNames';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trucks = _.find(names, function (users) {
                    if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trucks) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.expenseName = Trucks.expenseName;
                }
            }
            result.status = true;
            result.message = 'Error retrieving names';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};
Utils.prototype.populatePartyNameInExpenseColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    PartyColl.find({'_id': {$in: ids}}, {"name": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving ExpenseNames';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var supplier = _.find(names, function (users) {

                    if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (supplier) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.partyName = supplier.name;
                }

            }
            result.status = true;
            result.message = 'Error retrieving names';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};
Utils.prototype.populateNameInRolesColl = function (documents, fieldToPopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldToPopulate);
    RolesColl.find({'_id': {$in: ids}}, {"role": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Roles';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Roles = _.find(names, function (users) {
                    if (item[fieldToPopulate]) return users._id.toString() === item[fieldToPopulate].toString();
                });
                if (Roles) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.role = Roles.role;
                }
            }
            result.status = true;
            result.message = 'Success';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};


/**
 * Module to clean up when a driver is assigned to truck or vice versa.
 * When a driver is assigned to a truck check if the driver is already assigned to a different truck, if so remove old
 * truck-driver association.
 *
 * Do it in the background, no callback is needed
 */
Utils.prototype.cleanUpTruckDriverAssignment = function (jwt, truckId, driverId) {
    //no valid data
    if (!truckId || !driverId) {
        return;
    }
    TrucksColl.update({
        "_id": {$ne: truckId},
        "accountId": jwt.accountId,
        "driverId": driverId
    }, {$set: {"driverId": null}}, function (err, trucks) {
        if (err) {
            console.error("Error cleaning up the trucks collection");
        }
    });
    TrucksColl.update({
        "_id": truckId,
        "accountId": jwt.accountId
    }, {$set: {"driverId": driverId}}, function (err, trucks) {
        if (err) {
            console.error("Error cleaning up the trucks collection");
        }
    });
    DriversColl.update({
        "_id": {$ne: driverId},
        "accountId": jwt.accountId,
        "truckId": truckId
    }, {$set: {"truckId": null}}, function (err, drivers) {
        console.error("Error cleaning up the drivers collection");
    });
    DriversColl.update({
        "_id": driverId,
        "accountId": jwt.accountId
    }, {$set: {"truckId": truckId}}, function (err, drivers) {
        console.error("Error cleaning up the drivers collection");
    });

};

Utils.prototype.populateNameInTripsColl = function (documents, fieldTopopulate, callback) {
    var result = {};
    var ids = _.pluck(documents, fieldTopopulate);
    TripsColl.find({'_id': {$in: ids}}, {"tripId": 1}, function (err, names) {
        if (err) {
            result.status = false;
            result.message = 'Error retrieving Trips';
            result.err = err;
            callback(result);
        } else {
            for (var i = 0; i < documents.length; i++) {
                var item = documents[i];
                var Trips = _.find(names, function (users) {
                    if (item[fieldTopopulate]) return users._id.toString() === item[fieldTopopulate].toString();
                });
                if (Trips) {
                    if (!item.attrs) {
                        item.attrs = {};
                    }
                    item.attrs.tripId = Trips.tripId;
                }
            }
            result.status = true;
            result.message = 'Error retrieving Trips';
            result.documents = documents;
            result.err = err;
            callback(result);
        }
    });
};

Utils.prototype.getErpSettings = function (erp, accountId) {
    var condition = {};
    var today = new Date();

    if (erp.filterType === "day") {
        condition = {
            "accountId": accountId,
            date: {
                $lte: new Date(today.setHours(0, 0, 0, 0))
            }
        }
    } else if (erp.filterType === "week") {
        condition = {
            "accountId": accountId,
            date: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                $lte: today
            }
        }
    } else if (erp.filterType === "month") {
        condition = {
            "accountId": accountId,
            date: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: today
            }
        }
    } else if (erp.filterType === "year") {
        condition = {
            "accountId": accountId,
            date: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 365)),
                $lte: today
            }
        }
    } else if (erp.filterType === "custom") {
        condition = {
            "accountId": accountId,
            date: {
                $gte: erp.fromDate,
                $lte: erp.toDate
            }
        }
    }
    else if (erp.filterType === "default") {
        condition = {
            "accountId": accountId,
        }
    }
    return condition;
}

Utils.prototype.getErpSettingsForTruckExpiry = function (erp) {
    var output = {};
    var today = new Date();

    if (erp.filterType === "day") {
        output = {
            condition: {
                $lte: today
            },
            type: 'day',
            date: today
        };
    } else if (erp.filterType === "week") {
        output = {
            condition: {
                $lte: new Date(new Date().setDate(new Date().getDate() + 7))

            }, type: 'week',
            date: new Date(new Date().setDate(new Date().getDate() + 7))
        }
    } else if (erp.filterType === "month") {
        output = {
            condition: {
                $lte: new Date(new Date().setDate(new Date().getDate() + 30))
            }, type: 'month',
            date: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    } else if (erp.filterType === "year") {
        output = {
            condition: {
                $lte: new Date(new Date().setDate(new Date().getDate() + 365))
            }, type: 'year',
            date: new Date(new Date().setDate(new Date().getDate() + 365))
        }

    } else if (erp.filterType === "custom") {
        output = {
            condition: {$gte: erp.fromDate, $lte: erp.toDate},
            type: 'custom',
            fromDate: erp.fromDate,
            toDate: erp.toDate
        }
    }
    else if (erp.filterType === "default") {
        output = {
            condition: {
                $lte: new Date(new Date().setDate(new Date().getDate() + 30))
            }, type: 'default',
            date: new Date(new Date().setDate(new Date().getDate() + 30))
        };

    }
    return output;
};

Utils.prototype.uploadDocuments = function (files, callback) {
    var retObj = {
        false: true,
        messages: [],
        fileNames: []
    };
    async.map(files, function (doc, fileCallback) {
        var file = doc.file;
        var fileName = new Date() - 0 + "_" + file.originalFilename;

        fse.copy(file.path, './client/assets/documents/' + fileName, function (err) {
            if (err) {
                retObj.status = false;
                retObj.messages.push('Document uploading failed');
                callback(retObj);
            } else {
                fse.remove(file.path, function (err) {
                    if (err) {
                        retObj.status = false;
                        retObj.messages.push('Document uploading failed');
                        fileCallback(true);
                    } else {

                        retObj.fileNames.push(fileName);
                        fileCallback(false);
                    }

                });

            }
        })
    }, function (err) {
        if (err) {
            retObj.status = false;
            retObj.message.push("Document uploading failed");
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Documents Added Successfully');
            callback(retObj);
        }
    });

};

Utils.prototype.uploadProfilePic = function (file, callback) {
    var retObj = {
        false: true,
        messages: []
    };
    var fileName = new Date() - 0 + "_" + file.originalFileame;
    fse.copy(file.path, './client/images/profile-pics/' + fileName, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Document uploading failed');
            callback(retObj);
        } else {
            fse.remove(file.path, function (err) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Document uploading failed');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Document Added Successfully');
                    retObj.fileName = 'images/profile-pics/' + fileName;
                    callback(retObj);
                }

            });

        }
    })
};

Utils.prototype.removeProfilePic = function (file, callback) {
    var retObj = {
        false: true,
        messages: []
    };

    fse.remove('./client/' + file, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Document removing failed');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Document Added Successfully');
            callback(retObj);
        }

    });
};

Utils.prototype.uploadCustomerDoc = function (file, callback) {
    var retObj = {
        status: false,
        messages: []
    };
    var fileName = new Date() - 0 + "_" + file.originalFilename;
    fse.copy(file.path, './client/assets/documents/customer/' + fileName, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Document uploading failed');
            callback(retObj);
        } else {
            fse.remove(file.path, function (err) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push('Document uploading failed');
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push('Document Added Successfully');
                    retObj.fileName = 'assets/documents/customer/' + fileName;
                    callback(retObj);
                }

            });

        }
    })
};

Utils.prototype.removeCustomerDoc = function (file, callback) {
    var retObj = {
        false: true,
        messages: []
    };

    fse.remove('./client/' + file, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Document removing failed');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Document Removed Successfully');
            callback(retObj);
        }

    });
};

Utils.prototype.removeDoc = function (file, callback) {
    var retObj = {
        false: true,
        messages: []
    };

    fse.remove('./client/assets/documents/' + file, function (err) {
        if (err) {
            retObj.status = false;
            retObj.messages.push('Document removing failed');
            callback(retObj);
        } else {
            retObj.status = true;
            retObj.messages.push('Document Removed Successfully');
            callback(retObj);
        }

    });
};

Utils.prototype.assignTruckTypeToAccount = function (body) {
    var retObj = {
        status: false,
        messages: []
    };
    AccountsColl.findOne({_id: body.accountId, truckTypes: body.truckType}, function (err, doc) {
        if (err) {
            console.log("Please try again");
        } else if (doc) {
            console.log("Type exist");
        } else {
            AccountsColl.update(
                {_id: body.accountId},
                {$push: {truckTypes: body.truckType}},
                function (err, updated) {
                    if (err) {
                        console.log("Error ocurred");
                    } else {
                        console.log("truck type added successfully", updated);
                    }
                }
            );
        }
    })

};

Utils.prototype.uploadAttachmentsToS3 = function (accountId,folderName,files, callcack) {
    var retObj = {
        status: false,
        messages: []
    };

    if (files.length > 0) {
       var attachments=[];
        async.eachSeries(files, function (file, fileCallback) {
            fs.readFile(file.path, function (err, data) {
                if (err) {
                retObj.messages.push("File upload failed");
                fileCallback(err);
                }else{
                    var newFileKey=accountId+"/"+folderName+"/"+Date.now();
                    let base64Data = new Buffer(data,'binary');
                    var params = {Bucket:config.s3.bucketName, Key: newFileKey, Body: base64Data};
                    s3.upload(params,function (err,s3data) {
                        if(err){
                            retObj.messages.push("File upload failed,"+err.message);
                            fileCallback(err);
                        }else{
                            attachments.push({
                                fileName:file.originalFilename,
                                key:s3data.key,
                                path:s3data.Location
                            });
                            fileCallback(false);
                        }
                    })
                }
            });
        }, function (err) {
            if (err) {
                callcack(retObj);
            } else {
                retObj.status=true;
                retObj.attachments=attachments;
                callcack(retObj);
            }
        })
    } else {
        retObj.messages.push("Please provide attachments");
        callcack(retObj);
    }
};

Utils.prototype.getS3FilePath=function (fileKey,callback) {
  var retObj={
      status:false,
      messages:[]
  };
     s3.getSignedUrl('getObject', {
        Bucket: config.s3.bucketName,
        Key: fileKey
    },function (err,doc) {
       if(err){
           retObj.messages("Please try again",err.message);
       }else{
           retObj.status=true;
           retObj.messages.push('success');
           retObj.data=doc;
           callback(retObj);
       }

    });
};

Utils.prototype.deleteS3BucketFile=function (key,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    var params = {
        Bucket: config.s3.bucketName,
        Delete: { // required
            Objects: [ // required
                {
                    Key: key // required
                }
            ]
        },
    };

    s3.deleteObjects(params, function(err, data) {
        if (err){
            retObj.messages.push("please try again , "+err.message);
            callback(retObj);
        }else{
            console.log("data",data);
            retObj.status=true;
            callback(retObj);
        }
    });
};

Utils.prototype.getTruckId=function(accountId,regNumber,callback){
    var retObj={
        status:false,
        messages:[]
    };
    TrucksColl.findOne({registrationNo:regNumber.trim()},function (err,doc) {
        if(err){
            retObj.messages.push("finding truck failed ,"+JSON.stringify(err.message));
            callback(retObj);
        }else if(doc){
            retObj.status=true;
            retObj.data=doc._id;
            callback(retObj);
        }else{
            retObj.messages.push(regNumber+" truck number not found");
            callback(retObj);
        }
    })
};

Utils.prototype.getSupplierId=function (accountId,supplierName,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    PartyColl.findOne({accountId:accountId,name:supplierName.trim()},function (err,doc) {
        if(err){
            retObj.messages.push("finding supplier failed ,"+JSON.stringify(err.message));
            callback(retObj);
        }else if(doc){
            retObj.status=true;
            retObj.data=doc._id;
            callback(retObj);
        }else{
            retObj.messages.push(supplierName+" supplier not found");
            callback(retObj);
        }
    });
};

Utils.prototype.getExpenseTypeId=function (expenseType,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    ExpenseMasterColl.findOne({expenseName:expenseType.trim()},function (err,doc) {
        if(err){
            retObj.messages.push("finding expense type failed ,"+JSON.stringify(err.message));
            callback(retObj);
        }else if(doc){
            retObj.status=true;
            retObj.data=doc._id;
            callback(retObj);
        }else{
            retObj.messages.push(expenseType+" expense type not found");
            callback(retObj);
        }
    });
};

Utils.prototype.getPartyId=function (accountId,partyName,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    PartyColl.findOne({accountId:accountId,name:partyName.trim()},function (err,doc) {
        if(err){
            retObj.messages.push("finding party failed ,"+JSON.stringify(err.message));
            callback(retObj);
        }else if(doc){
            retObj.status=true;
            retObj.data=doc._id;
            callback(retObj);
        }else{
            retObj.messages.push(partyName+" party not found");
            callback(retObj);
        }
    });
};

Utils.prototype.getDriverId=function (accountId,driverName,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    DriversCollection.findOne({accountId:accountId,fullName:driverName.trim()},function (err,doc) {
        if(err){
            retObj.messages.push("finding driver failed ,"+JSON.stringify(err.message));
            callback(retObj);
        }else if(doc){
            retObj.status=true;
            retObj.data=doc._id;
            callback(retObj);
        }else{
            retObj.messages.push(driverName+" driver not found");
            callback(retObj);
        }
    });
};
/*
* get truck ids using truck type and registration number*/
Utils.prototype.getTruckIdsByTruckTypeAndRegNo=function (accountId,truckType,regNumber,callback) {
    var retObj={
        status:false,
        messages:[]
    };

    var condition={
        accountId:accountId
    };
   /* condition.$or=[];
    if(truckType){
        condition.$or.push({truckType:new RegExp("^" + truckType, "i")});
    };
    if(regNumber){
        condition.$or.push({registrationNo:new RegExp("^" + regNumber, "i")});
    };*/
    if(truckType){
        condition.truckType=new RegExp("^" + truckType, "i");
    };
    if(regNumber){
        condition.registrationNo=new RegExp("^" + regNumber, "i");
    }

  TrucksColl.find(condition,{_id:1},function (err,docs) {
      if(err){
          console.log(err);
          retObj.messages.push("Internal server error,"+JSON.stringify(err.message));
          callback(retObj)
      }else{
          retObj.status=true;
          retObj.data=_.pluck(docs,'_id');
          callback(retObj);
      }
  })
};
module.exports = new Utils();