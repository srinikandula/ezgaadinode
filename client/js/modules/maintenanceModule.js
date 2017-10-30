app.factory('MaintenanceService', function ($http) {
    return {
        addMaintenance: function (object, success, error) {
            $http({
                url: '/v1/maintenance/addMaintenance',
                method: "POST",
                data: object
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

    // $scope.totalItems = 200;
    // $scope.maxSize = 5;
    // $scope.pageNumber = 1;

    $scope.getMaintenanceRecords = function () {
        MaintenanceService.getAllRecords(function (success) {
            if (success.data.status) {
                $scope.maintenanceGridOptions.data = success.data.details;
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
                Notification.success({message: success.data.message});
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
            field: 'vehicleNumber'
        }, {
            name: 'Description',
            field: 'description'
        }, {
            name: 'Date',
            field: 'date',
            cellFilter : 'date:"dd-MM-yyyy"'
        },{
            name: 'Amount',
            field: 'cost'
        }, {
            name: 'Created By',
            field: 'createdBy'
        }, {
            name: 'Edit',
            cellTemplate: '<div class="text-center"><a ng-click="grid.appScope.goToEditMaintenancePage(row.entity._id)" class="glyphicon glyphicon-edit" style="padding-right: 10px;font-size: 20px;"></a></div>'
        }, {
            name: 'Delete',
            cellTemplate: '<div class="text-center"><a ng-click="grid.appScope.deleteMaintenanceRecord(row.entity._id)" class="glyphicon glyphicon-remove" style="padding-right: 10px;font-size: 20px;"></a></div>'

        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('maintenanceEditController', ['$scope', 'MaintenanceService', '$stateParams', '$state', function ($scope, MaintenanceService, $stateParams, $state) {
    console.log('-->', $stateParams, $stateParams.maintenanceId, !!$stateParams.maintenanceId);
    $scope.pagetitle = "Add Maintenance";

    $scope.maintenanceDetails = {
        vehicleNumber: '',
        description: '',
        date: new Date(),
        cost: '',
        error: '',
        success: ''
    };

    $scope.goToMaintenancePage = function () {
        $state.go('maintenance');
    };

    if ($stateParams.maintenanceId) {
        $scope.pagetitle = "Edit Maintenance Record";
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
        params.error = '';
        params.success = '';

        if (!params.vehicleNumber) {
            params.error = 'Invalid vehicle Number';
        } else if (!params.description) {
            params.error = 'Invalid description';
        } else if (!params.date) {
            params.error = 'Invalid date';
        } else if (!_.isNumber(params.cost)) {
            params.error = 'Invalid cost';
        } else if ($stateParams.maintenanceId) {
            MaintenanceService.updateRecord(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
                $scope.goToMaintenancePage();

            }, function (err) {
                console.log(err);
            });
        } else {
            MaintenanceService.addMaintenance(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                    $state.go('maintenance');
                } else {
                    params.error = success.data.message;
                }

            }, function (err) {
            });
        }
    }
}]);