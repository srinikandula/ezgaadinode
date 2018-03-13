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
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        })
    }
    getAllVehiclesLocation();
}]);
