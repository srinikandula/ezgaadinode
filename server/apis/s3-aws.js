var AWS = require('aws-sdk');
var fs=require('fs');
var config = require('./../config/config');


var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId : config.s3.accessKeyId,
    secretAccessKey : config.s3.secretAccessKey,
    signatureVersion: 'v4',
    region: 'ap-south-1'
});

var S3Bucket = function () {
};

S3Bucket.prototype.UploadFile = function (req,callcack) {
    let retObj = {
        status: false,
        messages: []
    };
    let file;
    if(req.files && req.files.files.length>0){
        file=req.files.files[0];
    }else{
        file=req.files.files;
    }
    let accountId=req.jwt.accountId;
    let folder;
    if(req.body.content){
        folder=req.body.content.folder;
    }else{
        folder=req.body.folder;
    }

    if(!file){
        retObj.messages.push("Please provide file");
    }
    if(!folder){
        retObj.messages.push("Please provide folder");
    }
    if(retObj.messages.length>0){
        callcack(retObj);
    }else{
        if(file){
            fs.readFile(file.path, function (err, data) {
                if (err) {
                    retObj.messages.push("File upload failed,"+JSON.stringify(err));
                   callcack(retObj);
                }else{
                    var newFileKey=accountId+"/"+folder+"/"+Date.now();
                    let base64Data = new Buffer(data,'binary');
                    var params = {Bucket:config.s3.bucketName, Key: newFileKey, Body: base64Data};
                    s3.upload(params,function (err,s3data) {
                        if(err){
                            retObj.messages.push("File upload failed,"+JSON.stringify(err.message));
                            callcack(retObj);
                        }else{
                           retObj.data={
                               fileName:file.originalFilename,
                               key:s3data.key,
                               path:s3data.Location
                           };
                           retObj.status=true;
                           callcack(retObj);
                        }
                    })
                }
            });
        }else{
            retObj.messages.push("Please provide file");
            callcack(retObj);
        }

    }
};

S3Bucket.prototype.getS3FilePath=function (fileKey,callback) {
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

S3Bucket.prototype.deleteFileFromS3Bucket=function (req,callback) {
    var retObj={
        status:false,
        messages:[]
    };
    var key=req.query.key;
    if(!key){
        retObj.messages.push("Please provide key");
        callback(retObj);
    }else{
        var obj = {
            Bucket: config.s3.bucketName,
            Delete: { // required
                Objects: [ // required
                    {
                        Key: key // required
                    }
                ]
            },
        };

        s3.deleteObjects(obj, function(err, data) {
            if (err){
                retObj.messages.push("please try again , "+JSON.stringify(err.message));
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push("File successfully deleted");
                callback(retObj);
            }
        });
    }

};

module.exports = new S3Bucket();