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
        },
        // createTripSheets: function (success, error) {
        //     $http({
        //         url: '/v1/trips/createTripSheet',
        //         method: "GET"
        //     }).then(success, error)
        // },
        getAllTripSheets: function (today, success, error) {
            $http({
                url: '/v1/trips/getTripSheets/' + today,
                method: "GET"
            }).then(success, error)
        },
        createTripSheet:function (date,success, error) {
            $http({
                url: '/v1/trips/createTripSheet/'+date,
                method: "GET"
            }).then(success, error)
        },
        updateTripSheet: function (params, success, error) {
            $http({
                url: '/v1/trips/updateTripSheet',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        getAllLoadingPoints: function (success, error) {
            $http({
                url: '/v1/loading/getAll',
                method: 'GET'
            }).then(success, error)
        },
        getAllUnloadingPoints: function (success, error) {
            $http({
                url: '/v1/unloading/getAll',
                method: 'GET'
            }).then(success, error)
        },
        saveLoadingPoint: function (loadingPoint, success, error) {
            $http({
                url: '/v1/loading/addLoadingPoint',
                method: 'POST',
                data: loadingPoint
            }).then(success, error)
        },
        saveUnloadingPoint: function (unloadingPoint, success, error) {
            $http({
                url: '/v1/unloading/addUnloadingPoint',
                method: 'POST',
                data: unloadingPoint
            }).then(success, error)
        },
        tripsSheetReport: function (params, success, error) {
            $http({
                url: '/v1/trips/tripSheetReport',
                method: 'GET',
                data: params
            }).then(success, error)
        },
        addNewTripSheet: function (params, success, error) {
            $http({
                url: '/v1/trips/addTripsheetTrip',
                method: 'POST',
                data: params
            }).then(success, error)
        },
        lockDataReport: function (lockData, success, error) {
          $http({
              url: 'v1/trips/lockDataReport',
              method: 'POST',
              data: lockData
          }).then(success, error)
        },
        getLockStatus: function (date,success, error) {
            $http({
                url: 'v1/trips/getLockStatus/'+date,
                method: 'GET'
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
            truckNumber: tableParams.truckNumber,
            truckType: tableParams.truckType
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
    };
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
                $scope.getAddedTruckTypes();
            }
        });
    };

    $scope.getAddedTruckTypes = function () {
        TrucksService.getAddedTruckTypes(function (success) {
            if (success.data.status) {
                $scope.addedTruckTypes = success.data.data;

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }

        }, function (error) {

        })
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
    };
    $scope.params = {};
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
                if ($scope.params.truckType) {
                    params.truckType = $scope.params.truckType.title;
                }
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
        truckId: '',
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
                // console.log("Parties", success.data.parties);
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
                    return truck._id.toString() === $scope.trip.truckId;
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

    // $scope.selectTruckId = function (truck) {
    //     $scope.trip.registrationNo = truck._id;
    //     $scope.trip.vechicleNo = truck.registrationNo;
    // }

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
        $scope.partyType = party.partyId.partyType;
        $scope.tripLanes = party.partyId.tripLanes;

    };


    $scope.getTrip = function () {
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                // console.log("$scope.trip", $scope.trip);
                $scope.trip.date = new Date($scope.trip.date);
                $scope.trip.reminderText = success.data.reminder.reminderText;
                $scope.trip.reminderDate = new Date(success.data.reminder.reminderDate);

                getTruckIds();
                getParties();
                getDriverIds();
                $scope.calculateReceivleAmount();
                for (var i = 0; i < $scope.trip.expense.length; i++) {
                    if ($scope.trip.expense[i].type !== undefined) {
                        $scope.trip.expense[i].type = $scope.trip.expense[i].type._id;
                    }
                }
                for (var i = 0; i < $scope.trip.truckOwnerCharges.length; i++) {
                    if ($scope.trip.truckOwnerCharges[i].type !== undefined) {
                        $scope.trip.truckOwnerCharges[i].type = $scope.trip.truckOwnerCharges[i].type._id;
                    }
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
        params.errors = [];
        if (_.isEmpty($scope.files[0])) {
            $scope.files = [];
        }
        if (!params.date) {
            params.errors.push('Please Select Trip Date');
        }
        // params.truckId = params.registrationNo;
        // console.log('truck selected now '+ params.truckId);
        if (!params.truckId) {
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

    $scope.saveLpoint = function (loadingPoint) {
        // console.log("sdasdad", loadingPoint);
        TripServices.saveLoadingPoint({loadingPoint: loadingPoint}, function (success) {
            if (success.data.status) {
                success.data.messages.forEach(function (messages) {
                    Notification.success(messages);
                });
                $uibModalInstance.close({status: true, message: success.data.message});
            }else{
                success.data.messages.forEach(function (messages) {
                    Notification.success(messages);
                });
            }
        })
    };

    $scope.saveUnlpoint = function (unloadingPoint) {
        // console.log("sdasdad", loadingPoint);
        TripServices.saveUnloadingPoint({unloadingPoint: unloadingPoint}, function (success) {
            if (success.data.status) {
                success.data.messages.forEach(function (messages) {
                    Notification.success(messages);
                });
                $uibModalInstance.close({status: true, message: success.data.message});
            }else{
                success.data.messages.forEach(function (messages) {
                    Notification.error(messages);
                });
            }
        })
    };


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

    $scope.$on('loadingPoints', function (e, value) {
       console.log('==>>', loadingPoints);
    });

}]);


