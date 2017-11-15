var app = angular.module('EasyGaadi', ['ui.router', 'ngTable', 'paginationService', 'ngCookies', 'ui.bootstrap', 'ui.grid', 'ui-notification', 'ui.grid.selection']);

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
        name: 'about',
        url: '/about',
        templateUrl: 'views/partials/about.html',
        params: {
            access: 'open'
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
        },
        controller: 'AddEditPartyCtrl'
    })
        //.state({
    //     name: 'users',
    //     url: '/users',
    //     templateUrl: 'views/partials/users/show-users.html',
    //     data: {activeTab: 'users'},
    //     params: {
    //         access: 'open'
    //     }
    // }).state({
    //     name: 'usersEdit',
    //     url: '/usersEdit/:userId',
    //     templateUrl: 'views/partials/users/usersEdit.html',
    //     data: {activeTab: 'users'},
    //     params: {
    //         access: 'open',
    //         userId: null
    //     }
    // })
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
        data: {activeTab: 'drivers'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'driversEdit',
        url: '/driversEdit/:driverId',
        templateUrl: 'views/partials/drivers/edit-driver.html',
        data: {activeTab: 'drivers'},
        params: {
            access: 'open',
            driverId: null
        }
    }).state({
        name: 'trucks',
        url: '/trucks',
        templateUrl: 'views/partials/trucks-list.html',
        data: {activeTab: 'trucks'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucksEdit',
        url: '/trucksEdit/:truckId',
        templateUrl: 'views/partials/trucks-edit.html',
        data: {activeTab: 'trucks'},
        params: {
            access: 'open',
            truckId: null
        }
    }).state({
        name: 'trips',
        url: '/trips',
        templateUrl: 'views/partials/trips/tripsList.html',
        data: {activeTab: 'trips'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'tripsEdit',
        url: '/tripsEdit/:tripId',
        templateUrl: 'views/partials/trips/tripsEdit.html',
        data: {activeTab: 'trips'},
        params: {
            access: 'auth',
            tripId: null
        }
    }).state({
        name: 'party',
        url: '/party',
        templateUrl: 'views/partials/party-list.html',
        data: {activeTab: 'party'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'editParty',
        url: '/editParty/:partyId',
        templateUrl: 'views/partials/edit-party.html',
        data: {activeTab: 'party'},
        params: {
            access: 'auth',
            partyId: null
        }
    }).state({
        name: 'tripLanes',
        url: '/tripLanes',
        templateUrl: 'views/partials/trip-lane.html',
        data: {activeTab: 'tripLanes'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'tripLanesEdit',
        url: '/tripLanesEdit/:tripLaneId',
        templateUrl: 'views/partials/trip-lane-edit.html',
        data: {activeTab: 'tripLanes'},
        params: {
            access: 'open',
            tripLaneId: null
        }
    }).state({
        name: 'roles',
        url: '/roles',
        templateUrl: 'views/partials/roles/roles.html',
        data: {activeTab: 'roles'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'rolesEdit',
        url: '/rolesEdit/:roleId',
        templateUrl: 'views/partials/roles/roles-edit.html',
        data: {activeTab: 'roles'},
        params: {
            access: 'open',
            roleId: null
        }
    }).state({
        name: 'maintenance',
        url: '/maintenance',
        templateUrl: 'views/partials/Maintenance/maintenance.html',
        data: {activeTab: 'maintenance'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'maintenanceEdit',
        url: '/maintenanceEdit/:maintenanceId',
        templateUrl: 'views/partials/Maintenance/maintenanceEdit.html',
        data: {activeTab: 'maintenance'},
        params: {
            access: 'open',
            maintenanceId: null
        }
    }).state({
        name: 'expenseMaster',
        url: '/expenseMaster',
        templateUrl: 'views/partials/ExpenseMaster/expense-master.html',
        data: {activeTab: 'expenseMaster'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'expenseMasterEdit',
        url: '/expenseMasterEdit/:expenseTypeId',
        templateUrl: 'views/partials/ExpenseMaster/expense-master-edit.html',
        data: {activeTab: 'expenseMaster'},
        params: {
            access: 'open',
            expenseTypeId: null
        }
    }).state({
        name: 'paymentsReceived',
        url: '/paymentsReceived',
        templateUrl: 'views/partials/payments/paymentsReceived.html',
        data: {activeTab: 'paymentsReceived'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'paymentsEdit',
        url: '/paymentsEdit/:paymentsId',
        templateUrl: 'views/partials/payments/paymentsEdit.html',
        data: {activeTab: 'paymentsReceived'},
        params: {
            access: 'open',
            paymentsId: null
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
    $httpProvider.interceptors.push(function ($q, $location, $cookies) {
        return {
            'responseError': function (response) {
                if ([400, 401, 402, 403].indexOf(response.status) > -1) {
                    console.log('-----', response.status);
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