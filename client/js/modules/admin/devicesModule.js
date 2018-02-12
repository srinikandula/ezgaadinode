app.factory('DeviceService', function ($http) {
    return {
        addDevices: function (device, success, error) {
            $http({
                url: '/v1/devices/addDevices',
                method: "POST",
                data: device
            }).then(success, error);
        },
        deleteDevice: function (deviceId, success, error) {
            $http({
                url: '/v1/devices/deleteDevice/' + deviceId,
                method: "GET"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/devices/count',
                method: "GET"
            }).then(success, error)
        },
        getDevices: function (pageable, success, error) {
            $http({
                url: '/v1/devices/getDevices',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getDevice: function (deviceId, success, error) {
            $http({
                url: '/v1/devices/getDevice/' + deviceId,
                method: "GET"
            }).then(success, error)
        },
        updateDevice: function (device, success, error) {
            $http({
                url: '/v1/devices/updateDevice',
                method: "POST",
                data: device
            }).then(success, error);
        },
        getAllDevices: function (success, error) {
            $http({
                url: '/v1/devices/getAllDevices',
                method: "GET"
            }).then(success, error)
        },
        transferDevices: function (devices, success, error) {
            $http({
                url: '/v1/devices/transferDevices',
                method: "POST",
                data: devices
            }).then(success, error);
        },
        getDevicePlans: function (success, error) {
            $http({
                url: '/v1/devices/getDevicePlans',
                method: "GET"
            }).then(success, error);
        },
        getDevicePlanHistory: function (deviceId, success, error) {
            $http({
                url: '/v1/devices/getDevicePlanHistory/' + deviceId,
                method: "GET"
            }).then(success, error);
        },
        getAllAccountsForDropdown: function (success, error) {
            $http({
                url: '/v1/admin/accounts/getAllAccountsForDropdown',
                method: "GET"
            }).then(success, error)
        },
        getAllTrucksOfAccount: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/getAllTrucksOfAccount/' + truckId,
                method: "GET"
            }).then(success, error)
        },
        getEmployees: function (success, error) {
            $http({
                url: '/v1/admin/getEmployees',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('DeviceCtrl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', '$uibModal', function ($scope, DeviceService, Notification, NgTableParams, $uibModal) {
    $scope.count = 0;
    $scope.getCount = function () {
        DeviceService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                // console.log('count', $scope.count);
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
            sort: tableParams.sorting()
        };
        DeviceService.getDevices(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.devices;
                $scope.currentPageOfDevices = response.data.devices;
                // $scope.currentPageOfDevices[1].isDamaged = '1';
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.init = function () {
        $scope.deviceParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [50, 100, 200],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                // $scope.getDevices();
            }
        });
    };

    $scope.assignDevicesModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'assignDevicesModal.html',
            controller: 'transferDevicesCrtl'
        });

    };

    $scope.deleteDevice = function (index) {
        // console.log(index);
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the device'
        }).then(function (result) {
            if (result.value) {
                DeviceService.deleteDevice($scope.currentPageOfDevices[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.init();
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    }
}]);

app.controller('DeviceEditCrtl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', '$stateParams', '$filter', '$state', function ($scope, DeviceService, Notification, NgTableParams, $stateParams, $filter, $state) {

    $scope.deviceDetails = {
        accountId: '',
        deviceId: '',
        truckId: '',
        installedBy: '',
        address: '',
        imei: '',
        simPhoneNumber: '',
        simNumber: '',
        truck: {
            fitnessExpiry: '',
            insuranceExpiry: ''
        },
        isDamaged: '',
        isActive: '',
        rcNumber: '',
        insuranceAmount: '',
        npAvailable: '',
        npExpiry: '',
        error: ''
    };

    function getDevice() {
        DeviceService.getDevice($stateParams.device, function (response) {
            if (response.data.status) {
                $scope.deviceDetails = response.data.deviceDetails;
                if ($scope.deviceDetails.truck) {
                    $scope.deviceDetails.truck.fitnessExpiry = $filter("date")($scope.deviceDetails.truck.fitnessExpiry, 'dd-MM-yyyy');
                    $scope.deviceDetails.truck.insuranceExpiry = $filter("date")($scope.deviceDetails.truck.insuranceExpiry, 'dd-MM-yyyy');
                    $scope.deviceDetails.truckId = $scope.deviceDetails.truck._id;
                }
                $scope.deviceDetails.isDamaged = $scope.deviceDetails.isDamaged === '1';
                if ($scope.deviceDetails.isDamaged) $scope.deviceDetails.isDamaged = $scope.deviceDetails.isDamaged.toString();
                if ($scope.deviceDetails.isActive) $scope.deviceDetails.isActive = $scope.deviceDetails.isActive.toString();
                // console.log($scope.deviceDetails.isDamaged);
                // if($scope.deviceDetails.isDamaged === '1') {
                //     $scope.deviceDetails.isDamaged = true;
                // } else {
                //     $scope.deviceDetails.isDamaged = false;
                // }
                // console.log($scope.deviceDetails);
                $scope.getTrucksOfAccount();
            }
        });
    }

    getDevice();

    function getAccounts() {
        DeviceService.getAllAccountsForDropdown(function (success) {
            if (success.data.status) {
                $scope.accounts = success.data.accounts;
                // console.log('accounts', $scope.accounts.length);
            }
        });
    }

    getAccounts();

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
                // console.log($scope.employees);
            }
        });
    }

    getEmployees();

    $scope.getTrucksOfAccount = function () {
        // console.log('deviceDetails', $scope.deviceDetails);
        DeviceService.getAllTrucksOfAccount($scope.deviceDetails.accountId, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                // console.log('trucks', $scope.trucks)
            }
        });
    };

    $scope.getSelectedTruckDetails = function () {
        // console.log($scope.deviceDetails.truckId);
        if ($scope.deviceDetails.truckId) {
            var truck = _.find($scope.trucks, function (truck) {
                return truck._id === $scope.deviceDetails.truckId;
            });
            // console.log(truck);
            $scope.deviceDetails.truck = {};
            $scope.deviceDetails.truck.insuranceExpiry = $filter("date")(truck.fitnessExpiry, 'dd-MM-yyyy');
            $scope.deviceDetails.truck.fitnessExpiry = $filter("date")(truck.fitnessExpiry, 'dd-MM-yyyy');
        }
    };

    $scope.updateDevice = function () {
        // console.log($scope.deviceDetails);
        if (!$scope.deviceDetails.accountId) {
            $scope.deviceDetails.error = 'Please select an account';
        } else {
            $scope.deviceDetails.error = '';
            DeviceService.updateDevice($scope.deviceDetails, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Successfully updated"});
                    $state.go('services.gpsDevices');
                } else {
                    Notification.error({message: success.data.messages[0]});
                }
            });
        }
    };

    function getDevicePlans() {
        DeviceService.getDevicePlans(function (success) {
            if(success.data.status) {
                $scope.devicePlans = success.data.devicePlans;
            } else {
                Notification.error({message: "unable to get plans"})
            }
        });
    }
    // getDevicePlans();

    function getDevicePlanHistory() {
        DeviceService.getDevicePlanHistory($stateParams.device, function (success) {
            if(success.data.status) {
                $scope.devicePlanHistory = success.data.devicePlanHistory;
                console.log('history', $scope.devicePlanHistory);
            } else {
                Notification.error({message: "unable to get plan history"})
            }
        });
    }
    getDevicePlanHistory();
}]);