app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {

    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };


}]);
app.controller('UploadTripsCtrl', ['$scope', 'Upload', 'Notification', '$state', function ($scope, Upload, Notification, $state) {
    $scope.file = undefined;
    $scope.uploadTrips = function () {
        if (!$scope.file) {
            Notification.error("Please select file");
        } else {
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


app.controller('TripSheetCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', 'paginationService', 'NgTableParams', 'TrucksService', '$timeout', '$stateParams', 'PartyService', 'DriverService', '$rootScope','$cookies',
    function ($scope, $uibModal, TripServices, $state, Notification, paginationService, NgTableParams, TrucksService, $timeout, $stateParams, PartyService, DriverService, $rootScope,$cookies) {

    $scope.validateTable = false;

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.popup2 = {
        opened: false
    };
// $scope.userLock=function(checked){
//     if($cookies.get('admin')&& checked){
//          $scope.value=true;
//     }
//
// }
// $scope.userLock();

        // $scope.addSegments = function() {
        //     angular.element(document.getElementById('modalCreateBtn'))[0].disabled = !userLogins.admin.true;
        // }
        $scope.userType=$cookies.get('admin');
    $scope.toggleDate = function(checked) {
       // $scope.userType=$cookies.get('admin');
        console.log("User Typeeeeeeee.......", $scope.userType);
        $scope.condtion=$scope.userType;
            if ($scope.userType === 'true') {
                $scope.value = false;
                console.log("Ifeeeeeeeeeeeeeeeeeeeeeeee.......");
            } else {
                $scope.value = true;
                console.log("elseeeeeeeeeeeeeeeeeeeee.........");
                console.log("value",$scope.value);
                console.log("hiiii");
            }

        var date = new Date();
        var params = {};
        params.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        params.locked = checked;

        TripServices.lockDataReport(params, function (success) {
            if (success.data.status) {
                // $scope.lockData = success.data.data;
                // swal("Good job!", "Lock Data Update Successfully!", "Success");
            } else {
                // swal("Lock Data NotUpdate Successfully!", "Success");
            }
        }, function (error) {

        })

    };

$scope.result=[];
    $scope.getLockStatus= function (date) {
        var date = new Date(date);
        $scope.today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        console.log("unlockStatus date",$scope.today);
        TripServices.getLockStatus($scope.today,function(success){
            if(success.data.status){
                $scope.result=success.data.data;
                //console.log("typeeeeeeeeeee",$scope.result[0].locked);
                //console.log("condition",$scope.value);
               // console.log("checked",success.data.data[0].locked);
              if($scope.userType === 'true'){
                  // console.log("typeeeeeeeeeeeif",typeof ($scope.result[0].locked));
                  $scope.checked=success.data.data[0].locked;

              }else{
                  $scope.checked=success.data.data[0].locked;
                  $scope.value=success.data.data[0].locked;
              }

             //$scope.value=success.data.data[0].locked;
            }
            // else{
            //     success.data.messages.forEach(function (message) {
            //         Notification.error({message: message});
            //     });
            // }
            },
            function(error){

        })
    };


    // $scope.show = function () {
    //     $scope.userType=$cookies.get('admin');
    //     console.log("kgjbnlkjgdb", $scope.userType);
    //     if ((userLogins.admin == true) == "toggleAdminS") {
    //         $("div.toggleAdminS").show();
    //     }
    //
    //     if ((!userLogins.admin == false) == "toggleAdminH") {
    //         $("div.toggleAdminH").hidden;
    //     }
    //
    //     if ((userLogins.user == false) == "toggleUserS") {
    //         $("div.toggleUserS").show();
    //     }
    //
    //     if ((!userLogins.user == true) == "toggleUserH") {
    //         $("div.toggleUserSH").hidden;
    //     }
    // }

    // $scope.hidden = function () {
    //     $scope.userType=$cookies.get('admin');
    //     console.log("kgjbnlkjgdb", $scope.userType);
    //     if (userLogins.admin.false == "toggleAdminH") {
    //         $("div.toggleAdminH").hidden();
    //     }
    //     if (userLogins.user.true == "toggleUserH") {
    //         $("div.toggleUserSH").hidden();
    //     }
    // }

    $scope.nextDay = function () {
        var dt = $scope.dt;
        dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);
        $scope.dt.setTime(dt.getTime());
        $scope.dt = new Date($scope.dt);
        $scope.getAllTripssheets($scope.dt);
        $scope.getAllDriversAttendance($scope.dt);
    };

    $scope.previousDay = function () {
        var dt = $scope.dt;
        dt.setTime(dt.getTime() - 24 * 60 * 60 * 1000);
        $scope.dt = new Date($scope.dt);
        $scope.getAllTripssheets($scope.dt);
        $scope.getAllDriversAttendance($scope.dt);
    };

    $scope.getAllLoadingPoints = function () {
        TripServices.getAllLoadingPoints(function (success) {
            if (success.data.status) {
                $scope.loadingPoints = success.data.data;
                $rootScope.$broadcast('$scope.loadingPoints');
            }
        })
    };

    $scope.getAllLoadingPoints();

    $scope.getAllUnloadingPoints = function () {
        TripServices.getAllUnloadingPoints(function (success) {
            if (success.data.status) {
                $scope.unloadingPoints = success.data.unloadingPoints;
                // $scope.unloadingPoints.unshift({"unloadingPoint": "No Trips"});
            }
        })
    };

    $scope.getAllUnloadingPoints();
    $scope.createTripSheet = function(date){
      TripServices.createTripSheet(date,function (successCallback) {
          if (successCallback.data.status) {
              $scope.getAllTripssheets(date);
          }
          },function(errorCallback){})
    };

        function getParties() {
            PartyService.getAllPartiesByTransporter(function (success) {
                if (success.data.status) {
                    $rootScope.parties = success.data.parties;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            });
        }
        getParties();


        $scope.getAllTripssheets = function (date) {
        var date = new Date(date);
        $scope.today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        console.log("tripsheet date",$scope.today);
        TripServices.getAllTripSheets($scope.today, function (success) {
            if (success.data.status) {
                $scope.tripSheets = success.data.data;
                for(var i=0;i<$scope.tripSheets.length;i++){
                   if($scope.tripSheets[i].partyId){
                       var party = _.find($rootScope.parties,function(party){
                           return party._id.toString() === $scope.tripSheets[i].partyId;
                       });
                       if(party){
                           $scope.tripSheets[i].partyName = party.name;
                       }
                   }
                }
            }
        })
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
    };
    $scope.getAllTrucks();

    $scope.saveAll = function () {
        var params = $scope.tripSheets;
        params.partyId = $scope.tripSheets._id;
        TripServices.updateTripSheet(params, function (success) {
            if (success.data.status) {
                swal("Good job!", "Trip Sheet Updated Successfully!", "success");
            }else{
                swal("Error!", "!", "error");
            }
        })
    };
    $scope.getAllTripssheets(new Date());

    $scope.saveLoadingPoint = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addLoadingPoint.html',
            controller: 'truckDriverPartyCtrl',
            windowClass: 'addingLoad',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
        });
        modalInstance.result.then(function () {
            $scope.getAllLoadingPoints();
        }, function () {
        });
    };
    $scope.saveUnloadingPoint = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addUnloadingPoint.html',
            controller: 'truckDriverPartyCtrl',
            size: 'md',
            windowClass: 'addingLoad',
            backdrop: 'static',
            keyboard: false,
        });
        modalInstance.result.then(function () {
            $scope.getAllUnloadingPoints();
        }, function () {
        });
    };

    $scope.validateFilters = function (truckId, fromDate, toDate) {
        var params = {};
        params.truckId = truckId;
        params.fromDate = fromDate;
        params.toDate = toDate;
        TripServices.tripsSheetReport(params, function (success) {
            if (success.data.status) {
               $scope.tripSheetReports = success.data.data;
                for(var i=0;i<$scope.tripSheetReports.length;i++){
                    if($scope.tripSheetReports[i].partyId){
                        var party = _.find($scope.parties,function(party){
                            return party._id.toString() === $scope.tripSheetReports[i].partyId;
                        });
                        if(party){
                            $scope.tripSheetReports[i].partyName = party.name;
                        }
                    }
                }
                $scope.validateTable = true;
            }else {
                console.log("erorrr");
            }
        })
    }

    $scope.downloadTripSheetReport = function (truckId, fromDate, toDate) {
        window.open('/v1/trips/downloadTripSheetDate?truckId='+truckId+'&fromDate='+fromDate+'&toDate='+toDate);
    };

    $scope.getAllDriversAttendance = function (date) {
        if (date) {
            $scope.today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        } else {
            var today = new Date();
            $scope.today = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        }

        DriverService.getAllDriversAttendance($scope.today, function (success) {
            if (success.data.status) {
                $scope.driverSheets = success.data.data;
                $scope.presentDrivers = [];
                    for(var i=0; i<$scope.driverSheets.length;i++){
                    if($scope.driverSheets[i].isPresent === true){
                        $scope.presentDrivers.push($scope.driverSheets[i]);
                    }
                }
            }
        }, function (error) {

        })
    };
    $scope.getAllDriversAttendance(new Date());

    $scope.getLockStatus(new Date());
    $scope.getValues = function(value,index){
        for(var i=0;i<index;i++){
            if($scope.tripSheets[i].tripId == value){
                $scope.tripSheets[index].loadingPoint = $scope.tripSheets[i].loadingPoint;
                $scope.tripSheets[index].unloadingPoint = $scope.tripSheets[i].unloadingPoint;
                $scope.tripSheets[index].partyId = $scope.tripSheets[i].partyId;
                break;
            }
        }
    };

    $scope.newTrip = {};
    $scope.saveNewTrip = function () {
        var params = $scope.newTrip;
        if(!params.registrationNo){
            swal("Error", "Please enter Registration","error" );
        }else if(!params.partyId){
            swal("Error", "Please select Party","error" );
        }else {
            var date = new Date();

            params.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            TripServices.addNewTripSheet($scope.newTrip, function (success) {
                if (success.data.status) {
                    swal("Good job!", "Trip added Successfully!", "success");
                    $('#addingNewTrip').modal('hide');
                }else{
                    swal("Error","Truck already exist for this date", "error");
                }
            });
        }

    }
}]);