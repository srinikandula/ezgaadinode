app.controller('NavCtrl', ['$scope', '$state', 'Utils', '$cookies', function ($scope, $state, Utils, $cookies) {
    $scope.logout = function () {
        Utils.logout();
        $state.go('login');
    };
    $scope.displayName=$cookies.get('firstName');
    $scope.isLoggedin=$cookies.get('token');

}]);