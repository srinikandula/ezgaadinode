const sgMail = require('@sendgrid/mail');
const sendgrid=require('sendgrid').mail;
var Velocity = require('velocityjs');
var fs = require('fs');
var config = require('./../config/config');
var base64 = require('base-64');

/**
 * Module for sending emails using node mailer
 * @param templateName -- html file name
 * @param subject      -- subject
 * @param to           -- to address
 * @param data         -- data to include in the email
 */

var EmailService = function () {
};

EmailService.prototype.sendEmail = function (data, callback) {
    sgMail.setApiKey(config.sendGrid.apiKey);
    var retObj = {
        status: false,
        messages: []
    };
    var template = null;
    if(!data.templateName) {
        retObj.status = false;
        retObj.messages.push("Please provide template name");
    }
    if(!data.subject){
        retObj.status = false;
        retObj.messages.push("Please provide subject name");
    }
    if(!data.to){
        retObj.status = false;
        retObj.messages.push("Please provide to address");
    }
    if(!data.data){
        retObj.status = false;
        retObj.messages.push("Please provide data for email");
    }
    if (!fs.existsSync(__dirname + '/../emailTemplates/' + data.templateName+'.html')) {
        retObj.status = false;
        retObj.messages.push("Cannot find html template for email");
    }
    if(retObj.messages.length) {
        callback(retObj);
    } else {
        template = fs.readFileSync(__dirname + '/../emailTemplates/' + data.templateName + '.html', 'utf8');
        var mailBody = Velocity.render(template, {emailData: data.data});
        const msg = {
            from: '"Easygaadi"<' + config.smtp.auth.user + '>',
            to: data.to,
            subject: data.subject,
            html: mailBody
        };
        sgMail.send(msg, function (error, info) {
            if (error) {
                retObj.status = false;
                retObj.messages.push("Error while sending report");
                callback(retObj);
            } else {
                retObj.status = true;
                retObj.messages.push("Email sent successfully");
                console.log('email has been sent '+ JSON.stringify(msg));
                callback(retObj);
            }
        });
    }
};

EmailService.prototype.sendEmailWithAttachment = function (data,callback) {
    sgMail.setApiKey(config.sendGrid.apiKey);
    var   attachment = new sgMail.Attachment()
    var retObj = {
        status: false,
        messages: []
    };
    var template = null;
    if(!data.subject){
        retObj.status = false;
        retObj.messages.push("Please provide subject name");
    }
    if(!data.to){
        retObj.status = false;
        retObj.messages.push("Please provide to address");
    }
    if(!data.data){
        retObj.status = false;
        retObj.messages.push("Please provide data for email");
    }
    // if (!fs.existsSync(__dirname + '/../emailTemplates/' + data.templateName+'.html')) {
    //     retObj.status = false;
    //     retObj.messages.push("Cannot find html template for email");
    // }
    if(retObj.messages.length) {
        callback(retObj);
    } else {
        if(data.templateName) {
            template = fs.readFileSync(__dirname + '/../emailTemplates/' + data.templateName + '.html', 'utf8');
            var mailBody = Velocity.render(template, {emailData: data.data});
        }

        fs.readFile(data.data, function(err, csvData) {
            console.log(csvData);
            const msg = {
                from: '"Easygaadi"<' + config.smtp.auth.user + '>',
                to: data.to,
                subject: data.subject,
                files     : [{filename: 'Trip_Report.csv', content: csvData}],
                html: 'Trip Report'
            };
            sgMail.send(msg, function (error, info) {
                if (error) {
                    console.log(error);
                    retObj.status = false;
                    retObj.messages.push("Error while sending report");
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push("Email sent successfully");
                    callback(retObj);
                }
            });
        });
    }
}

function mailObject(data) {
    var helper = require('sendgrid').mail;
    mail = new helper.Mail();
    email = new helper.Email('info@easygaadi.com', "EasyGaadi");
    mail.setFrom(email);
    mail.setSubject("Trip-Report");
    personalization = new helper.Personalization();
    email = new helper.Email(data.to);
    personalization.addTo(email);
    mail.addPersonalization(personalization);
    content = new helper.Content("text/plain", "some text here");
    mail.addContent(content);
    attachment = new helper.Attachment();
    attachment.setContent(data.base64Data);
    attachment.setType("application/csv");
    attachment.setFilename("trip_report.csv");
    attachment.setDisposition("attachment");
    mail.addAttachment(attachment);
    return mail.toJSON()
}

EmailService.prototype.sendEmailWithAttachment2 = function (data,callback) {
    console.log('-----> ',data.data);
    data.base64Data=base64.encode(data.data);   //Buffer.from('Hello World').toString(base64);
    send(mailObject(data),function (result) {
        callback(result);
    });
};

function send(toSend,callback) {
    var sg = require('sendgrid')(config.sendGrid.apiKey);
    var requestBody = toSend;
    var emptyRequest = require('sendgrid-rest').request;
    var requestPost = JSON.parse(JSON.stringify(emptyRequest));
    requestPost.method = 'POST';
    requestPost.path = '/v3/mail/send';
    requestPost.body = requestBody;
    sg.API(requestPost, function (error, response) {
        console.log(response);
        if(error){
            callback({status:false,message:'Error while sending trip report'});
        }else{
            callback({status:true,message:'Trip report sent successfully'});
        }
    })
}

module.exports = new EmailService();