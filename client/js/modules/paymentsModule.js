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
        getPayments: function (pageable, success, error) {
            $http({
                url: '/v1/payments/getPayments/',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getTotalPaymentsReceivable: function (success, error) {
            $http({
                url: '/v1/payments/getTotalAmount/',
                method: "GET"
            }).then(success, error)
        },
        getDuesByParty: function (params, success, error) {
            $http({
                url: '/v1/payments/getDuesByParty/',
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
        },
        sharePaymentsDetailsByPartyViaEmail: function (params, success, error) {
            $http({
                url: '/v1/payments/sharePaymentsDetailsByPartyViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        }
    }
});

app.controller('PaymentsCtrl', ['$scope', '$state', 'PaymentsService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', function ($scope, $state, PaymentsService, Notification, NgTableParams, paginationService, PartyService) {
    $scope.goToEditPaymentsPage = function (paymentsId) {
        $state.go('paymentsEdit', { paymentsId: paymentsId });
    };
    $scope.count = 0;
    $scope.getCount = function () {
        PaymentsService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();

            } else {
                Notification.error({ message: success.data.message });
            }
        });
    };
    $scope.getCount();

    var pageable;

    var loadTableData = function (tableParams) {
        pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(), partyName: tableParams.partyName };
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        PaymentsService.getPayments(pageable, function (response) {
            $scope.invalidCount = 0;

            if (angular.isArray(response.data.paymentsCosts)) {
                $scope.loading = false;
                $scope.payments = response.data.paymentsCosts;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.payments;
                $scope.currentPageOfPayments = $scope.payments;
            }
        });
    };
    $scope.getAllParties = function () {
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (err) {

        });
    }

    $scope.init = function () {
        $scope.paymentParams = new NgTableParams({
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
                    $scope.getAllParties();
                }
            });
    };

    $scope.deletePaymentsRecord = function (id) {
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
                PaymentsService.deletePaymentsRecord(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Party deleted successfully.',
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

                    ;
                });

            };
        });
    };

    $scope.searchByPartyName = function (partyName) {
        $scope.paymentParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
                counts: [],
                total: $scope.count,
                getData: function (params) {
                    params.partyName = partyName;
                    loadTableData(params);
                }
            });
    }



        
}]);

app.controller('paymentsEditController', ['$scope', 'PaymentsService', '$stateParams', '$state', 'Notification', 'TripServices', 'TrucksService', 'PartyService', function ($scope, PaymentsService, $stateParams, $state, Notification, TripServices, TrucksService, PartyService) {
    $scope.paymentRefNumber = false;

    $scope.refNum = function () {
        $scope.paymentRefNumber = true;
    };

    $scope.pagetitle = "Add Payments";
    $scope.dateCallback = "past";

    $scope.paymentsDetails = {
        date: '',
        partyId: '',
        description: '',
        amount: '',
        paymentType: '',
        paymentRefNo: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('payments');
    };
    

    function getPartyIds() {
        TripServices.getPartiesByTrips(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.partyList;
                 var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.paymentsDetails.partyId;
                });
                
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
               
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
                getPartyIds();
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }
    $scope.cancel = function () {
        $state.go('payments');
    };
    $scope.AddorUpdatePayments = function () {
        var params = $scope.paymentsDetails;
        //console.log(params);
        params.error = [];
        params.success = [];

        if (!params.date) {
            params.error.push('InValid Date');
        }
        if (!params.partyId) {
            params.error.push('Invalid Party Id');
        }
        if (!(params.amount)) {
            params.error.push('Invalid Amount');
        }
        if (!params.paymentType) {
            params.error.push('Select payment type');
        }
        if ((params.paymentType === 'NEFT' || params.paymentType === 'Cheque') && !params.paymentRefNo) {
            params.error.push('Enter payment reference number');
        }
        if (!params.error.length) {
            if ($stateParams.paymentsId) {
                PaymentsService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        // params.success = success.data.message[0];
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('payments');
                    } else {
                        params.error = success.data.message;
                    }
                    $state.go('payments');

                }, function (err) {
                    console.log(err);
                });
            } else {
                PaymentsService.addPayments(params, function (success) {

                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('payments');
                    } else {
                        params.error = success.data.message;
                    }
                });
            }
        }
    }
}]);