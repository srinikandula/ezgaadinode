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
                $scope.totalRevenue = success.data.totalRevenue;
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
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getRevenueByVehicle();

    $scope.gotorevenueByVehicleId = function (vehicleId) {
        $state.go('revenueByVehicleId', {vehicleId:vehicleId});
       };

// Total Expenses, Expense by Vehicle

    $scope.getTotalExpenses = function () {
        ExpenseService.findTotalExpenses(function (success) {
            if (success.data.status) {
                $scope.totalExpenses = success.data.totalExpenses;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getTotalExpenses();

    $scope.getExpenseByVehicle = function () {
        ExpenseService.findExpensesbyGroupVehicle(function (success) {
            if (success.data.status) {
                $scope.totalExpensesbyVehicle = success.data.expenses;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getExpenseByVehicle();
 

    $scope.gotoExpenseByVehicleId = function (vehicleId) {
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