var mongoose = require('mongoose');
var config = require('./../config/config');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect(config.mongo.url);//, {user: config.mongo.user, pass: config.mongo.pass});
var connection = mongoose.connection;

connection.once('open', function(){
    console.log('CONNECTED TO MONGODB')
});

connection.on('error', function(err){
    console.log('ERROR CONNECTED TO MONGODB')
});

var accountSchema = new mongoose.Schema({
    accountId : String,
    accountName : { type: String, index: true, unique:true },
    updatedBy : String,
    createdBy : String,
},{ timestamps: true });

var usersSchema = new mongoose.Schema({
    superUser : Boolean,
    accountAdmin : { type: Boolean, index: true },
    active : Boolean,
    accountName : { type: String, index: true },
    firstName : String,
    lastName : String,
    username : { type: String, index: true },
    password : String,
    updatedBy : String,
    createdBy : String,
    attrs: {}
},{ timestamps: true });

module.exports = {
    users : mongoose.model('users', usersSchema),
    accounts : mongoose.model('accounts', accountSchema)
};