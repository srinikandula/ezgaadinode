app.factory('DeviceService', function ($http) {
    return {
        addDevices: function (device, success, error) {
            $http({
                url: '/v1/cpanel/devices/addDevices',
                method: "POST",
                data: device
            }).then(success, error);
        },
        deleteDevice: function (deviceId, success, error) {
            $http({
                url: '/v1/cpanel/devices/deleteDevice/' + deviceId,
                method: "GET"
            }).then(success, error)
        },
        count: function (accountName,success, error) {
            $http({
                url: '/v1/cpanel/devices/count',
                method: "GET",
                params:accountName
            }).then(success, error)
        },
        getDevices: function (pageable, success, error) {
            $http({
                url: '/v1/cpanel/devices/getDevices',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getDevice: function (deviceId, success, error) {
            $http({
                url: '/v1/cpanel/devices/getDevice/' + deviceId,
                method: "GET"
            }).then(success, error)
        },
        updateDevice: function (device, success, error) {
            $http({
                url: '/v1/cpanel/devices/updateDevice',
                method: "POST",
                data: device
            }).then(success, error);
        },
        getAllDevices: function (success, error) {
            $http({
                url: '/v1/cpanel/devices/getAllDevices',
                method: "GET"
            }).then(success, error)
        },
        transferDevices: function (devices, success, error) {
            $http({
                url: '/v1/cpanel/devices/transferDevices',
                method: "POST",
                data: devices
            }).then(success, error);
        },
        getDevicePlans: function (success, error) {
            $http({
                url: '/v1/cpanel/devices/getDevicePlans',
                method: "GET"
            }).then(success, error);
        },
        getDevicePlanHistory: function (deviceId, success, error) {
            $http({
                url: '/v1/cpanel/devices/getDevicePlanHistory/' + deviceId,
                method: "GET"
            }).then(success, error);
        },
        getDeviceManagementDetails: function (pageable, success, error) {
            $http({
                url: '/v1/cpanel/devices/getDeviceManagementDetails',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getDeviceManagementCount: function (success, error) {
            $http({
                url: '/v1/cpanel/devices/getDeviceManagementCount',
                method: "GET"
            }).then(success, error)
        },
        getPaymentCount: function (success, error) {
            $http({
                url: '/v1/cpanel/devices/getPaymentCount',
                method: "GET"
            }).then(success, error)
        },
        getPaymentDetails: function (id, success, error) {
            $http({
                url: '/v1/cpanel/devices/getPaymentDetails/' + id,
                method: "GET"
            }).then(success, error)
        },
        getAllAccountsForDropdown: function (params, success, error) {
            $http({
                url: '/v1/admin/accounts/getAllAccountsForDropdown',
                method: "GET",
                params: params
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
        },
        getGPSPlansOfDevice: function (deviceId, success, error) {
            $http({
                url: '/v1/cpanel/devices/getGPSPlansOfDevice/' + deviceId,
                method: "GET"
            }).then(success, error)
        },
        getGpsDevicesByStatus: function (pageble, success, error) {
            $http({
                url: '/v1/cpanel/devices/getGpsDevicesByStatus',
                method: "GET",
                params: pageble
            }).then(success, error)
        },
        getGpsDevicesCountByStatus: function (params, success, error) {
            $http({
                url: '/v1/cpanel/devices/getGpsDevicesCountByStatus',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getLatestLocationFromDevice: function (params, success, error) {
            $http({
                url: '/v1/cpanel/devices/getLatestLocationFromDevice',
                method: "GET",
                params: params
            }).then(success, error)
        }
    }
});

app.controller('DeviceCtrl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', '$uibModal', '$stateParams', function ($scope, DeviceService, Notification, NgTableParams, $uibModal, $stateParams) {
    $scope.searchString = '';
    $scope.query = {searchAccount:''};
    $scope.sortableString = '';
    $scope.count = 0;
    $scope.getCount = function () {
        DeviceService.count($scope.query,function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
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
            sort: tableParams.sorting(),
            searchString: $scope.searchString,
            searchAccount: tableParams.searchAccount,
            sortableString: $scope.sortableString
        };
        DeviceService.getDevices(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                $scope.count = response.data.data.count;
                tableParams.data = response.data.data.devices;
                $scope.currentPageOfDevices = response.data.data.devices;
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
            counts: [10, 50, 100, 200],
            total: $scope.count,
            getData: function (params) {
                if($scope.query.searchAccount){
                    params.searchAccount = $scope.query.searchAccount;
                }
                loadTableData(params);
                // $scope.getDevices();
            }
        });
    };

    $scope.assignDevicesModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'assignDevicesModal.html',
            controller: 'transferDevicesCrtl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
        });

    };


    $scope.deleteDevice = function (index) {
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
    };
    $scope.getLatestLocation = function (location,registrationNo) {

        location.registrationNo=registrationNo;
        var modalInstance = $uibModal.open({
            templateUrl: 'latestLocationModal.html',
            controller: 'FindDeviceLocationController',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                location: function () {
                    return location;
                }
            }
        });


    }
}]);
app.controller('FindDeviceLocationController', ['$scope', 'DeviceService','$state','$uibModal', 'location','$uibModalInstance','$stateParams', function ($scope, DeviceService,$state,$uibModal, location, $uibModalInstance, $stateParams) {
    /*DeviceService.getLatestLocationFromDevice({_id:deviceId._id},function (success) {
        if(success.data.status){
            $scope.regNo= deviceId.regNo;
            $scope.latestLocation = success.data.data.attrs.latestLocation;
            console.log($scope.latestLocation);
        }else{
            $scope.regNo= deviceId.regNo;
            swal(
                '',
                success.data.messages[0],
                'error'
            );
        }
    },function (error) {

    });*/
    $scope.latestLocation =location;
    $scope.regNo=location.registrationNo;
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

}]);


app.controller('DeviceEditCrtl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', '$stateParams', '$filter', '$state', 'SettingServices', 'AccountService', function ($scope, DeviceService, Notification, NgTableParams, $stateParams, $filter, $state, SettingServices, AccountService) {

    $scope.status = {
        isOpen: true,
        isOpenOne: true
    };

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
        isDamaged: undefined,
        isActive: undefined,
        rcNumber: '',
        insuranceAmount: '',
        npAvailable: '',
        npExpiry: '',
        error: '',
        registrationNo: ""
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
                // if($scope.deviceDetails.isDamaged === '1') {
                //     $scope.deviceDetails.isDamaged = true;
                // } else {
                //     $scope.deviceDetails.isDamaged = false;
                // }
                $scope.GPSPlanDEtails.accountId = $scope.deviceDetails.accountId;
                $scope.getTrucksOfAccount();
            }
        });
    }

    getDevice();

    function getGPSPlansOfDevice() {
        DeviceService.getGPSPlansOfDevice($stateParams.device, function (success) {
            if (success.data.status) {
                $scope.GPSPlans = success.data.GPSPlans;
            }
        });
    }

    /*   function getAccounts() {
           DeviceService.getAllAccountsForDropdown(function (success) {
               if (success.data.status) {
                   $scope.accounts = success.data.accounts;


               }
           });
       }

       getAccounts();*/


    $scope.loadMore = function () {
        $scope.currentElement = $scope.currentElement + 10;
        DeviceService.getAllAccountsForDropdown({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.accounts = $scope.accounts.concat(success.data.accounts);
            } else {
                $scope.accounts = [];
            }

        }, function (error) {

        });
    };

    function getAccounts() {
        $scope.searchAccountOwner = function (search) {
            $scope.currentElement = 0;
            $scope.search = search;
            DeviceService.getAllAccountsForDropdown({
                name: $scope.search,
                size: $scope.currentElement
            }, function (success) {
                if (success.data.status) {
                    $scope.accounts = success.data.accounts;
                } else {
                    $scope.accounts = [];
                }

            }, function (error) {

            });
        };
    }

    getAccounts();

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
                /* $scope.employees.sort(function(a, b){
                     if(a.displayName < b.displayName) return -1;
                     if(a.displayName > b.displayName) return 1;
                     return 0;
                 })*/
            }
        });
    }

    getEmployees();

    $scope.getTrucksOfAccount = function () {
        DeviceService.getAllTrucksOfAccount($scope.deviceDetails.accountId._id, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
            }
        });
    };

    $scope.getSelectedTruckDetails = function () {
        if ($scope.deviceDetails.truckId) {
            var truck = _.find($scope.trucks, function (truck) {
                return truck._id === $scope.deviceDetails.truckId;
            });
            $scope.deviceDetails.truckId = truck._id;
            $scope.deviceDetails.registrationNo = truck.registrationNo;
            $scope.deviceDetails.truck = {};
            $scope.deviceDetails.truck.insuranceExpiry = $filter("date")(truck.fitnessExpiry, 'dd-MM-yyyy');
            $scope.deviceDetails.truck.fitnessExpiry = $filter("date")(truck.fitnessExpiry, 'dd-MM-yyyy');
        }
    };

    $scope.updateDevice = function () {
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

    function getPlans() {
        SettingServices.getAllPlans('gps', function (success) {
            if (success.data.status) {
                $scope.plans = success.data.plans;
            }
        });
    }

    getPlans();

    function initPlan() {
        $scope.GPSPlanDEtails = {
            accountId: '',
            deviceId: $stateParams.device,
            planId: '',
            amount: '',
            remark: '',
            startTime: '',
            expiryTime: '',
            errors: []
        }
    }

    initPlan();
    $scope.assignGPSPlan = function () {
        var params = $scope.GPSPlanDEtails;
        params.errors = [];
        if (!params.planId) {
            params.errors.push('Select a plan');
        }
        if (!params.startTime) {
            params.errors.push('Select start date');
        }
        if (!params.expiryTime) {
            params.errors.push('Select expiry date');
        }
        if (params.expiryTime < params.startTime) {
            params.errors.push('expiry date should be greater than start date');
        }
        if (!params.amount) {
            params.errors.push('select an amount');
        }
        if (params.errors.length < 1) {
            AccountService.assignPlan({planDetails: $scope.GPSPlanDEtails, type: 'gps'}, function (success) {
                if (success.data.status) {
                    initPlan();
                    // getAccountDetails();
                    Notification.success({message: "Successfully updated"});
                }
            });
        }
    };
    $scope.showGpsForm = false;

    function getDevicePlanHistory() {
        DeviceService.getDevicePlanHistory($stateParams.device, function (success) {
            if (success.data.status) {
                $scope.devicePlanHistory = success.data.devicePlanHistory;
                $scope.showGpsForm = success.data.showGpsForm;
            } else {
                Notification.error({message: "unable to get plan history"})
            }
        });
    }

    getDevicePlanHistory();
}]);

