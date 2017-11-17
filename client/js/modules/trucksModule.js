app.factory('TrucksService', function ($http, $cookies) {
    return {
        addTruck: function (truckDetails, success, error) {
            $http({
                url: '/v1/trucks/',
                method: "POST",
                data: truckDetails
            }).then(success, error)
        },
        getTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "GET"
            }).then(success, error)
        },
        getAccountTrucks: function (pageNumber, success, error) {
            $http({
                url: '/v1/trucks/get/accountTrucks/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getGroupTrucks: function (pageNumber, success, error) {
            $http({
                url: '/v1/trucks/groupTrucks/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getUnAssignedTrucks: function (groupId,success, error) {
            $http({
                url: '/v1/trucks/getUnAssignedTrucks/getAll/',
                method: "GET",
                params:groupId
            }).then(success, error)
        },
        updateTruck: function (truckInfo, success, error) {
            $http({
                url: '/v1/trucks',
                method: "PUT",
                data: truckInfo
            }).then(success, error)
        },
        deleteTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "DELETE"
            }).then(success, error)
        },
        getAllAccountTrucks: function (success, error) {
            $http({
                url: '/v1/trucks',
                method: "GET"
            }).then(success, error)
        },
        assignTrucks: function (assignedTrucks, success, error) {
            $http({
                url: '/v1/trucks/assignTrucks',
                method: "POST",
                data: assignedTrucks
            }).then(success, error);
        },
        unAssignTrucks:function(unAssignTrucks,success,error){
            $http({
                url:'/v1/trucks/unassign-trucks',
                method:"POST",
                data:unAssignTrucks
            }).then(success,error);
        },
        findExpiryCount: function (success, error) {
            $http({
                url: '/v1/trucks/findExpiryCount',
                method: "GET"
            }).then(success, error)
        },
        fitnessExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/fitnessExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        permitExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/permitExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        insuranceExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/insuranceExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        pollutionExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/pollutionExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        taxExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/taxExpiryTrucks',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('TrucksController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', function ($scope, $uibModal, TrucksService, Notification, $state) {
    $scope.goToEditTruckPage = function (truckId) {
        $state.go('trucksEdit', {truckId: truckId});
    };

    // pagination options
    $scope.totalItems = 10;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.truckGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Reg No',
            field: 'registrationNo'
        }, {
            name: 'TruckType',
            field: 'truckType'
        }, {
            name: 'Tonnage',
            field: 'tonnage'
        }, {
            name: 'Permit',
            field: 'permitExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Pollution',
            field: 'pollutionExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Insurance',
            field: 'insuranceExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Fitness',
            field: 'fitnessExpiry',
            cellFilter: 'date:"dd-MM-yyyy"'
        }, {
            name: 'Driver',
            field: 'attrs.fullName'
        }, {
            name: 'Driver mobile',
            field: 'attrs.mobile'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a ng-click="grid.appScope.goToEditTruckPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteTruck(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'

        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.getTrucksData = function () {
        TrucksService.getGroupTrucks($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.truckGridOptions.data = success.data.trucks;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getTrucksData();

    $scope.deleteTruck = function (truckId) {
        TrucksService.deleteTruck(truckId, function (success) {
            if (success.data.status) {
                Notification.error('Truck deleted successfully');
                $scope.getTrucksData();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message)
                });
            }
        }, function (err) {

        });
    }

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
                //console.log($scope.fitnessExpiryTrucksdata);
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
}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'TrucksService', 'DriverService', '$stateParams', 'Notification', '$state', function ($scope, Utils, TrucksService, DriverService, $stateParams, Notification, $state) {
    $scope.goToTrucksPage = function () {
        $state.go('trucks');
    };
    $scope.selectDriverId = function (driver) {
        $scope.truck.driverId = driver._id;
    }
    $scope.drivers = [];
    $scope.truck = {
        registrationNo: '',
        truckType: '',
        tonnage: '',
        modelAndYear: '',
        driverId: '',
        fitnessExpiry: '',
        permitExpiry: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
        taxDueDate: '',
        errors: []
    };

    $scope.pageTitle = $stateParams.truckId ? 'Update Truck' : 'Add Truck';

    function getAccountDrivers() {
        DriverService.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    getAccountDrivers();


    if ($stateParams.truckId) {
        TrucksService.getTruck($stateParams.truckId, function (success) {
            if (success.data.status) {
                $scope.truck = success.data.truck;
                $scope.truck.fitnessExpiry = new Date($scope.truck.fitnessExpiry);
                $scope.truck.insuranceExpiry = new Date($scope.truck.insuranceExpiry);
                $scope.truck.permitExpiry = new Date($scope.truck.permitExpiry);
                $scope.truck.pollutionExpiry = new Date($scope.truck.pollutionExpiry);
                $scope.truck.taxDueDate = new Date($scope.truck.taxDueDate);
                var selectedDriver = _.find( $scope.drivers, function (driver) {
                    return driver._id.toString() === $scope.truck.driverId;
                });
                if(selectedDriver){
                    $scope.driverName = selectedDriver.fullName;
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTruck = function () {
        var params = $scope.truck;
        params.errors = [];

        if (!params.registrationNo) {
            params.errors.push('Invalid Registration ID');
        }
        if (!params.truckType) {
            params.errors.push('Invalid truckType');
        }
        if (!params.modelAndYear) {
            params.errors.push('Invalid Modal and Year');
        }

        if (!params.fitnessExpiry) {
            params.errors.push('Invalid Fitness Expiry');
        }
        if (!params.permitExpiry) {
            params.errors.push('Invalid Permit Expiry');
        }
        if (!params.insuranceExpiry) {
            params.errors.push('Invalid Insurance Expiry');
        }
        if (!params.pollutionExpiry) {
            params.errors.push('Invalid Pollution Expiry');
        }
        if (!params.taxDueDate) {
            params.errors.push('Invalid Tax due date');
        }

        if (!params.errors.length) {
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                TrucksService.updateTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

