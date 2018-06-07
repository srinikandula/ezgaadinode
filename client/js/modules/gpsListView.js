app.factory('gpsListService',['$http','$cookies', function ($http, $cookies) {
    return {
        getAllVehiclesLocation: function (success, error) {
            $http({
                url: '/v1/gps/getAllVehiclesLocation',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('gpsListViewController', ['$scope', '$state','gpsListService','$stateParams','Notification', function ($scope, $state,gpsListService,$stateParams,Notification) {
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
    }
}]);
