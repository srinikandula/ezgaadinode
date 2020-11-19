var app = angular.module('EasyGaadi', ['ui.router', 'ngTable', 'paginationService', 'ngCookies', 'ui.bootstrap', 'ui-notification', 'ngImgCrop', 'ngFileUpload', 'ngSanitize', 'ui.select', 'ngMap', 'ui.bootstrap.datetimepicker']);

app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function ($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'views/partials/login.html',
        data: {activeTab: 'import-students'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'livetracking',
        url: '/live-tracking/:truckNo',
        templateUrl: 'views/partials/liveTracking.html',
        data: {activeTab: 'import-students'},
        params: {
            access: 'open',
            truckNo:null
        }
    }).state({
        name: 'home',
        url: '/home',
        templateUrl: 'views/partials/home.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'forgotPassword',
        url: '/forgotPassword',
        templateUrl: 'views/partials/forgotPassword.html',
        data: {activeTab: 'null'},
        params: {
            access: 'null'
        }
    }).state({
        name: 'routeConfig',
        url: '/routeConfig',
        templateUrl: 'views/partials/routeConfig/list.html',
        data: {
            activeTab: 'routeConfig',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'addRouteConfig',
        url: '/addRouteConfig/:ID',
        templateUrl: 'views/partials/routeConfig/addRouteConfig.html',
        data: {
            activeTab: 'routeConfig',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            ID: null
        }
    }).state({
        name: 'inventories',
        url: '/inventories',
        templateUrl: 'views/partials/inventories/inventoriesList.html',
        data: {
            activeTab: 'inventories',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'jobs',
        url: '/jobsList',
        templateUrl: 'views/partials/Jobs/jobsList.html',
        data: {
            activeTab: 'jobs',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'addJob',
        url: '/add-editJob/:ID',
        templateUrl: 'views/partials/Jobs/add_editJob.html',
        data: {
            activeTab: 'jobs',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            ID: null
        }
    }).state({
        name: 'invoice',
        url: '/invoicesList',
        templateUrl: 'views/partials/Invoice/invoiceList.html',
        data: {
            activeTab: 'invoice',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'invoiceEdit',
        url: '/add_editInvoice/:id',
        templateUrl: 'views/partials/Invoice/add_editInvoice.html',
        data: {
            activeTab: 'invoice',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            id:null
        }
    }).state({
        name: 'reminders',
        url: '/remindersList',
        templateUrl: 'views/partials/reminders/remindersList.html',
        data: {
            activeTab: 'reminders',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'addReminder',
        url: '/addReminder/:ID',
        templateUrl: 'views/partials/reminders/addReminder.html',
        data: {
            activeTab: 'reminders',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            ID: null
        }
    }).state({
        name: 'addInventory',
        url: '/add-editInventory/:Id',
        templateUrl: 'views/partials/inventories/add-editInventory.html',
        data: {
            activeTab: 'inventories',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            Id: null
        }
    }).state({
        name: 'myProfile',
        url: '/myProfile',
        templateUrl: 'views/partials/userProfile/myProfile.html',
        data: {activeTab: 'myProfile'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'myGroup',
        url: '/myGroup',
        templateUrl: 'views/partials/userProfile/myGroup.html',
        data: {activeTab: 'myGroup'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'addGroup',
        url: '/addGroup',
        templateUrl: 'views/partials/userProfile/addingGroup.html',
        data: {activeTab: 'addGroup'},
        params: {
            access: 'auth',
            accountGroupId: null
        }
    }).state({
        name: 'accounts',
        url: '/accounts',
        templateUrl: 'views/partials/accounts/accountsList.html',
        data: {
            activeTab: 'accounts',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'accountsEdit',
        url: '/accountsEdit/:accountId',
        templateUrl: 'views/partials/accounts/edit-account.html',
        data: {
            activeTab: 'accounts',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            accountId: null
        }
    }).state({
        name: 'groups',
        url: '/groups',
        templateUrl: 'views/partials/groups/show-groups.html',
        data: {activeTab: 'groups'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'groupsEdit',
        url: '/groupsEdit/:groupId',
        templateUrl: 'views/partials/groups/groupsEdit.html',
        data: {activeTab: 'groups'},
        params: {
            access: 'open',
            groupId: null
        }
    }).state({
        name: 'drivers',
        url: '/drivers',
        templateUrl: 'views/partials/drivers/driversList.html',
        data: {
            activeTab: 'drivers',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'driversEdit',
        url: '/driversEdit/:driverId',
        templateUrl: 'views/partials/drivers/edit-driver.html',
        data: {
            activeTab: 'drivers',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            driverId: null
        }
    }).state({
        name: 'trucks',
        url: '/trucks',
        templateUrl: 'views/partials/trucks/trucks-list.html',
        data: {
            activeTab: 'trucks',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucksEdit',
        url: '/trucksEdit/:truckId',
        templateUrl: 'views/partials/trucks/trucks-edit.html',
        data: {
            activeTab: 'trucks',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            truckId: null
        }
    }).state({
        name: 'trips',
        url: '/trips',
        templateUrl: 'views/partials/trips/tripsList.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'tripsEdit',
        url: '/tripsEdit/:tripId',
        templateUrl: 'views/partials/trips/tripsEdit.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            tripId: null
        }
    }).state({
        name: 'tripsettlement',
        url: '/tripsettlement',
        templateUrl: 'views/partials/tripSettlement/tripSettlementList.html',
        data: {
            activeTab: 'tripsettlement',
            subTab: 'ERP'
        },
        params: {
            access: 'open'

        }
    }).state({
        name: 'addTripSettlement',
        url: '/add-editTripSettlement/:id',
        templateUrl: 'views/partials/tripSettlement/tripSettlement-edit.html',
        data: {
            activeTab: 'tripSettlement',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            id:null
        }
    }).state({
        name: 'uploadTrips',
        url: '/uploadTrips',
        templateUrl: 'views/partials/trips/uploadTrips.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'printInvoice',
        url: '/printInvoice/:tripId/:partyId',
        templateUrl: 'views/partials/trips/printInvoice.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            tripId: null,
            partyId:null
        }
    }).state({
        name: 'parties',
        url: '/parties',
        templateUrl: 'views/partials/party/party-list.html',
        data: {
            activeTab: 'parties',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'loadRequests',
        url: '/loadRequests',
        templateUrl: 'views/partials/loadRequests/loadRequestsList.html',
        data: {
            activeTab: 'loadRequest',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'add-editLoadRequest',
        url: '/add-editLoadRequest/:ID',
        templateUrl: 'views/partials/loadRequests/add-editLoadRequest.html',
        data: {
            activeTab: 'loadRequest',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            ID: null
        }
    }).state({
        name: 'sendLoadRequest',
        url: '/sendLoadRequest/:Id',
        templateUrl: 'views/partials/loadRequests/sendLoadRequest.html',
        data: {
            activeTab: 'loadRequest',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            Id: null
        }
    }).state({
        name: 'sendSMS',
        url: '/sendSMS',
        templateUrl: 'views/partials/sendSMS/createSMS.html',
        data: {
            activeTab: 'sendSMS',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
        }
    }).state({
        name: 'geoFence',
        url: '/geoFencesList',
        templateUrl: 'views/partials/geoFences/geoFencesList.html',
        data: {
            activeTab: 'GeoFences',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'add_editGeoFence',
        url: '/add_editGeoFence/:id',
        templateUrl: 'views/partials/geoFences/add_editgeoFence.html',
        data: {
            activeTab: 'GeoFences',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            id:null
        }
    }).state({
        name: 'editParty',
        url: '/editParty/:partyId',
        templateUrl: 'views/partials/party/edit-party.html',
        data: {
            activeTab: 'parties',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            partyId: null
        }
    }).state({
        name: 'trackMap',
        url: '/trackMap',
        templateUrl: 'views/partials/trackMap.html',
        data: {activeTab: 'trackMap'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'expenses',
        url: '/expenses',
        templateUrl: 'views/partials/expenses/expenses.html',
        data: {
            activeTab: 'expenses',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'expensesEdit',
        url: '/expensesEdit/:expenseId',
        templateUrl: 'views/partials/expenses/expensesEdit.html',
        data: {
            activeTab: 'expenses',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            expenseId: null
        }
    }).state({
        name: 'uploadExpenses',
        url: '/uploadExpenses',
        templateUrl: 'views/partials/expenses/uploadExpenses.html',
        data: {
            activeTab: 'expenses',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'payments',
        url: '/payments',
        templateUrl: 'views/partials/payments/paymentsReceived.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'paymentsEdit',
        url: '/paymentsEdit/:paymentId',
        templateUrl: 'views/partials/payments/paymentsEdit.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            paymentId: null
        }
    }).state({
        name: 'uploadPayments',
        url: '/uploadPayments',
        templateUrl: 'views/partials/payments/uploadPayments.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'receipts',
        url: '/receipts',
        templateUrl: 'views/partials/receipts/receiptReceived.html',
        data: {
            activeTab: 'receipts',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'receiptEdit',
        url: '/receiptEdit/:receiptId',
        templateUrl: 'views/partials/receipts/receiptEdit.html',
        data: {
            activeTab: 'receipts',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            receiptId: null
        }
    }).state({
        name: 'uploadReceipts',
        url: '/uploadReceipts',
        templateUrl: 'views/partials/receipts/uploadReceipts.html',
        data: {
            activeTab: 'receipts',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'gpsReports',
        url: '/gps/gpsReports',
        templateUrl: 'views/partials/gps/gpsReports.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'users',
        url: '/users/usersList',
        templateUrl: 'views/partials/SubLogins/usersList.html',
        data: {
            activeTab: 'users',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
        }
    }).state({
        name: 'add_editUser',
        url: '/users/add_editUser/:id',
        templateUrl: 'views/partials/SubLogins/add-editUser.html',
        data: {
            activeTab: 'users',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            id: null
        }
    }).state({
        name: 'gpsSettings',
        url: '/gpsSettings',
        templateUrl: 'views/partials/settings/gpsSettings.html',
        data: {activeTab: 'settings'},
        params: {
            access: 'open',
        }
    }).state({
        name: 'reportsSettings',
        url: '/reportsSettings',
        templateUrl: 'views/partials/settings/reportsSettings.html',
        data: {activeTab: 'settings'},
        params: {
            access: 'open',
        }
    }).state({
        name: 'mapView',
        url: '/gps/mapView',
        templateUrl: 'views/partials/gps/mapView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'listView',
        url: '/gps/listView',
        templateUrl: 'views/partials/gps/listView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'trackView',
        url: '/gps/trackView/:truckNo',
        templateUrl: 'views/partials/gps/trackView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            truckNo: null,
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'tripView',
        url: '/gps/trackView/:startDate/:endDate/:regNo',
        templateUrl: 'views/partials/gps/trackView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            startDate: null,
            access: 'open',
            endDate: null,
            regNo: null
        }
    }).state({
        name: 'groupMap',
        url: '/groupMap',
        templateUrl: 'views/partials/groupMap.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'reports',
        url: '/reports/revenueByVehicles',
        templateUrl: 'views/partials/reports/revenueByVehicles.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },

        params: {
            access: 'auth'
        }
    }).state({
        name: 'revenueByvehicleId',
        url: '/reports/revenueByvehicleId/:vehicleId/:id',
        templateUrl: 'views/partials/reports/revenueByvehicleId.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            vehicleId: null, id: null
        }
    }).state({
        name: 'expenseByVehicles',
        url: '/reports/expenseByVehicles',
        templateUrl: 'views/partials/reports/expenseByVehicles.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'expenseByVehicleId',
        url: '/reports/expenseByVehicleId/:vehicleId/:id',
        templateUrl: 'views/partials/reports/expenseByVehicleId.html',
        data: {
            activeTab: 'reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            vehicleId: null, id: null
        }
    }).state({
        name: 'receivableByParty',
        url: '/reports/receivableByParty',
        templateUrl: 'views/partials/reports/receivableByParties.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'receivableByPartyName',
        url: '/reports/receivableByPartyName/:partyId/:name',
        templateUrl: 'views/partials/reports/receivableByPartyName.html',
        data: {activeTab: 'ERP', subTab: 'ERP'},
        params: {
            access: 'auth',
            partyId: null, name: null
        }
    }).state({
        name: 'payableByParty',
        url: '/reports/payableByParty',
        templateUrl: 'views/partials/reports/payableByParty.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'payableByPartyName',
        url: '/reports/payableByPartyName/:partyId/:name',
        templateUrl: 'views/partials/reports/payableByPartyName.html',
        data: {activeTab: 'ERP', subTab: 'ERP'},
        params: {
            access: 'auth',
            partyId: null, name: null
        }
    }).state({
        name: 'listOfExpireTrucks',
        url: '/reports/listOfExpireTrucks',
        templateUrl: 'views/partials/reports/expiryTrucks.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'byReceipts',
        url: '/reports/byReceipts',
        templateUrl: 'views/partials/reports/byReceipts.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'receiptByPartyName',
        url: '/reports/receiptByPartyName/:receiptId/:name',
        templateUrl: 'views/partials/reports/receiptByPartyName.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            receiptId: null, name: null
        }
    }).state({
        name: 'secretKeys',
        url: '/settings/secretKeys',
        templateUrl: 'views/partials/settings/SecretKeys.html',
        data: {
            activeTab: 'secret',
            subTab: 'GPS'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'devices',
        url: '/gps/devices',
        templateUrl: 'views/partials/gps/devices.html',
        data: {
            activeTab: 'gpsReports'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'analyticsReports',
        url: '/analytics/dashboard',
        templateUrl: 'views/partials/analyticsReports/reports.html',
        data: {
            activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'actionReports',
        url: '/reports/lastLogin',
        templateUrl: 'views/partials/analyticsReports/loginAnalytics.html',
        data: {
            activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'agentReports',
        url: '/reports/agentReports',
        templateUrl: 'views/partials/analyticsReports/agentReports.html',
        data: {
            activeTab: 'Analytics',
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'lrs',
        url: '/lrs',
        templateUrl: 'views/partials/lrs/lrsList.html',
        data: {
            activeTab: 'lrs',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'lrEdit',
        url: '/lrEdit/:lrId',
        templateUrl: 'views/partials/lrs/lrEdit.html',
        data: {
            activeTab: 'lrs',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            lrId: null
        }
    }).state({
        name: 'GeoFencesReports',
        url: '/GeoFencesReports',
        templateUrl: 'views/partials/geoFences/GeoFencesReports.html',
        data: {
            activeTab: 'GeoFencesReports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'tripsheet',
        url: '/tripsheet',
        templateUrl: 'views/partials/tripSheets/tripSheet.html',
        data: {
            activeTab: 'tripsheet',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'driversheet',
        url: '/driversheet',
        templateUrl: 'views/partials/driverSheet/driver-sheet.html',
        data: {
            activeTab: 'driversheet',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'expensessheet',
        url: '/expensessheet',
        templateUrl: 'views/partials/expenses/expensesSheet.html',
        data: {
            activeTab: 'expensessheet',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'anjanaParties',
        url: '/anjanaParties',
        templateUrl: 'views/partials/anjanaParties/anjana-partyList.html',
        data: {
            activeTab: 'anjanaParties',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'editAnjanaParty',
        url: '/editAnjanaParty/:partyId',
        templateUrl: 'views/partials/anjanaParties/anjana-editParty.html',
        data: {
            activeTab: 'anjanaParties',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            partyId: null
        }
    }).state({
        name: 'tripsheetfordeepaktransport',
        url: '/tripsheetfordeepaktransport',
        templateUrl: 'views/partials/tripSheets/tripSheetForDeepak.html',
        data: {
            activeTab: 'tripsheetfor',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            partyId: null
        }
    });
    // agentReportstrips
    $urlRouterProvider.otherwise('/login');
}]);

app.config(['NotificationProvider', '$httpProvider', function (NotificationProvider, $httpProvider) {
    NotificationProvider.setOptions({
        delay: 3000,
        startTop: 150,
        startRight: 500,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'center',
        positionY: 'bottom'
    });
    // Interceptor for redirecting to login page if not logged in
    $httpProvider.interceptors.push(['$q', '$location', '$rootScope', '$cookies', function ($q, $location, $rootScope, $cookies) {
        return {
            'request': function (config) {
                $rootScope.reqloading = true;
                return config;
            },
            'response': function (config) {
                $rootScope.reqloading = false;
                return config;
            },
            'responseError': function (error) {
                let status = error.status;
                console.log('status ' + error.status);
                if ([400, 401, 402, 403].indexOf(status) > -1) {
                    console.log('found error');
                    $cookies.remove('token');

                    console.log("$location.url()",$location.url());
                    if(!$location.url().startsWith('/live-tracking')){
                        $location.path('/login');
                        return;
                    }
                    return $q.reject(error);
                }
            }
        };
    }]);
}]);

app.run(['$transitions', '$rootScope', '$cookies', '$state', function ($transitions, $rootScope, $cookies, $state, $location) {
    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.profilePic = $cookies.get('profilePic');
        $rootScope.type = $cookies.get('type');
        $rootScope.createGroup = $cookies.get('createGroup');
        $rootScope.erpEnabled = $cookies.get('erpEnabled');
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
        $rootScope.subTab = to.promise.$$state.value.data.subTab;
        if (to.$to().self.url.startsWith('/reports')) {
            if ($rootScope.erpEnabled !== 'true') {
                $state.go('gpsReports');
            }
        }
    });
}]);

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];
        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

app.filter('words', function () {
    function isInteger(x) {
        return x % 1 === 0;
    }


    return function (value) {
        if (value && isInteger(value))
            return toWords(value);

        return value;
    };

});

var th = ['', 'thousand', 'million', 'billion', 'trillion'];
var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];


function toWords(s) {
    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s)) return 'not a number';
    var x = s.indexOf('.');
    if (x == -1) x = s.length;
    if (x > 15) return 'too big';
    var n = s.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] != 0) {
                str += tw[n[i] - 2] + ' ';
                sk = 1;
            }
        } else if (n[i] != 0) {
            str += dg[n[i]] + ' ';
            if ((x - i) % 3 == 0) str += 'hundred ';
            sk = 1;
        }


        if ((x - i) % 3 == 1) {
            if (sk) str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
    if (x != s.length) {
        var y = s.length;
        str += 'point ';
        for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
    }
    return str.replace(/\s+/g, ' ');
}

window.toWords = toWords;