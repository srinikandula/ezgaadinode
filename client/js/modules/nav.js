app.controller('NavCtrl', ['$scope', '$state', 'Utils', '$cookies', function ($scope, $state, Utils, $cookies) {
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $scope.displayName= "";
        $state.go('login');
    };
    $scope.isLoggedIn = function(){
        return $cookies.get('token') != undefined;
    }
    $scope.loggedInName=function(){
        $scope.displayName=$cookies.get('userName');
    }   
    $scope.loggedInName();
    
    $scope.isLoggedin=$cookies.get('token');
}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', function ($scope, $rootScope, $state, Utils, $cookies) {
    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };
}]);