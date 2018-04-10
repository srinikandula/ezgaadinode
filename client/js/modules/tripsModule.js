app.factory('TripServices',['$http', function ($http) {
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
        },
        getPartiesByTrips:function(success,error){
            $http({
                url: '/v1/trips/getPartiesByTrips',
                method: "GET"
            }).then(success, error);
        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/trips/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        }
    }
}]);

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
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trips;
                $scope.currentPageOfTrips = $scope.trips;
            }
        });
    };
    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
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
                                'Trip deleted successfully.',
                                'success'
                            );
                            $scope.getCount();
                        } else {
                            success.data.messages.forEach(function (message) {
                                swal(
                                    'Error!',
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
    };
    $scope.shareDetailsViaEmail=function(){
        swal({
            title: 'Share trips data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                TripServices.shareDetailsViaEmail({
                email:email
            },function(success){
                if (success.data.status) {
                    resolve()
                } else {

                }
            },function(error){

            })
        })

    },
        allowOutsideClick: false

    }).then((result) => {
            if (result.value) {
            swal({
                type: 'success',
                html: ' sent successfully'
            })
        }
    })
    };
    $scope.downloadDetails = function () {
        window.open('/v1/trips/downloadDetails');
    };

}]);


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification', 'TrucksService', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService) {
    $scope.pagetitle = "Add Trip";

    $scope.drivers = [];
    $scope.parties = [];
    $scope.trucks = [];
    $scope.isFirstOpen = true;
    $scope.trip = {
        date: '',
        driverId: '',
        partyId: '',
        registrationNo: '',
        freightAmount: '',
        tripLane: '',  //new..//new...
        tonnes: '',    //new...
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

    function getTruckTypes() {
        TrucksService.getTruckTypes(function (success) {
            if(success.status){
                $scope.truckTypesList=success.data.data;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        },function (error) {

        })
    }
    getTruckTypes();


    function getParties() {
        PartyService.getAllPartiesByTransporter(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.trip.partyId;
                });
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                    $scope.tripLanes = selectedParty.tripLanes;
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
        TrucksService.getAllTrucksForFilter(function (success) {
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
        DriverService.getAllDriversForFilter(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
                var selectedDriver = _.find($scope.drivers, function (driver) {
                    return driver._id.toString() === $scope.trip.driverId;
                });
                if (selectedDriver) {
                    $scope.driverName = selectedDriver.fullName;
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

    $scope.selectParty = function (party) {
        console.log("party",party);
        $scope.partyType=party.partyId.partyType;
        $scope.tripLanes = party.partyId.tripLanes;

    };


    $scope.getTrip = function () {
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                $scope.trip.date = new Date($scope.trip.date);
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
    $scope.searchSource = function () {
        var input = document.getElementById('source');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.trip.source = place.name;
                $scope.trip.sourceAddress = place.formatted_address;

            });
    };
    $scope.searchDestination = function () {
        var input = document.getElementById("destination");
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.trip.destination = place.name;
                $scope.trip.destinationAddress = place.formatted_address;
            });
    };

    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        params.errors = [];
        if (!params.date) {
            params.errors.push('Please Select Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Please Select a Vehicle');
        }
        if (!params.driverId) {
            params.errors.push('Please Select a Driver');
        }
        if (!params.partyId) {
            params.errors.push('Please Select a Party');
        }
        if (!params.source) {
            params.errors.push('Please Select a Trip Lane');
        }
        if (!params.destination) {
            params.errors.push('Please Select a Trip Lane');
        }
        if (!params.errors.length) {
            params.partyId=params.partyId._id;
            if (params._id) {
                params.date = Number(params.date);
               /* if(typeof  $scope.trip.tripLane ==="string") {
                    $scope.trip.tripLane = {name: $scope.trip.tripLane}
                }*/
                TripServices.updateTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success({message: 'Trip updated successfully'});
                        $state.go('trips');
                    } else {
                        params.errors.push(success.data.message);
                    }
                }, function (err) {

                });
            } else {
                TripServices.addTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success('Trip added successfully');
                        $state.go('trips');
                    } else {
                        params.errors = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    };


    $scope.selectedTruckTonnage=function(){
        $scope.trip.tonnage=parseInt($scope.trip.registrationNo.tonnage);
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

