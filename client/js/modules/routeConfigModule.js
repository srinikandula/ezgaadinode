app.factory('RouteConfigService',['$http', function ($http) {
    return {
        /**
         * Module for creating a new route configuration
         * @param info
         * @param successCallback
         * @param errorCallback
         */
        addRouteConfig: function (info, successCallback, errorCallback) {
            $http({
                url: '/v1/routeConfigs/',
                method: "POST",
                data:info
            }).then(successCallback, errorCallback)
        },
        /**
         * Module to get all route configuratons
         * @param successCallback
         * @param errorCallback
         */
        getRouteConfigs: function (successCallback, errorCallback) {
            $http({
                url: '/v1/routeConfigs/get',
                method: "GET"
            }).then(successCallback, errorCallback)
        },
        /**
         * Module to delete a route configuration
         * @param Id
         * @param successCallback
         * @param errorCallback
         */
        deleteRouteConfigs:function(Id,successCallback,errorCallback){
            $http({
                url: '/v1/routeConfigs/'+Id,
                method: "DELETE"
            }).then(successCallback, errorCallback)
        },
        /**
         * Module to get a particular route configuration
         * @param id
         * @param successCallback
         * @param errorCallback
         */
        getRouteConfig: function (id,successCallback, errorCallback) {
            $http({
                url: '/v1/routeConfigs/getRouteConfig/'+id,
                method: "GET"
            }).then(successCallback, errorCallback)
        },
        /**
         * Module to modify a route configuration
         * @param Info
         * @param successCallback
         * @param errorCallback
         */
        updateRouteConfig: function (Info, successCallback, errorCallback) {
            $http({
                url: '/v1/routeConfigs/',
                method: "PUT",
                data: Info
            }).then(successCallback, errorCallback)
        }
    }
}]);

app.controller('RouteConfigListCtrl', ['$scope','$state','RouteConfigService', function ($scope,$state,RouteConfigService) {
    $scope.routeConfigs = [];
    $scope.reloadPage = function(){
        window.location.reload();
    };
    RouteConfigService.getRouteConfigs(function(successCallback){
        console.log("getting...",successCallback.data);
        $scope.routeConfigs = successCallback.data.data;
    },function(errorCallback){

    });
    $scope.goToEditPage=function(id){
        $state.go('addRouteConfig',{ID:id});
    };
    $scope.delete = function(id){
        var params =id;
        console.log("delete function....",id);
        RouteConfigService.deleteRouteConfigs(params,function(successCallback){

        },function(errorCallback){

        });
        $scope.reloadPage();
    }

}]);
app.controller('PickRouteLocationController', ['$scope','$state','RouteConfigService','$uibModalInstance','NgMap','data', function ($scope,$state,RouteConfigService,$uibModalInstance,NgMap,data) {
    if(data && data.position){
        $scope.position = data.position || {};
    }else{
        $scope.position ={};
    }
    $scope.marker = null;
    var icon = (data&&data.type) ==='source'?'http://maps.google.com/mapfiles/ms/icons/green-dot.png':'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    NgMap.getMap().then(function(map) {
            if($scope.position.latlng){
                map.setCenter({lat:$scope.position.latlng[0],lng:$scope.position.latlng[1]});
                $scope.marker = new google.maps.Marker({icon:icon,position:new google.maps.LatLng($scope.position.latlng[0],$scope.position.latlng[1]),draggable: true});
            } else {
                $scope.marker = new google.maps.Marker({icon:icon,position:new google.maps.LatLng(17.3850,78.4867),draggable: true});
            }
            $scope.marker.setMap(map);
        var infowindow = new google.maps.InfoWindow;
        google.maps.event.addListener($scope.marker, 'dragend', function (evt) {
                var array = [evt.latLng.lat(),evt.latLng.lng()];
                var geocoder = new google.maps.Geocoder;
                $scope.geocodeLatLng(array,geocoder, map, infowindow,$scope.marker);
            });

        });
        $scope.geocodeLatLng =  function (latlang,geocoder, map, infowindow,marker) {
            var latlng = {lat: parseFloat(latlang[0]), lng: parseFloat(latlang[1])};
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        infowindow.setContent(results[0].formatted_address);
                        infowindow.open(map, marker);
                        $scope.position.address = results[0].formatted_address;
                        $scope.position.latlng = latlang;
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        };
        $scope.cancel = function () {
            if($scope.marker){
                $scope.marker.setMap(null);
            }
            $uibModalInstance.close($scope.position);
        };



}]);

app.controller('AddEditConfigCtrl', ['$scope','$state','RouteConfigService','$uibModal','$stateParams', function ($scope,$state,RouteConfigService,$uibModal,$stateParams) {
    $scope.route ={};
    $scope.pageTitle = " Add RouteConfig";

    if($stateParams.ID){
        $scope.pageTitle = " Update RouteConfig";
        RouteConfigService.getRouteConfig($stateParams.ID, function (successCallback) {
            $scope.route=successCallback.data.data[0];
        }, function (errorCallback) {

        });
    }else {
        $scope.pageTitle = " Add RouteConfig";
    }

    $scope.addOrUpdateConfig = function() {
            var params = null;
            if ($stateParams.ID) {
                params = $scope.route;
                RouteConfigService.updateRouteConfig(params, function (successCallback) {
                    // console.log('Update success',successCallback.data);
                }, function (error) {  });
            } else {
                params = $scope.route;
                RouteConfigService.addRouteConfig(params, function (successCallback) {
                    // console.log("Success data", successCallback.data);
                }, function (errorCallback) {  });
            }
            $state.go('routeConfig');
    };

    $scope.showMapDialog = function (type) {
         var modalInstance = $uibModal.open({
            templateUrl: 'pickRouteLocation.html',
            controller: 'PickRouteLocationController',
            size: 'md',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    if(type ==='source' && $scope.route.source){
                        return {position:$scope.route.source,type:type};
                        //return $scope.route.source;
                    } else if(type ==='destination' && $scope.route.destination){
                        return {position:$scope.route.destination,type:type};
                        // return $scope.route.destination;
                    } else {
                        return {type:type};
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            if(data) {
                if(type === 'source'){
                    $scope.route.source = data;
                } else {
                    $scope.route.destination = data;
                }
            }
        }, function () {
        });
    };
    $scope.cancel = function(){
        $state.go('routeConfig');
    }

}]);
