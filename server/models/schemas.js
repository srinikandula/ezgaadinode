var mongoose = require('mongoose');
var config = require('./../config/config');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect(config.mongo.url, {user: config.mongo.user, pass: config.mongo.password});
var connection = mongoose.connection;

connection.once('open', function () {
    console.log('CONNECTED TO MONGODB')
});

connection.on('error', function (err) {
    console.log('ERROR CONNECTING TO MONGODB', err);
});

var accountSchema = new mongoose.Schema({
    name: {   // name of the account is called accountId
        type: String,
        index: true,
        unique: true
    },
    updatedBy: String,
    createdBy: String
}, {
    timestamps: true
});

var usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    role: String,
    accountId: {
        type: ObjectId, ref: 'accounts'
    },
    userName: {
        type: String,
        index: true,
        unique: true
    },
    password: String,
    updatedBy: String,
    createdBy: String,
    attrs: {}
}, {
    timestamps: true
});

module.exports = {
    UsersColl: mongoose.model('users', usersSchema, 'users'),
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts')
};