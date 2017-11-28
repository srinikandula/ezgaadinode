app.controller('NavCtrl', ['$scope', '$state', 'Utils', '$cookies', function ($scope, $state, Utils, $cookies) {
    $scope.logout = function () {
        Utils.logout();
        $state.go('login');
    };
    $scope.isLoggedIn = function(){
        return $cookies.get('token') != undefined;
    }
    $scope.displayName=$cookies.get('userName');
    $scope.isLoggedin=$cookies.get('token');
}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', function ($scope, $rootScope, $state, Utils, $cookies) {
    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };
}]);