app.controller('addAndAssignDevicesCrtl', ['$scope', 'DeviceService', 'Notification', '$state', function ($scope, DeviceService, Notification, $state) {

    $scope.devicesToAdd = [];
    for (var i = 0; i < 30; i++) {
        $scope.devicesToAdd.push({
            imei: '',
            simPhoneNumber: '',
            simNumber: '',
            status:'Working'
        })
    }

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
            }
        });
    }

    $scope.addImeiNumbers = function (index, imeiNos) {
        if (index === 0) {
            var imeiNumbers = imeiNos.split(' ');
            for (var i = 0; i < imeiNumbers.length; i++) {
                $scope.devicesToAdd[i].imei = imeiNumbers[i];
            }

        }
    };
    $scope.addPhoneNumbers = function (index, phomeNos) {
        if (index === 0) {
            var phoneNumbers = phomeNos.split(' ');
            for (var i = 0; i < phoneNumbers.length; i++) {
                $scope.devicesToAdd[i].simPhoneNumber = phoneNumbers[i];
            }

        }
    };
    $scope.addSimIds = function (index, simIds) {
        if (index === 0) {
            var simNums = simIds.split(' ');
            for (var i = 0; i < simNums.length; i++) {
                $scope.devicesToAdd[i].simNumber = simNums[i];
            }

        }
    };

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
        for (var i = 0; i < params.length; i++) {
            if (!params[i].imei && !params[i].simPhoneNumber && !params[i].simNumber) {
                // console.log("$scope.assignedTo", i,params.length)

                params.splice(i, 1);
                if (i !== 0) {
                    i = i - 1;

                }

            } else {
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

        }
        if (!params[params.length - 1].imei || !params[params.length - 1].simPhoneNumber || !params[params.length - 1].simNumber) {
            $scope.errors.push('please fill all the details');
        } else if (!$scope.assignedTo) {
            $scope.errors.push('please select an employeee');
        } else {
            $scope.errors = '';
            DeviceService.addDevices({devices: params, assignedTo: $scope.assignedTo}, function (success) {
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

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    function getEmployees() {
        DeviceService.getEmployees(function (success) {
            if (success.data.status) {
                $scope.employees = success.data.employees;
            }
        });
    }

    getEmployees();
    $scope.getAllDevices = function () {
        DeviceService.getAllDevices(function (success) {
            if (success.data.status) {
                $scope.allDevices = success.data.devices;
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
        if (!$scope.selectedDevices) {
            $scope.error = 'please select devices';
        } else if (!$scope.assignedTo) {
            $scope.error = 'please select an employeee';
        } else {
            $scope.error = '';
            DeviceService.transferDevices({
                devices: $scope.selectedDevices,
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

app.controller('deviceManagementCrtl', ['$scope', 'DeviceService', 'NgTableParams', 'Notification', '$stateParams', function ($scope, DeviceService, NgTableParams, Notification, $stateParams) {
    $scope.searchString = '';
    $scope.sortableString = '';
    $scope.count = 0;
    $scope.getCount = function () {
        DeviceService.getDeviceManagementCount(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    $scope.init = function () {
        $scope.deviceManagementParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [10, 20, 50],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            searchString: $scope.searchString,
            sortableString: $scope.sortableString
        };
        DeviceService.getDeviceManagementDetails(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.dmDetails;
                $scope.currentPageOfDeviceDetails = response.data.dmDetails;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.getAssignedDevices = function () {
        $scope.Name = $stateParams.Name;
        DeviceService.getGpsDevicesCountByStatus({
            type: $stateParams.type,
            accountId: $stateParams.accountId
        }, function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initDevices();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    $scope.initDevices = function () {
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
                devicesloadTableData(params);
            }
        });
    };

    var devicesloadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            type: $stateParams.type,
            accountId: $stateParams.accountId
        };
        DeviceService.getGpsDevicesByStatus(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfDeviceDetails = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };


}]);

app.controller('paymentCrtl', ['$scope', 'DeviceService', 'Notification', 'NgTableParams', 'AccountService', function ($scope, DeviceService, Notification, NgTableParams, AccountService) {
    $scope.searchString = '';
    $scope.count = 0;
    $scope.type = 'accounts';
    $scope.getCount = function () {
        AccountService.count('accounts', function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();
    $scope.init = function () {
        $scope.accountParams = new NgTableParams({
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
    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            type: $scope.type,
            searchString: $scope.searchString,
        };
        AccountService.getAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.accounts;
                $scope.currentPageOfAccounts = response.data.accounts;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
}]);

app.controller('paymentListCrtl', ['$scope', 'DeviceService', 'Notification', '$stateParams', function ($scope, DeviceService, Notification, $stateParams) {

    function getPaymentDetails() {
        DeviceService.getPaymentDetails($stateParams.id, function (success) {
            if (success.data.status) {
                $scope.paymentDetails = success.data.paymentDetails;
            } else {
                Notification.error({message: success.data.messages[0]});
            }
        });
    }

    getPaymentDetails();
}]);