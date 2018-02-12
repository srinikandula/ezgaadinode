var app = angular.module('easygaadiAdmin', ['ui.router', 'ui.bootstrap', 'ui-notification', 'ngFileUpload', 'ngTable','ngCookies','ui.select','angularjs-dropdown-multiselect','ngSanitize']);

app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'views/partials/admin/adminLogin.html',
        data: {activeTab: 'login'}
    }).state({
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/partials/admin/dashboard.html',
        data: {activeTab: 'dashboard'}
    }).state({
        name: 'customers',
        url: '/customers',
        templateUrl: 'views/partials/admin/customers/customers.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.customersLead',
        url: '/customersLead',
        templateUrl: 'views/partials/admin/customers/customersLead.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.createCustomer',
        url: '/createCustomer/:customerId',
        templateUrl: 'views/partials/admin/customers/createCustomer.html',
        data: {activeTab: 'customers'},
        params: {
            customerId: null
        }
    }).state({
        name: 'customers.truckOwners',
        url: '/truckOwners',
        templateUrl: 'views/partials/admin/customers/truckOwners.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.transporters',
        url: '/transporters',
        templateUrl: 'views/partials/admin/customers/transporters.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.commissionAgent',
        url: '/commissionAgent',
        templateUrl: 'views/partials/admin/customers/commissionAgent.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.factoryOwners',
        url: '/factoryOwners',
        templateUrl: 'views/partials/admin/customers/factoryOwners.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.guest',
        url: '/guest',
        templateUrl: 'views/partials/admin/customers/guest.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'customers.restOfAll',
        url: '/restOfAll',
        templateUrl: 'views/partials/admin/customers/restOfAll.html',
        data: {activeTab: 'customers'}
    }).state({
        name: 'services',
        url: '/services',
        templateUrl: 'views/partials/admin/services/serviceDashboard.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.addNewAccount',
        url: '/addNewAccount',
        templateUrl: 'views/partials/admin/services/addNewAccount.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.gpsAccounts',
        url: '/gpsAccounts',
        templateUrl: 'views/partials/admin/services/gpsAccounts.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.erpAccounts',
        url: '/erpAccounts',
        templateUrl: 'views/partials/admin/services/erpAccounts.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.gpsDevices',
        url: '/gpsDevices',
        templateUrl: 'views/partials/admin/services/gpsDevices.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.editGpsDevice',
        url: '/editGpsDevice/:device',
        templateUrl: 'views/partials/admin/services/editGpsDevice.html',
        data: {activeTab: 'services', device: false}
    }).state({
        name: 'services.addDevice',
        url: '/addDevice',
        templateUrl: 'views/partials/admin/services/addDevice.html',
        data: {activeTab: 'services', device: false}
    }).state({
        name: 'services.transferDevice',
        url: '/transferDevice',
        templateUrl: 'views/partials/admin/services/transferDevice.html',
        data: {activeTab: 'services', device: false}
    }).state({
        name: 'services.deviceManagement',
        url: '/deviceManagement',
        templateUrl: 'views/partials/admin/services/deviceManagement.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'services.payments',
        url: '/payments',
        templateUrl: 'views/partials/admin/services/payments.html',
        data: {activeTab: 'services'}
    }).state({
        name: 'orderprocess',
        url: '/orderProcess',
        templateUrl: 'views/partials/admin/orderProcess/orderProcess.html',
        data: {activeTab: 'orderprocess'}
    }).state({
        name: 'orderprocess.truckRequest',
        url: '/truckRequest',
        templateUrl: 'views/partials/admin/orderProcess/truckRequets.html',
        data: {activeTab: 'orderprocess'}
    }).state({
        name: 'orderprocess.loadRequest',
        url: '/loadRequest',
        templateUrl: 'views/partials/admin/orderProcess/loadRequest.html',
        data: {activeTab: 'orderprocess'}
    }).state({
        name: 'orderprocess.viewOrder',
        url: '/viewOrder',
        templateUrl: 'views/partials/admin/orderProcess/viewOrder.html',
        data: {activeTab: 'orderprocess'}
    }).state({
        name: 'orderprocess.createTruckRequest',
        url: '/createTruckRequest',
        templateUrl: 'views/partials/admin/orderProcess/createTruckRequest.html',
        data: { activeTab: 'orderprocess' }
    }).state({
        name: 'orderprocess.editTruckRequest',
        url: '/editTruckRequest/:_id',
        templateUrl: 'views/partials/admin/orderProcess/editTruckRequest.html',
        data: {activeTab: 'orderprocess'},
        params: { _id: null },
        data: {activeTab: 'orderprocess'}
    }).state({
        name: 'settings',
        url: '/settings',
        templateUrl: 'views/partials/admin/settings/settings.html',
        data: {activeTab: 'settings'}
    }).state({
        name: 'settings.gpsSettings',
        url: '/settings-gps',
        templateUrl: 'views/partials/admin/settings/gpsSettings.html',
        data: {activeTab: 'settings'}
    }).state({
        name: 'settings.truckTypes',
        url: '/truckTypes',
        templateUrl: 'views/partials/admin/settings/truckTypes.html',
        data: {activeTab: 'settings'}
    }).state({
        name: 'notifications',
        url: '/notifications',
        templateUrl: 'views/partials/admin/notifications/notificationDashboard.html',
        data: { activeTab: 'notification' }
    }).state({
        name: 'notifications.avaTrucks',
        url: '/avaTrucks',
        templateUrl: 'views/partials/admin/notifications/availableTrucks.html',
        data: { activeTab: 'notification' }
    }).state({
        name: 'notifications.avaLoads',
        url: '/avaLoads',
        templateUrl: 'views/partials/admin/notifications/availableLoads.html',
        data: { activeTab: 'notification' }
    }).state({
        name: 'notifications.app',
        url: '/app',
        templateUrl: 'views/partials/admin/notifications/app.html',
        data: { activeTab: 'notification' }
    }).state({
        name: 'notifications.lookingForLoad',
        url: '/lookingForLoad',
        templateUrl: 'views/partials/admin/notifications/lookingForLoad.html',
        data: {activeTab: 'notification'}
    }).state({
        name: 'admin',
        url: '/admin',
        templateUrl: 'views/partials/admin/administrators/administratorMenu.html',
        data: {activeTab: 'Admin'}
    }).state({
        name: 'admin.administrators',
        url: '/administrators',
        templateUrl: 'views/partials/admin/administrators/administrators.html',
        data: {activeTab: 'Admin'}
    }).state({
        name: 'admin.addUpdateEmployee',
        url: '/addUpdateEmployee/:employeeId',
        templateUrl: 'views/partials/admin/administrators/addUpdateEmployee.html',
        data: {activeTab: 'Admin'},
        params: {employeeId: null}
    }).state({
        name: 'admin.adminRoles',
        url: '/adminRoles',
        templateUrl: 'views/partials/admin/administrators/adminRoles.html',
        data: {activeTab: 'Admin'}
    }).state({
        name: 'admin.addUpdateAdminRole',
        url: '/addUpdateAdminRole/:roleId',
        templateUrl: 'views/partials/admin/administrators/addUpdateAdminRole.html',
        data: {activeTab: 'Admin'},
        params: {roleId: null}
    }).state({
        name: 'admin.adminLogHistory',
        url: '/adminLogHistory',
        templateUrl: 'views/partials/admin/administrators/adminLogHistory.html',
        data: {activeTab: 'Admin'}
    }).state({
        name: 'admin.franchises',
        url: '/franchises',
        templateUrl: 'views/partials/admin/administrators/franchises.html',
        data: {activeTab: 'Admin'}
    }).state({
        name: 'admin.addUpdateFranchise',
        url: '/addUpdateFranchise/:franchiseId',
        templateUrl: 'views/partials/admin/administrators/addUpdateFranchise.html',
        data: {activeTab: 'Admin'},
        params: {franchiseId: null}
    });

    $urlRouterProvider.otherwise('/login');
});


app.run(function ($transitions, $rootScope) {
    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
    });
});

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
