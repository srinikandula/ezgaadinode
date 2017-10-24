"use strict";
var jwt = require('jsonwebtoken');
var config = require('./../config/config');
var staticFilesRegex = /\.(html|css|ico|png|jpeg|jpg|js|eot|svg|ttf|woff|json)$/;

function authMiddleware(req, res, next) {
    if(staticFilesRegex.test(req.url)) {
        next();
    } else if (!req.cookies['token']) {
        res.status(401).send({status: false, message: 'Not Authorized'})
    } else {
        jwt.verify(req.cookies['token'], config.jwt.secret, function (err, decoded) {
            if (err) {
                res.status(401).send({status: false, message: 'Invalid token'})
            } else  {
                req.jwt = decoded;
                console.log('decoded',decoded);
                next();
            }
        });
    }
}

module.exports = authMiddleware;