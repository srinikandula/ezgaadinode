app.factory('NotificationServices', ['$http', function ($http) {
    return {
        addGpsTruckNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/addGpsTruckNtfn',
                method: 'POST',
                data: params
            }).then(success, error)
        },
        getGpsTruckNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/getGpsTruckNtfn',
                method: 'GET',
                params: params
            }).then(success, error)
        },
        getGpsTruckNtfnDetails: function (id, success, error) {
            $http({
                url: '/v1/cpanel/notifications/getGpsTruckNtfnDetails',
                method: 'GET',
                params: {ntfnId: id}
            }).then(success, error)
        },
        updateGpsTruckNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/updateGpsTruckNtfn',
                method: 'PUT',
                data: params
            }).then(success, error)
        },
        deleteTruckNtfn: function (id, success, error) {
            $http({
                url: '/v1/cpanel/notifications/deleteTruckNtfn',
                method: 'DELETE',
                params: {_id: id}
            }).then(success, error)
        },
        countOfTruckNtfns: function (success, error) {
            $http({
                url: '/v1/cpanel/notifications/countOfTruckNtfns',
                method: "GET",
            }).then(success, error)
        },
        getNotifications: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/getNotifications',
                method: "GET",
                params: params
            }).then(success, error)
        },
        totalNumOfNotifications: function (success, error) {
            $http({
                url: '/v1/cpanel/notifications/totalNumOfNotifications',
                method: "GET",
            }).then(success, error)
        },
        addLoadNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/addLoadNtfn',
                method: 'POST',
                data: params
            }).then(success, error)
        },
        getLoadNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/getLoadNtfn',
                method: 'GET',
                params: params
            }).then(success, error)
        },
        countOfLoadNtfns: function (success, error) {
            $http({
                url: '/v1/cpanel/notifications/countOfLoadNtfns',
                method: "GET",
            }).then(success, error)
        },
        deleteLoadNtfn: function (id, success, error) {
            $http({
                url: '/v1/cpanel/notifications/deleteLoadNtfn',
                method: 'DELETE',
                params: {_id: id}
            }).then(success, error)
        },
        getLoadNtfnDetails: function (id, success, error) {
            $http({
                url: '/v1/cpanel/notifications/getLoadNtfnDetails',
                method: 'GET',
                params: {ntfnId: id}
            }).then(success, error)
        },
        updateLoadNtfn: function (params, success, error) {
            $http({
                url: '/v1/cpanel/notifications/updateLoadNtfn',
                method: 'PUT',
                data: params
            }).then(success, error)
        },

    }
}]);


app.controller('NotificationCntrl', ['$scope', '$uibModal', 'NotificationServices', 'NgTableParams', 'Notification', 'SettingServices', function ($scope, $uibModal, NotificationServices, NgTableParams, Notification, SettingServices) {

    /* Getting GPS Trcuk Notifications and Deleting */
    $scope.newGpsTruckNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsTruckNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modalData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.getTruckNtfnCount();
        }, function () {
        });
    };
    $scope.editGpsTruckNtfn = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsTruckNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modalData: function () {
                    return {data: id}
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.getTruckNtfnCount();
        }, function () {
        });
    };
    $scope.getTruckNtfnCount = function () {
        NotificationServices.countOfTruckNtfns(function (response) {
            if (response.data.status) {
                $scope.count = response.data.data;
                $scope.initTruckNtfns();
            } else {
                response.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var truckNtfnsTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
        };
        NotificationServices.getGpsTruckNtfn(pageable, function (success) {
            $scope.invalidCount = 0;
            if (success.data.status) {
                tableParams.total(success.data.count);
                tableParams.data = success.data.data;
                $scope.currentPageOfTruckNtfns = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.initTruckNtfns = function () {
        $scope.truckNtfnsparams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                truckNtfnsTableData(params);
            }
        });
    };
    $scope.delTruckNtfn = function (id) {
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
                NotificationServices.deleteTruckNtfn(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getTruckNtfnCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (err) {

                });
            }
        });
    };

    /* Getting Load Notifications and Deleting */
    $scope.newLoadNtfn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsLoadNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modalData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getLoadNtfnCount();
        }, function () {
        });
    };
    $scope.editLoadNtfn = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsLoadNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modalData: function () {
                    return {data:id}
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.getLoadNtfnCount();
        }, function () {
        });
    };
    $scope.getLoadNtfnCount = function () {
        NotificationServices.countOfLoadNtfns(function (response) {
            if (response.data.status) {
                $scope.count = response.data.data;
                $scope.initLoadNtfns();
            } else {
                response.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadNtfnsTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
        };
        NotificationServices.getLoadNtfn(pageable, function (success) {
            $scope.invalidCount = 0;
            if (success.data.status) {
                tableParams.total(success.data.count);
                tableParams.data = success.data.data;
                $scope.currentPageOfLoadNtfns = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.initLoadNtfns = function () {
        $scope.loadNtfnsparams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadNtfnsTableData(params);
            }
        });
    };
    $scope.delLoadNtfn = function (id) {
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
                NotificationServices.deleteLoadNtfn(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getLoadNtfnCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (err) {

                });
            }
        });
    };


    $scope.addAppNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addAppNtfcn.html',
            controller: 'addNtfnCtrl',
            backdrop: 'static',
            keyboard: false,
            resolve:{
                modalData: function () {
                    return{}
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.getAppNtfnCount();
        }, function () {
        });
    };
    // getting Email and SMS Notifications

    $scope.count = 0;

    $scope.getNotiCount = function () {
        NotificationServices.totalNumOfNotifications(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initNoti();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadNotiTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            //plan: tableParams.plan
        };
        NotificationServices.getNotifications(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfEmails = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.initNoti = function () {
        $scope.emailParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                //params.plan = plan;
                loadNotiTableData(params);
            }
        });
    };

}]);


