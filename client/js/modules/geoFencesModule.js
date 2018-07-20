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
        deleteGeoFence: function (id,successCallback, errorCallback) {
            $http({
                url: '/v1/geoFences/deleteGeoFence/'+id,
                method: "DELETE",
            }).then(successCallback, errorCallback)
        },
        getGeoFence: function (id,successCallback, errorCallback) {
            $http({
                url: '/v1/geoFences/getGeoFence/'+id,
                method: "GET",
            }).then(successCallback, errorCallback)
        },
        updateGeoFence: function (info,successCallback, errorCallback) {
            $http({
                url: '/v1/geoFences/updateGeoFence',
                method: "PUT",
                data:info
            }).then(successCallback, errorCallback)
        }
    }
}]);

app.controller('listController',['$scope','$state','GeoFenceService','Notification',function($scope,$state,GeoFenceService,Notification){
    GeoFenceService.getGeoFences(function(successCallback){
        if(successCallback.data.status){
            $scope.geoFences = successCallback.data.data;
        }
    },function(errorCallback){

    });
    $scope.goToEditPage = function(id){
        $state.go('add_editGeoFence',{id:id});
    };
    $scope.delete = function(id){
        GeoFenceService.deleteGeoFence(id,function(successCallback){
            if(successCallback.data.status){
                Notification.success({message: "Deleted Successfully"});
            }
        },function(errorCallback){});
    };
}]);

app.controller('AddEditGeoLocationCtrl',['$scope','$state','$uibModal','GeoFenceService','Notification','$stateParams',function($scope,$state,$uibModal,GeoFenceService,Notification,$stateParams){
    $scope.geoFence = {};
    $scope.title = 'Add Geofence';
    if($stateParams.id){
        $scope.title = 'Edit Geofence';
        GeoFenceService.getGeoFence($stateParams.id,function(successCallback){
            if(successCallback.data.status){
                $scope.geoFence = successCallback.data.data;
            }
        },function(errorCallback){});
    };
    $scope.selectLocation = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'geoLocation.html',
            controller: 'geoLocationCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                   return {address:$scope.geoFence.address,geoLocation:$scope.geoFence.geoLocation}
                }
            }
        });
        modalInstance.result.then(function (data) {
            if(data) {
                $scope.geoFence.address = data.address;
                $scope.geoFence.geoLocation = data.geoLocation;
                //window.location.reload();
            }
        });
    };

    $scope.addOrUpdategeoFence = function(){
        var params = $scope.geoFence;
        if($stateParams.id){
            GeoFenceService.updateGeoFence(params,function (successCallback) {
                if(successCallback.data.status){
                    Notification.success({message: "Updated Successfully"});
                    $state.go('geoFence');
                }else {
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            },function (errorCallback) {});
        }else{
            GeoFenceService.addGeoFence(params,function (successCallback) {
                if(successCallback.data.status){
                    Notification.success({message: "Added Successfully"});
                    $state.go('geoFence');
                }else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            },function (errorCallback) {});
        }
    };
    $scope.cancel = function(){
      $state.go('geoFence');
    };

}]);

app.controller('geoLocationCtrl',['$scope','$uibModalInstance','NgMap','AccountServices','data',function ($scope,$uibModalInstance,NgMap,AccountServices,data) {
    $scope.position = {};
    $scope.marker = null;
    $scope.position.geoLocation;
    $scope.position.address;
    if((data.address && data.geoLocation)!= undefined){
       $scope.position.address = data.address;
       $scope.position.geoLocation = {lat:data.geoLocation.coordinates[0],lang:data.geoLocation.coordinates[1]};
        initiateMap();
    }else{
       AccountServices.getAccountHomeLocation(function(successCallback){
           $scope.latlng = successCallback.data.data.homeLocation.latlng;
           if($scope.latlng){
               $scope.position.geoLocation = {lat:parseFloat($scope.latlng[0]),lang:parseFloat($scope.latlng[1])};
               initiateMap();
           }
       },function(errorCallback){
           console.log("error loading account home location in geoLocationCtrl");
       });
    }
    function initiateMap() {
        var infowindow = new google.maps.InfoWindow;
        var geocoder = new google.maps.Geocoder;
        NgMap.getMap().then(function(map) {
            map.setCenter({lat:$scope.position.geoLocation.lat,lng:$scope.position.geoLocation.lang});
            $scope.marker = new google.maps.Marker({position:new google.maps.LatLng($scope.position.geoLocation.lat,$scope.position.geoLocation.lang),
                draggable: true});
            $scope.marker.setMap(map);
            google.maps.event.addListener($scope.marker, 'dragend', function (evt) {
                $scope.geocodeLatLng([evt.latLng.lat(),evt.latLng.lng()],geocoder, map, infowindow,$scope.marker);
            });
        });
    }
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