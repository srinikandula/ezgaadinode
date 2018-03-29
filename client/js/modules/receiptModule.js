app.factory('ReceiptServices', ['$http', function ($http) {
    return {
        addReceipt: function (params, success, error) {
            $http({
                url: '/v1/receipts/addReceipt',
                method: "POST",
                data: params,
            }).then(success, error)
        },
        getReceipts: function (pageable, success, error) {
            $http({
                url: '/v1/receipts/getReceipts',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getReceiptDetails: function (id, success, error) {
            $http({
                url: '/v1/receipts/getReceiptDetails',
                method: "GET",
                params: {_id: id}
            }).then(success, error)
        },
        updateReceipt: function (params, success, error) {
            $http({
                url: '/v1/receipts/updateReceipt',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteReceipt: function (receiptId, success, error) {
            $http({
                url: '/v1/receipts/deleteReceipt',
                method: "DELETE",
                params: {_id: receiptId}
            }).then(success, error)
        },
        totalReceipts: function (success, error) {
            $http({
                url: '/v1/receipts/totalReceipts',
                method: "GET"
            }).then(success, error)
        },
        getReceiptsByParties: function (params,success, error) {
            $http({
                url: '/v1/receipts/getReceiptsByParties',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getReceiptByPartyName: function (receiptId, success, error) {
            $http({
                url: '/v1/receipts/getReceiptByPartyName',
                method: "GET",
                params: {_id: receiptId}
            }).then(success, error)
        }
    }
}]);

app.controller('receiptCtrl', ['$scope', '$state', 'PaymentsService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', 'ReceiptServices', function ($scope, $state, PaymentsService, Notification, NgTableParams, paginationService, PartyService, ReceiptServices) {

    $scope.goToEditReceiptsPage = function (id) {
        $state.go('receiptEdit', {receiptId: id});
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
    $scope.getReceiptCount = function () {
        ReceiptServices.totalReceipts(function (success) {
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
        ReceiptServices.getReceipts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.receipts;
                $scope.currentPageOfReceipts = response.data.receipts;
            } else {
                $scope.currentPageOfReceipts = response.data.receipts;
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.init = function () {
        $scope.receiptParams = new NgTableParams({
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


    $scope.deleteReceipt = function (receiptId) {
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
                ReceiptServices.deleteReceipt(receiptId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Receipt deleted successfully.',
                            'success'
                        );
                        $scope.getReceiptCount();
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
                params.fromDate = $scope.filters.fromDate;
                params.toDate = $scope.filters.toDate;
                loadTableData(params);
            }
        });
    }


}]);
app.controller('receiptEditCtrl', ['$scope', '$state', '$stateParams', 'PaymentsService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', 'TripServices', 'ReceiptServices', function ($scope, $state, $stateParams, PaymentsService, Notification, NgTableParams, paginationService, PartyService, TripServices, ReceiptServices) {

    $scope.pageTitle = "Add Receipt";

    $scope.cancel = function () {
        $state.go('receipts')
    }

    $scope.receiptDetails = {
        partyId: '',
        error: []
    }

    if ($stateParams.receiptId) {
        $scope.pageTitle = "Edit Receipts";
        ReceiptServices.getReceiptDetails($stateParams.receiptId, function (success) {
            if (success.data.status) {
                $scope.receiptDetails = success.data.data;
                $scope.receiptDetails.date = new Date($scope.receiptDetails.date);
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
        TripServices.getPartiesByTrips(function (success) {
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

    $scope.AddorUpdateReceipt = function () {
        var params = $scope.receiptDetails;
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
            // params.error.forEach(function (message) {
            //     Notification.error({ message: message });
            // });
        } else {
            $scope.receiptDetails.partyId = $scope.receiptDetails.partyId._id;
            if ($stateParams.receiptId) {
                ReceiptServices.updateReceipt(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: success.data.messages[0]});
                        $state.go('receipts');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                    $state.go('receipts');

                }, function (err) {
                });
            } else {
                ReceiptServices.addReceipt(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({message: success.data.messages[0]});
                        $state.go('receipts');
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

