var DriversAttendanceColl = require('./../models/schemas').driversAttendanceColl;
var DriversColl = require('./../models/schemas').DriversColl;
var AccountsColl = require('./../models/schemas').AccountsColl;
var async = require('async');


var Drivers = function(){

};
function createDriverAttendance(account,callback){
    var retObj = {
      status:false,
      messages:[]
    };
    var today = new Date();
    today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    DriversAttendanceColl.find({accountId:account._id,date:today},function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding data"+JSON.stringify(err));
            callback(retObj);
        }else if(data.length>0){
            retObj.status = false;
            retObj.messages.push("Already created");
            callback(retObj);
        }else{
            DriversColl.find({accountId:account._id},function(err,drivers){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("Error in finding data"+JSON.stringify(err));
                    callback(retObj);
                }else if(drivers.length>0){
                    async.each(drivers,function(driver,asyncCallback){
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
                            retObj.messages.push("Error in finding data"+JSON.stringify(err));
                            callback(retObj);
                        }else{
                            retObj.status = true;
                            retObj.messages.push("Driver attendance Sheet created successfully");
                            callback(retObj);
                        }
                    });
                }else{
                    retObj.status = false;
                    retObj.messages.push("No data found");
                    callback(retObj);
                }
            });
        }
    });
};
Drivers.prototype.createDriversAttendance = function(callback){
  var retObj = {
      status:false,
      messages:[]
  };
  AccountsColl.find({},function(err,accounts){
      if(err){
          retObj.status = false;
          retObj.messages.push("Error in finding data"+JSON.stringify(err));
          callback(retObj);
      } else{
          async.each(accounts,function (account,asyncAccCallback) {
              createDriverAttendance(account,function(createCallback){
                  if(createCallback.status){
                      asyncAccCallback(false);
                  }else{
                      asyncAccCallback(true);
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
  DriversAttendanceColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,data){
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
        DriversAttendanceColl.findOneAndUpdate({driverId:driver.driverId,date:driver.date},{$set:{isPresent:driver.isPresent}},function(err,updateResult){
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

module.exports = new Drivers();