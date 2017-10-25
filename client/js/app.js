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
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/partials/dashboard.html',
        params: {
            access: 'auth'
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