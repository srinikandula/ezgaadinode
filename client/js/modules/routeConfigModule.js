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
        // console.log("getting route configs.......",successCallback.data.data);
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
app.controller('PickRouteLocationController', ['$scope','$state','RouteConfigService','$uibModalInstance','NgMap','data','AccountServices', function ($scope,$state,RouteConfigService,$uibModalInstance,NgMap,data,AccountServices) {
    $scope.latlng =[];
    console.log("Postion",data);
    if(data && data.position){
        $scope.position = data.position || {};
    }else{
        $scope.position ={};
    }
    $scope.marker = null;
    $scope.accountHomeLocation = [ 81.23952833333334, 26.266689999999997 ];
    AccountServices.getAccountHomeLocation(function(success){
        $scope.latlng = success.data.data.homeLocation.latlng;
        // console.log(" home location latlng.....",$scope.latlng);
        if($scope.latlng){
            $scope.accountHomeLocation = [parseFloat($scope.latlng[0]), parseFloat($scope.latlng[1])];
        }
    },function(error){

    });
    var icon = (data&&data.type) ==='source'?'http://maps.google.com/mapfiles/ms/icons/green-dot.png':'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    var infowindow = new google.maps.InfoWindow;
    var array =[];
    var geocoder = {};
    NgMap.getMap().then(function(map) {
            map.setCenter({lat:$scope.accountHomeLocation[0],lng:$scope.accountHomeLocation[1]});
            if($scope.position.latlng){
                map.setCenter({lat:$scope.position.latlng[0],lng:$scope.position.latlng[1]});
                $scope.marker = new google.maps.Marker({icon:icon,position:new google.maps.LatLng($scope.position.latlng[0],$scope.position.latlng[1]),draggable: true});
                array = [$scope.accountHomeLocation[0],$scope.accountHomeLocation[1]];
                geocoder = new google.maps.Geocoder;
                $scope.geocodeLatLng(array,geocoder, map, infowindow,$scope.marker);

            } else {
                $scope.marker = new google.maps.Marker({icon:icon,position:new google.maps.LatLng($scope.accountHomeLocation[0],$scope.accountHomeLocation[1]),draggable: true});
                array = [$scope.accountHomeLocation[0],$scope.accountHomeLocation[1]];
                geocoder = new google.maps.Geocoder;
                $scope.geocodeLatLng(array,geocoder, map, infowindow,$scope.marker);
            }
            $scope.marker.setMap(map);
        google.maps.event.addListener($scope.marker, 'dragend', function (evt) {
                array = [evt.latLng.lat(),evt.latLng.lng()];
                geocoder = new google.maps.Geocoder;
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

app.controller('AddEditConfigCtrl', ['$scope','$state','RouteConfigService','$uibModal','$stateParams','AccountServices', function ($scope,$state,RouteConfigService,$uibModal,$stateParams,AccountServices) {
    $scope.route ={accountId:""};
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
            $scope.route.errors =[];

        if ($stateParams.ID) {
                params = $scope.route;
                RouteConfigService.updateRouteConfig(params, function (successCallback) {
                }, function (error) {  });
            $state.go('routeConfig');
        } else {
                params = $scope.route;
                RouteConfigService.addRouteConfig(params, function (successCallback) {
                    $scope.route.errors = successCallback.data.errors;
                    if($scope.route.errors.length === 0){
                        $state.go('routeConfig');
                    }
                }, function (errorCallback) {  });
        }
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
                        if($scope.route.source){
                            return {position:{latlng: $scope.route.source.coordinates},type:type};
                        }else{
                            return {position:{},type:type};
                        }

                        //return $scope.route.source;
                    } else if(type ==='destination' && $scope.route.destination){
                        if($scope.route.destination){
                            return {position:{latlng: $scope.route.destination.coordinates},type:type};
                        }else{
                            return {position:{},type:type};
                        }
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
                    $scope.route.source ={
                        coordinates:data.latlng
                    };
                    $scope.route.sourceAddress=data.address;
                } else {
                    $scope.route.destination ={
                        coordinates:data.latlng
                    };
                    $scope.route.destinationAddress=data.address;
                }
            }
        }, function () {
        });
    };
    $scope.cancel = function(){
        $state.go('routeConfig');
    }

}]);
