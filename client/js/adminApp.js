var app = angular.module('easygaadiAdmin', ['ui.router','ui.bootstrap']);

app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'views/partials/admin/adminLogin.html',
    }).state({
        name: 'adminHome',
        url: '/adminHome',
        templateUrl: 'views/partials/admin/adminHome.html',
    }).state({
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/partials/admin/dashboard.html',
        data:{activeTab: 'dashboard'}
    }).state({
        name: 'customers',
        url: '/customers',
        templateUrl: 'views/partials/admin/customers/customers.html',
        data:{activeTab: 'customers'}
    }).state({
        name: 'createCustomer',
        url: '/createCustomer',
        templateUrl: 'views/partials/admin/customers/createCustomer.html',
        data:{activeTab: 'customers'}

    }).state({
        name: 'services',
        url: '/services',
        templateUrl: 'views/partials/admin/services.html',
        data:{activeTab: 'services'}
    }).state({
        name: 'orderProcess',
        url: '/orderProcess',
        templateUrl: 'views/partials/admin/orderProcess.html',
        data:{activeTab: 'orderProcess'}
    });

    $urlRouterProvider.otherwise('/login');
});



app.run(function ($transitions, $rootScope) {
    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
    });
});



