var app = angular.module('EasyGaadi', ['ui.router', 'ngTable', 'paginationService', 'ngCookies', 'ui.bootstrap', 'ui-notification']);

app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
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
        name: 'reports',
        url: '/reports',
        templateUrl: 'views/partials/reports/dashboard.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'auth'
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
        data: {activeTab: 'accounts'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'accountsEdit',
        url: '/accountsEdit/:accountId',
        templateUrl: 'views/partials/accounts/edit-account.html',
        data: {activeTab: 'accounts'},
        params: {
            access: 'open',
            accountId: null
        }
    })
        .state({
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
        data: {activeTab: 'reports'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'driversEdit',
        url: '/driversEdit/:driverId',
        templateUrl: 'views/partials/drivers/edit-driver.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open',
            driverId: null
        }
    }).state({
        name: 'trucks',
        url: '/trucks',
        templateUrl: 'views/partials/trucks/trucks-list.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucksEdit',
        url: '/trucksEdit/:truckId',
        templateUrl: 'views/partials/trucks/trucks-edit.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open',
            truckId: null
        }
    }).state({
        name: 'trips',
        url: '/trips',
        templateUrl: 'views/partials/trips/tripsList.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'tripsEdit',
        url: '/tripsEdit/:tripId',
        templateUrl: 'views/partials/trips/tripsEdit.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'auth',
            tripId: null
        }
    }).state({
        name: 'parties',
        url: '/parties',
        templateUrl: 'views/partials/party/party-list.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'editParty',
        url: '/editParty/:partyId',
        templateUrl: 'views/partials/party/edit-party.html',
        data: {activeTab: 'reports'},
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
        data: {activeTab: 'reports'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'expensesEdit',
        url: '/expensesEdit/:expenseId',
        templateUrl: 'views/partials/expenses/expensesEdit.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open',
            expenseId: null
        }
    }).state({
        name: 'expense-master',
        url: '/expense-master',
        templateUrl: 'views/partials/ExpenseMaster/expense-master.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'expenseMasterEdit',
        url: '/expenseMasterEdit/:expenseTypeId',
        templateUrl: 'views/partials/ExpenseMaster/expense-master-edit.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open',
            expenseTypeId: null
        }
    }).state({
        name: 'payments',
        url: '/payments',
        templateUrl: 'views/partials/payments/paymentsReceived.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'paymentsEdit',
        url: '/paymentsEdit/:paymentsId',
        templateUrl: 'views/partials/payments/paymentsEdit.html',
        data: {activeTab: 'reports'},
        params: {
            access: 'open',
            paymentsId: null
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
        name: 'groupMap',
        url: '/groupMap',
        templateUrl: 'views/partials/groupMap.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'auth'
        }
    });
    $urlRouterProvider.otherwise('/login');
});

app.config(function (NotificationProvider, $httpProvider) {
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
    $httpProvider.interceptors.push(function ($q, $location,$rootScope, $cookies) {
        return {
            'request': function(config) {
              
               $rootScope.reqloading=true;
                return config;
            },
            'response': function(config) {
                $rootScope.reqloading=false;
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
    });
});

app.run(function ($transitions, $rootScope) {
    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
    });
});