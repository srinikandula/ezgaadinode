var ExpensesSheetColl = require('./../models/schemas').ExpensesSheetColl;

var ExpenseSheets = function(){

};
ExpenseSheets.prototype.getExpenseSheets = function(req,callback){
    var retObj = {
        status:false,
        messages:[]
    };
  ExpensesSheetColl.find({accountId:req.jwt.accountId,date:req.params.date},function(err,expenseSheets){
      if(err){
          retObj.status = true;
          retObj.messages.push("success");
          callback(retObj);
      }else{
          retObj.status = true;
          retObj.messages.push("success");
          retObj.data = expenseSheets;
          callback(retObj);
      }
  });
};
module.exports = new ExpenseSheets();
