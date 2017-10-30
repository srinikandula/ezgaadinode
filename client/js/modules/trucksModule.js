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
                url: '/v1/truck/' + truckId,
                method: "GET"
            }).then(success, error)
        },
        getAccountTrucks: function (pageNumber, success, error) {
            $http({
                url: '/v1/trucks/get/accountTrucks',
                method: "GET"
            }).then(success, error)
        },
        updateTruck: function (truckInfo, success, error) {
            $http({
                url: '/v1/truck',
                method: "PUT",
                data: truckInfo
            }).then(success, error)
        },
        deleteTruck: function (truckId, success, error) {
            $http({
                url: '/v1/truck/'+truckId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('TrucksController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', function ($scope, $uibModal, TrucksService, Notification, $state) {
    $scope.goToEditTrucksPage = function (truckId) {
        $state.go('trucksEdit', {truckId: truckId});
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

  $scope.getTrucksData = function () {
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
        columnDefs: [ {
            name: 'Reg No',
            field: 'registrationNo'
        }, {
            name: 'TruckType',
            field: 'truckType'
        },{
            name: 'Tonnage',
            field: 'tonnage'
        },{
            name: 'Permit',
            field: 'permitExpiry'
        },{
            name: 'Pollution',
            field: 'pollution'
        },{
            name: 'Insurance',
            field: 'insurance'
        },{
            name: 'Fitness',
            field: 'fitness'
        },{
            name: 'Driver',
            field: 'driverName'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditTruckPage(row.entity._id)" class="btn btn-success">Edit</button><button ng-click="grid.appScope.deleteTruck(row.entity._id)" class="btn btn-danger">Delete</button></div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'TrucksService', '$stateParams', 'Notification', function ($scope, Utils, TrucksService, $stateParams, Notification) {
    $scope.truck = {};
    $scope.pageTitle = $stateParams.truckId ?'Update Truck':'Add Truck';

    if ($stateParams.truckId) {
        TrucksService.getTruck($stateParams.truckId, function (success) {
            if (success.data.status) {
                $scope.truck = success.data.truck;
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
        console.log('params',params);
        if (!params.registrationNo) {
            params.error = 'Invalid Registration ID';
        }
        if(!params.error){
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                TrucksService.updateTruck(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

