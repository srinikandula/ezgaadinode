var app = angular.module('EasyGaadi', ['ui.router', 'ngCookies', 'ui.bootstrap', 'ui.grid', 'ui-notification', 'ui.grid.selection']);

app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'views/partials/login.html',
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
        params: {
            access: 'auth'
        }
    }).state({
        name: 'accountsEdit',
        url: '/accountsEdit/:accountId',
        templateUrl: 'views/partials/accounts/edit-account.html',
        params: {
            access: 'open',
            accountId: null
        },
        controller: 'AddEditPartyCtrl'
    }).state({
        name: 'users',
        url: '/users',
        templateUrl: 'views/partials/users/show-users.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'usersEdit',
        url: '/usersEdit/:userId',
        templateUrl: 'views/partials/users/usersEdit.html',
        params: {
            access: 'open',
            userId: null
        }
    }).state({
        name: 'drivers',
        url: '/drivers',
        templateUrl: 'views/partials/drivers/driversList.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'driversEdit',
        url: '/driversEdit',
        templateUrl: 'views/partials/drivers/edit-driver.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucks',
        url: '/trucks',
        templateUrl: 'views/partials/trucks-list.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucksEdit',
        url: '/trucksEdit',
        templateUrl: 'views/partials/trucks-edit.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'trips',
        url: '/trips',
        templateUrl: 'views/partials/trips.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'party',
        url: '/party',
        templateUrl: 'views/partials/party-list.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'editParty',
        url: '/editParty/:partyId',
        templateUrl: 'views/partials/edit-party.html',
        params: {
            access: 'auth',
            partyId: null
        }
    }).state({
        name: 'maintenance',
        url: '/maintenance',
        templateUrl: 'views/partials/maintenance.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'tripsLane',
        url: '/tripsLane',
        templateUrl: 'views/partials/trip-lane.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'roles',
        url: '/roles',
        templateUrl: 'views/partials/roles/roles.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'rolesEdit',
        url: '/rolesEdit/:roleId',
        templateUrl: 'views/partials/roles/roles-edit.html',
        params: {
            access: 'open',
            roleId: null
        }
    });
    $urlRouterProvider.otherwise('/login');
});

app.config(function(NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 10000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'left',
        positionY: 'bottom'
    });
});