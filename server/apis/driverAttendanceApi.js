var DriversAttendanceColl = require('./../models/schemas').driversAttendanceColl;
var DriversColl = require('./../models/schemas').DriversColl;
var async = require('async');


var Drivers = function(){

};

Drivers.prototype.createDriversAttendance = function(req,callback){
  var retObj = {
      status:false,
      messages:[]
  };
  var today = new Date();
  today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  DriversAttendanceColl.find({accountId:req.jwt.accountId,date:today},function(err,data){
        if(err){
            retObj.status = false;
            retObj.messages.push("Error in finding data"+JSON.stringify(err));
            callback(retObj);
        }else if(data.length>0){
            retObj.status = false;
            retObj.messages.push("Already created");
            callback(retObj);
        }else{
            DriversColl.find({accountId:req.jwt.accountId},function(err,drivers){
                if(err){
                    retObj.status = false;
                    retObj.messages.push("Error in finding data"+JSON.stringify(err));
                    callback(retObj);
                }else if(drivers.length>0){
                    async.each(drivers,function(driver,asyncCallback){
                        var driverObj = {
                            accountId:req.jwt.accountId,
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
          retObj.status = false;
          retObj.messages.push("No data found");
          callback(retObj);
      }
  });
};

module.exports = new Drivers();