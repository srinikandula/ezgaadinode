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
    userName: { // name of the account is called accountId
        type: String,
        index: true,
        unique: true
    },
    userId: String,
    contactPhone: Number,
    password: String,
    email: String,
    type: {type: String, default: "account"},
    accountId: {type: ObjectId, ref: 'accounts'},
    adminRoleId: {type: ObjectId, ref: 'adminRoles'},
    franchiseId: {type: ObjectId, ref: 'franchise'},
    groupName: String,
    firstName: String,
    lastName: String,
    contactName: String,
    displayName: String,
    contactAddress: String,
    city: String,
    state: String,
    location: String,
    truckIds: [],
    profilePic: String,
    updatedBy: String,
    createdBy: String,
    addressPreference: {type: String, default: 'osm'},
    smsEnabled: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
    gpsEnabled: {type: Boolean, default: false},
    erpEnabled: {type: Boolean, default: false},
    loadEnabled: {type: Boolean, default: true},
    editAccounts: {type: Boolean, default: false},
    lastLogin: Date,
    alternatePhone: [],
    companyName: String,
    pincode: String,
    role: String,
    documentFiles: [String],
    yearInService: Number,
    leadSource: String,
    officeNumber: String,
    isLead: {type: Boolean, default: false},
    leadType: String,
    leadStatus: {type: Boolean, default: false},
    createdAt: Date,
    updatedAt: Date,
    smsEmailAds: Number,
    bankName: String,
    bankIfscCode: String,
    bankAccNo: String,
    bankBranch: String,
    truckTypes:[ {type: ObjectId}]
}, {
    timestamps: true
});

var operatingRoutesSchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    source: String,
    sourceState: String,
    sourceAddress: String,
    sourceLocation: {
        'type': {type: String, default: "Point"},
        coordinates: [Number] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
    },
    destination: String,
    destinationState: String,
    destinationAddress: String,
    destinationLocation: {
        'type': {type: String, default: "Point"},
        coordinates: [Number] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
    },
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'},
    truckType: {type: ObjectId, ref: 'trucksTypes'},
}, {
    timestamps: true, versionKey: false
});

var groupSchema = new mongoose.Schema({
    name: String,
    type: {type: Boolean, default: "account"},
    accountId: {
        type: ObjectId,
        ref: 'accounts'
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
    userName: String,
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
    attrs: {latestLocation: {}},
    // latestLocation:{type:ObjectId,ref:'devicePositions'},
    deviceId: String,
    lookingForLoad: {type: Boolean, default: false},
    isIdle: Boolean,
    isStopped: Boolean
}, {timestamps: true});

var tripSchema = new mongoose.Schema({
    date: Date,
    registrationNo: String, //this will be truck id
    partyId: {type: ObjectId, ref: 'parties'},
    freightAmount: Number, //5000
    tonnage: Number, //new
    rate: Number, //new
    tripId: String,
    remarks: String, //new
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
    notificationType: Number, // 0 -SMS, 1-EMAIL, 2-BOTH
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
        coordinates: [Number] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
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
    address: String,
    isIdle: Boolean,
    isStopped: Boolean
    // isViewed : Boolean
}, {timestamps: true, versionKey: false});

var archivedDevicePositions = new mongoose.Schema({
    // _id: ObjectId,
    // updatedAt: Date,
    // createdAt: Date,
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
        coordinates: [Number] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
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
    userName: String,
    createdBy: {type: ObjectId, ref: 'accounts'},
    deviceId: String,
    assignedTo: Number,//{type: ObjectId, ref: 'accounts'},
    //truckId: {type: ObjectId, ref: 'trucks'},
    simNumber: String,
    imei: String,
    simPhoneNumber: String,
    truckId: {type: ObjectId, ref: 'trucks'},
    address: String,
    installedBy: Number,  //installed UserId
    accountId: {type: ObjectId, ref: 'accounts'},
    devicePaymentStatus: String,
    devicePaymentPlan: String, //reference to device payment plan
    lastStopTime: Date,
    fuelCapacity: Number,
    installTime: Date,
    resetTime: Date,
    paymentStart: Date,
    paymentEnd: Date,
    isDamaged: {type: Boolean, default: false}, //duplicate to status?
    replacedFor: String, //if this is replacement to another device
    equipmentType: String,
    serialNumber: String,
    isActive: {type: Boolean, default: true},
    remarks: String,
}, {timestamps: true, versionKey: false});

var secretKeys = new mongoose.Schema({
    secret: {
        type: String
    },
    email: String
}, {timestamps: true, versionKey: false});

var secretKeysCounter = new mongoose.Schema({
    date: String,
    secretId: {type: ObjectId, ref: 'secretKeys'},
    counter: Number
}, {timestamps: true, versionKey: false});

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
    action: String,
    remoteIp: String,
    userAgent: String,
    userAgentJSON: {},
    attrs: {accountId: {type: ObjectId, ref: 'accounts'}, body: String, success: Boolean},
    response: String
}, {timestamps: String});

