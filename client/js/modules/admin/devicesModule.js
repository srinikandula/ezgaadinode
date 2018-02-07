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
        }
    }
});

app.controller('DeviceCtrl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', function ($scope, DeviceService, Notification, NgTableParams) {
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
            if (angular.isArray(response.data.devices)) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.devices;
                $scope.currentPageOfDevices = response.data.devices;
                // $scope.currentPageOfDevices[1].isDamaged = '1';
                // console.log('devices', $scope.currentPageOfDevices);
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
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                // $scope.getDevices();
            }
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
            if(result.value) {
                DeviceService.deleteDevice($scope.currentPageOfDevices[index]._id, function (success) {
                    if(success.data.status) {
                        $scope.init();
                        swal(
                            '',
                            'Successfully removed' ,
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
        if($scope.deviceDetails.truckId) {
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
        if(!$scope.deviceDetails.accountId) {
            $scope.deviceDetails.error = 'Please select an account';
        } else {
            $scope.deviceDetails.error = '';
            DeviceService.updateDevice($scope.deviceDetails, function (success) {
                if (success.data.status) {
                    // console.log('updated');
                    $state.go('services.gpsDevices');
                }
            });
        }
    };

    $scope.devicesToAdd = [{
        imei: '',
        simPhoneNumber: '',
        simNumber: ''
    }];

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
        DeviceService.addDevices({devices: $scope.devicesToAdd, assignedTo: '27'}, function (success) {
            if (success.data.status) {
                // console.log('Added', success.data);
                $state.go('services.gpsDevices');
                $scope.alreadyadded = success.data.alreadyadded;
            }
        });
    };
}]);