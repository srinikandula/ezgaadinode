var RoutesCollection = require('./../models/schemas').RouteConfigColl;

var Routes = function () {
};

Routes.prototype.addRouteConfig = function(Info,callback){
    // console.log("Info",Info);
    var retObj={
        status:false,
        message:""
    };
    var insertDoc = new RoutesCollection(Info);
    insertDoc.save(function(err,result){
        if(err){
            console.log("error...",err);
            retObj.status=false;
            retObj.message="error in saving";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="Saved successfully";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.getRouteConfigs = function(req,callback){
    var retObj={
        status:false,
        message:""
    };
    RoutesCollection.find({},function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.getRouteConfig = function(id,req,callback){
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:id};
    RoutesCollection.find(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.updateRouteConfig= function (Info,req, callback) {
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:Info._id};


    RoutesCollection.findOneAndUpdate(query,Info,function (err,result) {
        if(err){
            retObj.message="Please try again";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="Updated successfully";
            retObj.data=result;
            callback(retObj);
        }
    });
};
Routes.prototype.deleteRouteConfigs = function(Id,callback){
    var retObj={
        status:false,
        message:""
    };
    var query = {_id:Id};
    RoutesCollection.remove(query,function(err,result){
        if(err){
            retObj.status=false;
            retObj.message="error";
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.message="successfull";
            retObj.data=result;
            callback(retObj);
        }
    });
};

module.exports=new Routes();

