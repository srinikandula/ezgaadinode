var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth2').Strategy;

var app = express();

var Admin = require('./server/routes/admin');
var config = require('./server/config/config');
var RouteConfig = require('./server/routes/routeConfigRoutes');
var  LoadRequest= require('./server/routes/loadRequestRoutes');
var Reminder = require('./server/routes/reminderRoutes');
var  Inventory= require('./server/routes/inventoryRoutes');
var  Job= require('./server/routes/jobRoutes');
var  subLogIn= require('./server/routes/subLoginRoutes');


var Trips = require('./server/routes/tripRoutes');
var Expense = require('./server/routes/expensesRoutes');
var Trucks = require('./server/routes/truckRoutes');
var Party = require('./server/routes/partyRoutes');
// var Users = require('./server/routes/users')
var Drivers = require('./server/routes/driverRoutes');
var Roles = require('./server/routes/roleRoutes');
var Events = require('./server/routes/eventsRoutes');
var ExpenseMaster = require('./server/routes/expenseMasterRoutes');
var Receipts = require('./server/routes/receiptsRoutes');
var ErpPayments = require('./server/routes/erpPaymentsRoutes');
var Groups = require('./server/routes/groupRoutes');
var Gps = require('./server/routes/gpsRoutes');
var Analytics = require('./server/routes/reports');
var Customers = require('./server/adminRoutes/customerRoutes');
var Settings = require('./server/adminRoutes/settingsRoutes');
var Notifications = require('./server/adminRoutes/notificationRoutes');
var OrderProcess = require('./server/adminRoutes/orderProcessRoutes');
var Accounts = require('./server/adminRoutes/accountsRoutes');
var Employees = require('./server/adminRoutes/employeeRoutes');
var Devices = require('./server/adminRoutes/deviceRoutes');
var globalApi = require('./server/routes/globalRoutes');
var pushNotifications= require('./server/routes/notifications');
var GroupUsers = require('./server/routes/groupsRoutes');
var LRs = require('./server/routes/lrRoutes');
var geoFence = require('./server/routes/geoFenceRoutes');
var geoFenceReports = require('./server/routes/geoFenceReportsRoutes');
var json2xls = require('json2xls');
var authMiddleware = require('./server/middleware/auth');

app.set('port', config.port);
// app.use(morgan('dev'));
app.use(express.static('client'));
// app.use(express.static('client', {index: "/views/adminIndex.html"}));

app.use(bodyParser.json({limit: config.bodyParserLimit}));
app.use(bodyParser.urlencoded({limit: config.bodyParserLimit, extended: true}));
app.use(cookieParser());

app.use(function (req, res, next) {
    if (/^\/v1\//.test(req.url)) {
        next();
    } else {
        var hostName = req.host || req.hostname;
        if(hostName.indexOf('cpanel') != -1 || hostName.indexOf('admin.') != -1){
            res.sendFile(__dirname + '/client/views/adminIndex.html');
        } else{
            res.sendFile(__dirname + '/client/views/index.html');

        }
    }
});


// app.use('/v1/user', Users.OpenRouter);
app.use('/v1/events', Events.OpenRouter);
app.use('/v1/inventories', Inventory.OpenRouter);

app.use('/v1/group', Groups.OpenRouter);
app.use('/v1/gps', Gps.OpenRouter);
app.use('/v1/analytics', Analytics.OpenRouter);
app.use('/v1/notifications',pushNotifications.OpenRouter);
app.use('/v1/trucks', Trucks.OpenRouter);
app.use(authMiddleware);
app.use(json2xls.middleware);
app.use('/v1/events', Events.AuthRouter);

app.use('/v1/admin', Admin.AuthRouter);
app.use('/v1/trips', Trips.AuthRouter);
app.use('/v1/trucks', Trucks.AuthRouter);
app.use('/v1/party', Party.AuthRouter);
app.use('/v1/drivers', Drivers.AuthRouter);
app.use('/v1/roles', Roles.AuthRouter);
app.use('/v1/expense', Expense.AuthRouter);
app.use('/v1/expenseMaster', ExpenseMaster.AuthRouter);
app.use('/v1/payments', ErpPayments.AuthRouter);
app.use('/v1/receipts', Receipts.AuthRouter);
app.use('/v1/gps', Gps.AuthRouter);
app.use('/v1/notifications',pushNotifications.AuthRouter);
app.use('/v1/cpanel/customers', Customers.AuthRouter);
app.use('/v1/cpanel/settings', Settings.AuthRouter);
app.use('/v1/cpanel/notifications', Notifications.AuthRouter);
app.use('/v1/cpanel/orderProcess', OrderProcess.AuthRouter);
app.use('/v1/cpanel/accounts', Accounts.AuthRouter);
app.use('/v1/cpanel/employees', Employees.AuthRouter);
app.use('/v1/cpanel/devices', Devices.AuthRouter);
app.use('/v1/global/',globalApi.AuthRouter);
app.use('/v1/routeConfigs',RouteConfig.AuthRouter);
app.use('/v1/loadRequest',LoadRequest.AuthRouter);
app.use('/v1/inventories', Inventory.AuthRouter);
app.use('/v1/jobs', Job.AuthRouter);
app.use('/v1/reminders', Reminder.AuthRouter);
app.use('/v1/users', subLogIn.AuthRouter);
app.use('/v1/groups', GroupUsers.AuthRouter);
app.use('/v1/lrs', LRs.AuthRouter);
app.use('/v1/geoFences',geoFence.AuthRouter);
app.use('/v1/geoFenceReports',geoFenceReports.AuthRouter);


var server = app.listen(app.get('port'), function () {
    console.log('Listening on port ' + server.address().port);
});

module.exports = app;