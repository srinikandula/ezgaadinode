app.controller('NavCtrl', ['$scope', '$state', 'Utils', function ($scope, $state, Utils) {
    $scope.logout = function () {
        Utils.logout();
        $state.go('login');
    }
}]);