app.factory('SettingServices', ['$http', function ($http)   {
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
        getAllPlans: function (type, success, error) {
            $http({
                url: '/v1/cpanel/settings/getAllPlans/'+type,
                method: "GET"
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
                params: {_id: planId}
            }).then(success, error)
        },
        planCount: function (plan, success, error) {
            $http({
                url: '/v1/cpanel/settings/planCount',
                method: "GET",
                params: {plan: plan}
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
                params: {_id: truckId}
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
                params: {_id: planId}
            }).then(success, error)
        },
        totalTruckTypes: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/totalTruckTypes',
                method: "GET",
            }).then(success, error)
        },
        addLoadType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/addLoadType',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getLoadTypes: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/getLoadTypes',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getLoadTypeDetails: function (truckId, success, error) {
            $http({
                url: '/v1/cpanel/settings/getLoadTypeDetails',
                method: "GET",
                params: {_id: truckId}
            }).then(success, error)
        },
        updateLoadType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/updateLoadType',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteLoadType: function (loadId, success, error) {
            $http({
                url: '/v1/cpanel/settings/deleteLoadType',
                method: "DELETE",
                params: {_id: loadId}
            }).then(success, error)
        },
        totalLoadsTypes: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/totalLoadsTypes',
                method: "GET",
            }).then(success, error)
        },
        addGoodsType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/addGoodsType',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getGoodsTypes: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/getGoodsTypes',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getGoodsTypeDetails: function (truckId, success, error) {
            $http({
                url: '/v1/cpanel/settings/getGoodsTypeDetails',
                method: "GET",
                params: {_id: truckId}
            }).then(success, error)
        },
        updateGoodsType: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/updateGoodsType',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteGoodsType: function (goodsId, success, error) {
            $http({
                url: '/v1/cpanel/settings/deleteGoodsType',
                method: "DELETE",
                params: {_id: goodsId}
            }).then(success, error)
        },
        totalGoodsTypes: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/totalGoodsTypes',
                method: "GET",
            }).then(success, error)
        },
        addOrderStatus: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/addOrderStatus',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getOrderStatus: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/getOrderStatus',
                method: "GET",
                params: params
            }).then(success, error)
        },
        totalOrderStatus: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/totalOrderStatus',
                method: "GET",
            }).then(success, error)
        },
        getOrderStatusDetails: function (orderId, success, error) {
            $http({
                url: '/v1/cpanel/settings/getOrderStatusDetails',
                method: "GET",
                params: {_id: orderId}
            }).then(success, error)
        },
        updateOrderStatus: function (params, success, error) {
            $http({
                url: '/v1/cpanel/settings/updateOrderStatus',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteOrderStatus: function (orderId, success, error) {
            $http({
                url: '/v1/cpanel/settings/deleteOrderStatus',
                method: "DELETE",
                params: {_id: orderId}
            }).then(success, error)
        },

    }
}]);


app.controller('settingsCtrl', ['$scope', '$uibModal', 'SettingServices', 'NgTableParams', 'Notification', function ($scope, $uibModal, SettingServices, NgTableParams, Notification) {

// Check All

    $scope.checkAll=function () {
        $scope.currentPageOfgpsPlans.forEach(function (plan) {
            if($scope.checkAllStatus){

                plan.checkStatus=true;

            }else{
                plan.checkStatus=false;

            }
        })
    };

// GPS and ERP Renewal Plans(Gettings Plans, pagenation, Sorting, Deleting)

    $scope.saveRenewalPlan = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPSandERP.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getErpPlanCount(data.plan);
        }, function () {
        });
    };
    $scope.editPlanPopup = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPSandERP.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {data: id}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getErpPlanCount(data.plan);
        }, function () {
        });
    };
    $scope.count = 0;
    $scope.getGpsPlanCount = function (plan) {
        SettingServices.planCount(plan, function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initGPSPlan(plan);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.getErpPlanCount = function (plan) {
        SettingServices.planCount(plan, function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initGPSPlan(plan);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadGPSTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            plan: tableParams.plan,
            status: tableParams.status,
            planName: tableParams.planName
        };
        SettingServices.getPlan(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);

                tableParams.data = response.data.data;
                $scope.currentPageOfgpsPlans = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.initGPSPlan = function (plan) {
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
                params.plan = plan;
                loadGPSTableData(params);
            }
        });
    };
    $scope.delGpsPlan = function (planId, plan) {
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
                SettingServices.deletePlan(planId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getGpsPlanCount(plan);
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

    $scope.searchByPlan = function (plan, status, planName) {
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
                params.plan = plan;
                params.status = status;
                params.planName = planName;
                loadGPSTableData(params);
            }
        });
    };


