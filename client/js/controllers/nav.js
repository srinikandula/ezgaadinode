app.controller('NavCtrl', ['$scope', 'Utils', '$state', function ($scope, Utils, $state) {
    $scope.logout = function () {
        Utils.logout();
        $state.go('login');
    }
}]);