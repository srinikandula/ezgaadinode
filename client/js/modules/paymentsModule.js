app.factory('PaymentService', ['$http', function ($http) {
    return {
        addPayment: function (params, success, error) {
            $http({
                url: '/v1/payments/addPayment',
                method: "POST",
                data: params,
            }).then(success, error)
        },
        getPayments: function (pageable, success, error) {
            $http({
                url: '/v1/payments/getPayments',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getPaymentDetails: function (id, success, error) {
            $http({
                url: '/v1/payments/getPaymentDetails',
                method: "GET",
                params: {_id: id}
            }).then(success, error)
        },
        updatePayment: function (params, success, error) {
            $http({
                url: '/v1/payments/updatePayment',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deletePayment: function (paymentId, success, error) {
            $http({
                url: '/v1/payments/deletePayment',
                method: "DELETE",
                params: {_id: paymentId}
            }).then(success, error)
        },
        totalPayments: function (success, error) {
            $http({
                url: '/v1/payments/totalPayments',
                method: "GET"
            }).then(success, error)
        },
        getReceiptsByParties: function (params,success, error) {
            $http({
                url: '/v1/payments/getReceiptsByParties',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getReceiptByPartyName: function (receiptId, success, error) {
            $http({
                url: '/v1/payments/getReceiptByPartyName',
                method: "GET",
                params: {_id: receiptId}
            }).then(success, error)
        },
        shareReceiptsDetailsByPartyViaEmail:function (params,success,error) {
            $http({
                url: '/v1/payments/shareReceiptsDetailsByPartyViaEmail',
                method: "GET",
                params: params
            }).then(success, error)

        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/payments/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        }

    }
}]);

app.controller('paymentsCtrl', ['$scope', '$state', 'PaymentService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService','ExpenseService', function ($scope, $state, PaymentService, Notification, NgTableParams, paginationService, PartyService,ExpenseService) {

    $scope.goToEditPaymentsPage = function (id) {
        $state.go('paymentsEdit', {paymentId: id});
    };

    $scope.filters = {
        fromDate: "",
        toDate: ""
    };

    $scope.getAllParties = function () {
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    $scope.count = 0;
    $scope.getPaymentCount = function () {
        PaymentService.totalPayments(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.init();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            fromDate: tableParams.fromDate,
            toDate: tableParams.toDate,
            partyName: tableParams.partyName
        };
        PaymentService.getPayments(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.payments;
                $scope.currentPageOfPayments = response.data.payments;
            } else {
                $scope.currentPageOfReceipts = response.data.receipts;
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.init = function () {
        $scope.paymentParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            },
            fromDate: $scope.filters.fromDate,
            toDate: $scope.filters.toDate
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                $scope.getAllParties();
            }
        });
    };


    $scope.deletePayment = function (paymentId) {
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
                PaymentService.deletePayment(paymentId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Payment deleted successfully.',
                            'success'
                        );
                        $scope.getPaymentCount();
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

            }
            ;
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
                params.fromDate = $scope.filters.fromDate;
                params.toDate = $scope.filters.toDate;
                loadTableData(params);
            }
        });
    };
    $scope.shareDetailsViaEmail=function(){
        swal({
            title: 'Share Payments data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                PaymentService.shareDetailsViaEmail({
                email:email
            },function(success){
                console.log("success...",success);
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
        window.open('/v1/payments/downloadDetails');
    };

}]);
app.controller('paymentsEditCtrl', ['$scope', '$state', '$stateParams', 'PaymentService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', 'TripServices','ExpenseService', function ($scope, $state, $stateParams, PaymentService, Notification, NgTableParams, paginationService, PartyService, TripServices,ExpenseService) {

    $scope.pageTitle = "Add Payment";

    $scope.cancel = function () {
        $state.go('payments')
    }

    $scope.paymentDetails = {
        partyId: '',
        error: []
    }

    if ($stateParams.paymentId) {
        $scope.pageTitle = "Edit Payment";
        PaymentService.getPaymentDetails($stateParams.paymentId, function (success) {
            if (success.data.status) {
                $scope.paymentDetails = success.data.data;
                $scope.paymentDetails.date = new Date($scope.paymentDetails.date);
                getPartyIds();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
        })
    }

    function getPartyIds() {
        ExpenseService.getPartiesFromExpense(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.partyList;
                var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.paymentDetails.partyId;
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
        $scope.paymentDetails.partyId = party._id;
    }

    $scope.AddorUpdatePayment = function () {
        console.log("Welcome")
        var params = $scope.paymentDetails;
        params.error = [];
        params.success = [];

        if (!params.date) {
            params.error.push('Please Select Date');
        }
        if (!params.partyId) {
            params.error.push('Please Select Party');
        }
        if (!(params.amount)) {
            params.error.push('Please enter an Amount');
        }
        if (params.error.length > 0) {
            params.error.forEach(function (message) {
                Notification.error({ message: message });
            });
        } else {
            $scope.paymentDetails.partyId = $scope.paymentDetails.partyId._id;
            if ($stateParams.paymentId) {
                PaymentService.updatePayment(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: success.data.messages[0]});
                        $state.go('receipts');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                    $state.go('payments');

                }, function (err) {
                });
            } else {
                PaymentService.addPayment(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({message: success.data.messages[0]});
                        $state.go('payments');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                });
            }
        }
    }

}]);
app.controller('UploadPaymentsCtrl', ['$scope','Upload','Notification','$state', function ($scope, Upload,Notification,$state) {
    $scope.file=undefined;
    $scope.uploadPayments=function () {
        if(!$scope.file){
            Notification.error("Please select file");
        }else{
            Upload.upload({
                url: '/v1/payments/uploadPayments',
                data: {
                    file: $scope.file,
                },
            }).then(function (success) {
                if (success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go("payments");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            });

        }
    }

}]);

