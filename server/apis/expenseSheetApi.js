var ExpensesSheetColl = require('./../models/schemas').ExpensesSheetColl;
var async = require('async');

var ExpenseSheets = function(){

};
ExpenseSheets.prototype.getExpenseSheets = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
  ExpensesSheetColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,expenseSheets){
      if(err){
          retObj.status = false;
          retObj.messages.push("error in fetching data"+JSON.stringify(err));
          callback(retObj);
      }else{
          retObj.status = true;
          retObj.messages.push("success");
          retObj.data = expenseSheets;
          console.log("retObj.data",retObj.data);
          callback(retObj);
      }
  });
};
ExpenseSheets.prototype.updateExpenseSheet = function(req,callback){
  var retObj = {
      status:false,
      messages:[]
  };
  var expenseSheets = req.body;
  async.each(expenseSheets,function(expenseSheet,asyncCallback){
      ExpensesSheetColl.findOneAndUpdate({_id:expenseSheet._id},{$set:{
              vehicleNo:expenseSheet.vehicleNo,
              date:expenseSheet.date,
              dieselSlip:expenseSheet.dieselSlip,
              from:expenseSheet.from,
              to:expenseSheet.to,
              partyId:expenseSheet.partyId,
              dieselAmount:expenseSheet.dieselAmount,
              cash:expenseSheet.cash,
              lrNo:expenseSheet.lrNo,
              unloadingDate:expenseSheet.unloadingDate,
              driverName:expenseSheet.driverName,
              remarks:expenseSheet.remarks
          }},function(err,updateResult){
                if(err){
                    asyncCallback(true);
                }else{
                    asyncCallback(false);
                }
      });
  },function(err){
    if(err){
        retObj.status = false;
        retObj.messages.push("error in fetching data"+JSON.stringify(err));
        callback(retObj);
    }else{
        retObj.status = true;
        retObj.messages.push("success");
        callback(retObj);
    }
  });
};
module.exports = new ExpenseSheets();
