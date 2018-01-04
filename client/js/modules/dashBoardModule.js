app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', 'paginationService', 'NgTableParams', 'TripServices', 'ExpenseService', 'PartyService', 'PaymentsService', '$rootScope', 'AccountServices',
    function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService, PartyService, PaymentsService, $rootScope, AccountServices) {

        $scope.templates = ['/views/templates/revenueByVehicle.html', '/views/templates/revenueByvehicleId.html',
            '/views/templates/expenseByVehicle.html', '/views/templates/expenseByVehicleId.html',
            '/views/templates/amountByParties.html', '/views/templates/amountByPartyId.html',
            '/views/templates/expiryTrucks.html','/views/templates/paybleByParty.html',
        '/views/templates/paybleByPartyId.html'];

        $scope.initializeparams = function (tableType) {
            var pageable = {};
            $scope.loading = true;
            $scope.filters = {
                fromDate: "",
                toDate: "",
                regNumber: "",
                error: [],

            }
            $scope.partyId = "";
            $scope.regNumber = "";
        }
        $scope.template = $scope.templates[0];
        $scope.activated = '0';
        $scope.initializeparams();
        $scope.revenueParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
                counts: [],
                total: $scope.count,
                getData: function (params) {
                    $scope.filters.page = params.page();
                    $scope.filters.size = params.count();
                    $scope.filters.sort = params.sorting();
                    $scope.getRevenueByVehicle();
                }
            });



        $scope.vehicleRevenue = function () {
            $scope.template = $scope.templates[0];
            $scope.activated = '0';
            $scope.initializeparams();
            $scope.revenueParams = new NgTableParams({
                page: 1, // show first page
                size: 10,
                sorting: {
                    createdAt: -1
                }
            }, {
                    counts: [],
                    total: $scope.count,
                    getData: function (params) {
                        $scope.filters.page = params.page();
                        $scope.filters.size = params.count();
                        $scope.filters.sort = params.sorting();
                        $scope.getRevenueByVehicle();
                    }
                });

        }

        $scope.gotorevenueByVehicleId = function (id, vehilceId) {
            $scope.vehicleNumber = vehilceId;
            $scope.getRevenueByParty(id);
            $scope.template = $scope.templates[1];
             $scope.initializeparams();
        };
        $scope.vehicleExpenses = function () {
            $scope.template = $scope.templates[2];
            $scope.activated = '2';
            $scope.initializeparams();
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
                        $scope.filters.page = params.page();
                        $scope.filters.size = params.count();
                        $scope.filters.sort = params.sorting();
                        $scope.getExpenseByVehicle();
                    }
                });
        }

        $scope.gotoExpenseByVehicleId = function (id, vehicleId) {
            $scope.vehicleNumber = vehicleId;
            $scope.getexpenseByVehicleId(id);
            $scope.template = $scope.templates[3];
            $scope.activated = '2';
            $scope.initializeparams();
        }
        $scope.paymentsReceivable = function () {
            $scope.template = $scope.templates[4];
            $scope.activated = '4';
            $scope.initializeparams();
            $scope.expiryParams = new NgTableParams({
                page: 1, // show first page
                size: 10,
                sorting: {
                    createdAt: -1
                }
            }, {
                    counts: [],
                    total: $scope.count,
                    getData: function (params) {
                        $scope.filters.page = params.page();
                        $scope.filters.size = params.count();
                        $scope.filters.sort = params.sorting();
                        //$scope.getTruckExpires();
                    }
                });
        }
        $scope.gotoPaymentBypartyId = function (id, name) {
            $scope.partyName = name;
            $scope.getAmountsBypartyId(id);
            $scope.template = $scope.templates[5];
            $scope.activated = '4';
            $scope.initializeparams();
        }
        $scope.paybleByParty = function () {
            $scope.template = $scope.templates[7];
            $scope.activated = '4';
            $scope.initializeparams();
            $scope.paybleParams = new NgTableParams({
                page: 1, // show first page
                size: 10,
                sorting: {
                    createdAt: -1
                }
            }, {
                    counts: [],
                    total: $scope.count,
                    getData: function (params) {
                        $scope.filters.page = params.page();
                        $scope.filters.size = params.count();
                        $scope.filters.sort = params.sorting();
                        $scope.getPaybleByParty();
                    }
                });
        }
        $scope.gotoPayableBypartyId = function (id, name) {
            $scope.partyName = name;
            $scope.getPaybleAmountByPartyId(id);
            $scope.template = $scope.templates[8];
            $scope.activated = '4';
          /*   $scope.initializeparams(); */
        }
       
        $scope.getTruckExpirs = function () {
            $scope.template = $scope.templates[6];
           
            $scope.activated = '6';
            $scope.initializeparams();
            $scope.expiryParams = new NgTableParams({
                page: 1, // show first page
                size: 10,
                sorting: {
                    createdAt: -1
                }
            }, {
                    counts: [],
                    total: $scope.count,
                    getData: function (params) {
                        $scope.filters.page = params.page();
                        $scope.filters.size = params.count();
                        $scope.filters.sort = params.sorting();
                        $scope.getTruckExpires();
                    }
                });
        }

        $scope.erpDashBoard = function () {
            AccountServices.erpDashboard(function (success) {
                if (success.data.status) {
                    $scope.totals = success.data.result;

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.erpDashBoard();

        $scope.getTruckExpires = function () {
            TrucksService.findExpiryTrucks({ 
                regNumber: $scope.regNumber,
                page: $scope.filters.page,
                sort: $scope.filters.sort,
                size: $scope.filters.size
             }, function (success) {
                if (success.data.status) {
                    $scope.expiryTrucks = success.data.expiryTrucks;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };


        $scope.getRevenueByParty = function (id) {
            PartyService.getRevenueByPartyId(id, function (success) {
                if (success.data.status) {
                    $scope.revenueByVehicleId = success.data.trips;
                    $scope.totalRevenueByVehicleId = success.data.totalRevenue;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getRevenueByVehicle = function () {
            TripServices.findRevenueByVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber,
                page: $scope.filters.page,
                sort: $scope.filters.sort,
                size: $scope.filters.size
            }, function (success) {
                if (success.data.status) {
                    $scope.revenueByVehicle = success.data.revenue;
                    $scope.totalRevenue = success.data.grossAmounts;


                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getPaybleByParty = function () {
            ExpenseService.getPaybleAmountByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId,
                page: $scope.filters.page,
                sort: $scope.filters.sort,
                size: $scope.filters.size
            }, function (success) {
                if (success.data.status) {
                    $scope.paybleList = success.data.paybleAmounts;
                    $scope.gross = success.data.gross;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
            PartyService.getAllPartiesBySupplier(function(success){
                if(success.data.status){
                    $scope.suppliersList=success.data.parties;
                }else{
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(error){

            })
        };

        $scope.getAllTrucks = function () {
            TrucksService.getAllTrucks(null, function (success) {
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


        $scope.validateFilters = function (paramType) {
            var params = $scope.filters;
            /*if (!params.fromDate) {
                params.error.push('Invalid From Date');
            }
            if (!params.toDate) {
                params.error.push('Invalid To Date');
            }*/
            if ((!params.fromDate || !params.toDate) && !params.regNumber) {
                params.error.push('Please Select Dates or Register Number');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }
            if (!params.error.length) {
                if (paramType === 'expense') {
                    $scope.getExpenseByVehicle();

                } else if (paramType === 'revenue') {
                    $scope.getRevenueByVehicle();
                }
            }
        }
        $scope.selectTruckId = function (truck) {
            $scope.regNumber = truck._id;
        };
        $scope.selectPartyId = function (party) {
            $scope.partyId = party._id;
        };
        $scope.resetPartyName = function () {
            $scope.partyId = "";
        }

        $scope.resetTruckName = function () {
            $scope.regNumber = "";
        }
        $scope.getExpenseByVehicle = function () {
            ExpenseService.findExpensesbyGroupVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber,
                page: $scope.filters.page,
                sort: $scope.filters.sort,
                size: $scope.filters.size
            }, function (success) {
                if (success.data.status) {
                    $scope.totalExpensesbyVehicle = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };

        $scope.getTotalAmountReceivable = function () {
            PaymentsService.getTotalPaymentsReceivable(function (success) {
                if (success.data.status) {
                    $scope.amounts = success.data.amounts;
                    //  console.log("-->", $scope.amounts);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getTotalAmountReceivable();

        $scope.getAmountsByparty = function () {
            PaymentsService.getDuesByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId
            }, function (success) {
                if (success.data.status) {
                    $scope.parties = success.data.parties;
                    $scope.partiesAmount = success.data.grossAmounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getAmountsByparty();

        $scope.getAllParties = function () {
            PartyService.getParties(null, function (success) {
                if (success.data.status) {
                    $scope.partiesList = success.data.parties;
                } else {

                }
            }, function (err) {

            });
        }
        $scope.getTotalAmountReceivable = function () {
            PaymentsService.getTotalPaymentsReceivable(function (success) {
                if (success.data.status) {
                    $scope.amounts = success.data.amounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getTotalAmountReceivable();

        $scope.getAmountsByparty = function () {
            PaymentsService.getDuesByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId
            }, function (success) {
                if (success.data.status) {
                    $scope.parties = success.data.parties;
                    $scope.partiesAmount = success.data.grossAmounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getAmountsByparty();

        $scope.getAllParties = function () {
            PartyService.getParties(null, function (success) {
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


        $scope.getAmountsBypartyWithFilters = function () {
            var params = $scope.filters;
            params.error = [];

            if ((!params.fromDate || !params.toDate) && !params.partyName) {
                params.error.push('Please Select Dates or Party Name');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }

            if (!params.error.length) {
                $scope.getAmountsByparty();
            }
        }
        $scope.getPaybleBypartyWithFilters = function () {
            var params = $scope.filters;
            params.error = [];

            if ((!params.fromDate || !params.toDate) && !params.partyName) {
                params.error.push('Please Select Dates or Party Name');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }

            if (!params.error.length) {
                $scope.getPaybleByParty();
            }
        }

        $scope.getexpenseByVehicleId = function (id) {
            ExpenseService.findExpensesbyVehicleId(id, function (success) {
                if (success.data.status) {
                    $scope.expensesByVehicleId = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };


        $scope.getAmountsByparty = function () {
            PaymentsService.getDuesByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId
            }, function (success) {
                if (success.data.status) {
                    $scope.parties = success.data.parties;
                    $scope.partiesAmount = success.data.grossAmounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getAmountsByparty();


        $scope.Expenseamount = 0;

        $scope.GetExpense = function (expenseName, ExpenseAMount) {

            if ((expenseName == 'Diesel') || (expenseName == 'Toll') || (expenseName == 'Maintenance')) {
                return 0;
            } else {
                return ExpenseAMount;
            }

        }
        $scope.getAmountsBypartyId = function (id) {
            PartyService.amountByPartyid(id, function (success) {
                if (success.data.status) {
                    $scope.results = success.data.results;
                    $scope.amountPaid = success.data.totalPendingPayments;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            }, function (err) {

            });
        };
        $scope.getPaybleAmountByPartyId=function(id){
            ExpenseService.getPaybleAmountByPartyId(id,function(success){
                if (success.data.status) {
                    $scope.payableAmounts = success.data.partyData;
                    $scope.grossAmounts=success.data.grossAmounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(error){

            })
        }
        $scope.shareRevenueDetailsByVechicleViaEmail = function () {
            swal({
                title: 'Share revenue data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        TripServices.shareRevenueDetailsByVechicleViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
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
                        html: 'Revenue details sent successfully'
                    })
                }
            })
        }

        $scope.sharePaymentsDetailsByPartyViaEmail = function () {
            swal({
                title: 'Share revenue data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        PaymentsService.sharePaymentsDetailsByPartyViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            partyId: $scope.partyId,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
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
                        html: 'Payments details sent successfully'
                    })
                }
            })
        }
        $scope.shareExpensesDetailsViaEmail = function () {
            swal({
                title: 'Share expense data',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        ExpenseService.shareExpensesDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
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
                        html: 'Expense details sent successfully'
                    })
                }
            })
        }
        $scope.shareExpairedDetailsViaEmail = function () {
            swal({
                title: 'Share expairy data',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        TrucksService.shareExpiredDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
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
                        html: 'Expairy details sent successfully'
                    })
                }
            })
        }
        $scope.sharePayableDetailsViaEmail = function () {
            swal({
                title: 'Share payable details',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        ExpenseService.sharePayableDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            partyId: $scope.partyId,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
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
                        html: 'Payble details sent successfully'
                    })
                }
            })
        }
        $scope.downloadRevenueDetailsByVechicle = function () {
            window.open('/v1/trips/downloadRevenueDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber+'&page='+$scope.filters.page+'&sort='+JSON.stringify($scope.filters.sort)+'&size='+$scope.filters.size);
        }
        $scope.downloadExpenseDetailsByVechicle = function () {
            window.open('/v1/expense/downloadExpenseDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber+'&page='+$scope.filters.page+'&sort='+JSON.stringify($scope.filters.sort)+'&size='+$scope.filters.size);
        }
        $scope.downloadPaymentDetailsByParty = function () {
            window.open('/v1/payments/downloadPaymentDetailsByParty?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&partyId=' + $scope.partyId+'&page='+$scope.filters.page+'&sort='+JSON.stringify($scope.filters.sort)+'&size='+$scope.filters.size);
        }
        $scope.downloadExpairyDetailsByTruck = function () {
            window.open('/v1/trucks/downloadExpiryDetailsByTruck?regNumber=' + $scope.regNumber+'&page='+$scope.filters.page+'&sort='+JSON.stringify($scope.filters.sort)+'&size='+$scope.filters.size);
        }
        $scope.downloadPaybleDetailsByParty = function () {
            window.open('/v1/expense/downloadPaybleDetailsByParty?partyId=' + $scope.partyId+'&page='+$scope.filters.page+'&sort='+JSON.stringify($scope.filters.sort)+'&size='+$scope.filters.size);
        }
    }]);

    