app.factory('TripServices', function ($http) {
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
        },
        deleteTrip: function (tripId, success, error) {
            $http({
                url: '/v1/trips/'+tripId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state','Notification', function ($scope, $uibModal, TripServices, $state, Notification) {
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

    $scope.deleteTrip = function (tripId) {
        TripServices.deleteTrip(tripId,function (success) {
            if (success){
                $scope.getTripsData();
                Notification.error({message: "Trip Deleted"});
            }else {
                console.log("Error in deleting")
            }
        })
    }

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
            name: 'Driver',
            field: 'driver'
        },{
            name: 'Booked For',
            field: 'bookedFor'
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
            name: 'Trip Expenses',
            field: 'tripExpenses'
        },{
            name: 'Trip Lane',
            field: 'tripLane'
        },{
            name: 'Created By',
            field: 'createdBy'
        },{
            name: 'Updated By',
            field: 'updatedBy'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditTripPage(row.entity._id)" class="glyphicon glyphicon-edit" style="padding-right: 10px;font-size: 20px;"></a></div>'
        },{
            name: 'Delete',
            cellTemplate: '<button ng-click="grid.appScope.deleteTrip(row.entity._id)" class="btn btn-danger">Delete</button>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditTripCtrl', ['$scope','$state', 'Utils', 'TripServices','DriverServices','PartyService','TripLaneServices', '$stateParams', 'Notification', function ($scope,$state, Utils, TripServices,DriverServices,PartyService,TripLaneServices, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.drivers = [];
    $scope.parties = [];

    $scope.trip = {
        date: '',
        driver:'',
        bookedFor:'',
        registrationNo: '',
        freightAmount: '',
        balance: '',
        advance: '',
        tripLane:'',
        tripExpenses: '',
        success:''
    };
    $scope.cancel = function () {
        $state.go('trips');
    };

    function getDrivers() {
        DriverServices.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    function getParties() {
        PartyService.getParties(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    function getTripLanes() {
        TripLaneServices.getTripLanes(function (success) {
            if (success.data.status) {
                $scope.tripLanes = success.data.tripLanes;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    getDrivers();
    getParties();
    getTripLanes();

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
            params.date= Number(params.date);
        //     delete params.userName;
        //     delete params.password;
        // }
        //
        // if (!params.name) {
        //     params.error = 'Invalid account name';
        // } else if (!params._id && !params.userName) {
        //     params.error = 'Invalid user name';
        // } else if (!params._id && !Utils.isValidPassword(params.password)) {
        //     params.error = 'Invalid password';
        // } else if (!params.address.trim()) {
        //     params.error = 'Invalid address'
        // } else if (!Utils.isValidPhoneNumber(params.contact)) {
        //     params.error = 'Invalid phone number';
        // } else if (params._id) {
            // If _id update the account
            TripServices.updateTrip(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                    $state.go('trips')
                    Notification.success({message: success.data.message});
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        } else {
            params.date= Number(params.date);
            TripServices.addTrip(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                    $state.go('trips')
                    Notification.success({message: success.data.message});
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        }
    }
}]);

