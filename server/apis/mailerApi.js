var nodeMailer = require('nodemailer');
var Velocity = require('velocityjs');
var fs = require('fs');
var config = require('./../config/config');

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
        if(!config.smtp){
            retObj.status = false;
            retObj.messages.push("Error while finding config file");
            callback(retObj);
        } else {
            var transporter = nodeMailer.createTransport(config.smtp);
            var mailOptions = {
                from: '"Easygaadi"<' + config.smtp.auth.user + '>',
                to: data.to,
                subject: data.subject,
                html: mailBody
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    retObj.status = false;
                    retObj.messages.push("Error while sending report");
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.messages.push("Email sent successfully");
                    callback(retObj);
                }
            });
        }
    }
};

module.exports = new EmailService();