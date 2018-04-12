app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', 'paginationService', 'NgTableParams', 'TripServices', 'ExpenseService', 'PartyService', 'PaymentsService', 'AccountServices', '$stateParams', 'ReceiptServices',
    function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService, PartyService, PaymentsService, AccountServices, $stateParams, ReceiptServices) {

        $scope.vehicleId = $stateParams.vehicleId;
        $scope.id = $stateParams.id;

        $scope.partyName = $stateParams.name;
        $scope.partyId = $stateParams.partyId;

        $scope.initializeparams = function (tableType) {
            var pageable = {};
            $scope.loading = true;
            $scope.filters = {
                fromDate: "",
                toDate: "",
                regNumber: "",
                error: [],
            };
            $scope.partyId = "";
            $scope.regNumber = "";
        };

        $scope.initializeparams();
        $scope.gotoPayableBypartyId = function (id, name) {
            $scope.partyName = name;
            $scope.getAmountsBypartyId(id);
            $scope.initializeparams();
        };

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
            TrucksService.findExpiryTrucks({
                regNumber: $scope.regNumber
            }, function (success) {
                if (success.data.status) {
                    $scope.expiryTrucks = success.data.expiryTrucks;
                    $scope.table = $('#truckExpirylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.expiryTrucks,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "registrationNo"
                            },
                            {
                                title: 'Fitness Expiry', "data": "fitnessExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Permit Expiry", "data": "permitExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Tax Expiry", "data": "taxDueDate",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Insurance Expiry", "data": "insuranceExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Pollution Expiry", "data": "pollutionExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            }
                        ],

                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getRevenueByParty = function () {
            PartyService.getRevenueByPartyId($stateParams.id, function (success) {
                if (success.data.status) {
                    $scope.totalRevenueByVehicleId = success.data.totalRevenue;
                    $scope.table = $('#revenueByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: false,

                            responsivePriority: 1
                        }],

                        data: success.data.trips,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: 'Trip ID', "data": "tripId",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Party Name", "data": "attrs.partyName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Frieight Amount", "data": "freightAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Expenses", "data": "cost",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })

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
                    $scope.table = $('#revenuelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,
                            targets: 0,
                            responsivePriority: 1
                        }],

                        data: $scope.revenueByVehicle,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "attrs.truckName",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" style="text-transform: uppercase">' + data + '</a>';

                                }
                            },
                            {title: 'Total Freight', "data": "totalFreight"},
                            {title: "Total Expense", "data": "totalExpense"},
                            {title: "Net Revenue", "data": "totalRevenue"}

                        ],


                        searching: true

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('revenueByvehicleId', {vehicleId: data.attrs.truckName, id: data.registrationNo});
                    })


                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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

            }, function (success) {
                if (success.data.status) {
                    $scope.paybleList = success.data.paybleAmounts;
                    $scope.gross = success.data.gross;
                    $scope.table = $('#payablelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.paybleAmounts,
                        columns: [
                            {
                                "title": "Party Name",
                                "data": "_id.name",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Party Mobile', "data": "_id.contact"},
                            {title: "Total Amount", "data": "totalAmount"},
                            {title: "Paid Amount", "data": "paidAmount"},
                            {title: "Payable", "data": "payableAmount"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('payableByPartyName', {partyId: data._id._id, name: data._id.name});
                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
            PartyService.getAllPartiesBySupplier(function (success) {
                if (success.data.status) {
                    $scope.suppliersList = success.data.parties;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
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


        $scope.validateFilters = function (paramType) {
            var params = $scope.filters;
            params.error = [];
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
        };
        $scope.getAmountByReceiptsFilters = function () {
            var params = $scope.filters;
            params.error = [];
            if ((!params.fromDate || !params.toDate) && !params.partyName) {
                params.error.push('Please Select Dates or Party name');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }
            if (!params.error.length) {
                $scope.getAmountByReceipts();
            }
        };
        $scope.selectTruckId = function (truck) {
            $scope.regNumber = truck._id;
        };
        $scope.selectPartyId = function (party) {
            $scope.partyId = party._id;
        };
        $scope.resetPartyName = function () {
            $scope.partyId = "";
        };

        $scope.resetTruckName = function () {
            $scope.regNumber = "";
        };
        $scope.getExpenseByVehicle = function () {
            ExpenseService.findExpensesbyGroupVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber

            }, function (success) {
                if (success.data.status) {
                    $scope.totalExpenses = success.data.totalExpenses;
                    $scope.table = $('#expenselist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.expenses,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "regNumber",
                                "render": function (data, type, row) {
                                    return '<a href="#" class="ui-sref" style="text-transform: uppercase;">' + data + '</a>';
                                }
                            },
                            {title: 'Diesel', "data": "exps[0].dieselExpense"},
                            {title: "Toll", "data": "exps[0].tollExpense"},
                            {title: "Maintenance", "data": "exps[0].mExpense"},
                            {title: "Miscellaneous", "data": "exps[0].misc"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('expenseByVehicleId', {vehicleId: data.regNumber, id: data.id});
                    })
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
                    $scope.table = $('#receivablelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.parties,
                        columns: [
                            {
                                "title": "Party Name",
                                "data": "attrs.partyName",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Party Mobile', "data": "attrs.partyContact"},
                            {title: "Total Fright", "data": "totalFright"},
                            {title: "Paid Amount", "data": "totalPayment"},
                            {title: "Due Amount", "data": "totalDue"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('receivableByPartyName', {partyId: data.id, name: data.attrs.partyName});
                    })
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


        $scope.getAllParties = function () {
            PartyService.getParties(null, function (success) {
                if (success.data.status) {
                    $scope.partiesList = success.data.parties;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


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
        };
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
        };

        $scope.getexpenseByVehicleId = function () {
            ExpenseService.findExpensesbyVehicleId($stateParams.id, function (success) {
                if (success.data.status) {
                    $scope.expensesByVehicleId = success.data.expenses;
                    $scope.totalExpenses = success.data.total;
                    $scope.table = $('#expenseByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data: success.data.expenses,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },

                            {
                                title: 'Expense Type', "data": "attrs.expenseName",

                            },
                            {
                                title: "Description", "data": "description",

                            },
                            {
                                title: 'Amount', "data": "cost",

                            }

                        ],


                        searching: true

                    })
                } else {
                    Notification.error(success.data.message);
                }
            }, function (err) {

            });
        };


        $scope.Expenseamount = 0;

        $scope.GetExpense = function (expenseName, ExpenseAMount) {
            if ((expenseName.toLowerCase() == 'diesel') || (expenseName.toLowerCase() == 'toll') || (expenseName.toLowerCase() == 'maintenance')) {
                return 0;
            } else {
                return ExpenseAMount;
            }

        };
        $scope.getAmountsBypartyId = function () {
            PartyService.amountByPartyid($stateParams.partyId, function (success) {
                if (success.data.status) {
                    $scope.amountPaid = success.data.totalPendingPayments;
                    $scope.table = $('#amountsByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data: success.data.results,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: 'Trip Id', "data": "tripId",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Registration No", "data": "attrs.truckName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Freight Amount", "data": "freightAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Paid Amount", "data": "amount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

        $scope.getPaybleAmountByPartyId = function () {
            ExpenseService.getPaybleAmountByPartyId($stateParams.partyId, function (success) {
                if (success.data.status) {
                    $scope.grossAmounts = success.data.grossAmounts;
                    $scope.table = $('#payableByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data: success.data.partyData,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: 'Expense Type', "data": "expenseType.expenseName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Total Amount", "data": "totalAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Paid Amount", "data": "paidAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Payable", "data": "payableAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })
                } else {
                    success.data.message.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
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
        };

        $scope.sharePaymentsDetailsByPartyViaEmail = function () {
            swal({
                title: 'Share payment data using email',
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
        };
        $scope.shareExpensesDetailsViaEmail = function () {
            swal({
                title: 'Share expense data using email',
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
        };
        $scope.shareExpairedDetailsViaEmail = function () {
            swal({
                title: 'Share expiry data using email',
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
                        html: 'Expiry details sent successfully'
                    })
                }
            })
        };
        $scope.sharePayableDetailsViaEmail = function () {
            swal({
                title: 'Share payable data using mail',
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
        };
        $scope.shareReceiptsDetailsViaEmail = function () {
            swal({
                title: 'Share receipts details using mail',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        ReceiptServices.shareReceiptsDetailsByPartyViaEmail({
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
                        html: 'Receipts details sent successfully'
                    })
                }
            })
        };
        $scope.downloadRevenueDetailsByVechicle = function () {
            window.open('/v1/trips/downloadRevenueDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadExpenseDetailsByVechicle = function () {
            window.open('/v1/expense/downloadExpenseDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadPaymentDetailsByParty = function () {
            window.open('/v1/payments/downloadPaymentDetailsByParty?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&partyId=' + $scope.partyId + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadExpairyDetailsByTruck = function () {
            window.open('/v1/trucks/downloadExpiryDetailsByTruck?regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadPaybleDetailsByParty = function () {
            window.open('/v1/expense/downloadPaybleDetailsByParty?partyId=' + $scope.partyId + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadReceiptsDetailsByParty = function () {
            window.open('/v1/receipts/downloadReceiptsDetailsByParty?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&partyId=' + $scope.partyId + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };


        $scope.getAmountByReceipts = function () {
            ReceiptServices.getReceiptsByParties($scope.filters, function (success) {
                if (success.data.status) {
                    // $scope.amounts = success.data.data;
                    $scope.table = $('#amountByReceipts').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{
                            orderable: true,
                            responsivePriority: 1
                        }],

                        data: success.data.data,
                        columns: [
                            {
                                title: 'Party Name', "data": "_id.name",
                                "render": function (data, type, row) {
                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {
                                title: "Amount", "data": "amount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            }
                        ],

                        searching: true

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('receiptByPartyName', {receiptId: data._id._id, name: data._id.name});
                    })

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getReceiptsAmountByParty = function () {
            ReceiptServices.getReceiptByPartyName($stateParams.receiptId, function (success) {
                if (success.data.status) {
                    $scope.amounts = success.data.data;
                    $scope.total = success.data.total;
                    $scope.table = $('#bypartyNames').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{
                            orderable: true,
                            responsivePriority: 1
                        }],

                        data: $scope.amounts,
                        columns: [
                            {
                                title: 'Date', "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '----';
                                    }

                                }
                            },
                            {
                                title: 'Party Name', "data": "partyId.name",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '----';
                                    }

                                }
                            },
                            {
                                title: "Description", "data": "description",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '----';
                                    }

                                }
                            },
                            {
                                title: "Amount", "data": "amount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            }

                        ],

                        searching: true

                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


    }]);

