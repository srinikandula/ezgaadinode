"use strict";
var jwt = require('jsonwebtoken');
var config = require('./../config/config');
var Groups = require('./../apis/groupsApi');
var staticFilesRegex = /\.(html|css|ico|png|jpeg|jpg|js|eot|svg|ttf|woff|json)$/;

function authMiddleware(req, res, next) {
    var token = req.cookies.token || req.headers.token;
  /*  if(staticFilesRegex.test(req.url)) {
        next();
    } else */if(req.headers.apikey && req.headers.secretkey){
        Groups.loginByKeys(req.headers.apikey,req.headers.secretkey,req,function (result) {
            if(result.status){
                token = result.token;
                jwt.verify(token, config.jwt.secret, function (err, decoded) {
                    if (err) {
                        res.status(401).send({status: false, message: 'Invalid token'})
                    } else {
                        req.body.globalAccess=result.globalAccess;
                        req.jwt = decoded;
                        next();
                    }
                });
            }else{
                res.status(401).send(result)
            }
        })
    } else if (!token) {
        res.status(401).send({status: false, message: 'Not Authorized'})
    } else {
        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            if (err) {
                res.status(401).send({status: false, message: 'Invalid token'})
            } else  {
                if(req.url.startsWith('/v1/cpanel')){
                    if(decoded.role==='employee'){
                        req.jwt = decoded;
                        next();
                    }else{
                        res.status(401).send({status: false, messages: ['Not Authorized']})
                    }
                }else{
                    req.jwt = decoded;
                    next();

                }

            }
        });
    }
}

module.exports = authMiddleware;