app.factory('SettingServices', ['$http', function ($http) {
    return {
        addPlan: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/addPlan',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getPlan: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/getPlan',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getPlanDetails: function (planId, success, error) {
            $http({
                url: '/v1/cpanel/settings/getPlanDetails',
                method: "GET",
                params: {gpsPlanId: planId}
            }).then(success, error)
        },
        updatePlan: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/updatePlan',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deletePlan: function (planId, success, error) {
            $http({
                url: '/v1/cpanel/settings/deletePlan',
                method: "DELETE",
                params: {_id:planId}
            }).then(success, error)
        },
        planCount: function ( success, error) {
            $http({
                url: '/v1/cpanel/settings/planCount',
                method: "GET",
            }).then(success, error)
        },
        addTruckType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/addTruckType',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getTruckTypes: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/getTruckTypes',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getTruckTypeDetails: function (truckId, success, error) {
            $http({
                url: '/v1/cpanel/settings/getTruckTypeDetails',
                method: "GET",
                params: {_id : truckId}
            }).then(success, error)
        },
        updateTruckType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/updateTruckType',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteTruckType: function (planId, success, error) {
            $http({
                url: '/v1/cpanel/settings/deleteTruckType',
                method: "DELETE",
                params: {_id:planId}
            }).then(success, error)
        },
        countTruckType: function ( success, error) {
            $http({
                url: '/v1/cpanel/settings/countTruckType',
                method: "GET",
            }).then(success, error)
        },
        getGoodsTypes:function (success, error) {
            $http({
                url: '/v1/cpanel/settings/getGoodsTypes',
                method: "GET"
            }).then(success, error)
        }
    }
}]);


app.controller('settingsCtrl', ['$scope', '$uibModal', 'SettingServices', 'NgTableParams', 'Notification', function ($scope, $uibModal, SettingServices, NgTableParams, Notification) {

   // GPS Renewal Plans(Gettings Plans, pagenation, Sorting, Deleting)

    $scope.saveGPSRenewalPlan = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
    };
    $scope.editPlanPopup = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            resolve: {
                modelData: function () {
                    return {data: id}
                }
            }
        });
    };
    $scope.count = 0;
    $scope.getGpsPlanCount = function () {
        SettingServices.planCount(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initGPSPlan();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.getGpsPlanCount();

    var loadGPSTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting()
        };
        SettingServices.getPlan(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfgpsPlans = response.data.data;
                console.log("currentPageOfgpsPlans", $scope.currentPageOfgpsPlans);
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initGPSPlan = function () {
        $scope.settingParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadGPSTableData(params);
            }
        });
    };
    $scope.delGpsPlan = function(planId) {
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
                SettingServices.deletePlan(planId, function(success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getGpsPlanCount();
                    } else {
                        success.data.messages.forEach(function(message) {
                            Notification.error(message);
                        });
                    }
                }, function(err) {

                });
            }
        });
    };

    // Trcusk Types (Gettings Truck Types, pagenation, Sorting, Deleting)

    $scope.saveTruckType = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewTruckType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
    };
    $scope.editTruckType = function (truckId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewTruckType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            resolve: {
                modelData: function () {
                    return {data: truckId}
                }
            }
        });
    };
    $scope.getTruckTypeCount = function () {
        SettingServices.countTruckType(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initTruckType();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.getTruckTypeCount();

    var loadTruckTypeTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting()
        };
        SettingServices.getTruckTypes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOftruckTypes = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initTruckType = function () {
        $scope.truckTypeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTruckTypeTableData(params);
            }
        });
    };


    $scope.delTruckType = function(truckId) {
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
                SettingServices.deleteTruckType(truckId, function(success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getTruckTypeCount();
                    } else {
                        success.data.messages.forEach(function(message) {
                            Notification.error(message);
                        });
                    }
                }, function(err) {

                });
            }
        });
    };
}]);

app.controller('settingsModalCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'SettingServices', 'modelData', function ($scope, $state, $uibModalInstance, Notification, SettingServices, modelData) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

// GPS Renewal Plan Adding or Updating

    function gpsAddFunc() {
        $scope.gpsAddPlan = {
            planName: '',
            amount: '',
            durationInMonths: '',
            type: 'gps',
            status: undefined,
            errorMessage: []
        };
    }

   $scope.initGPSPlan=function () {
       if (modelData.data) {
           SettingServices.getPlanDetails(modelData.data, function (success) {
               if (success.data.status) {
                   $scope.gpsAddPlan = success.data.data;
               } else {
                   success.data.messages.forEach(function (message) {
                       Notification.error(message);
                   });
               }
           }, function (error) {

           })
       } else {
           gpsAddFunc();
       }
   };

    $scope.addGPSPlan = function () {
        var params = $scope.gpsAddPlan;
        params.errorMessage = [];
        if (!params.planName) {
            params.errorMessage.push('Enter your Plan Name');
        }
        if (!params.amount) {
            params.errorMessage.push('Please enter your amount');
        }
        if (!params.durationInMonths) {
            params.errorMessage.push('Please enter duration');
        }
        if (params.status === undefined) {
            params.errorMessage.push('Please select status');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
            gpsAddFunc();
        } else {
            if (params._id) {
                SettingServices.updatePlan(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        gpsAddFunc();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
            else {
                SettingServices.addPlan(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $scope.cancel();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (error) {

                })
            }

        }
    };

// Truck Types adding and Updating

    function truckTypeAddFun() {
        $scope.truckType = {
            title: '',
            tonnes: '',
            mileage: '',
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initTruckType=function () {
        if (modelData.data) {
            SettingServices.getTruckTypeDetails(modelData.data, function (success) {
                if (success.data.status) {
                    $scope.truckType = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            truckTypeAddFun();
        }
    };


    $scope.addorUpdateTruckType = function () {
        var params = $scope.truckType;
        params.errorMessage = [];
        if (!params.title) {
            params.errorMessage.push('Enter your Title');
        }
        if (!params.tonnes) {
            params.errorMessage.push('Please enter Truck Tonnage');
        }
        if (!params.mileage) {
            params.errorMessage.push('Please enter Vehicle Mileage');
        }
        // if (params.status === undefined) {
        //     params.errorMessage.push('Please select status');
        // }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
            truckTypeAddFun();
        } else {
            if (params._id) {
                SettingServices.updateTruckType(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        truckTypeAddFun();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
            else {
                SettingServices.addTruckType(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $scope.cancel();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (error) {

                })
            }

        }
    };


}]);