// Trcusk Types (Gettings Truck Types, pagenation, Sorting, Deleting)

    $scope.saveTruckType = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewTruckType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getTruckTypeCount();
        }, function () {
        });
    };
    $scope.editTruckType = function (truckId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewTruckType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {data: truckId}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getTruckTypeCount();
        }, function () {
        });
    };
    $scope.getTruckTypeCount = function () {
        SettingServices.totalTruckTypes(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initTruckType();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadTruckTypeTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            trucksType: tableParams.trucksType
        };
        SettingServices.getTruckTypes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOftruckTypes = response.data.data;
            } else {
                $scope.currentPageOftruckTypes = response.data.data;
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
    $scope.delTruckType = function (truckId) {
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
                SettingServices.deleteTruckType(truckId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getTruckTypeCount();
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

    $scope.searchByTrucksType = function (status, trucksType) {
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
                params.status = status;
                params.trucksType = trucksType;
                loadTruckTypeTableData(params);
            }
        });
    };

// Load Types (Gettings Load types, pagenation, Sorting, Deleting)

    $scope.saveLoadType = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewLoadType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getLoadTypeCount();
        }, function () {
        });
    };
    $scope.editLoadType = function (truckId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewLoadType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {data: truckId}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getLoadTypeCount();
        }, function () {
        });
    };
    $scope.getLoadTypeCount = function () {
        SettingServices.totalLoadsTypes(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initLoadType();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var loadTypeTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            loadsType: tableParams.loadsType
        };
        SettingServices.getLoadTypes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfLoadTypes = response.data.data;
            } else {
                $scope.currentPageOfLoadTypes = response.data.data;
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.initLoadType = function () {
        $scope.loadTypeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTypeTableData(params);
            }
        });
    };
    $scope.delLoadType = function (loadId) {
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
                SettingServices.deleteLoadType(loadId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getLoadTypeCount();
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

    $scope.searchByLoadsType = function (status, loadsType) {
        $scope.loadTypeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.status = status;
                params.loadsType = loadsType;
                loadTypeTableData(params);
            }
        });
    };

// Goods Types (Gettings goods types, pagenation, Sorting, Deleting)

    $scope.saveGoodsType = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGoodsType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getGoodsTypeCount();
        }, function () {
        });
    };
    $scope.editGoodsType = function (truckId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGoodsType.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {data: truckId}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getGoodsTypeCount();
        }, function () {
        });
    };
    $scope.getGoodsTypeCount = function () {
        SettingServices.totalGoodsTypes(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initGoodsType();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var goodsTypeTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            goodsType: tableParams.goodsType
        };
        SettingServices.getGoodsTypes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfGoodsTypes = response.data.data;
            } else {
                $scope.currentPageOfGoodsTypes = response.data.data;
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.initGoodsType = function () {
        $scope.goodsTypeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                goodsTypeTableData(params);
            }
        });
    };
    $scope.delGoodsType = function (goodsId) {
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
                SettingServices.deleteGoodsType(goodsId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getGoodsTypeCount();
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

    $scope.searchByGoodsType = function (status, goodsType) {
        $scope.goodsTypeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.status = status;
                params.goodsType = goodsType;
                goodsTypeTableData(params);
            }
        });
    };

// Order Status (Getting order status, pagenation, Sorting, Deleting)

    $scope.saveOrderStatus = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewOrderStatus.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getOrderStatusCount();
        }, function () {
        });
    };
    $scope.editOrderStatus = function (truckId) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewOrderStatus.html',
            controller: 'settingsModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {data: truckId}
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.getOrderStatusCount();
        }, function () {
        });
    };
    $scope.getOrderStatusCount = function () {
        SettingServices.totalOrderStatus(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initOrderStatus();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    var orderStatusTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            orderStatus: tableParams.orderStatus
        };
        SettingServices.getOrderStatus(pageable, function (success) {
            $scope.invalidCount = 0;
            if (success.data.status) {
                tableParams.total(success.data.count);
                tableParams.data = success.data.data;
                $scope.currentPageOfOrderStatus = success.data.data;
                console.log("$scope.currentPageOfOrderStatus", $scope.currentPageOfOrderStatus);
            } else {
                $scope.currentPageOfOrderStatus = success.data.data;
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };
    $scope.initOrderStatus = function () {
        $scope.orderStatusParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                orderStatusTableData(params);
            }
        });
    };
    $scope.delOrderStatus = function (goodsId) {
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
                SettingServices.deleteOrderStatus(goodsId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.getOrderStatusCount();
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

    $scope.searchByOrderStatus = function (status, orderStatus) {
        $scope.orderStatusParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.status = status;
                params.orderStatus = orderStatus;
                orderStatusTableData(params);
            }
        });
    };

}]);


