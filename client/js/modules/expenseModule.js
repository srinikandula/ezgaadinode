app.factory('ExpenseService',['$http', function ($http) {
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
        },
        sharePayableDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/expense/sharePayableDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPaybleAmountByParty:function(params,success,error){
            $http({
                url: '/v1/expense/getPaybleAmountByParty',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPaybleAmountByPartyId:function(params,success,error){
            $http({
                url: '/v1/expense/getPaybleAmountByPartyId',
                method: "GET",
                params: {
                    partyId:params
                }
            }).then(success, error);
        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/expense/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getPartiesFromExpense:function (success,error) {
            $http({
                url: '/v1/expense/getPartiesFromExpense',
                method: "GET",
            }).then(success, error)
        }
    }
}]);


app.controller('ExpenseCtrl', ['$scope', '$state', 'ExpenseService', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, ExpenseService, Notification, NgTableParams, paginationService,TrucksService) {
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

        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            regNumber:tableParams.truckNumber,
            fromDate:$scope.fromDate,
            toDate:$scope.toDate};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        ExpenseService.getExpenses(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.maintanenceCosts = response.data.expenses;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.maintanenceCosts;
                $scope.currentPageOfMaintanence = $scope.maintanenceCosts;
                console.log("kjdhasfjknasdf", $scope.currentPageOfMaintanence);
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
                $scope.getAllTrucks();
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
                            Notification.error({ message: message });
                        });
                    }
                })
            }
        })
    };

    $scope.searchByVechicleNumber=function(truckNumber){
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
                params.truckNumber=truckNumber;
                loadTableData(params);
            }
        });
    };
    $scope.shareDetailsViaEmail=function(){
        swal({
            title: 'Share expenses data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                ExpenseService.shareDetailsViaEmail({
                email:email
            },function(success){
                if (success.data.status) {
                    resolve()
                } else {

                }
            },function(error){})
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
        window.open('/v1/expense/downloadDetails');
    };

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
        partyId: undefined,
        totalAmount:0,
        paidAmount:0,
        cost:0,
        date: '',
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
                console.log("dsfcds",selectedParty);
                $scope.selectPartyId(selectedParty);
                if (selectedParty) {
                    $scope.name = selectedParty.name;
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
        TrucksService.getAllTrucksForFilter(function (success) {
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
        console.log
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
            params.error.push('Invalid Total Expense Amount');
        }
        if (!params.partyId && params.mode === 'Credit') {
            params.error.push('Please Select party');
        }
        if (!params.totalAmount && params.mode === 'Credit') {
            params.error.push('Please Enter Total Expense Amount');
        }
        if (!_.isNumber(params.paidAmount) && params.mode === 'Credit') {
            params.error.push('Invalid Paid Amount');
        }
        if(params.mode === 'Credit') {
            if (params.paidAmount > params.totalAmount) {
                params.error.push('Paid Amount Should be less than total Amount');
            }
        }
        if (!params.error.length) {
            if ($stateParams.expenseId) {
                ExpenseService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: success.data.messages[0]});
                        $state.go('expenses');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }

                }, function (err) {
                });
            } else {
                ExpenseService.addExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        success.data.messages.forEach(function (message) {
                            Notification.success({ message: message });
                        });
                        $state.go('expenses');
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