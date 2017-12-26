app.factory('TripServices', function ($http) {
    return {
        addTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/addTrip',
                method: "POST",
                data: trip
            }).then(success, error)
        },
        getAllTrips: function (success, error) {
            $http({
                url: '/v1/trips/getAllTrips/',
                method: "GET",
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
        getAllAccountTrips: function (pageable, success, error) {
            $http({
                url: '/v1/trips/getAllAccountTrips',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        findTotalRevenue: function (success, error) {
            $http({
                url: '/v1/trips/find/totalRevenue',
                method: "GET"
            }).then(success, error)
        },
        findRevenueByVehicle: function (params, success, error) {
            $http({
                url: '/v1/trips/find/revenueByVehicle',
                method: "GET",
                params: params
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/trips/total/count',
                method: "GET"
            }).then(success, error)
        },
        shareRevenueDetailsByVechicleViaEmail: function (params, success, error) {
            $http({
                url: '/v1/trips/shareRevenueDetailsByVechicleViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        }


    }
});

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', 'paginationService', 'NgTableParams','TrucksService', function ($scope, $uibModal, TripServices, $state, Notification, paginationService, NgTableParams,TrucksService) {
    $scope.goToEditTripPage = function (tripId) {
        $state.go('tripsEdit', {tripId: tripId});
    };

    $scope.count = 0;
    $scope.getCount = function () {0
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

        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),truckNumber:tableParams.truckNumber};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        TripServices.getAllAccountTrips(pageable, function (response) {
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
    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucks(null, function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }
    $scope.init = function () {
        $scope.tripParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                $scope.getAllTrucks();
            }
        });
    };


    $scope.deleteTrip = function (tripId) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E83B13',
            cancelButtonColor: '#9d9d9d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                TripServices.deleteTrip(tripId, function (success) {
                        if (success.data.status) {
                            swal(
                                'Deleted!',
                                'Trip deleted successfully 123.',
                                'success'
                            );
                            $scope.getCount();
                        } else {
                            success.data.messages.forEach(function (message) {
                                swal(
                                    'Deleted!',
                                    message,
                                    'error'
                                );
                            });
                        }

                });
            };
        
    });
}
    $scope.searchByVechicleNumber=function(truckNumber){
        $scope.tripParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.truckNumber=truckNumber;
                loadTableData(params);
            }
        });
    }

}]);


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification', 'TrucksService', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService) {
    $scope.pagetitle = "Add Trip";

    $scope.drivers = [];
    $scope.parties = [];
    $scope.isFirstOpen = true;
    $scope.trip = {
        date: '',
        driverId: '',
        partyId: '',
        registrationNo: '',
        freightAmount: '',
        tripLane: '',  //new..//new...
        tonnage: '',    //new...
        rate: '',   //new...
        remarks: '',    //new
        error: [],
        success: [],
        share: false,
        vechicleNo: "",
        driverName: ""
    };

    $scope.cancel = function () {
        $state.go('trips');
    };


    function getParties() {
        PartyService.getAllPartiesByTransporter(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.trip.partyId;
                });
                if (selectedParty) {
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
        TrucksService.getAllAccountTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.trip.registrationNo;
                });
                if (selectedTruck) {
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
        $scope.trip.vechicleNo = truck.registrationNo;
    }

    function getDriverIds() {
        DriverService.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
                //console.log($scope.drivers);
                var selectedDriver = _.find($scope.drivers, function (driver) {
                    return driver._id.toString() === $scope.trip.driverId;
                });
                //console.log('selectedDriver : ',selectedDriver)
                if (selectedDriver) {
                    $scope.driverId = selectedDriver.fullName;
                }
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.selectTruckDriver = function (driver) {
        $scope.trip.driverId = driver._id;
        $scope.trip.driverName = driver.fullName;
        $scope.trip.driverNumber = driver.mobile;
    }

    $scope.selectTripLane = function (triplane) {
        console.log("selected triplane " + JSON.stringify(triplane));
        $scope.trip.tripLane = triplane.name;

    }
    $scope.selectParty = function (party) {
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
                getDriverIds();
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
        getDriverIds();
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
        //console.log($scope.trip);
        params.errors = [];
        if (!params.date) {
            params.errors.push('Please Provide Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Please Provide Registration Number');
        }
        if (!params.driverId) {
            params.errors.push('Please Select Driver');
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
    $scope.$watch("trip.tonnage", function (newValue, oldValue) {
        $scope.calculateFreightAmount();
    });
    $scope.$watch("trip.rate", function (newValue, oldValue) {
        $scope.calculateFreightAmount();
    });
    $scope.calculateFreightAmount = function () {
        if ($scope.trip.tonnage > 0 && $scope.trip.rate > 0) {
            $scope.trip.freightAmount = $scope.trip.tonnage * $scope.trip.rate;
        }
        return $scope.trip.freightAmount;
    };
}]);

