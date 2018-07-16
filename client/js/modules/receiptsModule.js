app.factory('ReceiptsService',['$http', function ($http) {
    return {
        addReceipts: function (object, success, error) {
            $http({
                url: '/v1/receipts/addReceipts',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getPaymentsRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/receipts/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/receipts/getAll',
                method: "GET"
            }).then(success, error)
        },
        getReceiptRecord: function (paymentsId, success, error) {
            $http({
                url: '/v1/receipts/getReceiptRecord/' + paymentsId,
                method: "GET"
            }).then(success, error)
        },
        getReceipts: function (pageable, success, error) {
            $http({
                url: '/v1/receipts/getReceipts/',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getTotalPaymentsReceivable: function (success, error) {
            $http({
                url: '/v1/receipts/getTotalAmount/',
                method: "GET"
            }).then(success, error)
        },
        getDuesByParty: function (params, success, error) {
            $http({
                url: '/v1/receipts/getDuesByParty/',
                method: "GET",
                params: params
            }).then(success, error)
        },
        updateReceipts: function (object, success, error) {
            $http({
                url: '/v1/receipts/updateReceipts',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deleteReceiptsRecord: function (receiptId, success, error) {
            $http({
                url: '/v1/receipts/' + receiptId,
                method: "DELETE"
            }).then(success, error)
        },
        countReceipts: function (success, error) {
            $http({
                url: '/v1/receipts/countReceipts',
                method: "GET"
            }).then(success, error)
        },
        shareReceiptsDetailsByPartyViaEmail: function (params, success, error) {
            $http({
                url: '/v1/receipts/shareReceiptsDetailsByPartyViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/receipts/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        }
    }
}]);

app.controller('receiptCtrl', ['$scope', '$state', 'ReceiptsService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', function ($scope, $state, ReceiptsService, Notification, NgTableParams, paginationService, PartyService) {

    $scope.goToEditReceiptsPage = function (receiptId) {
        $state.go('receiptEdit', { receiptId: receiptId });
    };
    $scope.count = 0;
    $scope.getCount = function () {
        ReceiptsService.countReceipts(function (success) {
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
        pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            partyName: tableParams.partyName,
            fromDate:$scope.fromDate,
            toDate:$scope.toDate
        };
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        ReceiptsService.getReceipts(pageable, function (response) {
            $scope.invalidCount = 0;

            if (angular.isArray(response.data.paymentsCosts)) {
                $scope.loading = false;
                $scope.payments = response.data.paymentsCosts;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.payments;
                $scope.currentPageOfReceipts = $scope.payments;
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
        $scope.receiptParams = new NgTableParams({
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
                ReceiptsService.deleteReceiptsRecord(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Receipt deleted successfully.',
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
        $scope.receiptParams = new NgTableParams({
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
    };
    $scope.shareDetailsViaEmail=function(){
        swal({
            title: 'Share Receipts data through email',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                ReceiptsService.shareDetailsViaEmail({
                email:email
            },function(success){
                // console.log("success...",success);
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
        window.open('/v1/receipts/downloadDetails');
    };



        
}]);

app.controller('receiptsEditController', ['$scope', 'ReceiptsService', '$stateParams', '$state', 'Notification', 'TripServices', 'TrucksService', 'PartyService', function ($scope, ReceiptsService, $stateParams, $state, Notification, TripServices, TrucksService, PartyService) {
    $scope.paymentRefNumber = false;

    $scope.refNum = function () {
        $scope.paymentRefNumber = true;
    };

    $scope.pagetitle = "Add Receipts";
    $scope.dateCallback = "past";

    $scope.receiptDetails = {
        date: '',
        partyId: '',
        description: '',
        amount: '',
        paymentType: '',
        receiptRefNo: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('receipts');
    };
    

    function getPartyIds() {
        TripServices.getPartiesWhoHasTrips(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.partyList;
                 var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.receiptDetails.partyId;
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
        $scope.receiptDetails.partyId = party._id;
    }

    if ($stateParams.receiptId) {
        $scope.pagetitle = "Edit Receipts";
        ReceiptsService.getReceiptRecord($stateParams.receiptId, function (success) {
            if (success.data.status) {
                $scope.receiptDetails = success.data.paymentsDetails;
                //console.log(success.data);
                $scope.receiptDetails.date = new Date($scope.receiptDetails.date);
                $scope.receiptDetails.amount = parseInt($scope.receiptDetails.amount);
                getPartyIds();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (err) {
        })
    }
    $scope.cancel = function () {
        $state.go('receipts');
    };
    $scope.AddorUpdateReceipt = function () {
        var params = $scope.receiptDetails;
        // console.log(params);
        params.error = [];
        params.success = [];

        if (!params.date) {
            params.error.push('Please select Receipt Date');
        }
        if (!params.partyId) {
            params.error.push('Please Select Party');
        }
        if (!(params.amount)) {
            params.error.push('Please enter an Amount');
        }
        if (!params.paymentType) {
            params.error.push('Please Select Payment Type');
        }
        if ((params.paymentType === 'NEFT' || params.paymentType === 'Cheque') && !params.receiptRefNo) {
            params.error.push('Enter payment reference number');
        }
        if (!params.error.length) {
            if ($stateParams.receiptId) {
                ReceiptsService.updateReceipts(params, function (success) {
                    if (success.data.status) {
                        // params.success = success.data.message[0];
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('receipts');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                    $state.go('receipts');

                }, function (err) {
                    console.log(err);
                });
            } else {
                ReceiptsService.addReceipts(params, function (success) {

                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('receipts');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                });
            }
        }
    }
}]);
app.controller('UploadReceiptsCtrl', ['$scope','Upload','Notification','$state', function ($scope, Upload,Notification,$state) {
    $scope.file=undefined;
    $scope.uploadReceipts=function () {
        if(!$scope.file){
            Notification.error("Please select file");
        }else{
            Upload.upload({
                url: '/v1/receipts/uploadReceipts',
                data: {
                    file: $scope.file,
                },
            }).then(function (success) {
                if (success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go("receipts");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            });

        }
    }

}]);
