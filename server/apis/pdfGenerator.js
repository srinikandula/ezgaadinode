var AWS = require('aws-sdk');
var fs=require('fs');
var config = require('./../config/config');
var pdf = require('dynamic-html-pdf');
var options = {
    format: "A4",
    orientation: "landscape",//portrait,landscape
    border: "5mm"
};

var PdfGenerator = function () {
};

PdfGenerator.prototype.createPdf=function (template,orientation,data,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  if(!template){
      retObj.messages.push("Provide template");
  }
  if(!data){
      retObj.messages.push("Provide pdf data");
  }
  if(retObj.messages.length>0){
      callback(retObj);
  }else{
      var html = fs.readFileSync(__dirname+'/../pdfTemplates/'+template, 'utf8');
      var document = {
          template: html,
          context: data,
          //path: "./output.pdf"
          type: "buffer"
      };
      options.orientation=orientation;
      pdf.create(document, options)
          .then(res => {
              retObj.status=true;
              retObj.data=res;
            callback(retObj);
          })
          .catch(error => {
              retObj.messages.push("PDF Error,"+JSON.stringify(error));
             callback(retObj)
          });
  }
};

module.exports = new PdfGenerator();