app.controller('addNtfnCtrl', ['$scope', '$uibModalInstance', 'SettingServices', 'Notification', 'NotificationServices', 'modalData', function ($scope, $uibModalInstance, SettingServices, Notification, NotificationServices, modalData) {

    $scope.closeGPS = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.getTruckTypes = function () {
        SettingServices.getTruckTypes({}, function (response) {
            if (response.data.status) {
                $scope.getTruckTypes = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    }
    $scope.getGoodsTypes = function () {
        SettingServices.getGoodsTypes({}, function (response) {
            if (response.data.status) {
                $scope.getGoodsTypes = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    }


    /* ------------ Available Trucks Notification adding or Updating----Sravan -------------*/

    $scope.truckNtfnTitle = "Add GPS Truck Notification";

    $scope.addGpsTruckNtfn = {
        sourceCity: '',
        destinationCity: '',
        numOfTrucks: '',
        dateAvailable: '',
        truckType: '',
        price: '',
        sendToAll: undefined,
    }

    $scope.initGPSTruckNotification = function () {
        if (modalData.data) {
            $scope.truckNtfnTitle = "Edit GPS Truck Notification";
            NotificationServices.getGpsTruckNtfnDetails(modalData.data, function (success) {
                if (success.data.status) {
                    $scope.addGpsTruckNtfn = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                    ``
                }
            }, function (error) {

            })
        } else {
        }
    };

    $scope.addOrUpdateTruckNtfn = function () {
        var params = $scope.addGpsTruckNtfn;
        params.errors = [];
        if (!params.sourceCity) {
            params.errors.push("Invalid Source City");
        }
        if (!params.destinationCity) {
            params.errors.push("Invalid Destination City");
        }
        if (!params.numOfTrucks) {
            params.errors.push("Please select Number of Trucks");
        }
        if (!params.dateAvailable) {
            params.errors.push("Please select Available Dates");
        }
        if (!params.truckType) {
            params.errors.push("Please select Truck Type");
        }
        if (params.sendToAll === undefined) {
            params.errors.push("Select Send To All")
        }
        if (params.errors.length > 0) {
            params.errors.forEach(function (message) {
                Notification.error(message);
            });
        }
        else {
            if (params._id) {
                NotificationServices.updateGpsTruckNtfn(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            } else {
                NotificationServices.addGpsTruckNtfn(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
        }
    }

    /* ------------ Available Load Notification adding or Updating----Sravan -------------*/

    $scope.loadTitle = "Add Load Notification";

    $scope.loadNotification = {
        sourceCity: '',
        destinationCity: '',
        goodsType: '',
        truckType: '',
        dateAvailable: '',
        price: '',
        message: '',
        sendToAll: undefined,
    }

    $scope.initLoadNotification = function () {
        if (modalData.data) {
            $scope.loadTitle = "Edit Load Notification";
            NotificationServices.getLoadNtfnDetails(modalData.data, function (success) {
                if (success.data.status) {
                    $scope.loadNotification = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
        }
    };

    $scope.addOrUpdateLoadNtfn = function () {
        var params = $scope.loadNotification;
        params.errors = [];
        if (!params.sourceCity) {
            params.errors.push("Invalid Source City");
        }
        if (!params.destinationCity) {
            params.errors.push("Invalid Destination City");
        }
        if (!params.dateAvailable) {
            params.errors.push("Please select Available Dates");
        }
        if (!params.truckType) {
            params.errors.push("Please select Truck Type");
        }
        if (!params.goodsType) {
            params.errors.push("Please select Goods Type");
        }
        if (!params.price) {
            params.errors.push("Please enter Price");
        }
        if (params.sendToAll === undefined) {
            params.errors.push("Select Send To All")
        }
        if (params.errors.length > 0) {
            params.errors.forEach(function (message) {
                Notification.error(message);
            });
        }
        else {
            if (params._id) {
                NotificationServices.updateLoadNtfn(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            } else {
                NotificationServices.addLoadNtfn(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
        }
    }

}]);