var erpGpsPlans = new mongoose.Schema({
    planName: String,
    durationInMonths: Number,
    status: Boolean,
    amount: Number,
    remark: String,
    plan: String,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: String});

var customerTypesSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    type: String,
}, {timestamps: String});

var customerLeadsSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    assignedTo: {type: ObjectId, ref: 'accounts'},
    firstName: String,
    userId: String,
    accountId: {type: ObjectId, ref: 'accounts'},
    contactPhone: Number,
    alternatePhone: [],
    email: String,
    isLead: Boolean,
    leadType: String,
    status: String,
    companyName: String,
    address: String,
    city: String,
    state: String,
    pinCode: String,
    officeNumber: String,
    gpsEnabled: {type: Boolean, default: false},
    erpEnabled: {type: Boolean, default: false},
    loadEnabled: {type: Boolean, default: false},
    yearInService: Number,
    documentType: String,
    documentFiles: [""],
    comment: String,
    leadSource: String,
    createdAt: Date,
    updatedAt: Date,
    leadStatus: {type: String, default: 'Initiated'},
    isActive: {type: Boolean, default: false},
    fuelCardApplied: {type: Boolean, default: false},
    smsEmailAds: Number,
}, {timestamps: String});

var accountDevicePlanHistory = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    accountName: String,
    deviceId: {type: ObjectId, ref: 'devices'},
    planId: {type: ObjectId, ref: 'erpGpsPlans'},
    remark: String,
    amount: Number,
    creationTime: Date,
    startTime: String,
    expiryTime: Date,
    received: Boolean,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: String});

var erpPlanHistory = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    accountName: String,
    planId: {type: ObjectId, ref: 'erpGpsPlans'},
    remark: String,
    amount: Number,
    creationTime: Date,
    startTime: String,
    expiryTime: Date,
    received: Boolean,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: String});

var faultyPlanhistory = new mongoose.Schema({
    accountId: String, //{type: ObjectId, ref: 'accounts'},
    deviceId: String, //{type: ObjectId, ref: 'devices'},
    planId: String, //{type: ObjectId, ref: 'erpGpsPlans'},
    remark: String,
    amount: Number,
    creationTime: Date,
    startTime: String,
    expiryTime: Date,
    received: {type: Boolean, default: false}
}, {timestamps: String});

var keysSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    apiKey: String,
    secretKey: String,
    globalAccess: {type: Boolean, default: false}
});

var trucksTypesSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    title: String,
    tonnes: Number,
    mileage: Number,
    status: Boolean
}, {timestamps: String});

var goodsTypesSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    title: String,
    status: Boolean
}, {timestamps: String});

var loadTypesSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    title: String,
    status: Boolean
}, {timestamps: String});

var orderStatusSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    title: String,
    releaseTruck: {type: Boolean, default: false},
    status: {type: Boolean, default: false}
}, {timestamps: String});

var truckRequestSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    customer: {type: ObjectId, ref: 'accounts'},
    title:String,
    customerName:String,
    customerType: String,
    source: String,
    leadType: String,
    destination: String,
    goodsType: String,
    truckType: {type: ObjectId, ref: 'trucksTypes'},
    date: {type: Date},
    pickupPoint: String,
    comment: String,
    expectedPrice: Number,
    trackingRequired: String,
    insuranceRequired: String,
    customerLeadId: {type: ObjectId, ref: 'customerLeads'},
    loadingCharge: Number,
    unloadingCharge: Number,
    pushMessage: String,
    status: {type: String, default: 'New'}

}, {timestamps: String});

var franchiseSchema = mongoose.Schema({
    fullName: String,
    account: String,
    mobile: Number,
    landLine: String,
    city: String,
    state: String,
    address: String,
    company: String,
    bankDetails: String,
    panCard: String,
    gst: String,
    doj: Date,
    status: Boolean,
    profilePic: String,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: true, versionKey: false});

var adminRoleSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    role: String,
    permissions: {
        moduleName: String,
        sectionName: String,
        view: Boolean,
        listAll: Boolean,
        add: Boolean,
        edit: Boolean,
        delete: Boolean
    },
    status: Boolean,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: true, versionKey: false});

var adminPermissionsSchema = mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    adminRoleId: {type: ObjectId, ref: 'adminRoles'},
    moduleName: String,
    fileName: String,
    title: String,
    listAll: Boolean,
    view: Boolean,
    add: Boolean,
    edit: Boolean,
    trash: Boolean,
    fileSortOrder: Number,
    moduleSortOrder: Number,
    menuType: Number,
    status: Boolean,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {timestamps: String});


var truckQuotesSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    accountId: {type: ObjectId, ref: 'accounts'},
    truckRequestId: {type: ObjectId, ref: 'truckRequests'},
    quote: Number,
    comment: String
}, {timestamps: String});

var truckRequestCommentSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    accountId: {type: ObjectId, ref: 'accounts'},
    truckRequestId: {type: ObjectId, ref: 'truckRequests'},
    status: String,
    comment: String,
    notifiedStatus: {type: String, default: "NO"}
}, {timestamps: String});

var truckNotificationSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'},
    accountId: {type: ObjectId, ref: 'accounts'},
    sourceCity: String,
    destinationCity: String,
    numOfTrucks: Number,
    dateAvailable: String,
    truckType: String,
    price: Number,
    sendToAll: Boolean
}, {timestamps: String});

var trafficManagerSchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    fullName: String,
    mobile: Number,
    city: String,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'}
}, {
    timestamps: true, versionKey: false
});
var LoadNotificationSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'},
    accountId: {type: ObjectId, ref: 'accounts'},
    sourceCity: String,
    destinationCity: String,
    dateAvailable: String,
    truckType: String,
    goodsType: String,
    price: Number,
    message: String,
    sendToAll: Boolean
}, {timestamps: String});

var adminLoadRequestSchema = mongoose.Schema({
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'},
    customerType: String,
    customerId: {type: ObjectId, ref: 'accounts'},
    firstName: String,
    contactPhone: Number,
    sourceAddress: String,
    destination: [{
        destinationAddress: String,
        price: Number
    }],
    truckType: String,
    registrationNo: String,
    makeYear: String,
    driverInfo: String,
    dateAvailable: {type: Date},
    expectedDateReturn: {type: Date},
    customerLeadId: {type: ObjectId, ref: 'customerLeads'},
    status: {type: String, default: 'New'}
}, {timestamps: String});

var adminTripsSchema = new mongoose.Schema({
    date: Date,
    registrationNo: String, //this will be truck id
    freightAmount: Number, //5000
    tripId: String,
    tripLane: String,
    tripExpenses: Number,
    driverId: {type: ObjectId, ref: 'drivers'},
    accountId: {type: ObjectId, ref: 'accounts'},
    updatedBy: String,
    createdBy: String,
    truckRequestId: {type: ObjectId, ref: 'truckRequests'},
    truckOwnerId:{type: ObjectId, ref: 'accounts'},
    loadOwnerId:{type: ObjectId, ref: 'accounts'},
    loadCustomerLeadId:{type: ObjectId, ref: 'customerLeads'},
    status:{type:String,default:"New"},
    source:String,
    destination:String,
    truckRequestId: {type: ObjectId, ref: 'truckRequests'}
}, {timestamps: true});

var paymentsSchema = new mongoose.Schema({
    accountId: {type: ObjectId, ref: 'accounts'},
    planId: {type: ObjectId, ref: 'erpGpsPlans'},
    amountPaid: Number,
    createdBy: {type: ObjectId, ref: 'accounts'},
    updatedBy: {type: ObjectId, ref: 'accounts'},
    type: String//gps or erp
}, {
    timestamps: true, versionKey: false
});


