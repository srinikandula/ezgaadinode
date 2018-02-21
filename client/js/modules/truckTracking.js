app.factory('truckTrackingService',['$http','$cookies', function ($http, $cookies) {
    return {
        getTruckLocations: function (body,success, error) {
            $http({
                url: '/v1/gps/gpsTrackingByTruck/'+body.regNo+'/'+body.startDate+'/'+body.endDate,
                method: "GET",
            }).then(success, error)
        },
    }
}]);

app.controller('TruckTrackingController', ['$scope', '$state','truckTrackingService','$stateParams', function ($scope, $state,truckTrackingService,$stateParams) {
    $scope.truckTrackingParams={
        regNo: 'OD02AA4731',//$stateParams.truckNo,
        startDate:new Date(),
        endDate:new Date()
    };
    console.log($scope.truckTrackingParams);
    var map,marker;
    $scope.loadData = function () {
         map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: new google.maps.LatLng(18.2699, 78.0489),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
    };

    var locations=[];
    $scope.getTruckPositions=function () {
        $scope.truckTrackingParams.startDate.setHours(0);
        $scope.truckTrackingParams.startDate.setMinutes(0);
        $scope.truckTrackingParams.startDate.setSeconds(0);
        $scope.truckTrackingParams.endDate.setHours(0);
        $scope.truckTrackingParams.endDate.setMinutes(0);
        $scope.truckTrackingParams.endDate.setSeconds(0);
        truckTrackingService.getTruckLocations($scope.truckTrackingParams,function (success) {
            if(success.data.status){
                locations=success.data.results;
                var flightPathCoordinates=[];
                console.log(locations);
                for (var i = 0; i< locations.length; i++) {
                    console.log(typeof locations[i].location.coordinates[1]);
                    flightPathCoordinates.push({lat:locations[i].location.coordinates[1],lng: locations[i].location.coordinates[0]})
                    // marker = new google.maps.Marker({
                    //     // new google.maps.LatLng($scope.addBranchParams.loc.coordinates[1], $scope.addBranchParams.loc.coordinates[0/]);
                    //     position: new google.maps.LatLng(locations[i].location.coordinates[1], locations[i].location.coordinates[0]),
                    //     icon: "/images/Track_Vehicle_Red.png",
                    //     /*label: {
                    //         text: locations[i].name,
                    //         color: "black"
                    //     },*/
                    //     map: map
                    // });
                    if(i===locations.length-1){
                        var flightPath = new google.maps.Polyline({
                            path: flightPathCoordinates,
                            geodesic: true,
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });
                        flightPath.setMap(map);
                    }
                }
                console.log(flightPathCoordinates);
            }else{

            }
        },function (err) {

        })
    };

    $scope.loadData();
}]);