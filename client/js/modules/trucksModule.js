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

    $scope.getTrucksData = function () {
        console.log('pn',$scope.pageNumber);
        TrucksService.getAccountTrucks($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.truckGridOptions.data = success.data.trucks;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getTrucksData();

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

    $scope.deleteTruck = function (truckId) {
        TrucksService.deleteTruck(truckId, function (success) {
            if (success.data.status) {
                Notification.error('Truck deleted successfully');
                $scope.getTrucksData();
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {

        });
    }
}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'TrucksService', '$stateParams', 'Notification', '$state', function ($scope, Utils, TrucksService, $stateParams, Notification, $state) {
    $scope.goToTrucksPage = function () {
        $state.go('trucks');
    };
    $scope.truck = {};
    $scope.pageTitle = $stateParams.truckId ? 'Update Truck' : 'Add Truck';

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
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTruck = function () {
        var params = $scope.truck;
        params.success = '';
        params.error = '';
        console.log('params==>', params);
        if (!params.registrationNo) {
            params.error = 'Invalid Registration ID';
        }

        if (!params.error) {
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                       // params.success = success.data.message;
                        $state.go('trucks');
                        Notification.success({message: "Truck Added Successfully"});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                TrucksService.updateTruck(params, function (success) {
                    if (success.data.status) {
                        //params.success = success.data.message;
                        $state.go('trucks');
                        Notification.success({message: "Truck Updated Successfully"});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

