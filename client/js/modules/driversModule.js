app.factory('DriverService',['$http', function ($http) {
    return {
        addDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers',
                method: "POST",
                data: driverInfo
            }).then(success, error)
        },
        getAllDrivers: function (success, error) {
            $http({
                url: '/v1/drivers/account/drivers',
                method: "GET"
            }).then(success, error)
        },
        getDrivers: function (pageable, success, error) {
            $http({
                url: '/v1/drivers/account/drivers',
                method: "GET",
                params:pageable
            }).then(success, error)
        },
        getDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/get/' + driverId,
                method: "GET"
            }).then(success, error)
        },
        updateDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers/',
                method: "PUT",
                data: driverInfo
            }).then(success, error)
        },
        deleteDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/' + driverId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/drivers/total/count',
                method: "GET"
            }).then(success, error)
        },getAllDriversForFilter: function (success, error) {
            $http({
                url: '/v1/drivers/getAllDriversForFilter',
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('DriversListCtrl', ['$scope', '$state', 'DriverService', 'Notification','paginationService','NgTableParams',
    function ($scope, $state, DriverService, Notification, paginationService, NgTableParams) {

        $scope.goToEditDriverPage = function (driverId) {
            $state.go('driversEdit', {driverId: driverId});
        };

        $scope.count = 0;
        $scope.getCount = function () {
            DriverService.count(function (success) {
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

            var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),driverName:tableParams.driverName};
            $scope.loading = true;
            // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
            DriverService.getDrivers(pageable, function (response) {
                $scope.invalidCount = 0;
                if (angular.isArray(response.data.drivers)) {
                    $scope.loading = false;
                    $scope.drivers = response.data.drivers;
                    $scope.userId=response.data.userId;
                    $scope.userType=response.data.userType;
                    tableParams.total(response.totalElements);
                    tableParams.data = $scope.drivers;
                    $scope.currentPageOfDrivers = $scope.drivers;
                   // console.log('<<>>===', $scope.drivers);
                }
            });
        };
    $scope.getAllDrivers=function(){
        DriverService.getAllDriversForFilter(function (success) {
            if (success.data.status) {
                $scope.driversList = success.data.drivers;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }
    $scope.init = function () {
        $scope.driverParams = new NgTableParams({
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
                $scope.getAllDrivers();
            }
        });
    };

    $scope.deleteDriver = function (driverId) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E83B13',
            cancelButtonColor: '#9d9d9d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                DriverService.deleteDriver(driverId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Driver deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Error!',
                                message,
                                'error'
                            );
                        });
                    }
                });
            };
        });
    }

    $scope.searchByDriverName=function(driverName){
        $scope.driverParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.driverName=driverName;
                loadTableData(params);
            }
        });
    }

    // $scope.getDrivers();
}]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'TrucksService', 'DriverService', 'Notification', 'Utils', '$stateParams', function ($scope, $state, TrucksService, DriverService, Notification, Utils, $stateParams) {
    $scope.pagetitle = "Add Driver";

    $scope.trucks = [];
    $scope.driver = {
        fullName: '',
        truckId: '',
        accountId: '',
        mobile: '',
        joiningDate: '',
        licenseValidity: '',
        salary: '',
        licenseNumber: '',
        errors: [],
        isActive: true
    };

    $scope.pageTitle = "Add Driver";
    if ($stateParams.driverId) {
        $scope.pageTitle = "Update Driver";
        DriverService.getDriver($stateParams.driverId, function (success) {
            if (success.data.status) {
                $scope.driver = success.data.driver;
                $scope.driver.licenseValidity = new Date($scope.driver.licenseValidity);
                getTruckIds();
                //console.log('driver',$scope.driver);

            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message)
                });
            }
        }, function (err) {
        })
    } else{
        getTruckIds();
    }

    function getTruckIds() {
     // TrucksService.getAllAccountTrucks(1, function (success) {
        TrucksService.getAllTrucks(1, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find( $scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.driver.truckId;
                });
                if(selectedTruck){
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(success.data.message);
                });
            }
        }, function (error) {
            Notification.error(error);
        });
    }



    $scope.cancel = function () {
        $state.go('drivers');
    };
    $scope.selectTruckId = function (truck) {
        $scope.driver.truckId = truck._id;
    }
    $scope.addOrSaveDriver = function () {
        var params = $scope.driver;
        console.log("params",params);
        params.errors = [];

        if (!params.fullName) {

            params.errors.push('Please provide driver\'s full name')
        }
        if (!Utils.isValidPhoneNumber(params.mobile)) {
            params.errors.push('Please provide valid mobile number');
        }

       /* if (!params.licenseValidity) {
            params.errors.push('Please provide license validity date');
        }

        if (!params.salary) {
            params.errors.push('Please provide  salary');
        }

        if (!params.licenseNumber) {
            params.errors.push('Please provide  licenseNumber');
        }*/
        if (params.errors.length>0) {
            /*params.errors.forEach(function (message) {
                Notification.error(message)
            });*/
        }else{
            if (params._id) {
                DriverService.updateDriver(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: "Driver Updated Successfully"});
                        $state.go('drivers');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message)
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            } else {
                DriverService.addDriver(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: "Driver Added Successfully"});
                        $state.go('drivers');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message)
                        });
                    }
                }, function (error) {

                });
            }
        }
    }
}]);