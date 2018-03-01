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
            var image='/images/';
            if(locations[i].isStopped){
                image=image+'red_marker.svg';
            }else if(locations[i].isIdle){
                image=image+'orange_marker.svg';
            }else{
                image=image+'green_marker.svg';
            }
            var icon = {
                url: image, // url
                scaledSize: new google.maps.Size(50, 50),
                labelOrigin: new google.maps.Point(20, -2),
                labelStyle:{background: '#fff'}
            };
            marker = new google.maps.Marker({
                // new google.maps.LatLng($scope.addBranchParams.loc.coordinates[1], $scope.addBranchParams.loc.coordinates[0/]);
                position: new google.maps.LatLng(locations[i].location.coordinates[1], locations[i].location.coordinates[0]),
                icon: icon,
                label: {
                    text: regNos[i],
                    color: "black",
                    fontSize: '12px',
                    labelClass:"labels"
                },
                map: map
            });

            // var content = '<span> <b>Truck Reg No:</b> '+regNos[i]+'</span><br><span><b> Truck Type: </b> '+truckTypes[i]+'</span><br>'; //'<span> Truck No: ' + regNos[i]+'</span>'+'<span> Truck Type :'+truckTypes[i]+'</span>';
            var functionContent = '<div>'+'<center><span> <b>Truck Reg No:</b> '+regNos[i]+'</span><br><span><b> Truck Type: </b> '+truckTypes[i]+'</span><br>'+'<a ng-click="track(' + i + ')" class="btn btn-danger">Track</a></center></div>';
            var compiledContent = $compile(functionContent)($scope);
            google.maps.event.addListener(marker, 'click', (function(marker, i,content) {
                return function() {
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                }
            })(marker, i,compiledContent[0], $scope));
        }
    };

    $scope.track = function (truckNo) {
        $state.go('trackView',{truckNo:regNos[truckNo]});          // console.log(truckNo);
    };

    $scope.gpsTrackingByMapView();
    // setTimeout(function () {$scope.loadData();}, 40);

}]);