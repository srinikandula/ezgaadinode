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
    userName: {   // name of the account is called accountId
        type: String,
        index: true,
        unique: true
    },
    contactPhone: Number,
    password: String,
    type: {type: String, default:"account"},
    updatedBy: String,
    createdBy: String,
    isActive: {type: Boolean, default:true},
    gpsEnabled: {type: Boolean, default:false},
    erpEnabled: {type: Boolean, default:false},
    loadEnabled:{type: Boolean, default:false},
    editAccounts: {type: Boolean, default:false}
}, {
    timestamps: true
});
var groupSchema = new mongoose.Schema({
    name: String,
    type: {type: Boolean, default:"account"},
    accountId: {
        type: ObjectId, ref: 'accounts'
    },
    userName: {
        type: String,
        index: true,
        unique: true
    },

    updatedBy: String,
    createdBy: String,
    isActive: {type: Boolean, default:true},
    attrs: {}
}, {
    timestamps: true
});

var truckSchema = new mongoose.Schema({
    registrationNo: String,
    truckType: String,
    modelAndYear: String,
    tonnage: String,
    fitnessExpiry: Date,
    permitExpiry: Date,
    insuranceExpiry: Date,
    tracking_available:Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    driverId: String,
    pollutionExpiry: Date,
    taxDueDate: Date,
    updatedBy: String,
    createdBy: String,
    status: Number,
    attrs: {}
}, {timestamps: true});

var tripSchema = new mongoose.Schema({
    date: Date,
    registrationNo:String, //this will be truck id
    partyId: {type: ObjectId, ref: 'parties'},
    freightAmount: Number, //5000
    tonnage: Number,    //new
    rate: Number,   //new
    tripId: String,
    remarks: String,    //new
    tripLane: String,
    tripExpenses: Number,
    driverId : {type: ObjectId, ref: 'drivers'},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    updatedBy: String,
    createdBy: String,
    paymentHistory: [],
    attrs: {},
    share:{type:Boolean,default:false}
}, {timestamps: true});

var partySchema = new mongoose.Schema({
    name: String,
    contact: Number,
    email: String,
    city: String,
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: String,
    tripLanes:[],
    updatedBy: String,
    createdBy: String,
    attrs: {},
    partyType:String,
    isEmail:{type:Boolean,default:false},
    isSms:{type:Boolean,default:false}
}, {timestamps: true});


var eventDataSchema = new mongoose.Schema({
    transportername: String,
    vehicle_number: String,
    latitude: Number,
    longitude: Number,
    speed: Number,
    distance: Number,
    datetime:Number,
    attrs: {}
}, {timestamps: true});

var driverSchema = new mongoose.Schema({
    fullName: {type: String, trim: true},
    truckId: {type: ObjectId, ref: 'trucks'},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    mobile: Number,
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
var expensesSchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    vehicleNumber: String,
    expenseType: String,
    description:String,
    date: Date,
    cost: Number,
    mode: String,
    updatedBy: String,
    createdBy: String,
    isDefault: {type: Boolean, default: false},
    attrs: {}
},{timestamps: true});

var rolesSchema = new mongoose.Schema({
    roleName: String,
    updatedBy: String,
    createdBy: String,
    menus: [],
    attrs: {}
},{timestamps: true});

var expenseMaster = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    expenseName: String,
    updatedBy: String,
    createdBy: String,
    attrs: {}
},{timestamps: String});

var paymentsReceived = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    partyId: {type: ObjectId, ref: 'parties'},
    description: String,
    amount: Number,
    updatedBy: String,
    createdBy: String,
    date: Date,
    attrs: {}
},{timestamps: String});

var otpSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    otp:Number,
    expaireIn:Number,
    contactPhone:Number
},{timestamps: String});

var notificationsSchema=mongoose.Schema({
    accountId:{type: ObjectId, ref: 'accounts'},
    notificationType:Number,// 0 -SMS, 1-EMAIL, 2-BOTH
    content:String,
    status:{type:Boolean,default:false},
    tripId:{type: ObjectId, ref: 'trips'},
    message:String
},{timestamps: String})

module.exports = {
    EventDataCollection: mongoose.model('eventData', eventDataSchema, 'eventData'),
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts'),
    TrucksColl: mongoose.model('trucks', truckSchema, 'trucks'),
    TripCollection: mongoose.model('trips', tripSchema, 'trips'),
    ExpenseCostColl: mongoose.model('expense', expensesSchema, 'expense'),
    PartyCollection: mongoose.model('parties', partySchema, 'parties'),
    DriversColl: mongoose.model('drivers', driverSchema, 'drivers'),
    Roles: mongoose.model('roles', rolesSchema, 'roles'),
    expenseMasterColl: mongoose.model('expenseMaster', expenseMaster, 'expenseMaster'),
    paymentsReceivedColl: mongoose.model('paymentsReceived', paymentsReceived, 'paymentsReceived'),
    GroupsColl: mongoose.model('groups', groupSchema, 'groups'),
    OtpColl:mongoose.model('otps',otpSchema,'otps'),
    NotificationColl:mongoose.model('notifications',notificationsSchema,'notifications')
};