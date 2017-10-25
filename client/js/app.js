var app = angular.module('EasyGaadi', ['ui.router', 'ngCookies', 'ui.bootstrap', 'ui.grid']);

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