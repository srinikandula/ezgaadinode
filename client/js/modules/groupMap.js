app.factory('groupMapService', function ($http, $cookies) {
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
});

app.controller('GroupMapController', ['$scope', '$state','groupMapService','GpsService', function ($scope, $state,groupMapService,GpsService) {

    var locations = [];
    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            if (success.data.status) {
                locations = success.data.data;
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
                position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
                icon: "/images/Track_Vehicle_Red.png",
                /*label: {
                    text: locations[i].name,
                    color: "black"
                },*/
                map: map
            });
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(locations[i].name+"<br>"+locations[i]._id);
                    infowindow.open(map, marker);
                }
            })(marker, i));
        }
    };
    $scope.gpsTrackingByMapView();
    // setTimeout(function () {$scope.loadData();}, 40);

}]);