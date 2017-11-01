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
                url: '/v1/trips/' + tripId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', function ($scope, $uibModal, TripServices, $state, Notification) {
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
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getTripsData();

    $scope.deleteTrip = function (tripId) {
        TripServices.deleteTrip(tripId, function (success) {
            if (success) {
                $scope.getTripsData();
                Notification.success({message: "Trip deleted successfully"});
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        })
    };

    $scope.tripGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Date',
            field: 'date',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Registration No',
            field: 'attrs.truckName'
        }, {
            name: 'Driver',
            field: 'attrs.fullName'
        }, {
            name: 'Booked For',
            field: 'attrs.partyName'
        }, {
            name: 'FreightAmount',
            field: 'freightAmount'
        }, {
            name: 'Advance',
            field: 'advance'
        }, {
            name: 'Balance',
            field: 'balance'
        }, {
            name: 'Trip Expenses',
            field: 'tripExpenses'
        }, {
            name: 'Trip Lane',
            field: 'attrs.tripLaneName'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditTripPage(row.entity._id)" class="glyphicon glyphicon-edit edit" "></a>' +
            '<a ng-click="grid.appScope.deleteTrip(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification) {
    $scope.pagetitle = "Add Trip";

    $scope.drivers = [];
    $scope.parties = [];

    $scope.trip = {
        date: '',
        driver: '',
        bookedFor: '',
        registrationNo: '',
        freightAmount: '',
        balance: '',
        advance: '',
        tripLane: '',
        tripExpenses: '',
        bookLoad: '',   //new...
        dieselAmount: '',   //new...
        tollgateAmount: '', //new..
        from: '',    //new...
        to: '',  //new...
        tonnage: '',    //new...
        rate: '',   //new...
        paymentType: '',    //new
        remarks: '',    //new
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
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    function getParties() {
        PartyService.getParties(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    function getTripLanes() {
        TripLaneServices.getAllTripLanes(function (success) {
            if (success.data.status) {
                $scope.tripLanes = success.data.tripLanes;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    function getTruckIds() {
        DriverService.getAllTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    getTruckIds();
    getDrivers();
    getParties();
    getTripLanes();

    $scope.calculateBalance = function () {
        $scope.trip.balance = $scope.trip.freightAmount - $scope.trip.advance;
    };
    if ($stateParams.tripId) {
        $scope.pagetitle = "Edit Trip";
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                $scope.trip.date = new Date($scope.trip.date);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        params.errors = [];

        if (!params.date) {
            params.errors.push('Valid Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Valid Registration Number');
        }
        if (!params.driver) {
            params.errors.push('Please Select Driver');
        }
        if (!params.bookedFor) {
            params.errors.push('Valid Booked For');
        }
        if (!_.isNumber(params.freightAmount)) {
            params.errors.push('Please add freightAmount');
        }
        if (!_.isNumber(params.balance)) {
            params.errors.push('Please add Balance');
        }
        if (!params.tripLane) {
            params.errors.push('Please Select Trip Lane');
        }
        if (!_.isNumber(params.advance)) {
            params.errors.push('Please add Advance');
        }
        if (!_.isNumber(params.tripExpenses)) {
            params.errors.push('Please add tripExpenses');
        }
        if (!_.isNumber(params.bookLoad)) {
            params.errors.push('Please add bookLoad');
        }
        if (!_.isNumber(params.dieselAmount)) {
            params.errors.push('Please add dieselAmount');
        }
        if (!_.isNumber(params.tollgateAmount)) {
            params.errors.push('Please add tollgateAmount');
        }
        if (!params.from) {
            params.errors.push('Please add from');
        }
        if (!params.to) {
            params.errors.push('Please add to');
        }
        if (!_.isNumber(params.tonnage)) {
            params.errors.push('Please add tonnage');
        }
        if (!_.isNumber(params.rate)) {
            params.errors.push('Please add rate');
        }
        if (!params.paymentType) {
            params.errors.push('Please add paymentType');
        }
        if (!params.remarks) {
            params.errors.push('Please add remarks');
        }

        if (!params.errors.length) {
            if (params._id) {
                params.date = Number(params.date);
                TripServices.updateTrip(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: 'Trip updated successfully'});
                        $state.go('trips');
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                TripServices.addTrip(params, function (success) {
                    if (success.data.status) {
                        Notification.success('Trip added successfully');
                        $state.go('trips');
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

