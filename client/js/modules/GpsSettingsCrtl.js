app.factory('GpsSettingsService',['$http', function ($http) {
    return {
        addSecret: function (object, success, error) {
            $http({
                url: '/v1/gps/addSecret',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getAllSecrets: function (success, error) {
            $http({
                url: '/v1/gps/getAllSecrets',
                method: "GET"
            }).then(success, error)
        },
        getGpsSettings: function (success, error) {
            $http({
                url: '/v1/gps/getGpsSettings',
                method: "GET"
            }).then(success, error)
        },
        updateGpsSettings:function (body,success,error) {
            $http({
                url: '/v1/gps/updateGpsSettings',
                method: "POST",
                data:body
            }).then(success, error)
        }
    }
}]);

app.controller('GpsSettingsCrtl', ['$scope', 'GpsSettingsService', 'Notification', '$state', function ($scope, GpsSettingsService, Notification, $state) {
    $scope.secretkey = '';


    $scope.addSecret = function () {
        if(!$scope.secretkey) {
            $scope.secretkeyerror = 'Please enter a secret key'
        } else {
            GpsSettingsService.addSecret({secret:$scope.secretkey, email: $scope.email}, function (success) {
                if(success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go('secretKeys')
                } else {
                    Notification.error(success.data.messages[0]);
                }
            });
        }
    };
    $scope.getAllSecrets = function () {
        GpsSettingsService.getAllSecrets(function (success) {
            if(success.data.status) {
                $scope.secretKeys = success.data.secretKeys;
            }
        });
    };
    $scope.getAllSecrets();

    function getGpsSettings() {
        GpsSettingsService.getGpsSettings(function (success) {
            if(success.data.status){
                $scope.gpsSettingsParams=success.data.results;
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        })
    }

    getGpsSettings();

    $scope.updateGpsSettings =function () {
        GpsSettingsService.updateGpsSettings($scope.gpsSettingsParams,function (success) {
            if(success.data.status){
                Notification.success({message:success.data.message});
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        })
    }

}]);