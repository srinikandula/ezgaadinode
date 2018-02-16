var AccountsColl = require('./../models/schemas').AccountsColl;
var analyticsService=require('./../apis/analyticsApi');
var serviceActions=require('./../constants/constants');

var globalApis = function () {
};


globalApis.prototype.getContactInfo  = function (accountId,access,req,callback) {
    var retObj={
        status: false,
        messages: []
    };
    if(access){
        AccountsColl.findOne({_id:accountId},{email:1,contactPhone:1,userName:1,_id:0,alternatePhone:1},function (err,accDetails) {
            if(err){
                retObj.status=false;
                retObj.messages.push('Please try again');
                analyticsService.create(req,serviceActions.get_contact_info_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push('Success');
                retObj.results=accDetails;
                analyticsService.create(req,serviceActions.get_contact_info,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:true},function(response){ });
                callback(retObj);
            }
        })
    }else{
        retObj.status=false;
        retObj.messages.push('Not Authorized');
        analyticsService.create(req,serviceActions.get_contact_info_err,{body:JSON.stringify(req.params),accountId:req.jwt.id,success:false,messages:retObj.messages},function(response){ });
        callback(retObj);
    }
};

module.exports = new globalApis();