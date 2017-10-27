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
        }
    }).state({
        name: 'users',
        url: '/users',
        templateUrl: 'views/partials/users.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'drivers',
        url: '/drivers',
        templateUrl: 'views/partials/drivers.html',
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
    })

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