var mysql = require('mysql');
var async = require('async');

var config = require('./../config/config');
var migrateDatabase = function() {};
var pool  = mysql.createPool(config.mysql);

migrateDatabase.prototype.getUserData = function (callback) {
    var retObj = {};
    retObj.messages = [];

    var accountsQuery = "select accountId from accounts";
    var groupsQuery = "select accountId from accounts";
}

module.exports = new migrateDatabase();