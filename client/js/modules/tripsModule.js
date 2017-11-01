app.factory('TripServices', function ($http) {
    return {
        addTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/addTrip',
                method: "POST",
                data: trip
            }).then(success, error)
        },
        getTrips: function (pageNumber, success, error) {
            $http({
                url: '/v1/trips/getAll/' + pageNumber,
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
        TripServices.getTrips($scope.pageNumber, function (success) {
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
    };

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
            field: 'attrs.fullName'
        },{
            name: 'Booked For',
            field: 'attrs.partyName'
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
            field: 'attrs.tripLaneName'
        },{
            name: 'Created By',
            field: 'attrs.createdByName'
        },{
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditTripPage(row.entity._id)" class="glyphicon glyphicon-edit edit" "></a>' +
             '<a ng-click="grid.appScope.deleteTrip(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>'+
            '</div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditTripCtrl', ['$scope','$state', 'Utils', 'TripServices','DriverService','PartyService','TripLaneServices', '$stateParams', 'Notification', function ($scope,$state, Utils, TripServices,DriverService,PartyService,TripLaneServices, $stateParams, Notification) {
    console.log('-->', $stateParams);
    $scope.pagetitle = "Add Trip";

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
        error:[],
        success:[]
    };
    $scope.cancel = function () {
        $state.go('trips');
    };

    function getDrivers() {
        DriverService.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    function getParties() {
        // console.log('parties--->');
        PartyService.getParties(function (success) {
            // console.log('succ',success.data);
            if (success.data.status) {
                $scope.parties = success.data.parties;
                // console.log('parties',$scope.parties);
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    function getTripLanes() {
        console.log('triplanes--->');
        TripLaneServices.getAllTripLanes(function (success) {
            if (success.data.status) {
                $scope.tripLanes = success.data.tripLanes;
                console.log('triplanes...',$scope.tripLanes);
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
        // $scope.trip.date = '';
        $scope.pagetitle = "Edit Trip";
        TripServices.getTrip($stateParams.tripId, function (success) {
            console.log('acc--->', success.data.trip);
            if (success.data.status) {
                $scope.trip = success.data.trip;
                $scope.trip.date = new Date($scope.trip.date);
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        params.success = [];
        params.error = [];
        if (!params.date) {
            params.error.push('Valid Trip Date');
        }
        if (!params.registrationNo) {
            params.error.push('Valid Registration Number');
        }
        if (!params.driver) {
            params.error.push('Please Select Driver');
        }
        if (!params.bookedFor) {
            params.error.push('Valid Booked For');
        }
        if (!_.isNumber(params.freightAmount)) {
            params.error.push('Please add freightAmount');
        }
        if (!_.isNumber(params.balance)) {
            params.error.push('Please add Balance');
        }
        if (!params.tripLane) {
            params.error.push('Please Select Trip Lane');
        }
        if (!_.isNumber(params.advance)) {
            params.error.push('Please add Advance');
        }
        if (!_.isNumber(params.tripExpenses)) {
            params.error.push('Please add tripExpenses');
        }
        console.log(params.error);
        if (!params.error.length) {
            if (params._id) {
                params.date = Number(params.date);
                TripServices.updateTrip(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('trips');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                console.log('add');
                TripServices.addTrip(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('trips');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                    console.log(params);
                }, function (err) {

                });
            }
        }
    }
}]);

