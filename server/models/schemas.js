var mongoose = require('mongoose');
var config = require('./../config/config');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect(config.mongo.url, {
    user: config.mongo.user,
    pass: config.mongo.password,
    server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
    replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
});

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
    email: String,
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
    accountId: {type: ObjectId, ref: 'accounts'},
    truckType: String,
    driverId: String,
    modelAndYear: String,
    fitnessExpiry: Number,
    permitExpiry: Number,
    insuranceExpiry: Number,
    pollutionExpiry: Number,
    taxDueDate: Number,
    updatedBy: String,
    createdBy: String
}, {timestamps: true});

var tripSchema = new mongoose.Schema({
    date: Number,
    registrationNo: String,
    driver: {type: ObjectId, ref: 'accounts'},
    bookedFor: {type: ObjectId, ref: 'parties'},
    freightAmount: Number,
    advance: Number,
    balance: Number,
    tripLane: {type: ObjectId, ref: 'tripLanes'},
    tripExpenses: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
}, {timestamps: true});

var partySchema = new mongoose.Schema({
    name: String,
    contact: Number,
    email: String,
    city: String,
    operatingLane: String,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
}, {timestamps: true});

var tripLanesSchema = new mongoose.Schema({
    from: String,
    to: String,
    estimatedDistance: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String
}, {timestamps: true});

var driverSchema = new mongoose.Schema({
    fullName: {type: String, trim: true},
    truckId: {type: ObjectId, ref: 'trucks'},
    accountId: {type: ObjectId, ref: 'accounts'},
    mobile: Number,
    joiningDate: {type: Number, default: new Date() - 0},
    licenseValidity: Number,
    salary: {
        value: Number
    }
}, {
    timestamps: true
});

var rolesSchema = new mongoose.Schema({
    roleName: String,
    updatedBy: String,
    createdBy: String,
    menus: []
},{timestamps: true});


module.exports = {
    UsersColl: mongoose.model('users', usersSchema, 'users'),
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts'),
    TrucksColl: mongoose.model('trucks', truckSchema, 'trucks'),
    TripCollection: mongoose.model('trips', tripSchema, 'trips'),
    PartiesCollection: mongoose.model('parties', partySchema, 'parties'),
    TripLanesCollection: mongoose.model('tripLanes', tripLanesSchema, 'tripLanes'),
    DriversColl: mongoose.model('drivers', driverSchema, 'drivers'),
    Roles: mongoose.model('roles', rolesSchema, 'roles')
};