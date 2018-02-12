var AccountsColl = require('./../models/schemas').AccountsColl;

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
                callback(retObj);
            }else{
                retObj.status=true;
                retObj.messages.push('Success');
                retObj.results=accDetails;
                callback(retObj);
            }
        })
    }else{
        retObj.status=false;
        retObj.messages.push('Not Authorized');
        callback(retObj);
    }
};

module.exports = new globalApis();