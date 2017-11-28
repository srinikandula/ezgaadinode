app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state','paginationService','NgTableParams','TripServices','ExpenseService','PartyService', function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService,PartyService) {

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
        $state.go('revenueByVehicleId', {vehicleId:vehicleId})
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
        ExpenseService.findExpensesbyVehicle(function (success) {
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

}]);

app.controller('paymentsById', ['$scope', '$stateParams', 'PartyService', function ($scope, $stateParams, PartyService) {

      $scope.getRevenueByParty = function () {
        PartyService.getRevenueByPartyId($stateParams.vehicleId, function (success) {
            if (success.data.status) {
                $scope.revenueByVehicleId = success.data.trips;
                console.log("===>>>>",$scope.revenueByVehicleId);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
    $scope.getRevenueByParty();
}]);