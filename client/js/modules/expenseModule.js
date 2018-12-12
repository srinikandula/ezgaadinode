app.factory('ExpenseService', ['$http', function ($http) {
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
        getPaybleAmountByParty: function (params, success, error) {
            $http({
                url: '/v1/expense/getPaybleAmountByParty',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPaybleAmountByPartyId: function (params, success, error) {
            $http({
                url: '/v1/expense/getPaybleAmountByPartyId',
                method: "GET",
                params: {
                    partyId: params
                }
            }).then(success, error);
        },
        shareDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/expense/shareDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getPartiesFromExpense: function (success, error) {
            $http({
                url: '/v1/expense/getPartiesFromExpense',
                method: "GET",
            }).then(success, error)
        },
        getAllExpensesSheet: function (today, success, error) {
            $http({
                url: '/v1/expense/getExpensesSheet/' + today,
                method: "GET"
            }).then(success, error)
        },
        updateExpensesSheet: function (expense, amounts, today, success, error) {
            $http({
                url: '/v1/expense/updateExpensesSheet/' + today,
                method: "PUT",
                data: {expense, amounts}
            }).then(success, error)
        },
        saveOpeningBalance: function (params, success, error) {
            $http({
                url: '/v1/expense/add',
                method: "POST",
                data: params
            }).then(success, error)
        },
        expensesSheetReport: function (params, success, error) {
            $http({
                url: '/v1/expense/getExpenseSheetByParams',
                method: 'GET',
                params: params
            }).then(success, error)
        },
        addNewExpenseSheet: function (params, success, error) {
            $http({
                url: '/v1/expense/addNewExpense',
                method: 'POST',
                data: params
            }).then(success, error)
        }
    }
}]);


app.controller('ExpenseCtrl', ['$scope', '$state', 'ExpenseService', 'Notification', 'NgTableParams', 'paginationService', 'TrucksService', function ($scope, $state, ExpenseService, Notification, NgTableParams, paginationService, TrucksService) {
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
            regNumber: tableParams.truckNumber,
            fromDate: $scope.fromDate,
            toDate: $scope.toDate
        };
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        ExpenseService.getExpenses(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.maintanenceCosts = response.data.expenses;
                $scope.userId = response.data.userId;
                $scope.userType = response.data.userType;
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
                    Notification.error({message: message});
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
                            Notification.error({message: message});
                        });
                    }
                })
            }
        })
    };

    $scope.searchByVechicleNumber = function (truckNumber) {
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
                params.truckNumber = truckNumber;
                loadTableData(params);
            }
        });
    };
    $scope.shareDetailsViaEmail = function () {
        swal({
            title: 'Share expenses data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
                return new Promise((resolve) => {
                    ExpenseService.shareDetailsViaEmail({
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
        window.open('/v1/expense/downloadDetails');
    };

}]);

app.controller('expenseEditController', ['$scope', 'ExpenseService', 'PartyService', '$stateParams', '$state', 'DriverService', 'Notification', 'TrucksService', 'ExpenseMasterServices', function ($scope, ExpenseService, PartyService, $stateParams, $state, DriverService, Notification, TrucksService, ExpenseMasterServices) {
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
        totalAmount: 0,
        paidAmount: 0,
        cost: 0,
        date: '',
        mode: '',
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


    function getPartiesbySupplier() {
        PartyService.getAllPartiesBySupplier(function (success) {
            if (success.data.status) {
                $scope.partyBySupplier = success.data.parties;
                console.log("Parties", $scope.partyBySupplier);
                var selectedParty = _.find($scope.partyBySupplier, function (party) {
                    return party._id.toString() === $scope.expenseDetails.partyId;
                });

                $scope.selectPartyId(selectedParty);
                if (selectedParty) {
                    $scope.name = selectedParty.name;
                }
            } else {
                Notification.error(success.data.message);
            }
        })
    }

    $scope.selectPartyId = function (party) {
        $scope.expenseDetails.partyId = party._id;

    };

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
        if (!_.isNumber(params.cost) && params.mode === 'Cash') {
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
        if (params.mode === 'Credit') {
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
                            Notification.error({message: message});
                        });
                    }

                }, function (err) {
                });
            } else {
                ExpenseService.addExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        success.data.messages.forEach(function (message) {
                            Notification.success({message: message});
                        });
                        $state.go('expenses');
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

app.controller('UploadExpanseCtrl', ['$scope', 'Upload', 'Notification', '$state', function ($scope, Upload, Notification, $state) {
    $scope.file = undefined;
    $scope.uploadExpenses = function () {
        if (!$scope.file) {
            Notification.error("Please select file");
        } else {
            Upload.upload({
                url: '/v1/expense/uploadExpensesData',
                data: {
                    file: $scope.file,
                },
            }).then(function (success) {
                if (success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go("expenses");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            });

        }
    }

}]);

app.controller('expensesSheetController', ['$scope', 'Upload', 'Notification', '$state', 'TrucksService', 'ExpenseService', 'NgTableParams', 'PartyService',
    function ($scope, Upload, Notification, $state, TrucksService, ExpenseService, NgTableParams, PartyService) {

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

        $scope.totalAmounts = {
            openingBalance: 0,
            closingBalance: 0,
            advanceAmount: 0,
            totalAmount: 0,
            expenditureAmount: 0
        };

        $scope.fullAmounts = function () {
            $scope.totalAmounts[0].totalAmount = $scope.totalAmounts[0].advanceAmount + $scope.totalAmounts[0].openingBalance;
            $scope.totalAmounts[0].closingBalance = $scope.totalAmounts[0].totalAmount - $scope.totalAmounts[0].expenditureAmount;
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

        function getParties() {
            PartyService.getAllPartiesByTransporter(function (success) {
                if (success.data.status) {
                    $scope.parties = success.data.parties;
                    $scope.getAllExpensesSheets(new Date());
                    // console.log("$scope.parties", $scope.parties);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            });
        }

        getParties();


        $scope.getAllExpensesSheets = function (dt) {
            var date = new Date(dt);
            $scope.today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

            $scope.tomorrow = new Date();
            $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);
            $scope.tomorrowDate = $scope.tomorrow.getFullYear() + '-' + ($scope.tomorrow.getMonth() + 1) + '-' + $scope.tomorrow.getDate();

            ExpenseService.getAllExpensesSheet($scope.today, function (success) {
                if (success.data.status) {
                    $scope.expensesSheetsDetails = success.data.data;
                    $scope.totalAmounts = success.data.amounts;
                    $scope.dieselTotal = 0;
                    $scope.cashTotal = 0;
                    for (var i = 0; i < $scope.expensesSheetsDetails.length; i++) {
                        if ($scope.expensesSheetsDetails[i].partyId) {
                            var party = _.find($scope.parties, function (party) {
                                return party._id.toString() === $scope.expensesSheetsDetails[i].partyId;
                            });
                            if (party) {
                                $scope.expensesSheetsDetails[i].partyName = party.name;
                            }
                        }
                        if ($scope.expensesSheetsDetails[i].dieselAmount) {
                            $scope.dieselTotal += $scope.expensesSheetsDetails[i].dieselAmount;
                        }
                        if ($scope.expensesSheetsDetails[i].cash) {
                            if ($scope.expensesSheetsDetails[i].throughOnline === true) {
                                $scope.cashTotalTrue = $scope.expensesSheetsDetails[i].cash;
                            } else if ($scope.expensesSheetsDetails[i].throughOnline === false) {
                                $scope.cashTotal += $scope.expensesSheetsDetails[i].cash;
                                $scope.totalAmounts[0].expenditureAmount = $scope.cashTotal;
                            }
                        }
                    }
                    $scope.totalAmounts[0].totalAmount = $scope.totalAmounts[0].advanceAmount + $scope.totalAmounts[0].openingBalance;
                    $scope.totalAmounts[0].closingBalance = $scope.totalAmounts[0].totalAmount - $scope.totalAmounts[0].expenditureAmount;
                }
            })
        };

        $scope.nextDay = function () {
            var dt = $scope.dt;
            dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);
            $scope.dt.setTime(dt.getTime());
            $scope.dt = new Date($scope.dt);
            $scope.nextDate = $scope.dt;
            $scope.getAllExpensesSheets($scope.dt);
        };

        $scope.previousDay = function () {
            var dt = $scope.dt;
            dt.setTime(dt.getTime() - 24 * 60 * 60 * 1000);
            $scope.dt.setTime(dt.getTime());
            $scope.dt = new Date($scope.dt);
            $scope.previousDate = $scope.dt;
            $scope.getAllExpensesSheets($scope.dt);
        };
        $scope.expensesSheetsDetails = {
            dieselAmount: 0,
            cash: 0
        };

        $scope.saveAll = function () {
            if ($scope.nextDate) {
                $scope.getByDate = $scope.nextDate.getFullYear() + '-' + ($scope.nextDate.getMonth() + 1) + '-' + $scope.nextDate.getDate();
            } else if ($scope.previousDate) {
                $scope.getByDate = $scope.previousDate.getFullYear() + '-' + ($scope.previousDate.getMonth() + 1) + '-' + $scope.previousDate.getDate();
            } else {
                var date = new Date();
                var dt = new Date(date);
                $scope.getByDate = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();
            }
            ExpenseService.updateExpensesSheet($scope.expensesSheetsDetails, $scope.totalAmounts, $scope.getByDate, function (success) {
                if (success.data.status) {
                    swal("Good job!", "Expenses Sheet Updated Successfully!", "success");
                } else {
                    swal("Error!", "Error in Updating Expense Sheet", "error");
                }
            });
        }
        ;

        $scope.validateFilters = function (truckId, fromDate, toDate) {
            var params = {};
            params.truckId = truckId;
            params.fromDate = fromDate;
            params.toDate = toDate;
            ExpenseService.expensesSheetReport(params, function (success) {
                if (success.data.status) {
                    $scope.expenseSheetReports = success.data.data;
                    for (var i = 0; i < $scope.expenseSheetReports.length; i++) {
                        if ($scope.expenseSheetReports[i].partyId) {
                            var party = _.find($scope.parties, function (party) {
                                return party._id.toString() === $scope.expenseSheetReports[i].partyId;
                            });
                            if (party) {
                                $scope.expenseSheetReports[i].partyName = party.name;
                            }
                        }
                    }
                    $scope.validateTable = true;
                } else {
                    console.log("error");
                }
            })
        };

        $scope.newExpense = {};
        $scope.saveNewExpense = function () {
            var params = $scope.newExpense;
            var date = new Date();
            params.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            ExpenseService.addNewExpenseSheet($scope.newExpense, function (success) {
                if (success.data.status) {
                    swal("Good job!", "Expense added Successfully!", "success");
                    $('#createNewExpense').modal('hide');
                }
            });

        }
    }]);