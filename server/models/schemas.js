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
    email: String,
    type: {type: String, default: "account"},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupName: String,
    contactName: String,
    location: String,
    truckIds: [],
    profilePic: String,
    updatedBy: String,
    createdBy: String,
    isActive: {type: Boolean, default: true},
    gpsEnabled: {type: Boolean, default: false},
    erpEnabled: {type: Boolean, default: false},
    loadEnabled: {type: Boolean, default: false},
    editAccounts: {type: Boolean, default: false},
    lastLogin:Date
}, {
    timestamps: true
});
var groupSchema = new mongoose.Schema({
    name: String,
    type: {type: Boolean, default: "account"},
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
    isActive: {type: Boolean, default: true},
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
    tracking_available: Number,
    accountId: {type: ObjectId, ref: 'accounts'},
    driverId: String,
    pollutionExpiry: Date,
    taxDueDate: Date,
    updatedBy: String,
    createdBy: String,
    status: Number,
    attrs: {},
    deviceId: String,
    lookingForLoad: {type: Boolean, default: false}
}, {timestamps: true});

var tripSchema = new mongoose.Schema({
    date: Date,
    registrationNo: String, //this will be truck id
    partyId: {type: ObjectId, ref: 'parties'},
    freightAmount: Number, //5000
    tonnage: Number,    //new
    rate: Number,   //new
    tripId: String,
    remarks: String,    //new
    tripLane: String,
    tripExpenses: Number,
    driverId: {type: ObjectId, ref: 'drivers'},
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: {type: ObjectId, ref: 'groups'},
    updatedBy: String,
    createdBy: String,
    paymentHistory: [],
    attrs: {},
    share: {type: Boolean, default: false}
}, {timestamps: true});

var partySchema = new mongoose.Schema({
    name: String,
    contact: Number,
    email: String,
    city: String,
    accountId: {type: ObjectId, ref: 'accounts'},
    groupId: String,
    tripLanes: [],
    updatedBy: String,
    createdBy: String,
    attrs: {},
    partyType: String,
    isEmail: {type: Boolean, default: false},
    isSms: {type: Boolean, default: false}
}, {timestamps: true});


var eventDataSchema = new mongoose.Schema({
    transportername: String,
    vehicle_number: String,
    latitude: Number,
    longitude: Number,
    speed: Number,
    distance: Number,
    datetime: Number,
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
    salary: Number,
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
    vehicleNumber: {type: ObjectId, ref: 'trucks'},
    expenseType: {type: ObjectId, ref: 'expenseMaster'},
    partyId: {type: ObjectId, ref: 'parties'},
    description: String,
    date: Date,
    totalAmount: {type: Number, default: 0},
    paidAmount: {type: Number, default: 0},
    cost: {type: Number, default: 0},
    mode: String,
    updatedBy: String,
    createdBy: String,
    isDefault: {type: Boolean, default: false},
    attrs: {}
}, {timestamps: true});

var rolesSchema = new mongoose.Schema({
    roleName: String,
    updatedBy: String,
    createdBy: String,
    menus: [],
    attrs: {}
}, {timestamps: true});

var expenseMaster = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    expenseName: String,
    updatedBy: String,
    createdBy: String,
    attrs: {}
}, {timestamps: String});

var payments = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    partyId: {type: ObjectId, ref: 'parties'},
    description: String,
    amount: Number,
    updatedBy: String,
    createdBy: String,
    date: Date,
    paymentType: String,
    paymentRefNo: String,
    attrs: {}
}, {timestamps: String});

var otpSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    otp: Number,
    expaireIn: Number,
    contactPhone: Number
}, {timestamps: String});

var notificationsSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    notificationType: Number,// 0 -SMS, 1-EMAIL, 2-BOTH
    content: String,
    status: {type: Boolean, default: false},
    tripId: {type: ObjectId, ref: 'trips'},
    message: String
}, {timestamps: String});

var erpSettingsSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    revenue: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    },
    payment: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    },
    expense: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    },
    expiry: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    },
    tollCard: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    },
    fuelCard: {
        filterType: {type: String, default: "month"},
        fromDate: {type: Date},
        toDate: {type: Date}
    }
}, {timestamps: String});

var devicePositions = new mongoose.Schema({
    gprmc: String,
    name: String,
    uniqueId: String,
    deviceId: String,
    protocol: String,
    deviceTime: Number,
    fixTime: Number,
    valid: Boolean,
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [Number]  //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
    },
    altitude: String,
    speed: String,
    course: String,
    statusCode: String,
    attributes: {
        batteryLevel: String,
        distance: Number,
        totalDistance: Number,
        motion: Number
    },
    address: String
    // isViewed : Boolean
}, {timestamps: true, versionKey: false});

var deviceSchema = new mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    deviceId: String,
    truckId: {type: ObjectId, ref: 'trucks'},
    simNumber: String,
    imei: String,
    simPhoneNumber: String,
    installedBy: String,  //installed UserId
    accountId:{type: ObjectId, ref: 'accounts'},
    devicePaymentStatus: String,
    devicePaymentPlan: String, //reference to device payment plan
    isDamaged: String, //duplicate to status?
    replacedFor: String, //if this is replacement to another device
    equipmentType: String,
    serialNumber: String,
    status: String,  // we need to create device status type master
    remarks: String,
}, {timestamps: true, versionKey: false});

var secretKeys = new mongoose.Schema({
    secret: {
        type: String
    },
    email: String
},{ timestamps: true, versionKey: false });

var secretKeysCounter = new mongoose.Schema({
    date: String,
    secretId: {type: ObjectId, ref: 'secretKeys'},
    counter: Number
});
var loadRequestSchema = new mongoose.Schema({
        createdBy: {type: ObjectId, ref: 'accounts'},
        accountId: {type: ObjectId, ref: 'accounts'},
        truckId: {type: ObjectId, ref: 'trucks'},
        tripLane: String,
        possibleStartDate: {type: Date},
        active: {type: Boolean, default: false},
        createdDate: {type: Date, default: new Date()},
    },
    {
        timestamps: true, versionKey:
        false
    }
);

var analyticsSchema = mongoose.Schema({
    action:String,
    remoteIp:String,
    userAgent:String,
    userAgentJSON:{},
    attrs:{accountId:{type: ObjectId, ref: 'accounts'}},
    // accountId:{type: ObjectId, ref: 'accounts'},
    response:String
},{timestamps: String});

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
    paymentsReceivedColl: mongoose.model('payments', payments, 'payments'),
    GroupsColl: mongoose.model('groups', groupSchema, 'groups'),
    OtpColl:mongoose.model('otps',otpSchema,'otps'),
    NotificationColl:mongoose.model('notifications',notificationsSchema,'notifications'),
    ErpSettingsColl:mongoose.model('erpsettings',erpSettingsSchema,'erpsettings'),
    GpsColl:mongoose.model('devicePositions',devicePositions,'devicePositions'),
    SecretKeysColl:mongoose.model('secretKeys',secretKeys,'secretKeys'),
    SecretKeyCounterColl:mongoose.model('secretKeyCounter',secretKeysCounter,'secretKeyCounter'),
    DeviceColl: mongoose.model('devices', deviceSchema, 'devices'),
    LoadRequestColl: mongoose.model('loadRequests', loadRequestSchema, 'LoadRequests'),
    analyticsColl:mongoose.model('analytics',analyticsSchema,'analytics')
};

