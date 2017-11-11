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
    updatedBy: String,
    createdBy: String,
    isActive: {type: Boolean, default:true}
}, {
    timestamps: true
});
var groupSchema = new mongoose.Schema({
    name: String,
    type: String,
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
    isActive: {type: Boolean, default:true},
    attrs: {}
}, {
    timestamps: true
});

var truckSchema = new mongoose.Schema({
    registrationNo: {type: String, unique: true},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    truckType: String,
    driverId: String,
    modelAndYear: String,
    tonnage: String,
    fitnessExpiry: Date,
    permitExpiry: Date,
    insuranceExpiry: Date,
    pollutionExpiry: Date,
    taxDueDate: Date,
    updatedBy: String,
    createdBy: String,
    attrs: {}
}, {timestamps: true});

var tripSchema = new mongoose.Schema({
    date: Date,
    registrationNo: String,
    driver: {type: ObjectId, ref: 'drivers'},
    bookedFor: {type: ObjectId, ref: 'parties'},
    freightAmount: Number, //5000
    advance: Number, //3000
    balance: Number, //2000
    dieselAmount: Number,   //new
    tollgateAmount: Number, //new
    from: String,    //new
    to: String,  //new
    tonnage: Number,    //new
    rate: Number,   //new
    paymentType: String,    //new
    tripId: String,
    remarks: String,    //new
    tripLane: {type: ObjectId, ref: 'tripLanes'},
    tripExpenses: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    updatedBy: String,
    createdBy: String,
    paymentHistory: [],
    attrs: {}
}, {timestamps: true});

var partySchema = new mongoose.Schema({
    name: String,
    contact: Number,
    email: String,
    city: String,
    operatingLane: String,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String,
    attrs: {}
}, {timestamps: true});

var tripLanesSchema = new mongoose.Schema({
    name:String,
    from: String,
    to: String,
    estimatedDistance: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String,
    attrs: {}
}, {timestamps: true});

var driverSchema = new mongoose.Schema({
    fullName: {type: String, trim: true},
    truckId: {type: ObjectId, ref: 'trucks'},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    mobile: Number,
    joiningDate: {type: Date, default: new Date()},
    licenseNumber: String,
    licenseValidity: Date,
    salary:  Number,
    createdBy: String,
    updatedBy: String,
    driverId: String,
    isActive: {type: Boolean, default: true},
    attrs: {}
}, {
    timestamps: true
});
var maintenanceCostSchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    vehicleNumber: String,
    description:String,
    date: Date,
    shedName: String,
    shedArea: String,
    paymentType: String,
    cost: Number,
    updatedBy: String,
    createdBy: String,
    attrs: {}
},{timestamps: true});

var rolesSchema = new mongoose.Schema({
    roleName: String,
    updatedBy: String,
    createdBy: String,
    menus: [],
    attrs: {}
},{timestamps: true});

var payments = new mongoose.Schema({
    tripId: String,
    accountId: String,
    paymentDate: Date,
    amount: Number,
    paymentType: String,
    updatedBy: String,
    createdBy: String,
    attrs: {}
},{timestamps: true});

var expenseMaster = new mongoose.Schema({
    expenseName: String,
    updatedBy: String,
    createdBy: String,
    attrs: {}
},{timestamps: String});

var paymentsReceived = mongoose.Schema({
    tripId: String,
    driverId: String,
    description: String,
    expenseType: String,
    amount: String,
    accountId: String,
    attrs: {}
},{timestamps: String});

module.exports = {
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts'),
    TrucksColl: mongoose.model('trucks', truckSchema, 'trucks'),
    TripCollection: mongoose.model('trips', tripSchema, 'trips'),
    MaintenanceCostColl: mongoose.model('maintenance', maintenanceCostSchema, 'maintenance'),
    PartyCollection: mongoose.model('parties', partySchema, 'parties'),
    DriversColl: mongoose.model('drivers', driverSchema, 'drivers'),
    TripLanesCollection: mongoose.model('tripLanes', tripLanesSchema, 'tripLanes'),
    Roles: mongoose.model('roles', rolesSchema, 'roles'),
    PaymentsColl: mongoose.model('payments', payments, 'payments'),
    expenseMasterColl: mongoose.model('expenseMaster', expenseMaster, 'expenseMaster'),
    paymentsReceivedColl: mongoose.model('paymentsReceived', paymentsReceived, 'paymentsReceived'),
    GroupsColl: mongoose.model('groups', groupSchema, 'groups')
};