app.controller('addAndAssignDevicesCrtl', ['$scope', 'DeviceService', 'Notification', '$state', function ($scope, DeviceService, Notification, $state) {
    $scope.devicesToAdd = [{
        imei: '',
        simPhoneNumber: '',
        simNumber: ''
    }];

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
                console.log($scope.employees);
            }
        });
    }

    getEmployees();

    $scope.addDeviceRow = function () {
        var params = $scope.devicesToAdd;
        if (params[params.length - 1].imei && params[params.length - 1].simPhoneNumber && params[params.length - 1].simNumber)
            params.push({
                imei: '',
                simPhoneNumber: '',
                simNumber: ''
            });
    };

    $scope.removeDeviceRow = function (index) {
        $scope.devicesToAdd.splice(index, 1);
    };

    $scope.addDevices = function () {
        $scope.errors = [];
        var params = $scope.devicesToAdd;
        console.log(params);
        for (var i = 0; i < params.length - 1; i++) {
            for (var j = i + 1; j < params.length; j++) {
                if (params[i].imei === params[j].imei) {
                    $scope.errors.push('Multiple devices cannot have same IMEI number');
                    return;
                }
                if (params[i].simPhoneNumber === params[j].simPhoneNumber) {
                    $scope.errors.push('Multiple devices cannot have same Sim PhoneNumber');
                    return;
                }
                if (params[i].simNumber === params[j].simNumber) {
                    $scope.errors.push('Multiple devices cannot have same Sim Number');
                    return;
                }
            }
        }
        if (!params[params.length - 1].imei || !params[params.length - 1].simPhoneNumber || !params[params.length - 1].simNumber) {
            $scope.errors.push('please fill all the details');
        } else if (!$scope.assignedTo) {
            $scope.errors.push('please select an employeee');
        } else {
            $scope.errors = '';
            DeviceService.addDevices({devices: params, assignedTo: $scope.assignedTo}, function (success) {
                console.log(success.data);
                if (success.data.status) {
                    Notification.success({message: "Successfully added"});
                    $state.go('services.gpsDevices');
                } else {
                    $scope.errors = success.data.messages;
                    Notification.error({message: success.data.messages[0]});
                }
            });
        }
    };
}]);

app.controller('transferDevicesCrtl', ['$scope', 'DeviceService', 'Notification', '$state', '$uibModalInstance', function ($scope, DeviceService, Notification, $state, $uibModalInstance) {

    $scope.closeAssignDevice = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
                console.log($scope.employees);
            }
        });
    }

    getEmployees();
    $scope.getAllDevices = function () {
        DeviceService.getAllDevices(function (success) {
            if (success.data.status) {
                $scope.allDevices = success.data.devices;
                console.log('adddevices', $scope.allDevices);
            }
        });
    };
    $scope.getAllDevices();
    $scope.selected_baseline_settings = {
        displayProp: 'imei',
        searchField: 'imei',
        enableSearch: true,
        scrollable: true,
        idProp: '_id',
        externalIdProp: '_id',
        showCheckAll: false,
    };
    $scope.customText = {buttonDefaultText: 'Select Devices'};
    // function init() {
    $scope.selectedDevices = [];
    // } init();

    $scope.transferDevices = function () {
        console.log($scope.selectedDevices, $scope.assignedTo);
        if ($scope.selectedDevices.length < 1) {
            $scope.error = 'please select devices';
        } else if (!$scope.assignedTo) {
            $scope.error = 'please select an employeee';
        } else {
            $scope.error = '';
            DeviceService.transferDevices({
                devices: _.pluck($scope.selectedDevices, '_id'),
                assignedTo: $scope.assignedTo
            }, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Successfully transfered"});
                    $state.go('services.gpsDevices');
                } else {
                    Notification.error({message: success.data.messages[0]});
                }
            });
        }
    }
}]);