var app = angular.module('easygaadiAdmin', ['ui.router']);

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
    }).state({
        name: 'customers',
        url: '/customers',
        templateUrl: 'views/partials/admin/customers.html',
    }).state({
        name: 'services',
        url: '/services',
        templateUrl: 'views/partials/admin/services.html',
    }).state({
        name: 'orderProcess',
        url: '/orderProcess',
        templateUrl: 'views/partials/admin/orderProcess.html',
    });

    $urlRouterProvider.otherwise('/login');
});



// app.run(function ($transitions, $rootScope, $cookies) {
//
//     $transitions.onSuccess({to: '*'}, function (to) {
//         $rootScope.profilePic = $cookies.get('profilePic');
//         $rootScope.type = $cookies.get('type');
//         $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
//         $rootScope.subTab = to.promise.$$state.value.data.subTab;
//
//     });
// });



