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
    address: String,
    contact: Number,
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

var truckSchema = new mongoose.Schema({
    registrationNo: {type: String, unique: true},
    truckType: String,
    modelAndYear: String,
    fitnessExpiry: Number,
    permitExpiry: Number,
    insuranceExpiry: Number,
    pollutionExpiry: Number,
    taxDueDate: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
},{timestamps: true});


var tripSchema = new mongoose.Schema({
    date : Number,
    registrationNo: String,
    driver: {type: ObjectId, ref: 'accounts'},
    bookedFor: {type: ObjectId, ref: 'parties'},
    freightAmount: Number,
    advance: Number,
    balance: Number,
    tripLane:  {type: ObjectId, ref: 'tripLanes'},
    tripExpenses: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
},{timestamps: true});

var partySchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
},{timestamps: true});

var tripLanesSchema = new mongoose.Schema({
    from: String,
    to: String,
    estimatedDistance: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
},{timestamps: true});


module.exports = {
    UsersColl: mongoose.model('users', usersSchema, 'users'),
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts'),
    TrucksColl: mongoose.model('trucks', truckSchema, 'trucks'),
    TripCollection: mongoose.model('trips', tripSchema, 'trips'),
    PartiesCollection: mongoose.model('parties', partySchema, 'parties'),
    TripLanesCollection: mongoose.model('tripLanes', tripLanesSchema, 'tripLanes')
};