app.factory('TripServices', function ($http, $cookies) {
    return {
        addTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/addTrip',
                method: "POST",
                data: trip
            }).then(success, error)
        },
        getTrips: function (success, error) {
            $http({
                url: '/v1/trips/getAll',
                method: "GET"
            }).then(success, error)
        },
        getTrip: function (tripId, success, error) {
            $http({
                url: '/v1/trips/' + tripId,
                method: "GET"
            }).then(success, error)
        },
        updateTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/',
                method: "PUT",
                data: trip
            }).then(success, error)
        }
    }
});

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', 'Notification', '$state', function ($scope, $uibModal, TripServices, Notification, $state) {
    $scope.goToEditTripPage = function (tripId) {
        $state.go('tripsEdit', {tripId: tripId});
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getTripsData = function () {
        TripServices.getTrips(function (success) {
            if (success.data.status) {
                $scope.tripGridOptions.data = success.data.trips;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getTripsData();

    $scope.tripGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [ {
            name: 'Date',
            field: 'date'
        }, {
            name: 'Registration No',
            field: 'registrationNo'
        },{
            name: 'FreightAmount',
            field: 'freightAmount'
        },{
            name: 'Advance',
            field: 'advance'
        },{
            name: 'Balance',
            field: 'balance'
        },{
            name: 'TripExpenses',
            field: 'tripExpenses'
        },{
            name: 'createdBy',
            field: 'createdBy'
        },{
            name: 'updatedBy',
            field: 'updatedBy'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditTripPage(row.entity._id)" class="btn btn-success">Edit</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditTripCtrl', ['$scope', 'Utils', 'TripServices', '$stateParams', 'Notification', function ($scope, Utils, TripServices, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.account = {
        name: '',
        userName: '',
        password: '',
        address: '',
        contact: '',
        error: '',
        success: ''
    };

    if ($stateParams.tripId) {
        TripServices.getTrip($stateParams.tripId, function (success) {
            console.log('acc--->', success.data.trip);
            if (success.data.status) {
                $scope.trip = success.data.trip;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        params.success = '';
        params.error = '';

        if (params._id) {
            delete params.userName;
            delete params.password;
        }

        if (!params.name) {
            params.error = 'Invalid account name';
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
            AccountServices.updateAccount(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        } else {
            // _id doesn\'t exist => create account
            AccountServices.addAccount(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        }
    }
}]);

