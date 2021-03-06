app.controller('LoginCtrl', ['$scope', 'Utils', 'CommonServices', '$state', '$cookies', '$rootScope', 'GroupServices', function ($scope, Utils, CommonServices, $state, $cookies, $rootScope, GroupServices) {
    if (Utils.isLoggedIn()) {
        $state.go('reports');
    }

    $scope.loginParams = {
        userName: $cookies.get('rememberUserName'),
        password: $cookies.get('rememberPassword'),
        contactPhone: $cookies.get('rememberContactPhone'),
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
            $scope.rememberMe();
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    // window.location.reload();
                    $scope.loginRes = success.data.permissions;
                    // console.log("$scope.loginRes", $scope.loginRes);
                    $cookies.put('token', success.data.token);
                    $cookies.put('type', success.data.type);
                    $cookies.put('role', success.data.role);
                    $cookies.put('userName', success.data.userName);
                    $cookies.put('editAccounts', success.data.editAccounts);
                    $cookies.put('profilePic', success.data.profilePic);
                    $cookies.put('type', success.data.type);
                    $cookies.put('erpEnabled',success.data.erpEnabled);
                    $cookies.put('gpsEnabled',success.data.gpsEnabled);
                    $cookies.put('routeConfigEnabled',success.data.routeConfigEnabled);
                    $cookies.put('tripSheetEnabled',success.data.tripSheetEnabled);
                    $cookies.put('driverSheetEnabled',success.data.driverSheetEnabled);
                    $cookies.put('expenseSheetEnabled',success.data.expenseSheetEnabled);
                    $cookies.put('inventoriesEnabled',success.data.inventoriesEnabled);
                    $cookies.put('loadRequestEnabled',success.data.loadRequestEnabled);
                    $cookies.put('lrEnabled',success.data.lrEnabled);
                    $cookies.put('tripSettlementEnabled',success.data.tripSettlementEnabled);
                    $cookies.put('invoiceEnabled',success.data.invoiceEnabled);
                    $cookies.put('receiptsEnabled',success.data.receiptsEnabled);
                    $cookies.put('paymentsEnabled',success.data.paymentsEnabled);
                    $cookies.put('isPartiesForAnjana',success.data.isPartiesForAnjana);
                    $cookies.put('tripSheetForDeepakEnabled',success.data.tripSheetForDeepakEnabled);
                    $cookies.put('admin',success.data.admin);

                    var permissions = [];
                    $scope.loginRes.forEach(permission => {
                        if (permission.v || permission.e ) permissions.push(permission);
                    });

                    localStorage.setItem("permissions", JSON.stringify(permissions));
                    $rootScope.loggedTrue();
                    if(success.data.erpEnabled){
                        $state.go('reports');
                    }else{
                        $state.go('listView');
                    }
           } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    };

    $scope.otpField = false;
    $scope.forgotPassword = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if (!params.errors.length) {
            GroupServices.forgotPassword($scope.loginParams, function (success) {
                if (success.data.status) {
                    params.success = success.data.messages;
                    $scope.otpField = true;
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

        if (!params.errors.length) {
            console.log("Cphone", $scope.otpParams);
            GroupServices.verifyOtp($scope.otpParams, function (success) {
                if (success.data.status) {
                    params.success = success.data.messages;
                    // $state.go("login");
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    };

    $scope.rememberMe=function () {
        if($scope.remember){
            $cookies.put('rememberUserName',$scope.loginParams.userName);
            $cookies.put('rememberPassword', $scope.loginParams.password);
            $cookies.put('rememberContactPhone', $scope.loginParams.contactPhone);
        }
    }
}]);