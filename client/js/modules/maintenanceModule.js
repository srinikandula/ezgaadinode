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
        getMaintenance: function (params, success, error) {
            $http({
                url: '/v1/maintenance/getAllMaintenance',
                method: "GET",
                params: params
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
        },
        count: function (success, error) {
            $http({
                url: '/v1/maintenance/total/count',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('MaintenanceCtrl', ['$scope', '$state', 'MaintenanceService', 'Notification', 'NgTableParams', 'paginationService', function ($scope, $state, MaintenanceService, Notification, NgTableParams, paginationService) {

    $scope.goToEditMaintenancePage = function (maintenanceId) {
        $state.go('expensesEdit', {maintenanceId: maintenanceId});
    };

    $scope.count = 0;
    $scope.getCount = function () {
        MaintenanceService.count(function (success) {

            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();


    var loadTableData = function (tableParams) {

        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        MaintenanceService.getMaintenance(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.maintanenceCosts)) {
                $scope.loading = false;
                $scope.maintanenceCosts = response.data.maintanenceCosts;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.maintanenceCosts;
                $scope.currentPageOfMaintanence = $scope.maintanenceCosts;
            }

        });
    };

    $scope.init = function () {
        $scope.maintenanceParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };



    $scope.deleteMaintenanceRecord = function (id) {
        MaintenanceService.deleteRecord(id, function (success) {
            if (success.data.status) {
                $scope.getCount();
                Notification.success({message: "Successfully Deleted"});
            } else {
                Notification.error({message: success.data.message});
            }
        })
    };
}]);

app.controller('maintenanceEditController', ['$scope', 'MaintenanceService', '$stateParams', '$state', 'DriverService', 'Notification', 'TrucksService', 'ExpenseMasterServices', function ($scope, MaintenanceService, $stateParams, $state, DriverService, Notification, TrucksService, ExpenseMasterServices) {
    // console.log('-->', $stateParams, $stateParams.maintenanceId, !!$stateParams.maintenanceId);
    $scope.pagetitle = "Add Expenses";
    $scope.dateCallback = "past";

    $scope.trucks=[];
    $scope.expenses=[];

    $scope.maintenanceDetails = {
        vehicleNumber: '',
        expenseType: '',
        description: '',
        date: '',
        cost: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('expenses');
    };

    function getAllExpenses(params) {
        ExpenseMasterServices.getExpenses(params, function (success) {
            if (success.data.status) {
                $scope.expenses = success.data.expenses;
                var selectedExpesneType = _.find($scope.expenses, function (expenses) {
                    return expenses._id.toString() === $scope.maintenanceDetails.expenseType;
                });
                if (selectedExpesneType) {
                    $scope.expenseTitle = selectedExpesneType.expenseName;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectExpenseType = function (expenses) {
        $scope.maintenanceDetails.expenseType = expenses._id;
    };

    function getTruckIds() {
        TrucksService.getAllAccountTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.maintenanceDetails.vehicleNumber;
                });
                if (selectedTruck) {
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }

            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectTruckId = function (truck) {
        $scope.maintenanceDetails.vehicleNumber = truck._id;
    };



    if ($stateParams.maintenanceId) {
        $scope.pagetitle = "Edit expenses";
        MaintenanceService.getMaintenanceRecord($stateParams.maintenanceId, function (success) {
            if (success.data.status) {
                $scope.maintenanceDetails = success.data.trip;
                $scope.maintenanceDetails.date = new Date($scope.maintenanceDetails.date);
                getAllExpenses();
                getTruckIds();
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    } else {
        getAllExpenses();
        getTruckIds();
    }

    $scope.AddorUpdateMaintenance = function () {
        var params = $scope.maintenanceDetails;
        params.error = [];
        params.success = [];

        if (!params.vehicleNumber) {
            params.error.push('Invalid vehicle Number');
        }
        if (!params.expenseType) {
            params.error.push('Invalid expenseType');
        }
        if (!params.description) {
            params.error.push('Invalid description');
        }
        if (!params.date) {
            params.error.push('Invalid date');
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
                        $state.go('expenses');
                    } else {
                        params.error = success.data.message;
                    }
                    $state.go('expenses');

                }, function (err) {
                    console.log(err);
                });
            } else {
                MaintenanceService.addMaintenance(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        console.log('--->>>>', params.success);
                        Notification.success({message: success.data.message});
                        $state.go('expenses');
                    } else {
                        params.error = success.data.message;
                    }
                });
            }
        }
    }
}]);