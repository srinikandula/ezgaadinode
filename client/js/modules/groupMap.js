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

app.controller('GroupMapController', ['$scope', '$state','groupMapService','GpsService','$compile', function ($scope, $state,groupMapService,GpsService,$compile) {

    var trucksData=[];
    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            if (success.data.status) {
                trucksData=success.data.data;
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

        for (var i = 0; i< trucksData.length; i++) {
            if (Object.keys(trucksData[i]).indexOf('attrs')!==-1) {
                if (trucksData[i].attrs.latestLocation.location != undefined) {
                    var image = '/images/';
                if (trucksData[i].attrs.latestLocation.isStopped || trucksData[i].attrs.latestLocation.isIdle) {
                    image = image + 'red_marker.svg';
                } else {
                    image = image + 'green_marker.svg';
                }
                var icon = {
                    url: image, // url
                    scaledSize: new google.maps.Size(50, 50),
                    labelOrigin: new google.maps.Point(20, -2)
                    // labelStyle:{background: '#fff'}
                };
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(trucksData[i].attrs.latestLocation.location.coordinates[1], trucksData[i].attrs.latestLocation.location.coordinates[0]),
                    icon: icon,
                    label: {
                        text: trucksData[i].registrationNo,
                        color: "black",
                        fontSize: '12px',
                        labelClass: "labels"
                    },
                    map: map
                });

                var functionContent = '<div>' + '<center><span> <b>Truck Reg No:</b> ' + trucksData[i].registrationNo + '</span><br><span><b> Truck Type: </b> ' + trucksData[i].truckType + '</span><br>' + '<a ng-click="track(' + i + ')" class="btn btn-danger">Track</a></center></div>';
                var compiledContent = $compile(functionContent)($scope);
                google.maps.event.addListener(marker, 'click', (function (marker, i, content) {
                    return function () {
                        infowindow.setContent(content);
                        infowindow.open(map, marker);
                    }
                })(marker, i, compiledContent[0], $scope));
            }
            }
        }
    };

    $scope.track = function (truckNo) {
        $state.go('trackView',{truckNo:trucksData[truckNo].registrationNo});          // console.log(truckNo);
    };

    $scope.gpsTrackingByMapView();
    // setTimeout(function () {$scope.loadData();}, 40);

}]);