app.factory('DriverServices', function ($http, $cookies) {
    return {
        addDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers',
                method: "POST",
                data: driverInfo
            }).then(success, error)
        },
        getAllTrucksWithIds: function (success, error) {
            $http({
                url: '/v1/trucks',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('DriversListCtrl', ['$scope', '$state', function ($scope, $state) {

    $scope.goToAddDriverPage = function () {
        $state.go('driversEdit');
    }
}]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'DriverServices', 'Utils', function ($scope, $state, DriverServices, Utils) {

    $scope.trucks = [];
    $scope.driver = {
        fullName: '',
        truckId: '',
        accountId: '',
        mobile: '',
        joiningDate: '',
        licenseValidity: '',
        salary: {
            value: ''
        },
        errors: [],
        success: []
    };

    function getTruckIds() {
        DriverServices.getAllTrucksWithIds(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    getTruckIds();

    $scope.cancel = function () {
        $state.go('drivers');
    };

    $scope.addOrSaveDriver = function () {
        var params = $scope.driver;
        params.errors = [];
        params.success = '';

        if (!params.fullName) {
            params.errors.push('Please provide driver\'s full name')
        }

        if (!Utils.isValidPhoneNumber(params.mobile)) {
            params.errors.push('Please provide valid mobile number');
        }

        if (!params.truckId) {
            params.errors.push('Please provide valid truck registration number')
        }

        if (!params.licenseValidity) {
            params.errors.push('Please provide license validity date');
        }

        if (isNaN(Number(params.salary.value))) {
            params.errors.push('Please provide valid salary');
        }

        if (!params.errors.length) {
            DriverServices.addDriver(params, function (success) {
                if(success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.errors = success.data.message;
                }
            }, function (error) {
            });
        } else {
            console.log(params.errors);
        }
    }

}]);