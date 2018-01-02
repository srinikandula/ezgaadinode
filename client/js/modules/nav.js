
app.controller('NavCtrl', ['$scope', '$state', 'Utils', 'AccountServices', '$cookies', '$rootScope', function ($scope, $state, Utils, AccountServices, $cookies, $rootScope) {
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $scope.displayName = "";
        $rootScope.loggedTrue();
        $state.go('login');
    };
    $scope.isLoggedIn = function () {
        return $cookies.get('token') != undefined;
    }
    $scope.loggedInName=function(){
        $scope.displayName=$cookies.get('userName');

    }
    $scope.loggedInName();

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
 /*   $scope.templates = ['/views/templates/dashboard.html']*/

    $scope.erpReports = function () {
        $scope.template = $scope.templates[0];
        $scope.activated = 0;
    };
}]);