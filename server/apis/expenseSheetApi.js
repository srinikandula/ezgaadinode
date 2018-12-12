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
            accountBalanceColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,data){
                if(!data.length){
                    var obj = {
                        closingBalance:0,
                        advanceAmount:0,
                        totalAmount:0,
                        expenditureAmount:0,
                        openingBalance:0
                    };
                    data.push(obj);
                }
                balanceCallback(err,data);
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
    async.map(amounts,function (amount,asyncCallback) {
        var obj = {
            accountId:req.jwt.accountId,
            date:req.params.date,
            closingBalance:amount.closingBalance,
            advanceAmount:amount.advanceAmount,
            totalAmount:amount.totalAmount
        };
        if(amount.openingBalance != undefined){
            obj.openingBalance = amount.openingBalance;
        }
        if(amount.expenditureAmount != undefined){
            obj.expenditureAmount = amount.expenditureAmount;
        }
        var tomorrow = new Date(req.params.date);
        var date = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
        var datePlusOne = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        if(amount._id){
            accountBalanceColl.findOneAndUpdate({_id:amount._id},{$set:obj},function(err,result){
                if(err){
                    asyncCallback(err);
                }else{
                    var obj = {
                        accountId:req.jwt.accountId,
                        date:datePlusOne,
                        openingBalance:amount.closingBalance
                    };
                    accountBalanceColl.update({accountId:req.jwt.accountId,date:datePlusOne},obj,{upsert: true},
                        function (errSaved, saved) {
                        if(errSaved){
                            asyncCallback(errSaved);
                        }else{
                            asyncCallback(null);
                        }
                    });
                }
            });
        }else{
            var doc = new accountBalanceColl(obj);
            doc.save(function(err,result){
            if(err){
                retObj.status = false;
                retObj.messages.push("error"+JSON.stringify(err));
                callback(retObj);
            } else{
                var obj = {
                    accountId:req.jwt.accountId,
                    date:datePlusOne,
                    openingBalance:amount.closingBalance
                };
                var doc = new accountBalanceColl(obj);
                doc.save(function(err,result){
                    if(err){
                        asyncCallback(err);

                    }else{
                        asyncCallback(null);

                    }
                });
            }
        });
        }
    },function(err){
        if(err){
            retObj.status = false;
            retObj.messages.push("error"+JSON.stringify(err));
            callback(retObj);
        }else{
            retObj.status = true;
            retObj.messages.push("success");
            callback(retObj);
        }
    });

};

ExpenseSheets.prototype.addNewExpense=function(req,callback){
    var retObj = {
        status: false,
        messages: []
    };
    var expenseDetails = req.body;
    expenseDetails.accountId = req.jwt.accountId;
    var expenseDoc=new ExpensesSheetColl(expenseDetails);
    expenseDoc.save(function(err,expense)
    {
        if(err){
            retObj.status=false;
            retObj.messages.push("error while adding trip, try again ");
            callback(retObj);
        }else{
            retObj.status=true;
            retObj.messages.push("Expense added successfully");
            callback(retObj);
        }
    })

}

module.exports = new ExpenseSheets();
