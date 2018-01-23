app.factory('GpsService', function ($http) {
    return {
        addDevice: function (object, success, error) {
            $http({
                url: '/v1/gps/addDevice',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getDevices:function (success,error) {
            $http({
                url: '/v1/gps/getDevices',
                method: "GET",
            }).then(success, error)
        },
        gpsTrackingByMapView:function (success,error) {
            $http({
                url: '/v1/gps/gpsTrackingByMapView',
                method: "GET",
            }).then(success, error)
        }
    }
});

app.controller('GpsCtrl', ['$scope', '$state', 'GpsService', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, GpsService, Notification, NgTableParams, paginationService,TrucksService) {

    $scope.getDevices=function () {
        GpsService.getDevices(function (success) {
            if(success.data.status){
                $scope.devicesList=success.data.devices;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function (error) {

        })
    };

    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    };
    function initializeDevice() {
        $scope.device={
            deviceId:"",
            truckId:"",
            errors:[],
            success:[]
        }
    }
    initializeDevice();
    $scope.addDevice=function () {
        console.log('devices');
        var params=$scope.device;
        params.errors = [];
        if(!params.deviceId){
            params.errors.push('Please provide device id');
        }
        if(!params.truckId){
            params.errors.push('select truck number');
        }
        if(!params.simNumber){
            params.errors.push('select truck number');
        }
        if(!params.imei){
            params.errors.push('select truck number');
        }

        if (!params.errors.length) {
            GpsService.addDevice($scope.device,function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success({message: message});
                    });
                    $scope.getDevices();
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        }
    }

    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            console.log('response',success);
        },function (error) {

        })
    }

}]);