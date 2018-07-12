app.factory('gpsListService',['$http','$cookies', function ($http, $cookies) {
    return {
        getAllVehiclesLocation: function (success, error) {
            $http({
                url: '/v1/gps/getAllVehiclesLocation',
                method: "GET"
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
    function getAllVehiclesLocation() {
        gpsListService.getAllVehiclesLocation(function (success) {
            if(success.data.status){
                $scope.trucksData=success.data.results;
                for(var i=0;i<$scope.trucksData.length;i++){
                    if($scope.trucksData[i].attrs.latestLocation.isStopped){
                       $scope.trucksData[i].status = 'Stopped';
                    }else if(($scope.trucksData[i].attrs.latestLocation.isIdle)){
                        $scope.trucksData[i].status = 'Idle';
                    }else{
                        $scope.trucksData[i].status = 'Running';
                    }

                }
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        })
    }
    getAllVehiclesLocation();
    $scope.trackView = function(truckNo){
        $state.go('trackView',{truckNo:truckNo});
    };
    $scope.shareTracking=function (truckId) {
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
                            return { url: success.data.data };
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
}]);
app.controller('shareCtrl', ['$scope', '$state', '$uibModalInstance','linkData', function ($scope,  $state, $uibModalInstance,linkData) {
    $scope.link=linkData.url;
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}]);