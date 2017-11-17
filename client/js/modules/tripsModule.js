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
        },
        addPayment: function (paymentdetails, success, error) {
            $http({
                url: '/v1/payments',
                method: "PUT",
                data: paymentdetails
            }).then(success, error)
        },
        getAllAccountTrips: function (success, error) {
            $http({
                url: '/v1/trips/getAllAccountTrips',
                method: "GET"
            }).then(success, error)
        },

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
            name: 'Party',
            field: 'attrs.partyName'
        }, {
            name: 'FreightAmount',
            field: 'freightAmount'
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


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification','TrucksService', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService) {
    $scope.pagetitle = "Add Trip";

    $scope.drivers = [];
    $scope.parties = [];
    $scope.isFirstOpen=true;
    $scope.trip = {
        date: '',
        driver: '',
        Party: '',
        registrationNo: '',
        freightAmount: '',
        tripLane: '',  //new..//new...
        tonnage: '',    //new...
        rate: '',   //new...
        remarks: '',    //new
        error:[],
        success:[]
    };

    $scope.cancel = function () {
        $state.go('trips');
    };



    function getParties() {
       PartyService.getParties(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                var selectedParty = _.find( $scope.parties, function (party) {
                    return party._id.toString() === $scope.trip.partyId;
                });
                 if(selectedParty){
                    $scope.trip.partyName = selectedParty.name;
                    $scope.tripLanesList = selectedParty.tripLanes;
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }



    function getTruckIds() {
     // TrucksService.getAllAccountTrucks(1,function (success) {
        TrucksService.getGroupTrucks(1, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find( $scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.trip.registrationNo;
                });
                if(selectedTruck){
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }
    $scope.selectTruckId = function (truck) {
        $scope.trip.registrationNo = truck._id;
    }
    $scope.selectTruckDriver = function (driver) {
        $scope.trip.driver = driver._id;
    }
    $scope.selectBookedFor = function (booked) {
        $scope.trip.bookedFor = booked._id;
    }
    $scope.selectTripLane = function (triplane) {
        console.log("selected triplane " + JSON.stringify(triplane));
        $scope.trip.tripLane = triplane.name;

    }
    $scope.selectParty = function(party) {
        $scope.trip.partyId = party._id;
        $scope.tripLanesList = party.tripLanes;
    }



    $scope.getTrip = function () {
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                console.log($scope.trip);
                $scope.trip.date = new Date($scope.trip.date);

                getTruckIds();
                getParties();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    };
    $scope.showHistory = false;
    if ($stateParams.tripId) {
        $scope.showHistory = true;
        $scope.pagetitle = "Edit Trip";
        $scope.getTrip();
    } else {
        getTruckIds();
        getParties();
    }

    $scope.paymentFlag = false;
    $scope.addPaymentFlag = function () {
        $scope.paymentFlag = true;
    };
    $scope.removePaymentFlag = function () {
        $scope.paymentFlag = false;
    };

    $scope.paymentDetails = {
        tripId: '',
        paymentDate: '',
        amount: '',
        paymentType: '',
        errors: [],
        success: []
    };




    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        console.log($scope.trip);
        params.errors = [];
        if (!params.date) {
            params.errors.push('Valid Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Valid Registration Number');
        }

        if (!params.errors.length) {
            if (params._id) {
                params.date = Number(params.date);

                TripServices.updateTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        console.log(success.data);
                        Notification.success({message: 'Trip updated successfully'});
                        $state.go('trips');
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                TripServices.addTrip($scope.trip, function (success) {
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
    };
    $scope.calcFreightAmount = function () {
        var params = $scope.trip;
        console.log(params.tonnage.length>0, params.rate.length>0);
        if(params.tonnage>0 && params.rate>0) {
            params.freightAmount = params.tonnage*params.rate;
        }
    };
}]);

