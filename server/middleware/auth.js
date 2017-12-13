"use strict";
var jwt = require('jsonwebtoken');
var config = require('./../config/config');
var staticFilesRegex = /\.(html|css|ico|png|jpeg|jpg|js|eot|svg|ttf|woff|json)$/;

function authMiddleware(req, res, next) {
    var token = req.cookies.token || req.headers.token;
    if(staticFilesRegex.test(req.url)) {
        next();
    } else if (!token) {
        res.status(401).send({status: false, message: 'Not Authorized'})
    } else {
        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            if (err) {
                res.status(401).send({status: false, message: 'Invalid token'})
            } else  {
                req.jwt = decoded;
                next();
            }
        });
    }
}

module.exports = authMiddleware;