module.exports = {
    EventDataCollection: mongoose.model('eventData', eventDataSchema, 'eventData'),
    AccountsColl: mongoose.model('accounts', accountSchema, 'accounts'),
    OperatingRoutesColl: mongoose.model('operatingRoutes', operatingRoutesSchema, 'operatingRoutes'),
    TrucksColl: mongoose.model('trucks', truckSchema, 'trucks'),
    TripCollection: mongoose.model('trips', tripSchema, 'trips'),
    ExpenseCostColl: mongoose.model('expense', expensesSchema, 'expense'),
    PartyCollection: mongoose.model('parties', partySchema, 'parties'),
    DriversColl: mongoose.model('drivers', driverSchema, 'drivers'),
    Roles: mongoose.model('roles', rolesSchema, 'roles'),
    expenseMasterColl: mongoose.model('expenseMaster', expenseMaster, 'expenseMaster'),
    paymentsReceivedColl: mongoose.model('payments', payments, 'payments'),
    GroupsColl: mongoose.model('groups', groupSchema, 'groups'),
    OtpColl: mongoose.model('otps', otpSchema, 'otps'),
    NotificationColl: mongoose.model('notifications', notificationsSchema, 'notifications'),
    ErpSettingsColl: mongoose.model('erpsettings', erpSettingsSchema, 'erpsettings'),
    GpsColl: mongoose.model('devicePositions', devicePositions, 'devicePositions'),
    archivedDevicePositionsColl: mongoose.model('archivedDevicePositions', archivedDevicePositions, 'archivedDevicePositions'),
    SecretKeysColl: mongoose.model('secretKeys', secretKeys, 'secretKeys'),
    SecretKeyCounterColl: mongoose.model('secretKeyCounter', secretKeysCounter, 'secretKeyCounter'),
    DeviceColl: mongoose.model('devices', deviceSchema, 'devices'),
    LoadRequestColl: mongoose.model('loadRequests', loadRequestSchema, 'LoadRequests'),
    analyticsColl: mongoose.model('analytics', analyticsSchema, 'analytics'),
    erpGpsPlansColl: mongoose.model('erpGpsPlans', erpGpsPlans, 'erpGpsPlans'),
    CustomerLeadsColl: mongoose.model('customerLeads', customerLeadsSchema, 'customerLeads'),
    AccountDevicePlanHistoryColl: mongoose.model('accountDevicePlanHistory', accountDevicePlanHistory, 'accountDevicePlanHistory'),
    ErpPlanHistoryColl: mongoose.model('erpPlanHistory', erpPlanHistory, 'erpPlanHistory'),
    FaultyPlanhistoryColl: mongoose.model('faultyPlanhistory', faultyPlanhistory, 'faultyPlanhistory'),
    keysColl: mongoose.model('apiSecretKeys', keysSchema, 'apiSecretKeys'),
    TrucksTypesColl: mongoose.model('trucksTypes', trucksTypesSchema, 'trucksTypes'),
    GoodsTypesColl: mongoose.model('goodsTypes', goodsTypesSchema, 'goodsTypes'),
    LoadTypesColl: mongoose.model('loadTypes', loadTypesSchema, 'loadTypes'),
    OrderStatusColl: mongoose.model('orderStatus', orderStatusSchema, 'orderStatus'),
    TruckRequestColl: mongoose.model('truckRequests', truckRequestSchema, 'truckRequests'),
    CustomerTypesColl: mongoose.model('customerTypes', customerTypesSchema, 'customerTypes'),
    franchiseColl: mongoose.model('franchise', franchiseSchema, 'franchise'),
    adminRoleColl: mongoose.model('adminRoles', adminRoleSchema, 'adminRoles'),
    adminPermissionsColl: mongoose.model('adminPermissions', adminPermissionsSchema, 'adminPermissions'),
    TruckRequestQuoteColl: mongoose.model('truckRequestQuotes', truckQuotesSchema, 'truckRequestQuotes'),
    TruckRequestCommentsColl: mongoose.model('truckRequestComments', truckRequestCommentSchema, 'truckRequestComments'),
    TruckNotificationColl: mongoose.model('truckNotification', truckNotificationSchema, 'truckNotification'),
    trafficManagerColl: mongoose.model('trafficManager', trafficManagerSchema, 'trafficManager'),
    LoadNotificationColl: mongoose.model('loadNotification', LoadNotificationSchema, 'loadNotification'),
    adminLoadRequestColl: mongoose.model('adminLoadRequest', adminLoadRequestSchema, 'adminLoadRequest'),
    AdminTripsColl:mongoose.model('adminTripsColl',adminTripsSchema,'adminTripsColl'),
    PaymentsColl: mongoose.model('paymentsSchema', paymentsSchema, 'paymentsSchema')
};
