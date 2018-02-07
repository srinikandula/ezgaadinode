app.controller('adminNavCtrl', ['$scope', 'CommonServices', '$state', '$cookies', '$rootScope', function ($scope, CommonServices, $state, $cookies, $rootScope, GroupServices) {
    if ($cookies.get('token')) {
        $state.go('dashboard');
    }

    $scope.logout = function () {
        $cookies.remove('token');
        $cookies.remove('userName');
        $scope.displayName = "";
        $state.go('login');
    };
    $scope.isLoggedIn = function () {
        return $cookies.get('token') != undefined;
    };
    $scope.loggedInName = function () {
        $scope.displayName = $cookies.get('userName');

    };
    $scope.loggedInName();

    $scope.login = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params.password) {

            params.errors.push('Invalid Password');
        }

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if (!params.errors.length) {
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('type', success.data.type);
                    $cookies.put('userName', success.data.userName);
                    $cookies.put('editAccounts', success.data.editAccounts);
                    $cookies.put('profilePic', success.data.profilePic);
                    $rootScope.loggedTrue();
                    $state.go('reports');
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    };


}]);

app.controller('AdminLoginCtrl', ['$scope', 'CommonServices', '$state', '$cookies', '$rootScope', function ($scope, CommonServices, $state, $cookies, $rootScope, GroupServices) {
    if ($cookies.get('token')) {
        $state.go('dashboard');
    }
    $scope.loginParams = {
        userName: "",
        password: "",
        contactPhone: "",
        errors: []
    };

    $scope.login = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params.password) {

            params.errors.push('Invalid Password');
        }

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if (!params.errors.length) {
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('type', success.data.type);
                    $cookies.put('userName', success.data.userName);
                    $cookies.put('editAccounts', success.data.editAccounts);
                    $cookies.put('profilePic', success.data.profilePic);
                    $state.go('dashboard');
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    };


}]);