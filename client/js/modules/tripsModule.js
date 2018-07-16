app.factory('TripServices', ['$http', function ($http) {
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
                url: '/v1/trips/updateTrip',
                method: "POST",
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
        getPartiesWhoHasTrips: function (success, error) {
            $http({
                url: '/v1/trips/getPartiesWhoHasTrips',
                method: "GET"
            }).then(success, error);
        },
        shareDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/trips/shareDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error)
        },
        viewTripDocument: function (params, success, error) {
            $http({
                url: '/v1/trips/viewTripDocument',
                method: "GET",
                params: params
            }).then(success, error)
        },
        deleteTripImage: function (params, success, error) {
            $http({
                url: '/v1/trips/deleteTripImage',
                method: "DELETE",
                params: params
            }).then(success, error)
        },
        getTripInvoiceDetails: function (params, success, error) {
            $http({
                url: '/v1/trips/getTripInvoiceDetails/' + params.tripId + '/' + params.partyId,
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', 'paginationService', 'NgTableParams', 'TrucksService', '$timeout', '$stateParams', function ($scope, $uibModal, TripServices, $state, Notification, paginationService, NgTableParams, TrucksService, $timeout, $stateParams) {
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

        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            truckNumber: tableParams.truckNumber
        };
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        TripServices.getAllAccountTrips(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.trips)) {
                $scope.loading = false;
                $scope.trips = response.data.trips;
                $scope.userId = response.data.userId;
                $scope.userType = response.data.userType;
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
                    Notification.error({message: message});
                });
            }
        }, function (error) {

        })
    }
    $scope.printInvoice = function (tripId, partyId) {

        $state.go('printInvoice', {tripId: tripId, partyId: partyId});
    };
    $scope.printInvoicePDF = function (tripId, partyId) {
        window.open('/v1/trips/getTripInvoiceDetails/' + tripId + '/' + partyId);
    };
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
            }
            ;

        });
    }
    $scope.searchByVechicleNumber = function (truckNumber) {
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
                params.truckNumber = truckNumber;
                loadTableData(params);
            }
        });
    };
    $scope.shareDetailsViaEmail = function () {
        swal({
            title: 'Share trips data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
                return new Promise((resolve) => {
                    TripServices.shareDetailsViaEmail({
                        email: email
                    }, function (success) {
                        if (success.data.status) {
                            resolve()
                        } else {

                        }
                    }, function (error) {

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


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification', 'TrucksService', 'ExpenseMasterServices', '$uibModal', 'Upload', 'truckTrackingService', '$rootScope', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService, ExpenseMasterServices, $uibModal, Upload, truckTrackingService, $rootScope) {
    $scope.pagetitle = "Add Trip";
    // $scope.customFiles=[{},{}]
    $scope.drivers = [];
    $scope.parties = [];
    $scope.trucks = [];
    $scope.isFirstOpen = true;
    $scope.trip = {
        date: '',
        reminderDate: '',
        reminderText: '',
        driverId: '',
        partyId: '',
        registrationNo: '',
        freightAmount: 0,
        deductAmount: 0,
        advanceAmount: 0,
        tripLane: '',  //new..//new...
        tonnes: 0,    //new...
        rate: 0,   //new...
        remarks: '',    //new
        error: [],
        success: [],
        share: false,
        vechicleNo: "",
        driverName: "",
        truckOwnerCharges: [{
            type: undefined,
            amount: undefined
        }],
        expense: [{
            type: undefined,
            amount: undefined
        }],
        totalExpense: 0,
        totalAmount: 0,
        receivableAmount: 0,
        truckType: '',
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date()
    };

    $scope.cancel = function () {
        $state.go('trips');
    };
    $scope.track = function () {
        $state.go('tripView', {
            startDate: $scope.trip.startDate,
            endDate: $scope.trip.endDate,
            regNo: $scope.trip.registrationNo.registrationNo
        });
        /* $scope.trip.startDate.setHours(0);
     $scope.trip.startDate.setMinutes(0);
     $scope.trip.startDate.setSeconds(0);
     $scope.trip.endDate.setHours(23);
     $scope.trip.endDate.setMinutes(59);
     $scope.trip.endDate.setSeconds(59);
     $rootScope.params = {
         regNo:$scope.trip.registrationNo.registrationNo,
         startDate:$scope.trip.startDate,
         endDate:$scope.trip.endDate
     };*/
        /*truckTrackingService.getTruckLocations(params,function(successCallback){
            console.log("trip track. ....locations..",successCallback);
        },function(errorCallback){

        });*/
    };

    function getExpenseMaster() {
        ExpenseMasterServices.getExpenses(null, function (success) {
            if (success.data.status) {
                $scope.expenses = success.data.expenses;
                /*var selectedExpesneType = _.find($scope.expenses, function (expenses) {
                    return expenses._id.toString() === $scope.expenseDetails.expenseType;
                });
                if (selectedExpesneType) {
                    $scope.expenseTitle = selectedExpesneType.expenseName;
                }*/
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.addTruckOwnerCharges = function () {
        if (!$scope.trip.truckOwnerCharges[$scope.trip.truckOwnerCharges.length - 1].type || !$scope.trip.truckOwnerCharges[$scope.trip.truckOwnerCharges.length - 1].amount) {
            Notification.error("Please enter Additional Charges details");
        } else {
            $scope.trip.truckOwnerCharges.push({
                type: undefined,
                amount: undefined
            });
        }
    };

    $scope.deleteTruckOwnerCharges = function (index) {
        if ($scope.trip.truckOwnerCharges.length > 1) {
            $scope.trip.truckOwnerCharges.splice(index, 1);
        } else {
            Notification.error("Please add at least one Truck owner Charge");
        }

    };
    $scope.addExpense = function () {
        if (!$scope.trip.expense[$scope.trip.expense.length - 1].type || !$scope.trip.expense[$scope.trip.expense.length - 1].amount) {
            Notification.error("Please enter Additional Charges details");
        } else {
            $scope.trip.expense.push({
                type: undefined,
                amount: undefined
            });
        }
    };

    $scope.deleteExpense = function (index) {
        if ($scope.trip.expense.length > 1) {
            $scope.trip.expense.splice(index, 1);
        } else {
            Notification.error("Please add at least one Additional Charge");
        }

    };
    getExpenseMaster();
    $scope.viewAttachment = function (keyPath) {
        TripServices.viewTripDocument({filePath: keyPath}, function (success) {

            if (success.data.status) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'viewS3Image.html',
                    controller: 'ViewS3ImageCtrl',
                    size: 'sm',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        path: function () {
                            return success.data.data
                        }
                    }
                });

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {

        })
    };

    $scope.deleteTripImage = function (key, index) {
        TripServices.deleteTripImage({tripId: $scope.trip._id, key: key}, function (success) {
            if (success.data.status) {
                $scope.trip.attachments.splice(index, 1);
                success.data.messages.forEach(function (message) {
                    Notification.success(message);
                });

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        })
    };

    function getTruckTypes() {
        TrucksService.getTruckTypes(function (success) {
            if (success.status) {
                $scope.truckTypesList = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        })
    }

    getTruckTypes();


    function getParties() {
        PartyService.getAllPartiesByTransporter(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                console.log("Parties", success.data.parties);
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
    };

    getParties();


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
                success.data.messages.forEach(function (message) {
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
        console.log("party", party);
        $scope.partyType = party.partyId.partyType;
        $scope.tripLanes = party.partyId.tripLanes;

    };


    $scope.getTrip = function () {
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                $scope.trip.date = new Date($scope.trip.date);
                $scope.trip.reminderText = success.data.reminder.reminderText;
                $scope.trip.reminderDate = new Date(success.data.reminder.reminderDate);

                getTruckIds();
                getParties();
                getDriverIds();
                $scope.calculateReceivleAmount();
                for (var i = 0; i < $scope.trip.expense.length; i++) {
                    $scope.trip.expense[i].type = $scope.trip.expense[i].type._id;
                }
                for (var i = 0; i < $scope.trip.truckOwnerCharges.length; i++) {
                    $scope.trip.truckOwnerCharges[i].type = $scope.trip.truckOwnerCharges[i].type._id;
                }
                if ($scope.trip.truckOwnerCharges.length == 0) {
                    $scope.trip.truckOwnerCharges = [{
                        type: undefined,
                        amount: undefined
                    }]
                }
                if ($scope.trip.expense.length == 0) {
                    $scope.trip.expense = [{
                        type: undefined,
                        amount: undefined
                    }]
                }
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
    $scope.calculateReceivleAmount = function () {
        if ($scope.trip.freightAmount > 0) {
            $scope.trip.totalExpense = 0;
            for (var i = 0; i < $scope.trip.expense.length; i++) {
                if ($scope.trip.expense[i].amount) {

                    $scope.trip.totalExpense += $scope.trip.expense[i].amount;
                }
            }
            ;
            $scope.trip.totalAmount = $scope.trip.freightAmount + $scope.trip.totalExpense;
            $scope.trip.receivableAmount = $scope.trip.totalAmount - $scope.trip.advanceAmount;
        }

    };
    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        // console.log("update trip...",$scope.trip);
        params.errors = [];
        if (!params.date) {
            params.errors.push('Please Select Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Please Select a Vehicle');
        }
        /*if (!params.driverId) {
            params.errors.push('Please Select a Driver');
        }*/
        if (!params.partyId) {
            params.errors.push('Please Select a Party');
        }
        /*   if (!params.source) {
               params.errors.push('Please Select a Trip Lane');
           }
           if (!params.destination) {
               params.errors.push('Please Select a Trip Lane');
           }*/
        if (!params.errors.length) {
            params.partyId = params.partyId._id;
            if (params._id) {

                params.date = Number(params.date);
                if ($scope.trip.attachments.length > 0) {
                    $scope.files.forEach(function (file) {
                        if (file.key) {
                            $scope.trip.attachments.push(file);
                        }
                    })
                } else {
                    $scope.trip.attachments = $scope.files;
                }
                TripServices.updateTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success({message: 'Trip updated successfully'});
                        $state.go('trips');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (error) {

                });

            } else {
                $scope.trip.attachments = $scope.files;
                TripServices.addTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success('Trip added successfully');
                        $state.go('trips');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (error) {

                });
            }

        }
    };

    $scope.pickerStart = {
        date: new Date()
    };
    $scope.pickerEnd = {
        date: new Date()
    };

    $scope.openCalendarStartDate = function (e, picker) {
        $scope[picker].open = true;
    };
    $scope.openCalendarEndDate = function (e, picker) {
        $scope[picker].open = true;
    };

    $scope.selectedTruckTonnage = function () {
        $scope.trip.tonnage = parseInt($scope.trip.registrationNo.tonnage);
    };

    $scope.$watch("trip.tonnage", function (newValue, oldValue) {
        $scope.calculateFreightAmount();
    });
    $scope.$watch("trip.rate", function (newValue, oldValue) {
        $scope.calculateFreightAmount();

    });
    $scope.$watch("trip.deductAmount", function (newValue, oldValue) {
        $scope.calculateFreightAmount();

    });
    $scope.$watch("trip.freightAmount", function (newValue, oldValue) {
        $scope.calculateReceivleAmount();

    });
    $scope.$watch("trip.advanceAmount", function (newValue, oldValue) {
        $scope.calculateReceivleAmount();
    });
    $scope.calculateFreightAmount = function () {

        if ($scope.trip.tonnage > 0 && $scope.trip.rate > 0 && $scope.trip.deductAmount >= 0) {
            $scope.trip.freightAmount = ($scope.trip.tonnage * $scope.trip.rate) - $scope.trip.deductAmount;
        }
        return $scope.trip.freightAmount;
    };
    /*---------------Adding Trucks From Trips Controller-------------------*/


    $scope.addTruckFromTrips = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addTruck.html',
            controller: 'truckDriverPartyCtrl',
            size: 'md',
            /* windowClass: 'window-custom',*/
            backdrop: 'static',
            keyboard: false,
        });
        modalInstance.result.then(function () {
            getTruckIds();
        }, function () {
        });
    };


    /*---------------Adding Driver From Trips Controller-------------------*/


    $scope.addDriverFromTrip = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addDriver.html',
            controller: 'truckDriverPartyCtrl',
            size: 'md',
            /* windowClass: 'window-custom',*/
            backdrop: 'static',
            keyboard: false,
        });
        modalInstance.result.then(function () {
            getDriverIds();
        }, function () {
        });
    };


    /*---------------Adding party From Trips Controller-------------------*/


    $scope.addPartyFromTrip = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addParty.html',
            controller: 'truckDriverPartyCtrl',
            size: 'md',
            /* windowClass: 'window-custom',*/
            backdrop: 'static',
            keyboard: false,
        });
        modalInstance.result.then(function () {
            getParties();
        }, function () {
        });
    };
}]);

