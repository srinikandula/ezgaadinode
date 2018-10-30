var DriversAttendanceColl = require('./../models/schemas').driversAttendanceColl;
var DriversColl = require('./../models/schemas').DriversColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');


var Drivers = function(){

};
function createDriverAttendance(account,today,callback){
    var retObj = {
      status:false,
      messages:[]
    };
    DriversColl.find({accountId:account._id},function(err,drivers){

        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding data"+JSON.stringify(err));
            callback(retObj);
        }else if(drivers.length>0){
            async.map(drivers,function(driver,asyncCallback){
                var driverObj = {
                    accountId:account._id,
                    contactPhone:driver.mobile,
                    driverId:driver._id,
                    driverName:driver.fullName,
                    date:today
                };
                var driverAttendanceDoc = new DriversAttendanceColl(driverObj);
                driverAttendanceDoc.save(function(err,result){
                    if(err){
                        asyncCallback(true);
                    } else{
                        asyncCallback(false);
                    }
                });
            },function(err){
                if(err){
                    retObj.status = false;
                    callback(retObj);
                }else{
                    retObj.status = true;
                    callback(retObj);
                }
            });
        }else{
            retObj.status = true;
            retObj.messages.push("No data found");
            callback(retObj);
        }
    });
};
Drivers.prototype.createDriversAttendance = function(today,callback){
  var retObj = {
      status:false,
      messages:[]
  };
  AccountsColl.find({driverSheetEnabled:true},function(err,accounts){
      if(err){
          retObj.status = false;
          retObj.messages.push("Error in finding data"+JSON.stringify(err));
          callback(retObj);
      } else{
          async.map(accounts,function (account,asyncAccCallback) {
              DriversAttendanceColl.find({accountId:account._id,date:today},function(err,data){
                  if(err){
                      asyncAccCallback(true);
                  }else if(!data.length){
                      createDriverAttendance(account,today,function(createCallback){
                          if(createCallback.status){
                              asyncAccCallback(false);
                          }else{
                              asyncAccCallback(true);
                          }
                      });
                  }else{
                      asyncAccCallback(false);
                  }
              });
              },function(err){
              if(err){
                  retObj.status = false;
                  retObj.messages.push("Error in saving");
                  callback(retObj);
              } else{
                  retObj.status = true;
                  retObj.messages.push("Saved successfully");
                  callback(retObj);
              }
          });
      }
  });
};
Drivers.prototype.getDriversAttendance = function(req,callback){
  var retObj = {
      status:false,
      messages:[]
  };
  DriversAttendanceColl.find({accountId:req.jwt.accountId,date:req.params.date}).exec(function(err,data){
      if(err){
          retObj.status = false;
          retObj.messages.push("Error in finding data"+JSON.stringify(err));
          callback(retObj);
      }else if(data.length>0){
          retObj.status = true;
          retObj.messages.push("Success");
          retObj.data = data;
          callback(retObj);
      }else{
          retObj.status = true;
          retObj.messages.push("No data found");
          callback(retObj);
      }
  });
};
Drivers.prototype.updateDriverSheet = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var drivers = req.body;
    async.each(drivers,function(driver,asyncCallback){
        DriversAttendanceColl.findOneAndUpdate({_id:driver._id},{$set:{isPresent:driver.isPresent}},function(err,updateResult){
           if(err){
               asyncCallback(true);
           } else{
               asyncCallback(false);
           }
        });

    },function (err) {
        if(err){
            retObj.status = false;
            retObj.messages.push("error in updating",JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("Updated successfully");
            callback(retObj);
        }
    });
};
Drivers.prototype.getDriversDataByDateRange = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };

    var condition = {accountId:req.jwt.accountId};
    if(req.query.driverId !== 'undefined'){
        condition.driverId = req.query.driverId;
    }
    if(!isNaN(new Date(req.query.fromDate)) && !isNaN(new Date(req.query.toDate))){
        condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)}
    }
    DriversAttendanceColl.find(condition).sort({date:1}).exec(function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in finding data",JSON.stringify(err));
            callback(retObj);
        }else if(data.length>0){
            retObj.status = true;
            retObj.messages.push("success");
            retObj.data = data;
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("No data found");
            retObj.data = [];
            callback(retObj);
        }
    });
};
Drivers.prototype.downloadDriversData = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    Drivers.prototype.getDriversDataByDateRange(req,function(getDataCallback){
      if(getDataCallback.data.length>0){
          var drivers = getDataCallback.data;
          var output = [];
          for(var i=0;i<drivers.length;i++){
             var driverObj = {
                     contactPhone: drivers[i].contactPhone,
                     driverName: drivers[i].driverName,
                     date:drivers[i].date ,
                     isPresent: drivers[i].isPresent
                 };
                 output.push(driverObj);
          }
          retObj.data = output;
          retObj.status = true;
          retObj.messages.push("successful..");
          callback(retObj);
      }else{
          callback(getDataCallback);
      }
    });
};

module.exports = new Drivers();