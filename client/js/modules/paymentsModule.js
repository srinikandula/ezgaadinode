app.factory('PaymentsService', function ($http) {
    return {
        addPayments: function (object, success, error) {
            $http({
                url: '/v1/payments/addPayments',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getPaymentsRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/payments/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/payments/getAll',
                method: "GET"
            }).then(success, error)
        },
        getPaymentsRecord: function (paymentsId, success, error) {
            $http({
                url: '/v1/payments/getPaymentsRecord/' + paymentsId,
                method: "GET"
            }).then(success, error)
        },
        getPayments: function (params, success, error) {
            $http({
                url: '/v1/payments/getPayments/',
                method: "GET",
                params: params
            }).then(success, error)
        },
        updateRecord: function (object, success, error) {
            $http({
                url: '/v1/payments/updatePayments',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deletePaymentsRecord: function (paymentsId, success, error) {
            $http({
                url: '/v1/payments/' + paymentsId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/payments/countPayments',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('PaymentsCtrl', ['$scope', '$state', 'PaymentsService', 'Notification','NgTableParams','paginationService', function ($scope, $state, PaymentsService, Notification, NgTableParams, paginationService) {
    $scope.goToEditPaymentsPage = function (paymentsId) {
        $state.go('paymentsEdit', {paymentsId: paymentsId});
    };
    $scope.count = 0;
    PaymentsService.count(function (success) {
        if (success.data.status) {
            $scope.count = success.data.count;
            $scope.init();

        } else {
            Notification.error({message: success.data.message});
        }
    });

    var pageable;

    var loadTableData = function (tableParams) {
        pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        PaymentsService.getPayments(pageable, function (response) {
            $scope.invalidCount = 0;

            if (angular.isArray(response.data.paymentsCosts)) {
                $scope.loading = false;
                $scope.payments = response.data.paymentsCosts;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.payments;
                $scope.currentPageOfPayments = $scope.payments;
            }
        });
    };


    $scope.init = function () {
        $scope.paymentsParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                amount: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                //console.log($scope.count);
                loadTableData(params);
            }
        });
    };
    // $scope.totalItems = 10;
    // $scope.maxSize = 5;
    // $scope.pageNumber = 1;
    //
    // $scope.getPaymentsRecords = function () {
    //     PaymentsService.getPaymentsRecords($scope.pageNumber, function (success) {
    //         if (success.data.status) {
    //             $scope.paymentsGridOptions.data = success.data.paymentsCosts;
    //             $scope.totalItems = success.data.count;
    //         } else {
    //             Notification.error({message: success.data.message});
    //         }
    //     }, function (err) {
    //     });
    // };
    // $scope.getPaymentsRecords();

    $scope.deletePaymentsRecord = function (id) {
        PaymentsService.deletePaymentsRecord(id, function (success) {
            if (success.data.status) {
                $scope.init();
                Notification.error({message: "Successfully Deleted"});
            } else {
                Notification.error({message: success.data.message});
            }
        })
    };

    // $scope.paymentsGridOptions = {
    //     enableSorting: true,
    //     paginationPageSizes: [9, 20, 50],
    //     paginationPageSize: 9,
    //     columnDefs: [{
    //         name: 'Vehicle Number',
    //         field: 'attrs.truckName'
    //     }, {
    //         name: 'Description',
    //         field: 'description'
    //     }, {
    //         name: 'Date',
    //         field: 'date',
    //         cellFilter: 'date:"dd-MM-yyyy"'
    //     }, {
    //         name: 'Amount',
    //         field: 'cost'
    //     }, {
    //         name: 'Created By',
    //         field: 'attrs.createdByName'
    //     }, {
    //         name: 'Action',
    //         cellTemplate: '<div class="text-center"> <a ng-click="grid.appScope.goToEditPaymentsPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
    //         '<a ng-click="grid.appScope.deletePaymentsRecord(row.entity._id)" class="glyphicon glyphicon-trash dele"> </a></div>'
    //
    //     }],
    //     rowHeight: 30,
    //     data: [],
    //     onRegisterApi: function (gridApi) {
    //         $scope.gridApi = gridApi;
    //     }
    // };
}]);

app.controller('paymentsEditController', ['$scope', 'PaymentsService', '$stateParams', '$state', 'Notification', 'TripServices', 'TrucksService', 'PartyService', function ($scope, PaymentsService, $stateParams, $state, Notification, TripServices, TrucksService, PartyService) {
    // console.log('-->', $stateParams, $stateParams.paymentsId, !!$stateParams.paymentsId);
    $scope.pagetitle = "Add Payments";
    $scope.dateCallback = "past";

    $scope.paymentsDetails = {
        date: '',
        //tripId: '',
        //truckId: '',
        partyId: '',
        description: '',
        amount: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('paymentsReceived');
    };

    /*function getTripIds() {
        TripServices.getAllAccountTrips(function (success) {
            if (success.data.status) {
                $scope.trips = success.data.trips;
                var selectedTrip = _.find( $scope.trips, function (trip) {
                    return trip._id.toString() === $scope.paymentsDetails.tripId;
                });
                if(selectedTrip){
                    $scope.tripName = selectedTrip.tripId;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    getTripIds();


    $scope.selectTripId = function (trip) {
        $scope.paymentsDetails.tripId = trip._id;
    }*/


    /*function getTruckIds() {
        TrucksService.getAllAccountTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find( $scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.paymentsDetails.truckId;
                });
                if(selectedTruck){
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    getTruckIds();

    $scope.selectTruckId = function (truck) {
        $scope.paymentsDetails.truckId = truck._id;
    }*/

    function getPartyIds() {
        PartyService.getAllParties(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                //console.log($scope.parties);
                var selectedParty = _.find( $scope.parties, function (party) {
                    return party._id.toString() === $scope.paymentsDetails.partyId;
                });
                if(selectedParty){
                    $scope.partyName = selectedParty.name;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    getPartyIds();

    $scope.selectPartyId = function (party) {
        $scope.paymentsDetails.partyId = party._id;
    }

    if ($stateParams.paymentsId) {
        $scope.pagetitle = "Edit Payments";
        PaymentsService.getPaymentsRecord($stateParams.paymentsId, function (success) {
            if (success.data.status) {
                $scope.paymentsDetails = success.data.paymentsDetails;
                //console.log(success.data);
                $scope.paymentsDetails.date = new Date($scope.paymentsDetails.date);
                $scope.paymentsDetails.amount = parseInt($scope.paymentsDetails.amount);
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }
    $scope.AddorUpdatePayments = function () {
        var params = $scope.paymentsDetails;
        //console.log(params);
        params.error = [];
        params.success = [];

        if (!params.date) {
            params.error.push('InValid Date');
        } if (!params.partyId) {
            params.error.push('Invalid Party Id');
        } if (!(params.amount)) {
            params.error.push('Invalid Amount');
        }
        if (!params.error.length) {
            if ($stateParams.paymentsId) {
                PaymentsService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        // params.success = success.data.message[0];
                        Notification.success({message: success.data.messages[0]});
                        $state.go('paymentsReceived');
                    } else {
                        params.error = success.data.message;
                    }
                    $state.go('paymentsReceived');

                }, function (err) {
                    console.log(err);
                });
            } else {
                PaymentsService.addPayments(params, function (success) {
                    //console.log(params);
                    //console.log(success);
                    //console.log(success.data.status);
                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({message: success.data.messages[0]});
                        $state.go('paymentsReceived');
                    } else {
                        params.error = success.data.message;
                    }
                });
            }
        }
    }
}]);