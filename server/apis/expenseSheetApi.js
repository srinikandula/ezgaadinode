var ExpensesSheetColl = require('./../models/schemas').ExpensesSheetColl;
var async = require('async');
var accountBalanceColl = require('./../models/schemas').accountBalanceColl;
var ExpenseSheets = function(){

};
ExpenseSheets.prototype.getExpenseSheets = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    async.parallel({
        expenseSheets:function(expenseSheetCallback){
            ExpensesSheetColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,data){
                expenseSheetCallback(err,data);
            });
        },
        accountBalance:function(balanceCallback){
            var date = new Date(req.params.date);
            var x = new Date(date.setDate(date.getDate()-1));
            // x = x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();
            accountBalanceColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,data){
                if(!data.length) {
                    accountBalanceColl.find({accountId: req.jwt.accountId},{closingBalance:1}).sort({createdAt:-1}).limit(1).exec(function (err, data) {
                        balanceCallback(err,data);
                    });
                }else{
                    balanceCallback(err,data);
                }
            });
        }
    },function(err,results){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in fetching data"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("success");
            retObj.data = results.expenseSheets;
            retObj.amounts = results.accountBalance;
            callback(retObj);
        }
    });

};
ExpenseSheets.prototype.updateExpenseSheet = function(req,callback){
  var retObj = {
      status:false,
      messages:[]
  };
  var expenseSheets = req.body.expense;
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
              remarks:expenseSheet.remarks,
              throughOnline:expenseSheet.throughOnline
          }},function(err,updateResult){
                if(err){
                    asyncCallback(err);
                }else{
                    asyncCallback(null);
                }
      });
  },function(err){
    if(err){
        retObj.status = false;
        retObj.messages.push("error in fetching data"+JSON.stringify(err));
        callback(retObj);
    }else{
        var amounts = req.body.amounts;
        ExpenseSheets.prototype.saveAmounts(amounts,req,function(saveCallback){
            if(saveCallback.status){
                retObj.status = true;
                retObj.messages.push("successfully updated..");
                callback(retObj);
            }else{
                callback(saveCallback)
            }
        });
    }
  });
};
ExpenseSheets.prototype.getExpenseSheet = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    var condition = {};
    if(req.query.truckId !== 'undefined'){
        condition.truckId = req.query.truckId;
    }
    if((req.query.fromDate && req.query.toDate) !== 'undefined'){
        condition.createdAt = {$gte:new Date(req.query.fromDate),$lte:new Date(req.query.toDate)};
    }
    ExpensesSheetColl.find(condition).sort({createdAt:-1}).exec(function(err,expenseSheets){
        if(err){
            retObj.status = false;
            retObj.messages.push("error in fetching data"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("success");
            retObj.data = expenseSheets;
            callback(retObj);
        }
    });

};
ExpenseSheets.prototype.saveAmounts = function(amounts,req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
    // console.log("save amounts......",req.params.date);
    async.map(amounts,function (amount,asyncCallback) {
        var obj = {
            accountId:req.jwt.accountId,
            date:req.params.date,
            openingBalance:amount.openingBalance,
            closingBalance:amount.closingBalance,
            advanceAmount:amount.advanceAmount
        };
        var doc = new accountBalanceColl(obj);
        doc.save(function(err,result){
            if(err){
                retObj.status = false;
                retObj.messages.push("error"+JSON.stringify(err));
                callback(retObj);
            } else{
                retObj.status = true;
                retObj.messages.push("success");
                callback(retObj);
            }
        });
    },function(err){

    });

};

module.exports = new ExpenseSheets();
