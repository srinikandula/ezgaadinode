var express = require('express');
var OpenRouter=express.Router();
// var students=require('../apis/studentApi')
OpenRouter.post('/',function(req,res){
students.addStudent(req,req.body,function(result){
    res.send(result);
    }); 
});
module.exports={
    OpenRouter:OpenRouter
};
