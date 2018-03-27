app.factory('GpsSettingsService',['$http', function ($http) {
    return {
        addSecret: function (object, success, error) {
            $http({
                url: '/v1/gps/addSecret',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getAllSecrets: function (success, error) {
            $http({
                url: '/v1/gps/getAllSecrets',
                method: "GET"
            }).then(success, error)
        },
        getGpsSettings: function (success, error) {
            $http({
                url: '/v1/gps/getGpsSettings',
                method: "GET"
            }).then(success, error)
        },
        updateGpsSettings:function (body,success,error) {
            $http({
                url: '/v1/gps/updateGpsSettings',
                method: "POST",
                data:body
            }).then(success, error)
        },
        getAccountRoutes:function (success,error) {
            $http({
                url:'/v1/admin/getAccountRoutes',
                method:"GET"
            }).then(success, error)
        },
        updateAccountRoutes:function (params,success,error) {
            $http({
                url:'/v1/admin/updateAccountRoutes',
                method:"POST",
                data:params
            }).then(success, error)
        },
        deleteOperatingRoutes:function (params,success,error) {
            $http({
                url:'/v1/admin/deleteOperatingRoutes',
                method:"DELETE",
                params:{_id:params}
            }).then(success, error)
        }

    }
}]);

app.controller('GpsSettingsCrtl', ['$scope', 'GpsSettingsService', 'Notification', '$state', function ($scope, GpsSettingsService, Notification, $state) {
    $scope.secretkey = '';


    $scope.addSecret = function () {
        if(!$scope.secretkey) {
            $scope.secretkeyerror = 'Please enter a secret key'
        } else {
            GpsSettingsService.addSecret({secret:$scope.secretkey, email: $scope.email}, function (success) {
                if(success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go('secretKeys')
                } else {
                    Notification.error(success.data.messages[0]);
                }
            });
        }
    };
    $scope.getAllSecrets = function () {
        GpsSettingsService.getAllSecrets(function (success) {
            if(success.data.status) {
                $scope.secretKeys = success.data.secretKeys;
            }
        });
    };
    $scope.getAllSecrets();

    function getGpsSettings() {
        GpsSettingsService.getGpsSettings(function (success) {
            if(success.data.status){

                $scope.gpsSettingsParams=success.data.results;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message:message});
                });
            }
        },function (error) {

        })
    }

    getGpsSettings();


    $scope.updateGpsSettings =function () {
        GpsSettingsService.updateGpsSettings($scope.gpsSettingsParams,function (success) {
            if(success.data.status){
                success.data.messages.forEach(function (message) {
                    Notification.success({message:message});
                });
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message:message});
                });
            }
        },function (error) {

        })
    };
    function getAccountRoutes() {
        GpsSettingsService.getAccountRoutes(function (success) {
            if(success.data.status){
                 $scope.operatingRoutesList=success.data.data;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message:message});
                });
            }
        },function (error) {

        })
    }
    getAccountRoutes();
    $scope.addSearchSource = function (index) {
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.operatingRoutesList[index].source = place.name;
                $scope.operatingRoutesList[index].sourceState = place.address_components[2].long_name;
                $scope.operatingRoutesList[index].sourceAddress = place.formatted_address;
                $scope.operatingRoutesList[index].sourceLocation = [parseFloat(place.geometry.location.lng()), parseFloat(place.geometry.location.lat())];

            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.operatingRoutesList[index].destination = place.name;
                $scope.operatingRoutesList[index].destinationState = place.address_components[2].long_name;
                $scope.operatingRoutesList[index].destinationAddress = place.formatted_address;
                $scope.operatingRoutesList[index].destinationLocation = [parseFloat(place.geometry.location.lng()), parseFloat(place.geometry.location.lat())];
            });
    };
    $scope.addOperatingRoute = function () {
        var routesObj = $scope.operatingRoutesList;
        if (!routesObj[routesObj.length - 1].source || !routesObj[routesObj.length - 1].destination) {
            Notification.error('Enter Source and Destination');
        } else {
            routesObj.push({});
        }
    };
    $scope.deleteOperatingRoute = function (index) {
        if( $scope.operatingRoutesList[index]._id){

            swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#E83B13',
                cancelButtonColor: '#9d9d9d',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    GpsSettingsService.deleteOperatingRoutes($scope.operatingRoutesList[index]._id, function (success) {
                        if (success.data.status) {
                            swal(
                                'Deleted!',
                                success.data.messages[0],
                                'success'
                            );
                            $scope.operatingRoutesList.splice(index, 1)
                        } else {
                            success.data.messages.forEach(function (message) {
                                Notification.error(message);
                            });
                        }
                    }, function (err) {

                    });
                }
            });
        }else{
            $scope.operatingRoutesList.splice(index, 1)

        }
    };

    $scope.updateOperatingRoutes=function () {
        GpsSettingsService.updateAccountRoutes($scope.operatingRoutesList,function (success) {
            if (success.data.status) {
                success.data.messages.forEach(function (message) {
                    Notification.success(message);
                })
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })
            }
        },function (error) {

        })
    }

}]);