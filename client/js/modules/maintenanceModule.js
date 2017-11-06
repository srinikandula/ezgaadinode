app.factory('MaintenanceService', function ($http) {
    return {
        addMaintenance: function (object, success, error) {
            $http({
                url: '/v1/maintenance/addMaintenance',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getMaintenanceRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/maintenance/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/maintenance/getAll',
                method: "GET"
            }).then(success, error)
        },
        getMaintenanceRecord: function (maintenanceId, success, error) {
            $http({
                url: '/v1/maintenance/getMaintenance/' + maintenanceId,
                method: "GET"
            }).then(success, error)
        },
        updateRecord: function (object, success, error) {
            $http({
                url: '/v1/maintenance/updateMaintenance',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deleteRecord: function (maintenanceId, success, error) {
            $http({
                url: '/v1/maintenance/' + maintenanceId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('MaintenanceCtrl', ['$scope', '$state', 'MaintenanceService', 'Notification', function ($scope, $state, MaintenanceService, Notification) {
    $scope.goToEditMaintenancePage = function (maintenanceId) {
        $state.go('maintenanceEdit', {maintenanceId: maintenanceId});
    };

    $scope.totalItems = 10;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getMaintenanceRecords = function () {
        MaintenanceService.getMaintenanceRecords($scope.pageNumber,function (success) {
            if (success.data.status) {
                $scope.maintenanceGridOptions.data = success.data.maintanenceCosts;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {
        });
    };
    $scope.getMaintenanceRecords();

    $scope.deleteMaintenanceRecord = function (id) {
        MaintenanceService.deleteRecord(id, function (success) {
            if (success.data.status) {
                $scope.getMaintenanceRecords();
                Notification.error({message: "Successfully Deleted"});
            } else {
                Notification.error({message: success.data.message});
            }
        })
    };

    $scope.maintenanceGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Vehicle Number',
            field: 'attrs.truckName'
        }, {
            name: 'Description',
            field: 'description'
        }, {
            name: 'Date',
            field: 'date',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Amount',
            field: 'cost'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center"> <a ng-click="grid.appScope.goToEditMaintenancePage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteMaintenanceRecord(row.entity._id)" class="glyphicon glyphicon-trash dele"> </a></div>'

        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('maintenanceEditController', ['$scope', 'MaintenanceService', '$stateParams', '$state', 'DriverService', 'Notification', 'TrucksService', function ($scope, MaintenanceService, $stateParams, $state, DriverService, Notification, TrucksService) {
    // console.log('-->', $stateParams, $stateParams.maintenanceId, !!$stateParams.maintenanceId);
    $scope.pagetitle = "Add Maintenance";
    $scope.dateCallback = "past";

    $scope.maintenanceDetails = {
        vehicleNumber: '',
        description: '',
        date: '',
        shedName: '',
        shedArea: '',
        paymentType: '',
        cost: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('maintenance');
    };

    function getTruckIds() {
        TrucksService.getAllAccountTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    getTruckIds();

    if ($stateParams.maintenanceId) {
        $scope.pagetitle = "Edit Maintenance";
        MaintenanceService.getMaintenanceRecord($stateParams.maintenanceId, function (success) {
            if (success.data.status) {
                $scope.maintenanceDetails = success.data.trip;
                $scope.maintenanceDetails.date = new Date($scope.maintenanceDetails.date);
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }
    $scope.AddorUpdateMaintenance = function () {
        var params = $scope.maintenanceDetails;
        params.error = [];
        params.success = [];

        if (!params.vehicleNumber) {
            params.error.push('Invalid vehicle Number');
        }
        if (!params.description) {
            params.error.push('Invalid description');
        }
        if (!params.date) {
            params.error.push('Invalid date');
        }
        if (!params.shedName) {
            params.error.push('Invalid Shedname');
        }
        if (!params.shedArea) {
            params.error.push('Invalid Shed Area');
        }
        if (!params.paymentType) {
            params.error.push('Invalid Payment Type');
        }
        if (!_.isNumber(params.cost)) {
            params.error.push('Invalid cost');
        }
        if (!params.error.length) {
            if ($stateParams.maintenanceId) {
                MaintenanceService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        // params.success = success.data.message[0];
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                    $state.go('maintenance');

                }, function (err) {
                    console.log(err);
                });
            } else {
                MaintenanceService.addMaintenance(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({message: success.data.message});
                        $state.go('maintenance');
                    } else {
                        params.error = success.data.message;
                    }
                });
            }
        }
    }
}]);