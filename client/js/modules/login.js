app.controller('LoginCtrl', ['$scope', 'Utils', 'CommonServices', '$state', '$cookies','$rootScope', function ($scope, Utils, CommonServices, $state, $cookies, $rootScope) {
    if (Utils.isLoggedIn()) {
        $state.go('accounts');
    }

    $scope.loginParams = {
        accountName: '',
        userName: '',
        password: '',
        errors: []
    };

    $scope.login = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.accountName) {
            params.errors.push('Invalid account Name');
        }

        if (!params.userName) {
            params.errors.push('Invalid user name');
        }

        if (!Utils.isValidPassword(params.password)) {
            params.errors.push('Password length should be at least 8');
        }


        if(!params.errors.length) {
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('role', success.data.role);
                    $cookies.put('firstName', success.data.firstName);
                    $state.go('accounts');
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    }

}]);