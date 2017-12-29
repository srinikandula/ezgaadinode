app.factory('ExpenseService', function ($http) {
    return {
        addExpense: function (object, success, error) {
            $http({
                url: '/v1/expense/addExpense',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getExpenseRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/expense/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/expense/getAll',
                method: "GET"
            }).then(success, error)
        },
        getExpenseRecord: function (expenseId, success, error) {
            $http({
                url: '/v1/expense/getExpense/' + expenseId,
                method: "GET"
            }).then(success, error)
        },
        getExpenses: function (pageable, success, error) {
            $http({
                url: '/v1/expense/getAllExpenses',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        updateRecord: function (object, success, error) {
            $http({
                url: '/v1/expense/updateExpense',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deleteRecord: function (expenseId, success, error) {
            $http({
                url: '/v1/expense/' + expenseId,
                method: "DELETE"
            }).then(success, error)
        },
        findTotalExpenses: function (success, error) {
            $http({
                url: '/v1/expense/total',
                method: "GET"
            }).then(success, error)
        },
        findExpensesbyGroupVehicle: function (params, success, error) {
            $http({
                url: '/v1/expense/groupByVehicle',
                method: "GET",
                params: params
            }).then(success, error)
        },
        findExpensesbyVehicleId: function (vehicleId, success, error) {
            $http({
                url: '/v1/expense/vehicleExpense/' + vehicleId,
                method: "GET"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/expense/total/count',
                method: "GET"
            }).then(success, error)
        },
        shareExpensesDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/expense/shareExpensesDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        }
    }
});

app.controller('ExpenseCtrl', ['$scope', '$state', 'ExpenseService', 'Notification', 'NgTableParams', 'paginationService', function ($scope, $state, ExpenseService, Notification, NgTableParams, paginationService) {
    $scope.goToEditExpensePage = function (expenseId) {
        $state.go('expensesEdit', {expenseId: expenseId});
    };

    $scope.count = 0;
    $scope.getCount = function () {
        ExpenseService.count(function (success) {

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

        ExpenseService.getExpenses(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.maintanenceCosts = response.data.expenses;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.maintanenceCosts;
                $scope.currentPageOfMaintanence = $scope.maintanenceCosts;
            }

        });
    };

    $scope.init = function () {
        $scope.expenseParams = new NgTableParams({
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
            }
        });
    };

    $scope.deleteExpenseRecord = function (id) {
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
                ExpenseService.deleteRecord(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Expenses deleted successfully.',
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
                })
            }
            ;
        });
    }
}]);

app.controller('expenseEditController', ['$scope', 'ExpenseService','PartyService', '$stateParams', '$state', 'DriverService', 'Notification', 'TrucksService', 'ExpenseMasterServices', function ($scope, ExpenseService,PartyService, $stateParams, $state, DriverService, Notification, TrucksService, ExpenseMasterServices) {
    $scope.pagetitle = "Add Expenses";
    $scope.dateCallback = "past";

    $scope.trucks = [];
    $scope.expenses = [];
    $scope.parties = [];

    $scope.expenseDetails = {
        vehicleNumber: '',
        expenseType: '',
        description: '',
        partyId: '',
        totalAmount:'',
        paidAmount:'',
        date: '',
        cost: '',
        mode:'',
        expenseName: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('expenses');
    };

    $scope.addExpenseTypeField = false;
    $scope.addExpenseType = function () {
        $scope.addExpenseTypeField = true;
    }


    function getPartiesbySupplier () {
        PartyService.getAllPartiesBySupplier (function (success) {
            if(success.data.status){
                $scope.partyBySupplier = success.data.parties;
                var selectedParty = _.find($scope.partyBySupplier, function (party) {
                    return party._id.toString() === $scope.expenseDetails.partyId;
                });
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                }
            }else {
                Notification.error(success.data.message);
            }
        })
    }


    $scope.selectPartyId = function (party) {
        $scope.expenseDetails.partyId = party._id;

    }

    function getAllExpenses(params) {
        ExpenseMasterServices.getExpenses(params, function (success) {
            if (success.data.status) {
                $scope.expenses = success.data.expenses;
                var selectedExpesneType = _.find($scope.expenses, function (expenses) {
                    return expenses._id.toString() === $scope.expenseDetails.expenseType;
                });
                if (selectedExpesneType) {
                    $scope.expenseTitle = selectedExpesneType.expenseName;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectExpenseType = function (expenses) {
        $scope.expenseDetails.expenseType = expenses._id;
    };

    function getTruckIds() {
        TrucksService.getAllAccountTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.expenseDetails.vehicleNumber;
                });
                if (selectedTruck) {
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }

            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectTruckId = function (truck) {
        $scope.expenseDetails.vehicleNumber = truck._id;
    };


    if ($stateParams.expenseId) {
        $scope.pagetitle = "Edit expenses";
        ExpenseService.getExpenseRecord($stateParams.expenseId, function (success) {
            if (success.data.status) {
                $scope.expenseDetails = success.data.expense;
                $scope.expenseDetails.date = new Date($scope.expenseDetails.date);
                getAllExpenses();
                getTruckIds();
                getPartiesbySupplier();
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    } else {
        getAllExpenses();
        getTruckIds();
        getPartiesbySupplier();
    }

    $scope.AddorUpdateExpense = function () {
        var params = $scope.expenseDetails;
        params.error = [];
        params.success = [];

        if (!params.vehicleNumber) {
            params.error.push('Invalid vehicle Number');
        }
        if (!params.expenseType) {
            params.error.push('Invalid expenseType');
        }
        if (params.expenseType === 'others' && !params.expenseName) {
            params.error.push('Enter other expenseType');
        }
        if (!params.date) {
            params.error.push('Invalid date');
        }
        if (!params.mode) {
            params.error.push('Please Select Cash or Credit');
        }
        if (!_.isNumber(params.cost)&& params.mode === 'Cash') {
            params.error.push('Invalid cost');
        }
        if (!params.totalAmount && params.mode === 'Credit') {
            params.error.push('Please Enter Total Expesne Amount');
        }
        if (!params.paidAmount && params.mode === 'Credit') {
            params.error.push('Please enter Paid Amount');
        }
        if (!params.error.length) {
            if ($stateParams.expenseId) {
                ExpenseService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: success.data.message});
                        $state.go('expenses');
                    } else {
                        params.error = success.data.message;
                    }

                }, function (err) {
                });
            } else {
                ExpenseService.addExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({message: success.data.message});
                        $state.go('expenses');
                    } else {
                        params.error = success.data.message;
                    }
                });
            }
        }
    }
}]);