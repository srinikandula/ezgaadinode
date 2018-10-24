app.controller('NavCtrl', ['$scope', '$state', 'Utils', 'AccountServices', '$cookies', '$rootScope','ReminderService', function ($scope, $state, Utils, AccountServices, $cookies, $rootScope,ReminderService) {
    $scope.remainder ='';
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $cookies.remove('routeConfigEnabled');
        $cookies.remove('erpEnabled');
        $cookies.remove('gpsEnabled');
        $cookies.remove('type');
        localStorage.removeItem('permission');
        localStorage.clear();
        $rootScope.loggedTrue();
        $state.go('login');
    };

    $scope.getReminderCount = function(){
        ReminderService.getReminderCount(function(successCallback){
            if(successCallback.data.status){
                $scope.remainder = successCallback.data.data;
            }
        });
    };

    $scope.$on('reminderEdited', function(){
        $scope.getReminderCount();
    });

    $scope.isLoggedIn = function () {
        $scope.displayName=$cookies.get('userName');
        $scope.routeConfigEnabled = $cookies.get('routeConfigEnabled');
        $scope.tripSheetEnabled = $cookies.get('tripSheetEnabled');
        $scope.driverSheetEnabled = $cookies.get('driverSheetEnabled');
        return $cookies.get('token') != undefined;

    };

    $scope.isLoggedInn = '';

    $rootScope.loggedTrue = function () {
        if ($cookies.get('token')) {
            $scope.isLoggedInn = true;
            $scope.getReminderCount();
        }
        else {
            $scope.isLoggedInn = false;
            $state.go('login');
        }
    };
    $rootScope.loggedTrue();
    
    $scope.isLoggedin=$cookies.get('token');

    $scope.loginParams = {
        userName: '',
        password: '',
        contactPhone: '',
        email: '',
        errors: []
    };

    $rootScope.modules = [
        {
            name: 'Reports',
            subModules: [{name: 'Reports', link:'reports'}],
            id:'reports'
        },
        {
            name: "Master",
            subModules: [{name: "Trucks", link:'trucks'},
                         {name: "Drivers", link:'drivers'},
                         {name: "Parties", link:'parties'},
                         {name: "Inventories", link:'inventories'},
                         {name: "Users", link:'users'}],
            id:'master'
        },
        {
            name: "Maintanance",
            subModules: [{name: "Expenses", link:'expenses'},
                         {name: "Jobs", link:'jobs'},
                         {name: "Remainders", link:'reminders'}],
            id:'maintanance'
        },
        {
            name: "Transactions",
            subModules: [{name: "Trips", link:'trips'},
                        {name: "Receipts", link:'receipts'},
                        {name: "Payments", link:'payments'},
                        {name: "LR", link:'lrs'},
                        {name: "TripSettlement", link:'tripSettlement'},
                        {name: "Invoice", link:'invoice'}
            ],
            id:'transactions'
        },
        {
            name: "Load Request",
            subModules: [{name: "LoadRequest", link:'loadRequests'},
                         {name: "Send SMS", link:'sendSMS'}],
            id:'load'
        },
        {
            name: "Route Config",
            subModules: [{name: "routeConfig", link:'routeConfig'},
                         {name: "GeoFences", link:'geoFence'},
                         {name: "GeoFencesReports", link:'GeoFencesReports'}],
            id:'route'
        }

    ];

    $scope.permissions = JSON.parse(localStorage.getItem("permissions"));

    if($scope.permissions) {
        $scope.permissions.forEach(permission => {
            $scope.modules.forEach(module => {
                module.subModules.forEach(subModule => {
                    // if (permission.roleName === "") {
                    //     subModule.v = true;
                    //     subModule.e = true;
                    // }
                    if (subModule.name == permission.subModule) {
                        subModule.v = permission.v;
                        subModule.e = permission.e;
                    }
                });
            });
        });
    }
    $scope.modules.forEach(module => {
        var subModules = [];
        module.subModules.forEach(subModule => {
            if (subModule.v || subModule.e) {
                subModules.push(subModule);
            }
        });
        module.subModules = subModules;
    });

    var tempModules = [];
    $scope.modules.forEach(module => {
        if (module.subModules.length > 0) {
            tempModules.push(module);
        }
    });
    $scope.modules = tempModules;


}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', '$stateParams', function ($scope, $rootScope, $state, Utils, $cookies, $stateParams) {

    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };

}]);