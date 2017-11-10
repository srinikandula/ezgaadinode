var nodeMailer = require('nodemailer');
var Velocity = require('velocityjs');
var fs = require('fs');

/**
 * Module for sending emails using node mailer
 * @param jwt
 * @param templateName
 * @param to -- to address
 * @param data
 * @param callback
 */
EmailService.prototype.sendEmail = function (jwt, templateName, to, from, subject, data, callback) {
    console.log(details);
    var retObj = {
        status: false,
        messages: []
    };
    var template = null;
    if(!fs.existsSync(__dirname + '/../emailTemplates/'+templateName)){
        retObj.status = false;
        retObj.messages.push("Error while sending report");
        callback(retObj);
    } else {
        template = fs.readFileSync(__dirname + '/../emailTemplates/'+templateName, 'utf8');
        // var temp = Velocity.render(template, {a: 100, b: {c: 200}});
        var mailBody = Velocity.render(template, {emailData:data});
        var mailoptions = {
            email: 'sai@mtwlabs.com',
            subject: "Easygaadi Test",
            html: mailBody
        };


        Utils.prototype.sendEmail = function(data, callback){
            var retObj = {};
            var transporter = nodeMailer.createTransport(config.smtp);
            var mailOptions = {
                from: '"Easygaadi"<' + config.smtp.auth.user + '>',
                to: data.email,
                subject: data.subject
            };
            if(data.text) mailOptions.text = data.text;
            if(data.html) mailOptions.html = data.html;
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    retObj.status = false;
                    retObj.message = "Error";
                    callback(retObj);
                } else {
                    retObj.status = true;
                    retObj.message = "mail sent successfully";
                    callback(retObj);
                }
            });
        };
        Utils.sendEmail(mailoptions, function (emailsuccess) {
            if (!emailsuccess.status) {
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
};
