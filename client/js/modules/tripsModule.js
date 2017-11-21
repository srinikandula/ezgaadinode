app.factory('TripServices', function ($http) {
    return {
        addTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/addTrip',
                method: "POST",
                data: trip
            }).then(success, error)
        },
        getAllTrips: function (pageable, success, error) {
            $http({
                url: '/v1/trips/getAllTrips/',
                method: "GET",
                params: pageable
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
        count: function (success, error) {
            $http({
                url: '/v1/trips/total/count',
                method: "GET"
            }).then(success, error)
        }

    }
});

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', 'paginationService','NgTableParams', function ($scope, $uibModal, TripServices, $state, Notification, paginationService, NgTableParams) {
    $scope.goToEditTripPage = function (tripId) {
        $state.go('tripsEdit', {tripId: tripId});
    };

    $scope.count = 0;
    $scope.getCount = function () {
        TripServices.count(function (success) {
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
        TripServices.getAllTrips(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.trips)) {
                $scope.loading = false;
                $scope.trips = response.data.trips;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trips;
                $scope.currentPageOfTrips = $scope.trips;

            }
        });
    };

    $scope.init = function () {
        $scope.tripParams = new NgTableParams({
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


      $scope.deleteTrip = function (tripId) {
          TripServices.deleteTrip(tripId, function (success) {
              if (success) {
                  $scope.getCount();
                  Notification.success({message: "Trip deleted successfully"});
              } else {
                  success.data.messages.forEach(function (message) {
                      Notification.error(message);
                  });
              }
          })
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
        partyId: '',
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
       PartyService.getAllParties(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                var selectedParty = _.find( $scope.parties, function (party) {
                    return party._id.toString() === $scope.trip.partyId;
                });
                 if(selectedParty){
                    $scope.partyName = selectedParty.name;
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
    $scope.selectBookedFor = function (booked) {
        $scope.trip.bookedFor = booked._id;
    }


    function getTruckIds() {
     // TrucksService.getAllAccountTrucks(1,function (success) {
        TrucksService.getAllAccountTrucks(function (success) {
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
                $scope.trip.date = new Date($scope.trip.date);
                // console.log('trip', $scope.trip)
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
    $scope.$watch("trip.tonnage", function(newValue, oldValue){
        $scope.calculateFreightAmount();
    });
    $scope.$watch("trip.rate", function(newValue, oldValue){
        $scope.calculateFreightAmount();
    });
    $scope.calculateFreightAmount = function () {
        if($scope.trip.tonnage>0 && $scope.trip.rate>0) {
            $scope.trip.freightAmount = $scope.trip.tonnage * $scope.trip.rate;
        }
        return $scope.trip.freightAmount;
    };
}]);