app.controller('truckDriverPartyCtrl', ['$scope', '$uibModalInstance', 'TripServices', '$state', 'Notification', 'TrucksService', 'DriverService', 'PartyService', 'Utils', function ($scope, $uibModalInstance, TripServices, $state, Notification, TrucksService, DriverService, PartyService, Utils) {

    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function getTruckTypes() {
        TrucksService.getTruckTypes(function (success) {
            if (success.data.status) {
                $scope.truckTypesList = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        })
    }

    getTruckTypes();

    $scope.truck = {};

    $scope.addNewTruck = function () {
        var params = $scope.truck;
        params.errors = [];

        if (!params.registrationNo) {
            params.errors.push('Invalid Registration Number');
        }
        if (!params.truckType) {
            params.errors.push('Invalid Truck Type');
        }
        if (!params.errors.length) {
            if (typeof params.truckType === "object") {
                params.tonnage = params.truckType.tonnes;
                params.truckTypeId = params.truckType._id;
                params.truckType = params.truckType.title;
            }
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: "Truck Added Successfully"});
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                console.log("Thank You")
            }
        }
    };

    $scope.driver = {};

    $scope.addNewDriver = function () {
        var params = $scope.driver;
        params.errors = [];
        if (!params.fullName) {
            params.errors.push('Please provide driver\'s full name')
        }
        if (params.errors.length > 0) {

        } else {
            DriverService.addDriver(params, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Driver Added Successfully"});
                    $uibModalInstance.close({status: true, message: success.data.message});
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message)
                    });
                }
            }, function (error) {

            });

        }
    };

    $scope.party = {
        name: '',
        contact: '',
        partyType: 'Load Owner',
        error: []
    }

    $scope.addNewParty = function () {
        var params = $scope.party;
        params.error = [];

        if (!params.name) {
            params.error.push('Please enter Party Name');
        }
        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error.push('Please enter Party mobile number');
        }
        if (!params.error.length) {
            PartyService.addParty(params, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Party Added Successfully"});
                    $uibModalInstance.close({status: true, message: success.data.message});
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {
            });

        }
    };

}]);


app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {

    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };


}]);
app.controller('UploadTripsCtrl', ['$scope','Upload','Notification','$state', function ($scope, Upload,Notification,$state) {
    $scope.file=undefined;
    $scope.uploadTrips=function () {
        console.log("filess");
        if(!$scope.file){
            Notification.error("Please select file");
        }else{
            Upload.upload({
                url: '/v1/trips/uploadTrips',
                data: {
                    file: $scope.file,
                },
            }).then(function (success) {
                if (success.data.status) {
                  Notification.success(success.data.messages[0]);
                  $state.go("trips");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            });

        }
    }

}]);
