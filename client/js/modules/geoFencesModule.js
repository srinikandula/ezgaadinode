app.factory('GeoFenceService',['$http', function ($http) {
    return {
        addGeoFence: function (info, successCallback, errorCallback) {
            $http({
                url: '/v1/geoFences/addGeoFence',
                method: "POST",
                data:info
            }).then(successCallback, errorCallback)
        },
        getGeoFences: function (successCallback, errorCallback) {
            $http({
                url: '/v1/geoFences/getGeoFences',
                method: "GET",
            }).then(successCallback, errorCallback)
        },

    }
}]);

app.controller('listController',['$scope','$state','GeoFenceService',function($scope,$state,GeoFenceService){
    GeoFenceService.getGeoFences(function(successCallback){

    },function(errorCallback){

    });
    $scope.goToEditPage = function(){
        $state.go('add_editGeoFence');
    };
}]);

app.controller('AddEditCtrl',['$scope','$state','$uibModal','GeoFenceService',function($scope,$state,$uibModal,GeoFenceService){
    $scope.geoFence = {};
    $scope.title = 'Add Geofence';

    $scope.selectLocation = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'geoLocation.html',
            controller: 'geoLocationCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });
        modalInstance.result.then(function (data) {
            if(data) {
                $scope.geoFence.address = data.address;
                $scope.geoFence.geoLocation = data.geoLocation;
            }
        });
    };

    $scope.addOrUpdategeoFence = function(){
        var params = $scope.geoFence;
        GeoFenceService.addGeoFence(params,function (successCallback) {
            if(successCallback.data.status){
                $state.go('geoFence');
            }
        },function (errorCallback) {

        });

    };

    $scope.cancel = function(){
      $state.go('geoFence');
    };

}]);

app.controller('geoLocationCtrl',['$scope','$uibModalInstance','NgMap',function ($scope,$uibModalInstance,NgMap) {
    $scope.position = {};
    $scope.position.geoLocation = {lat:26.26, lang:81.23 };
    $scope.position.address;

    var infowindow = new google.maps.InfoWindow;
    var geocoder = new google.maps.Geocoder;
    NgMap.getMap().then(function(map) {
        map.setCenter({lat:$scope.position.geoLocation.lat,lng:$scope.position.geoLocation.lang});
        var marker = new google.maps.Marker({position:new google.maps.LatLng($scope.position.geoLocation.lat,$scope.position.geoLocation.lang),
            draggable: true});
        marker.setMap(map);
        google.maps.event.addListener(marker, 'dragend', function (evt) {
            $scope.geocodeLatLng([evt.latLng.lat(),evt.latLng.lng()],geocoder, map, infowindow,marker);
        });
    });
    $scope.geocodeLatLng =  function (latlang,geocoder, map, infowindow,marker) {
        var latlng = {lat: latlang[0], lng:latlang[1]};
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                    $scope.position.address = results[0].formatted_address;
                    $scope.position.geoLocation = latlng;

                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.close($scope.position);
    };
}]);