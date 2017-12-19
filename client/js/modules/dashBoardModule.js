
app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state','paginationService','NgTableParams','TripServices','ExpenseService','PartyService', 'PaymentsService','$rootScope','AccountServices',
function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService,PartyService,PaymentsService, $rootScope, AccountServices) {

    $scope.templates = ['/views/templates/revenueByVehicle.html', '/views/templates/revenueByvehicleId.html',
                        '/views/templates/expenseByVehicle.html', '/views/templates/expenseByVehicleId.html',
                        '/views/templates/amountByParties.html', '/views/templates/amountByPartyId.html',
                        '/views/templates/expiryTrucks.html'];

    $scope.template = $scope.templates[0];
    $scope.activated = '0';

    $scope.vehicleRevenue = function () {
        $scope.template = $scope.templates[0];
        $scope.activated = '0';
    }

    $scope.gotorevenueByVehicleId = function (id, vehilceId) {
        $scope.vehicleNumber= vehilceId;
        $scope.getRevenueByParty(id);
        $scope.template = $scope.templates[1];
    };
    $scope.vehicleExpenses = function () {
        $scope.template = $scope.templates[2];
        $scope.activated = '2';
    }

    $scope.gotoExpenseByVehicleId = function (id, vehicleId) {
        $scope.vehicleNumber= vehicleId;
        $scope.getexpenseByVehicleId(id);
        $scope.template = $scope.templates[3];
        $scope.activated = '2';
    }
    $scope.paymentsReceivable = function () {
        $scope.template = $scope.templates[4];
        $scope.activated = '4';
    }
    $scope.gotoPaymentBypartyId = function (id, name) {
        $scope.partyName= name;
        $scope.getAmountsBypartyId(id);
        $scope.template = $scope.templates[5];
        $scope.activated = '4';
    }
    $scope.getTruckExpirs = function () {
        $scope.template = $scope.templates[6];
        $scope.getTruckExpires();
        $scope.activated = '6';
    }

    $scope.erpDashBoard = function () {
        AccountServices.erpDashboard (function (success) {
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
                console.log("---->>", $scope.revenueByVehicleId);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };


    $scope.getRevenueByVehicle = function () {
        TripServices.findRevenueByVehicle(function (success) {
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
    $scope.getRevenueByVehicle();


    $scope.filters={
        fromDate: "",
        toDate: "",
        regNumber: ""
    }
    
    $scope.validateFilters = function () {
        var params = $scope.filters;
        params.error = [];
        /*if (!params.fromDate) {
            params.error.push('Invalid From Date');
        }
        if (!params.toDate) {
            params.error.push('Invalid To Date');
        }*/
        if((!params.fromDate && !params.toDate) && !params.regNumber) {
            params.error.push('Please Select Dates or Register Number');
        }
        if (new Date(params.fromDate) > new Date(params.toDate)) {
            params.error.push('Invalid Date Selection');
        }
        if (!params.error.length) {
            $scope.getExpenseByVehicle();
        }
    }

    $scope.selectTruckId = function (truck) {
        $scope.regNumber = truck.id;
    };

    $scope.getExpenseByVehicle = function () {
        ExpenseService.findExpensesbyGroupVehicle({
            fromDate:$scope.filters.fromDate,
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
    $scope.getExpenseByVehicle();



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
            PaymentsService.getDuesByParty(function (success) {
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


    $scope.Expenseamount =0;

    $scope.GetExpense = function(expenseName,ExpenseAMount){

        if((expenseName =='Diesel')||(expenseName == 'Toll') ||(expenseName =='Maintenance')){
            return 0;
        }else{
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

}]);

