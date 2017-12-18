app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state','paginationService','NgTableParams','TripServices','ExpenseService','PartyService', 'PaymentsService','$rootScope',
function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService,PartyService,PaymentsService, $rootScope) {

 // All Trucks Expirys

    $scope.getExpiryCount = function () {
        TrucksService.findExpiryCount(function (success) {
            if (success.data.status) {
                $scope.allExpiryCountdata = success.data.expiryCount;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getExpiryCount();

    $scope.getfitnessExpiryTrucks = function () {
        TrucksService.fitnessExpiryTrucks(function (success) {
            if (success.data.status) {
                $scope.fitnessExpiryTrucksdata = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getfitnessExpiryTrucks();

    $scope.getpermitExpiryTrucks = function () {
        TrucksService.permitExpiryTrucks(function (success) {
            if (success.data.status) {
                $scope.permitExpiryTrucksdata = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getpermitExpiryTrucks();

    $scope.getinsuranceExpiryTrucks = function () {
        TrucksService.insuranceExpiryTrucks(function (success) {
            if (success.data.status) {
                $scope.insuranceExpiryTrucksdata = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getinsuranceExpiryTrucks();

    $scope.getpollutionExpiryTrucks = function () {
        TrucksService.pollutionExpiryTrucks(function (success) {
            if (success.data.status) {
                $scope.pollutionExpiryTrucksdata = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getpollutionExpiryTrucks();

    $scope.gettaxExpiryTrucks = function () {
        TrucksService.taxExpiryTrucks(function (success) {
            if (success.data.status) {
                $scope.taxExpiryTrucksdata = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.gettaxExpiryTrucks();

// Total Revenue, Revenue by Vehicle, Revenue By Party

    $scope.getTotalRevenue = function () {
        TripServices.findTotalRevenue(function (success) {
            if (success.data.status) {
                $scope.totalVehicleRevenue = success.data.totalRevenue;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getTotalRevenue();

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

    $scope.gotorevenueByVehicleId = function (vehicleId, truckName) {
        $rootScope.vehicleNumber = truckName;
        $state.go('revenueByVehicleId', {vehicleId:vehicleId});
       };

// Total Expenses, Expense by Vehicle

    $scope.getTotalExpenses = function () {
        ExpenseService.findTotalExpenses(function (success) {
            if (success.data.status) {
                $scope.totalExpense = success.data.totalExpenses;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getTotalExpenses();

    $scope.filters={
        fromDate: "",
        toDate: "",
        regNumber: ""
    }
    $scope.regNumber = "";
    
    $scope.validateFilters = function () {
        var params = $scope.filters;
        params.error = [];
        /*if (!params.fromDate) {
            params.error.push('Invalid From Date');
        }
        if (!params.toDate) {
            params.error.push('Invalid To Date');
        }*/
        if((!params.fromDate || !params.toDate) && !params.regNumber) {
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
 

    $scope.gotoExpenseByVehicleId = function (vehicleId, regNumber) {
        $rootScope.vehicleNumber = regNumber;
        $state.go('expenseByVehicleId', {vehicleId:vehicleId})
    };
    $scope.gotoPaymentBypartyId = function (partyId, partyName) {
        $rootScope.partyName = partyName;
        $state.go('amountByPartyId', {partyId:partyId, partyName:partyName});
    };

    /**
     * Total Payment Receivable by Party, Pending Amount by Party
     */

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

}]);

app.controller('paymentsById', ['$scope', '$stateParams', 'PartyService', 'ExpenseService','PaymentsService',
function ($scope, $stateParams, PartyService, ExpenseService,PaymentsService) {

      $scope.getRevenueByParty = function () {
        PartyService.getRevenueByPartyId($stateParams.vehicleId, function (success) {
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
    $scope.getRevenueByParty();

    $scope.getexpenseByVehicleId = function () {
        ExpenseService.findExpensesbyVehicleId($stateParams.vehicleId, function (success) {
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
    $scope.getexpenseByVehicleId();
    $scope.Expenseamount =0;

    $scope.GetExpense = function(expenseName,ExpenseAMount){

        if((expenseName =='Diesel')||(expenseName == 'Toll') ||(expenseName =='Maintenance')){
            return 0; 
        }else{
            return ExpenseAMount; 
        }       

    }


    $scope.getAmountsBypartyId = function () {
        PartyService.amountByPartyid($stateParams.partyId, function (success) {
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
    $scope.getAmountsBypartyId();
}]);