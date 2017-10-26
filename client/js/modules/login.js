app.controller('LoginCtrl', ['$scope', 'Utils', 'CommonServices', '$state', '$cookies', function ($scope, Utils, CommonServices, $state, $cookies) {
    if (Utils.isLoggedIn()) {
        $state.go('accounts');
    }

    $scope.loginParams = {
        accountName: '',
        userName: '',
        password: '',
        error: '',
        success: ''
    };

    $scope.login = function () {
        var params = $scope.loginParams;
        params.success = '';
        params.error = '';

        if (!params.accountName) {
            params.error = 'Invalid account Name';
        } else if (!params.userName) {
            params.error = 'Invalid user name';
        } else if (!Utils.isValidPassword(params.password)) {
            params.error = 'Password length should be atleast 8';
        } else {
            // http call
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('role', success.data.role);
                    $cookies.put('firstName', success.data.firstName);
                    $state.go('accounts');
                } else {
                    params.error = success.data.message;
                }
            }, function (error) {
            });
        }
    }

}]);