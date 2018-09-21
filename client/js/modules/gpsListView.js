app.factory('gpsListService',['$http','$cookies', function ($http, $cookies) {
    return {
        getAllVehiclesLocation: function (params,success, error) {
            console.log("params", params);
            $http({
                url: '/v1/gps/getAllVehiclesLocation',
                method: "GET",
                params:{registrationNo:params}
            }).then(success, error)
        },
        generateShareTrackingLink:function (data,success,error) {
            $http({
                url: '/v1/gps/generateShareTrackingLink',
                method: "POST",
                data:data
            }).then(success, error)
        }
    }
}]);

app.controller('gpsListViewController', ['$scope', '$state','gpsListService','$stateParams','Notification','$uibModal', function ($scope, $state,gpsListService,$stateParams,Notification,$uibModal) {
    $scope.trucksData = [];
    $scope.today = new Date();
    function getAllVehiclesLocation() {
        gpsListService.getAllVehiclesLocation({},function (success) {
            if(success.data.status){
                $scope.trucksData=success.data.results;
                for(var i=0;i<$scope.trucksData.length;i++){
                    var deviceUpdate;
                    if($scope.trucksData[i].attrs){
                        deviceUpdate = new Date($scope.trucksData[i].attrs.latestLocation.createdAt);
                        if(deviceUpdate.getDate() < $scope.today.getDate()){
                            $scope.trucksData[i].deviceUpdate = 'false';
                        }
                        if($scope.trucksData[i].attrs.latestLocation.isStopped){
                            $scope.trucksData[i].status = 'Stopped';
                        }else if(($scope.trucksData[i].attrs.latestLocation.isIdle)){
                            $scope.trucksData[i].status = 'Idle';
                        }else{
                            $scope.trucksData[i].status = 'Running';
                        }
                    }else{
                        $scope.trucksData[i].status = '--';
                    }
                    if(!$scope.trucksData[i].attrs){
                        $scope.trucksData[i].deviceStatus = 'false';
                    }
                }
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        })
    };


    $scope.filters = {
        registrationNo: ''
    }
    $scope.truckFilterWithRegNo = function () {
        var filters = $scope.filters.registrationNo;
         console.log("Welocne,,,,,,,", filters);
        gpsListService.getAllVehiclesLocation(filters, function (success) {
                if (success.data.status) {
                    $scope.trucksData = success.data.results;
                }
            }
        )
    }



    $scope.trackView = function(truckNo){
        $state.go('trackView',{truckNo:truckNo});
    };
    $scope.shareTracking=function (truckId, registrationNumber) {
        console.log('registrationNumber ' + registrationNumber);
        gpsListService.generateShareTrackingLink({truckId:truckId},function (success) {
            if(success.data.status){
                var modalInstance = $uibModal.open({
                    templateUrl: 'shareLink.html',
                    controller: 'shareCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        linkData: function () {
                            return {
                                url: success.data.data,
                                registrationNumber: registrationNumber
                            };
                        }
                    }
                });

            }else{
                success.data.messages.forEack(function (message) {
                    Notification.error({message:message});
                })
            }
        },function (error) {

        })
    };
    getAllVehiclesLocation();
}]);
app.controller('shareCtrl', ['$scope', '$state', '$uibModalInstance','linkData', function ($scope,  $state, $uibModalInstance,linkData) {
    $scope.link=linkData.url;
    $scope.registrationNumber=linkData.registrationNumber;

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}]);