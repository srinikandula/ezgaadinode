app.controller('LoginCtrl', ['$scope', 'Utils', 'CommonServices', '$state', '$cookies','$rootScope', 'GroupServices', function ($scope, Utils, CommonServices, $state, $cookies, $rootScope, GroupServices) {
    if (Utils.isLoggedIn()) {
        $state.go('reports');
    }

    $scope.loginParams = {
        userName: '',
        password: '',
        contactPhone: '',
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
        if(!params.errors.length) {
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('role', success.data.role);
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

     $scope.otpField= false;
    $scope.forgotPassword= function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if(!params.errors.length) {
            GroupServices.forgotPassword($scope.loginParams, function (success) {
                if (success.data.status) {
                    params.success = success.data.messages;
                    $scope.otpField= true;
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    }

    $scope.otpParams = {
        contactPhone: '',
        otp: '',
        errors: []
    };
    $scope.otpValidate = function () {
        var params = $scope.otpParams;
        $scope.otpParams.contactPhone = $scope.loginParams.contactPhone;
        params.errors = [];

        if(!params.errors.length) {
            console.log("Cphone",  $scope.otpParams);
            GroupServices.verifyOtp($scope.otpParams, function (success){
                if (success.data.status) {
                    params.success = success.data.messages;
                   // $state.go("login");
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    }


    }]);