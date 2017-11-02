app.factory('TrucksService', function ($http, $cookies) {
    return {
        addTruck: function (truckDetails, success, error) {
            $http({
                url: '/v1/trucks/',
                method: "POST",
                data: truckDetails
            }).then(success, error)
        },
        getTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "GET"
            }).then(success, error)
        },
        getAccountTrucks: function (pageNumber, success, error) {
            $http({
                url: '/v1/trucks/get/accountTrucks/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        updateTruck: function (truckInfo, success, error) {
            $http({
                url: '/v1/trucks',
                method: "PUT",
                data: truckInfo
            }).then(success, error)
        },
        deleteTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('TrucksController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', function ($scope, $uibModal, TrucksService, Notification, $state) {
    $scope.goToEditTruckPage = function (truckId) {
        $state.go('trucksEdit', {truckId: truckId});
    };

    // pagination options
    $scope.totalItems = 10;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.truckGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Reg No',
            field: 'registrationNo'
        }, {
            name: 'TruckType',
            field: 'truckType'
        }, {
            name: 'Permit',
            field: 'permitExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Pollution',
            field: 'pollutionExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Insurance',
            field: 'insuranceExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Fitness',
            field: 'fitnessExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Driver',
            field: 'attrs.fullName'
        }, {
            name: 'Driver mobile',
            field: 'attrs.mobile'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a ng-click="grid.appScope.goToEditTruckPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteTruck(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'

        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.getTrucksData = function () {
        TrucksService.getAccountTrucks($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.truckGridOptions.data = success.data.trucks;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getTrucksData();

    $scope.deleteTruck = function (truckId) {
        TrucksService.deleteTruck(truckId, function (success) {
            if (success.data.status) {
                Notification.error('Truck deleted successfully');
                $scope.getTrucksData();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message)
                });
            }
        }, function (err) {

        });
    }
}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'TrucksService', 'DriverService', '$stateParams', 'Notification', '$state', function ($scope, Utils, TrucksService, DriverService, $stateParams, Notification, $state) {
    $scope.goToTrucksPage = function () {
        $state.go('trucks');
    };

    $scope.drivers = [];
    $scope.truck = {
        registrationNo: '',
        truckType: '',
        modelAndYear: '',
        driverId: '',
        fitnessExpiry: '',
        permitExpiry: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
        taxDueDate: '',
        errors: []
    };

    $scope.pageTitle = $stateParams.truckId ? 'Update Truck' : 'Add Truck';

    function getAccountDrivers() {
        DriverService.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    getAccountDrivers();


    if ($stateParams.truckId) {
        TrucksService.getTruck($stateParams.truckId, function (success) {
            if (success.data.status) {
                $scope.truck = success.data.truck;
                $scope.truck.fitnessExpiry = new Date($scope.truck.fitnessExpiry);
                $scope.truck.insuranceExpiry = new Date($scope.truck.insuranceExpiry);
                $scope.truck.permitExpiry = new Date($scope.truck.permitExpiry);
                $scope.truck.pollutionExpiry = new Date($scope.truck.pollutionExpiry);
                $scope.truck.taxDueDate = new Date($scope.truck.taxDueDate);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTruck = function () {
        var params = $scope.truck;
        params.errors = [];

        if (!params.registrationNo) {
            params.errors.push('Invalid Registration ID');
        }
        if (!params.truckType) {
            params.errors.push('Invalid truckType');
        }
        if (!params.modelAndYear) {
            params.errors.push('Invalid Modal and Year');
        }

        if (!params.fitnessExpiry) {
            params.errors.push('Invalid Fitness Expiry');
        }
        if (!params.permitExpiry) {
            params.errors.push('Invalid Permit Expiry');
        }
        if (!params.insuranceExpiry) {
            params.errors.push('Invalid Insurance Expiry');
        }
        if (!params.pollutionExpiry) {
            params.errors.push('Invalid Pollution Expiry');
        }
        if (!params.taxDueDate) {
            params.errors.push('Invalid Tax due date');
        }

        if (!params.errors.length) {
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                TrucksService.updateTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