app.controller('settingsModalCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'SettingServices', 'modelData', function ($scope, $state, $uibModalInstance, Notification, SettingServices, modelData) {

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

// GPS and ERP Renewal Plan Adding or Updating
    $scope.pageTitle = "New Renewal Plans";

    function gpsAddFunc() {
        $scope.addRenewalPlan = {
            planName: '',
            amount: '',
            durationInMonths: '',
            plan: '',
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initGPSandERPPlan = function () {
        if (modelData.data) {
            $scope.pageTitle = "Edit Renewal Plans";
            SettingServices.getPlanDetails(modelData.data, function (success) {
                if (success.data.status) {
                    $scope.addRenewalPlan = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });``
                }
            }, function (error) {

            })
        } else {
            gpsAddFunc();
        }
    };
    $scope.addGPSPlan = function (plan) {
        $scope.addRenewalPlan.plan = plan;
        var params = $scope.addRenewalPlan;
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
                        $uibModalInstance.close({plan: params.plan});
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
                        $uibModalInstance.close({plan: params.plan})
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
    $scope.truckTitle = "New Truck Type";
    function truckTypeAddFun() {
        $scope.truckType = {
            title: '',
            tonnes: '',
            mileage: '',
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initTruckType = function () {
        if (modelData.data) {
            $scope.truckTitle = "Edit Truck Type";
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
        if (params.status === undefined) {
            params.errorMessage.push('Please select status');
        }
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
                        $uibModalInstance.close({status: true, message: success.data.message});
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
                        $uibModalInstance.close({status: true, message: success.data.message});
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

// Load Types adding and Updating
    $scope.loadTitle = "New Load Type";
    function loadTypeAddFun() {
        $scope.loadType = {
            title: '',
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initLoadType = function () {
        if (modelData.data) {
            $scope.loadTitle = "Edit Load Type";
            SettingServices.getLoadTypeDetails(modelData.data, function (success) {
                if (success.data.status) {
                    $scope.loadType = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            loadTypeAddFun();
        }
    };
    $scope.addorUpdateLoadType = function () {
        var params = $scope.loadType;
        params.errorMessage = [];
        if (!params.title) {
            params.errorMessage.push('Enter your Title');
        }
        if (params.status === undefined) {
            params.errorMessage.push('Please select status');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
            loadTypeAddFun();
        } else {
            if (params._id) {
                SettingServices.updateLoadType(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages);
                        $uibModalInstance.close({status: true, message: success.data.message});
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
            else {
                SettingServices.addLoadType(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({ status: true, message: success.data.message });
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

// Goods Types adding and Updating
    $scope.goodsTitle = "New Goods Type";
    function goodsTypeAddFun() {
        $scope.goodsType = {
            title: '',
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initGoodsType = function () {
        if (modelData.data) {
            $scope.goodsTitle = "Edit Goods Type";
            SettingServices.getGoodsTypeDetails(modelData.data, function (success) {
                if (success.data.status) {
                    $scope.goodsType = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            goodsTypeAddFun();
        }
    };
    $scope.addorUpdateGoodsType = function () {
        var params = $scope.goodsType;
        params.errorMessage = [];
        if (!params.title) {
            params.errorMessage.push('Enter your Title');
        }
        if (params.status === undefined) {
            params.errorMessage.push('Please select status');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
            loadTypeAddFun();
        } else {
            if (params._id) {
                SettingServices.updateGoodsType(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages);
                        $uibModalInstance.close({ status: true, message: success.data.message });
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
            else {
                SettingServices.addGoodsType(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({ status: true, message: success.data.message });
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

// Order Status adding and Updating
    $scope.orderTitle = "New Order Status";
    function orderStatusAddFun() {
        $scope.orderStatus = {
            title: '',
            releaseTruck:undefined,
            status: undefined,
            errorMessage: []
        };
    }
    $scope.initOrderStatus = function () {
        if (modelData.data) {
            $scope.orderTitle = "Edit Order Status";
            SettingServices.getOrderStatusDetails(modelData.data, function (success) {
                if (success.data.status) {
                    $scope.orderStatus = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            goodsTypeAddFun();
        }
    };
    $scope.addorUpdateOrderStatus = function () {
        var params = $scope.orderStatus;
        params.errorMessage = [];
        if (!params.title) {
            params.errorMessage.push('Enter your Title');
        }
        if (params.status === undefined) {
            params.errorMessage.push('Please select Release Truck');
        }
        if (params.status === undefined) {
            params.errorMessage.push('Please select status');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
            loadTypeAddFun();
        } else {
            if (params._id) {
                SettingServices.updateOrderStatus(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                       $uibModalInstance.close({ status: true, message: success.data.message });
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                })
            }
            else {
                SettingServices.addOrderStatus(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $uibModalInstance.close({ status: true, message: success.data.message });
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

