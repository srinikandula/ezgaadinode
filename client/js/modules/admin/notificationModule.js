app.factory('NotificationServices', ['$http', function ($http) {
    return {
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
        }

    }
}]);


app.controller('NotificationCntrl', ['$scope', '$uibModal', 'NotificationServices', 'NgTableParams', 'Notification', 'SettingServices', function ($scope, $uibModal, NotificationServices, NgTableParams, Notification , SettingServices) {

    $scope.newGpsTruckNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsTruckNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false
        });
    };
    $scope.newGpsLoadNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsLoadNtfcn.html',
            controller: 'addNtfnCtrl',
            windowClass: 'window-custom',
            backdrop: 'static',
            keyboard: false

        });
    };
    $scope.addAppNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addAppNtfcn.html',
            controller: 'addNtfnCtrl',
            backdrop: 'static',
            keyboard: false

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


app.controller('addNtfnCtrl', ['$scope', '$uibModalInstance', 'SettingServices', function ($scope, $uibModalInstance, SettingServices) {

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
}]);