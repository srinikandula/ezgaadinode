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
        },
        getDrivers: function (pageNumber, success, error) {
            $http({
                url: '/v1/drivers/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/get/' + driverId,
                method: "GET"
            }).then(success, error)
        },
        updateDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers/',
                method: "PUT",
                data: driverInfo
            }).then(success, error)
        }
    }
});

app.controller('DriversListCtrl', ['$scope', '$state', 'DriverServices', function ($scope, $state, DriverServices) {
    $scope.goToEditDriverPage = function (driverId) {
        $state.go('driversEdit', {driverId: driverId});
    };


    $scope.driverGridOptions = {
        enableSorting: true,
        columnDefs: [{
            name: 'Full Name',
            field: 'fullName'
        }, {
            name: 'Contact Number',
            field: 'mobile'
        },{
            name: 'Truck Reg No',
            field: 'truckId.registrationNo'
        }, {
            name: 'Salary/Month',
            field: 'salary.value'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditDriverPage(row.entity._id)" class="glyphicon glyphicon-edit" style="padding-right: 10px;font-size: 20px;"></a>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getDriversData = function () {
        DriverServices.getDrivers($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.driverGridOptions.data = success.data.drivers;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getDriversData();
}]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'DriverServices', 'Utils', '$stateParams', function ($scope, $state, DriverServices, Utils, $stateParams) {
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

    if ($stateParams.driverId) {
        DriverServices.getDriver($stateParams.driverId, function (success) {
            if (success.data.status) {
                $scope.driver = success.data.driver;
                $scope.driver.licenseValidity = new Date($scope.driver.licenseValidity);
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

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
            if (params._id) {
                DriverServices.updateDriver(params, function (success) {
                    if(success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.errors = success.data.message;
                    }
                }, function (error) {

                });
            } else {
                DriverServices.addDriver(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.errors = success.data.message;
                    }
                }, function (error) {
                });
            }

        } else {
            console.log(params.errors);
        }
    }

}]);