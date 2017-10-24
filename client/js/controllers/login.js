app.controller('LoginCtrl', ['$scope', 'ValidatorService', 'CommonServices', '$state', '$cookies', function ($scope, ValidatorService, CommonServices, $state, $cookies) {
    if (CommonServices.isLoggedIn()) {
        $state.go('dashboard');
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
        if (!params.accountName) {
            params.error = 'Invalid account Name';
        } else if (!params.userName) {
            params.error = 'Invalid user name';
        } else if (!ValidatorService.isValidPassword(params.password)) {
            params.error = 'Password length should be atleast 8';
        } else {
            // http call
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('role', success.data.role);
                    $cookies.put('firstName', success.data.firstName);
                    $state.go('dashboard');
                } else {
                    params.error = success.data.message;
                }
            }, function (error) {
            });
        }
    }

}]);