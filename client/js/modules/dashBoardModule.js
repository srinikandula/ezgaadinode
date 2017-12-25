app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', 'paginationService', 'NgTableParams', 'TripServices', 'ExpenseService', 'PartyService', 'PaymentsService', '$rootScope', 'AccountServices',
    function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService, PartyService, PaymentsService, $rootScope, AccountServices) {

        $scope.templates = ['/views/templates/revenueByVehicle.html', '/views/templates/revenueByvehicleId.html',
            '/views/templates/expenseByVehicle.html', '/views/templates/expenseByVehicleId.html',
            '/views/templates/amountByParties.html', '/views/templates/amountByPartyId.html',
            '/views/templates/expiryTrucks.html'];

        $scope.initializeparams = function () {
            $scope.filters = {
                fromDate: "",
                toDate: "",
                regNumber: "",
                error: []
            }
            $scope.partyId = "";
            $scope.regNumber = "";

        }

        $scope.template = $scope.templates[0];
        $scope.activated = '0';
        $scope.initializeparams();

        $scope.vehicleRevenue = function () {
            $scope.initializeparams();
            $scope.template = $scope.templates[0];
            $scope.activated = '0';
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
        }
        $scope.gotoPaymentBypartyId = function (id, name) {
            $scope.partyName = name;
            $scope.getAmountsBypartyId(id);
            $scope.template = $scope.templates[5];
            $scope.activated = '4';
            $scope.initializeparams();
        }
        $scope.getTruckExpirs = function () {
            $scope.template = $scope.templates[6];
            $scope.getTruckExpires();
            $scope.activated = '6';
            $scope.initializeparams();
        }

        $scope.erpDashBoard = function () {
            AccountServices.erpDashboard(function (success) {
                if (success.data.status) {
                    $scope.totals = success.data.result;

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };
        $scope.erpDashBoard();


        $scope.getTruckExpires = function () {
            TrucksService.findExpiryTrucks(function (success) {
                if (success.data.status) {
                    $scope.expiryTrucks = success.data.expiryTrucks;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };
        $scope.getRevenueByVehicle = function () {
            TripServices.findRevenueByVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber
            }, function (success) {
                if (success.data.status) {
                    $scope.revenueByVehicle = success.data.revenue;
                    $scope.totalRevenue = success.data.grossAmounts;


                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

        $scope.getAllTrucks = function () {
            TrucksService.getAllTrucks(null, function (success) {
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
                regNumber: $scope.regNumber
            }, function (success) {
                if (success.data.status) {
                    $scope.totalExpensesbyVehicle = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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
                        Notification.error({message: message});
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
                        Notification.error({message: message});
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

        $scope.getExpenseByVehicle = function () {
            ExpenseService.findExpensesbyGroupVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber
            }, function (success) {
                if (success.data.status) {
                    $scope.totalExpensesbyVehicle = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getTotalAmountReceivable = function () {
            PaymentsService.getTotalPaymentsReceivable(function (success) {
                if (success.data.status) {
                    $scope.amounts = success.data.amounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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
                        Notification.error({message: message});
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


        $scope.getexpenseByVehicleId = function (id) {
            ExpenseService.findExpensesbyVehicleId(id, function (success) {
                if (success.data.status) {
                    $scope.expensesByVehicleId = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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
                        Notification.error({message: message});
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
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

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
                            email: email
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
                            email: email
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
                            email: email
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
    }]);

