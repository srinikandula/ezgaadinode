var app = angular.module('EasyGaadi', ['ui.router', 'ngTable', 'paginationService', 'ngCookies', 'ui.bootstrap', 'ui-notification', 'ngImgCrop', 'ngFileUpload', 'ngSanitize', 'ui.select','ngMap']);

app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider',function ($stateProvider, $locationProvider, $urlRouterProvider) {
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
            ID:null
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
        data: {activeTab: 'accounts',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'accountsEdit',
        url: '/accountsEdit/:accountId',
        templateUrl: 'views/partials/accounts/edit-account.html',
        data: {activeTab: 'accounts',
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
        url: '/paymentsEdit/:paymentsId',
        templateUrl: 'views/partials/payments/paymentsEdit.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            paymentsId: null
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
        name: 'gpsReports',
        url: '/gps/gpsReports',
        templateUrl: 'views/partials/gps/gpsReports.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
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
            truckNo:null,
            access: 'open',
            paymentsId: null
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
        data: {activeTab: 'secret',
            subTab: 'GPS'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'devices',
        url: '/gps/devices',
        templateUrl: 'views/partials/gps/devices.html',
        data: {activeTab: 'gpsReports'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'analyticsReports',
        url: '/analytics/dashboard',
        templateUrl: 'views/partials/analyticsReports/reports.html',
        data: {activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'actionReports',
        url: '/reports/lastLogin',
        templateUrl: 'views/partials/analyticsReports/loginAnalytics.html',
        data: {activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'agentReports',
        url: '/reports/agentReports',
        templateUrl: 'views/partials/analyticsReports/agentReports.html',
        data: {activeTab: 'Analytics',
        },
        params: {
            access: 'auth'
        }
    });
    // agentReports
    $urlRouterProvider.otherwise('/login');
}]);

app.config(['NotificationProvider', '$httpProvider',function (NotificationProvider, $httpProvider) {
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
    $httpProvider.interceptors.push(['$q', '$location', '$rootScope', '$cookies',function ($q, $location, $rootScope, $cookies) {
        return {
            'request': function (config) {``

                $rootScope.reqloading = true;
                return config;
            },
            'response': function (config) {
                $rootScope.reqloading = false;
                return config;
            },
            'responseError': function (response) {
                if ([400, 401, 402, 403].indexOf(response.status) > -1) {
                    $cookies.remove('token');
                    $location.path('/login');
                    return $q.reject(response);
                }
            }
        };
    }]);
}]);

app.run(['$transitions', '$rootScope', '$cookies','$state',function ($transitions, $rootScope, $cookies,$state) {
    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.profilePic = $cookies.get('profilePic');
        $rootScope.type = $cookies.get('type');
        $rootScope.createGroup=$cookies.get('createGroup');
        $rootScope.erpEnabled=$cookies.get('erpEnabled');
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
        $rootScope.subTab = to.promise.$$state.value.data.subTab;
        if(to.$to().self.url.startsWith('/reports')){
            if($rootScope.erpEnabled!=='true'){
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