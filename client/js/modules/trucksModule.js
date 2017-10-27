app.factory('TrucksService', function ($http, $cookies) {
    return {
        addTruck: function (truckDetails, success, error) {
            $http({
                url: '/v1/trucks/',
                method: "POST",
                data: truckDetails
            }).then(success, error)
        },
        getAllTrucks: function (truckId, success, error) {
            $http({
                url: '/v1/truck/' + truckId,
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

app.controller('trucksCntrl', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', function ($scope, $uibModal, TrucksService, Notification, $state) {
    $scope.goToEditTrucksPage = function (truckId) {
        $state.go('trucksEdit', {truckId: truckId});
    };

 /*   // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;*/

/*    $scope.getTrucksData = function () {
        AccountServices.getAllTrucks($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.accountGridOptions.data = success.data.accounts;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getTrucksData();*/
/*
    $scope.accountGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [ {
            name: 'Reg No',
            field: 'registrationNo'
        }, {
            name: 'truckType',
            field: 'truckType'
        },{
            name: 'driverId',
            field: 'driverId'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditAccountPage(row.entity._id)" class="btn btn-success">Edit</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };*/

}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'AccountServices', '$stateParams', 'Notification', function ($scope, Utils, AccountServices, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.truck = {
        registrationNo: '',
        truckType: '',
        driverId: '',
        modelAndYear: '',
        fitnessExpiry: '',
        permitExpiry: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
        taxDueDate: '',
        error: '',
        success: ''
    };

   /* if ($stateParams.truckId) {
        AccountServices.updateTruck($stateParams.truckId, function (success) {
            console.log('acc--->', success.data.truckId);
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

      /!*  if (params._id) {
            delete params.userName;
            delete params.password;
        }
*!/
        if (!params.registrationNo) {
            params.error = 'Invalid Registration ID';
        } else if (!params._id && !params.userName) {
            params.error = 'Invalid user name';
        } else if (!params._id && !Utils.isValidPassword(params.password)) {
            params.error = 'Invalid password';
        } else if (!params.address.trim()) {
            params.error = 'Invalid address'
        } else if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error = 'Invalid phone number';
        } else if (params._id) {
            // If _id update the account
            AccountServices.addTrack(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        } else {
            // _id doesn\'t exist => create account
            AccountServices.updateTruck(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        }
    }*/
}]);

