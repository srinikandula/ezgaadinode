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
        getTruckTypes: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/getTruckTypes',
                method: "GET"
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
    $scope.saveGPSRenewalPlan = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html',
            controller: 'gpsPopup',
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
            controller: 'gpsPopup',
            size: 'md',
            resolve: {
                modelData: function () {
                    return {data: id}
                }
            }
        });
    };

    $scope.getPlanDetails = function () {
        $scope.settingParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            getData: function (tableParams) {
                var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
                SettingServices.getPlan(pageable, function (success) {
                    if (success.data.status) {
                        $scope.planData = success.data.data;
                        tableParams.data = $scope.planData;
                        tableParams.total(parseInt(success.data.count));
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                }, function (error) {

                });
            }

        });
        $scope.settingParams.reload();
    };

    $scope.delGpsPlan = function(planId) {
        console.log(planId);
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

app.controller('gpsPopup', ['$scope', '$state', '$uibModalInstance', 'Notification', 'SettingServices', 'modelData', function ($scope, $state, $uibModalInstance, Notification, SettingServices, modelData) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

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
                        gpsAddFunc();
                    } else {
                        alert(success.data.status);
                    }
                }, function (error) {

                })
            }

        }
    };




}]);

