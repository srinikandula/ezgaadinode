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

/**
 *
 * @param folderPath - folder in which the template files are in the source code. For every account the folder path
 * can be different which is configured in the profile page.
 * @param templateName --
 * @param orientation
 * @param data
 * @param callback
 */
PdfGenerator.prototype.createPdf=function (folderPath,templateName,orientation,data,callback) {
  var retObj={
      status:false,
      messages:[]
  };
  // console.log("pdf ....",data);
  if(!templateName){
      retObj.messages.push("Provide template");
  }
  if(!data){
      retObj.messages.push("Provide pdf data");
  }
  if(retObj.messages.length>0){
      callback(retObj);
  }else{
      var filepath = filepath = __dirname+'/../pdfTemplates/'+templateName;
      //If account settings has a template path use that
      if(folderPath) {
          filepath = __dirname+'/../pdfTemplates/'+folderPath+'/'+templateName;
      }
      var html = fs.readFileSync(filepath, 'utf8');
      var document = {
          template: html,
          context: data,
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

