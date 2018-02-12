app.factory('groupMapService',['$http','$cookies', function ($http, $cookies) {
    return {
        getGroupMap: function (success, error) {
            $http({
                url: '/v1/events/get/groupMap',
                method: "GET",
                data: success
            }).then(success, error)
        },
        getParties: function (success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('GroupMapController', ['$scope', '$state','groupMapService','GpsService', function ($scope, $state,groupMapService,GpsService) {

    var locations = [];
    var regNos=[];
    var truckTypes=[];
    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            if (success.data.status) {
                locations = success.data.data;
                regNos=success.data.regNos;
                truckTypes=success.data.truckTypes;
                $scope.loadData();

            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        });
    };

    $scope.loadData = function (){
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: new google.maps.LatLng(18.2699, 78.0489),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var infowindow = new google.maps.InfoWindow();
        var marker;
        for (var i = 0; i< locations.length; i++) {
            marker = new google.maps.Marker({
                // new google.maps.LatLng($scope.addBranchParams.loc.coordinates[1], $scope.addBranchParams.loc.coordinates[0/]);
                position: new google.maps.LatLng(locations[i].location.coordinates[1], locations[i].location.coordinates[0]),
                icon: "/images/Track_Vehicle_Red.png",
                /*label: {
                    text: locations[i].name,
                    color: "black"
                },*/
                map: map
            });
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(regNos[i]+"<br>"+truckTypes[i]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
        }
    };
    $scope.gpsTrackingByMapView();
    // setTimeout(function () {$scope.loadData();}, 40);

}]);