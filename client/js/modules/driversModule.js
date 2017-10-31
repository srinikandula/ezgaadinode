app.factory('DriverServices', function ($http) {
    return {
        addDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers',
                method: "POST",
                data: driverInfo
            }).then(success, error)
        },
        getAllTrucks: function (success, error) {
            $http({
                url: '/v1/trucks',
                method: "GET"
            }).then(success, error)
        },
        getAllDrivers: function(success, error) {
            $http({
                url: '/v1/drivers',
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
        },
        deleteDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/' + driverId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('DriversListCtrl', ['$scope', '$state', 'DriverServices', 'Notification', function ($scope, $state, DriverServices, Notification) {

    $scope.goToEditDriverPage = function (driverId) {
        $state.go('driversEdit', {driverId: driverId});
    };


    $scope.driverGridOptions = {
        enableSorting: true,
        columnDefs: [{
            name: 'ID',
            field: 'driverId'
        },{
            name: 'Full Name',
            field: 'fullName'
        }, {
            name: 'Contact Number',
            field: 'mobile'
        }, {
            name: 'Truck Reg No',
            field: 'truckId.registrationNo'
        }, {
            name: 'License Validity',
            field: 'licenseValidity',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Mobile',
            field: 'mobile'
        }, {
            name: 'Salary',
            field: 'salary'
        }, {
            name: 'License Number',
            field: 'licenseNumber'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditDriverPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>'
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

    $scope.getDrivers = function () {
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

    $scope.deleteDriver = function (driverId) {
        DriverServices.deleteDriver(driverId, function (success) {
            if (success) {
                $scope.getDrivers();
                Notification.error({message: success.data.message});
            } else {
                console.log("Error in deleting")
            }
        })
    };

    $scope.getDrivers();
}]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'TrucksService', 'DriverServices', 'Notification', 'Utils', '$stateParams', function ($scope, $state, TrucksService, DriverServices, Notification, Utils, $stateParams) {
    $scope.pagetitle="Add Driver";

    $scope.trucks = [];
    $scope.driver = {
        fullName: '',
        truckId: '',
        accountId: '',
        mobile: '',
        joiningDate: '',
        licenseValidity: new Date(),
        salary:'',
        licenseNumber:'',
        errors: [],
        success: []
    };
    $scope.pageTitle = "Add Driver";
    if ($stateParams.driverId) {
        $scope.pageTitle = "Update Driver";
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
        DriverServices.getAllTrucks(function (success) {
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

        if (!params.salary) {
            params.errors.push('Please provide  salary');
        }

        if (!params.licenseNumber) {
            params.errors.push('Please provide  licenseNumber');
        }

        if (!params.errors.length) {
            if (params._id) {
                DriverServices.updateDriver(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('drivers');
                       Notification.success({message: "Driver Updated Successfully"});
                    } else {
                        params.errors.push(success.data.message);
                    }
                }, function (err) {
                    console.log(err);
                });
            } else {
                DriverServices.addDriver(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('drivers');
                        Notification.success({message: "Driver Added Successfully"});
                    } else {
                        params.errors.push(success.data.message);
                    }
                }, function (error) {

                });
            }
        } else {
            console.log(params.errors);
        }
    }

}]);