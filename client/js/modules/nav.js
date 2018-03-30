
app.controller('NavCtrl', ['$scope', '$state', 'Utils', 'AccountServices', '$cookies', '$rootScope', function ($scope, $state, Utils, AccountServices, $cookies, $rootScope) {
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $cookies.remove('routeConfigEnabled');
        $cookies.remove('erpEnabled');
        $cookies.remove('gpsEnabled');
        $rootScope.loggedTrue();
        $state.go('login');
    };
    $scope.isLoggedIn = function () {
        $scope.displayName=$cookies.get('userName');
        $scope.routeConfigEnabled = $cookies.get('routeConfigEnabled');
        return $cookies.get('token') != undefined;

    }

    $scope.isLoggedInn = '';

    $rootScope.loggedTrue = function () {
        if ($cookies.get('token')) {
            $scope.isLoggedInn = true;            
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


}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', '$stateParams', function ($scope, $rootScope, $state, Utils, $cookies, $stateParams) {

    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };

}]);