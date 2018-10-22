app.factory('DriverService', ['$http', function ($http) {
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
                params: pageable
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
        }, getAllDriversForFilter: function (success, error) {
            $http({
                url: '/v1/drivers/getAllDriversForFilter',
                method: "GET",
            }).then(success, error)
        },
        shareDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/drivers/shareDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error)
        },
        deleteImage: function (params, success, error) {
            $http({
                url: '/v1/drivers/deleteImage',
                method: "DELETE",
                params: params
            }).then(success, error)
        },
        getAllDriversAttendance: function (date, success, error) {
            $http({
                url: '/v1/drivers/getAllDriversAttendance/' + date,
                method: "GET",
            }).then(success, error)
        },
        updateDriverSheet: function (params, success, error) {
            $http({
                url: '/v1/drivers/updateDriverSheet',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        showDriversReport: function (driverId, fromDate, toDate, success, error) {
            $http({
                url: '/v1/drivers/getDriversDataByDateRange/' + driverId + '/' + fromDate + '/' + toDate,
                method: 'GET',
            }).then(success, error)
        }

    }
}]);

app.controller('DriversListCtrl', ['$scope', '$state', 'DriverService', 'Notification', 'paginationService', 'NgTableParams',
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

            var pageable = {
                page: tableParams.page(),
                size: tableParams.count(),
                sort: tableParams.sorting(),
                driverName: tableParams.driverName
            };
            $scope.loading = true;
            // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
            DriverService.getDrivers(pageable, function (response) {
                $scope.invalidCount = 0;
                if (angular.isArray(response.data.drivers)) {
                    $scope.loading = false;
                    $scope.drivers = response.data.drivers;
                    $scope.userId = response.data.userId;
                    $scope.userType = response.data.userType;
                    tableParams.total(response.totalElements);
                    tableParams.data = $scope.drivers;
                    $scope.currentPageOfDrivers = $scope.drivers;
                    // console.log('<<>>===', $scope.drivers);
                }
            });
        };
        $scope.getAllDrivers = function () {
            DriverService.getAllDriversForFilter(function (success) {
                if (success.data.status) {
                    $scope.driversList = success.data.drivers;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
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
                }
                ;
            });
        }

        $scope.searchByDriverName = function (driverName) {
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
                    params.driverName = driverName;
                    loadTableData(params);
                }
            });
        }
        $scope.shareDetailsViaEmail = function () {
            swal({
                title: 'Share drivers data using mail',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        DriverService.shareDetailsViaEmail({
                            email: email
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {

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
                        html: ' sent successfully'
                    })
                }
            })
        };
        $scope.downloadDetails = function () {
            window.open('/v1/drivers/downloadDetails');
        };

    }]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'TrucksService', 'DriverService', 'Notification', 'Utils', '$stateParams', 'TripServices', '$uibModal', function ($scope, $state, TrucksService, DriverService, Notification, Utils, $stateParams, TripServices, $uibModal) {
    $scope.pagetitle = "Add Driver";

    $scope.mobile = /^\+?\d{10}$/;

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
                if ($scope.driver.licenseValidity !== undefined) {
                    $scope.driver.licenseValidity = new Date($scope.driver.licenseValidity);
                }
                getTruckIds();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message)
                });
            }
        }, function (err) {
        })
    } else {
        getTruckIds();
    }

    function getTruckIds() {
        TrucksService.getAllTrucksForFilter(function (success) {
            //TrucksService.getAllTrucks(1, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.driver.truckId;
                });
                if (selectedTruck) {
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
    };
    $scope.addOrSaveDriver = function () {
        var params = $scope.driver;
        console.log("params", params);
        params.errors = [];

        if (!params.fullName) {

            params.errors.push('Please provide driver\'s full name')
        }
        /*if (!Utils.isValidPhoneNumber(params.mobile)) {
            params.errors.push('Please provide valid mobile number');
        }*/

        /* if (!params.licenseValidity) {
             params.errors.push('Please provide license validity date');
         }

         if (!params.salary) {
             params.errors.push('Please provide  salary');
         }

         if (!params.licenseNumber) {
             params.errors.push('Please provide  licenseNumber');
         }*/
        if (params.errors.length > 0) {
            /*params.errors.forEach(function (message) {
                Notification.error(message)
            });*/
        } else {
            if (params._id) {
                if ($scope.driver.aadharAttachments.length > 0 || $scope.driver.licenseAttachments.length > 0) {
                    $scope.aadharAttachments.forEach(function (file) {
                        if (file.key) {
                            $scope.driver.aadharAttachments.push(file);
                        }
                    });
                    $scope.licenseAttachments.forEach(function (file) {
                        if (file.key) {
                            $scope.driver.licenseAttachments.push(file);
                        }
                    })
                } else {
                    $scope.driver.aadharAttachments = $scope.aadharAttachments;
                    $scope.driver.licenseAttachments = $scope.licenseAttachments;
                }
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
                $scope.driver.aadharAttachments = $scope.aadharAttachments;
                $scope.driver.licenseAttachments = $scope.licenseAttachments;
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
    $scope.viewAttachment = function (path) {
        TripServices.viewTripDocument({filePath: path}, function (success) {
            if (success.data.status) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'viewS3Image.html',
                    controller: 'ViewS3ImageCtrl',
                    size: 'sm',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        path: function () {
                            return success.data.data
                        }
                    }
                });
                modalInstance.result.then(function (path) {
                    if (path) {
                        path = path;
                    }
                }, function () {
                });


            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {

        })
    };
    $scope.deleteImage = function (type, key, index) {
        DriverService.deleteImage({Id: $scope.driver._id, key: key}, function (successCallback) {
            if (successCallback.data.status) {
                if (type === 'aadhar') {
                    $scope.driver.aadharAttachments.splice(index, 1);
                } else {
                    $scope.driver.licenseAttachments.splice(index, 1);
                }
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({message: message});
                });
            } else {
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };
}]);
app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {
    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

app.controller('DriverSheetCntrl', ['$scope', 'DriverService', '$state', 'Notification', function ($scope, DriverService, TripServices, $state, Notification) {

    $scope.validateTable = false;
    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.popup2 = {
        opened: false
    };

    $scope.nextDay = function () {
        var dt = $scope.dt;
        dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);
        $scope.dt.setTime(dt.getTime());
        $scope.dt = new Date($scope.dt);
        $scope.getAllDriversAttendance($scope.dt);
    };

    $scope.previousDay = function () {
        var dt = $scope.dt;
        dt.setTime(dt.getTime() - 24 * 60 * 60 * 1000);
        $scope.dt = new Date($scope.dt);
        $scope.getAllDriversAttendance($scope.dt);
    };

    $scope.getAllDriversAttendance = function (date) {
        if (date) {
            $scope.today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        } else {
            var today = new Date();
            $scope.today = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        }

        DriverService.getAllDriversAttendance($scope.today, function (success) {
            if (success.data.status) {
                $scope.driverSheets = success.data.data;
            }
        }, function (error) {

        })
    };


    $scope.saveAll = function () {
        var params = $scope.driverSheets;
        console.log("params", params);
        DriverService.updateDriverSheet(params, function (success) {
            if (success.data.status) {
                console.log("success");
            }
        })
    }

    $scope.getAllDriversAttendance();

    $scope.getAllDrivers = function () {
        DriverService.getAllDriversForFilter(function (success) {
            if (success.data.status) {
                $scope.driversList = success.data.drivers;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (error) {

        })
    }
    $scope.getAllDrivers();

    $scope.downloadDriverReport = function (driverId, fromDate, toDate) {

            window.open('/v1/drivers/downloadDriversData/' + driverId + '/' + fromDate + '/' + toDate);
    };

    $scope.showDriverReport = function (driverId, fromDate, toDate) {
        // $scope.errors = [];
        // if (!driverId) {
        //     $scope.errors.push('Please select driver');
        // }
        // if (!fromDate) {
        //     $scope.errors.push('Please select From Date')
        // }
        // if (!toDate) {
        //     $scope.errors.push('Please select To Date')
        // }
        // if ( $scope.errors.length > 0) {
        // } else {
            DriverService.showDriversReport(driverId, fromDate, toDate, function (success) {
                if (success.data.status) {
                    $scope.showDriverReport = success.data.data;
                    $scope.validateTable = true;
                } else {
                    success.data.messages.forEach(function (messages) {
                        Notification.error({message: messages});
                    });
                }
            })

    }
}]);