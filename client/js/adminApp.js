var app = angular.module('easygaadiAdmin', ['ui.router', 'ui.bootstrap', 'ui-notification', 'ngFileUpload', 'ngTable']);

app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
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
        data: { activeTab: 'dashboard' }
    }).state({
        name: 'customers',
        url: '/customers',
        templateUrl: 'views/partials/admin/customers/customers.html',
        data: { activeTab: 'customers' }
    }).state({
        name: 'customers.customersLead',
        url: '/customersLead',
        templateUrl: 'views/partials/admin/customers/customersLead.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'createCustomer',
        url: '/createCustomer/:customerId',
        templateUrl: 'views/partials/admin/customers/createCustomer.html',
        data: { activeTab: 'customers' },
        params: {
            customerId: null
        }

    }).state({
        name: 'customers.truckOwners',
        url: '/truckOwners',
        templateUrl: 'views/partials/admin/customers/truckOwners.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'customers.transporters',
        url: '/transporters',
        templateUrl: 'views/partials/admin/customers/transporters.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'customers.commissionAgent',
        url: '/commissionAgent',
        templateUrl: 'views/partials/admin/customers/commissionAgent.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'customers.factoryOwners',
        url: '/factoryOwners',
        templateUrl: 'views/partials/admin/customers/factoryOwners.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'customers.guest',
        url: '/guest',
        templateUrl: 'views/partials/admin/customers/guest.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'customers.restOfAll',
        url: '/restOfAll',
        templateUrl: 'views/partials/admin/customers/restOfAll.html',
        data: { activeTab: 'customers' }

    }).state({
        name: 'services',
        url: '/services',
        templateUrl: 'views/partials/admin/services/serviceDashboard.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'addNewAccount',
        url: '/addNewAccount',
        templateUrl: 'views/partials/admin/services/addNewAccount.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'services.gpsAccounts',
        url: '/gpsAccounts',
        templateUrl: 'views/partials/admin/services/gpsAccounts.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'services.erpAccounts',
        url: '/erpAccounts',
        templateUrl: 'views/partials/admin/services/erpAccounts.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'services.gpsDevices',
        url: '/gpsDevices',
        templateUrl: 'views/partials/admin/services/gpsDevices.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'services.deviceManagement',
        url: '/deviceManagement',
        templateUrl: 'views/partials/admin/services/deviceManagement.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'services.payments',
        url: '/payments',
        templateUrl: 'views/partials/admin/services/payments.html',
        data: { activeTab: 'services' }
    }).state({
        name: 'orderProcess',
        url: '/orderProcess',
        templateUrl: 'views/partials/admin/orderProcess/orderProcess.html',
        data: { activeTab: 'orderProcess' }
    }).state({
        name: 'orderProcess.truckRequest',
        url: '/truckRequest',
        templateUrl: 'views/partials/admin/orderProcess/truckRequets.html',
        data: { activeTab: 'orderProcess' }
    }).state({
        name: 'orderProcess.loadRequest',
        url: '/loadRequest',
        templateUrl: 'views/partials/admin/orderProcess/loadRequest.html',
        data: { activeTab: 'orderProcess' }
    }).state({
        name: 'orderProcess.viewOrder',
        url: '/viewOrder',
        templateUrl: 'views/partials/admin/orderProcess/viewOrder.html',
        data: { activeTab: 'orderProcess' }
    }).state({
        name: 'createTruckRequest',
        url: '/createTruckRequest',
        templateUrl: 'views/partials/admin/orderProcess/createTruckRequest.html',
        data: { activeTab: 'orderProcess' }
    });

    $urlRouterProvider.otherwise('/login');
});



app.run(function($transitions, $rootScope) {
    $transitions.onSuccess({ to: '*' }, function(to) {
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
    });
});