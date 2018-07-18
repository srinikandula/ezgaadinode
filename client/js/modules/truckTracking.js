app.factory('truckTrackingService',['$http','$cookies', function ($http, $cookies) {
    return {
        getTruckLocations: function (body,success, error) {
            $http({
                url: '/v1/gps/gpsTrackingByTruck/'+body.regNo+'/'+body.startDate+'/'+body.endDate,
                method: "GET"
            }).then(success, error)
        },
        downloadReport:function (body,success,error) {
            $http({
                url: '/v1/gps/downloadReport/'+body.regNo+'/'+body.startDate+'/'+body.endDate,
                method: "GET"
            }).then(success, error)
        },
        getTruckLatestLocation:function (trackingId,success,error) {
            $http({
                url: '/v1/gps//getTruckLatestLocation/'+trackingId,
                method: "GET"
            }).then(success, error)
        }

    }
}]);

app.controller('TruckTrackingController', ['$scope', '$state','truckTrackingService','$stateParams','Notification','$compile','gpsListService',function ($scope, $state,truckTrackingService,$stateParams,Notification,$compile,gpsListService) {
    $scope.truckTrackingParams={
        regNo: $stateParams.truckNo,
        startDate:new Date(new Date().setHours(0,0,0,0)),
        endDate:new Date(),
        showOnlyStops:false
    };
    $scope.mapType='';
    $scope.totalDistance=null;
    $scope.locations=[];
    $scope.bounds = new google.maps.LatLngBounds();
    $scope.markers=[];
    $scope.trackCount = 0;

    if($stateParams.startDate && $stateParams.endDate && $stateParams.regNo){
        var params = {
            regNo:$stateParams.regNo.registrationNo,
            startDate:$stateParams.startDate,
            endDate:$stateParams.endDate
        };
        getLocations(params);
    };

    var flightPath;
    var map,markerIndex=0;
    var mapOptions = {
        zoom: 9,
        center: new google.maps.LatLng(18.2699, 78.0489),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var infowindow = new google.maps.InfoWindow();

    $scope.loadData = function () {
        map = new google.maps.Map(document.getElementById('map'),mapOptions);
        gpsListService.getAllVehiclesLocation(function (success) {
            if(success.data.status){
                $scope.trucksData=success.data.results;
                for(var i=0;i<$scope.trucksData.length;i++){
                    if($scope.trucksData[i].registrationNo == $stateParams.truckNo){
                        $scope.totalDistance =$scope.trucksData[i].attrs.latestLocation.totalDistance;
                    }
                }
            }else{
                Notification.error({message:success.data.message});
            }
        },function (error) {

        });
        $scope.getTruckPositions();
    };

    $scope.selectMapType = function(){
        if($scope.mapType == 'SATELLITE'){
            mapOptions.mapTypeId = google.maps.MapTypeId.SATELLITE;
        }else if($scope.mapType == 'TERRAIN'){
            mapOptions.mapTypeId = google.maps.MapTypeId.TERRAIN;
        }else if($scope.mapType == 'HYBRID'){
            mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
        }else{
            mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
        }
        map = new google.maps.Map(document.getElementById('map'),mapOptions);
        $scope.getTruckPositions();
    };

    var idle_marker_icon={
        url: '/images/isIdle.png', // url
        scaledSize: new google.maps.Size(15, 15),
    };

    var red_marker_icon={
        url: '/images/stop.png', // url
        scaledSize: new google.maps.Size(15, 15),
    };

    function setMapOnAll(map) {
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(map);
        }
    }

    $scope.renderStops= function () {
        var marker;
        map = new google.maps.Map(document.getElementById('map'),mapOptions);
        var latlngbounds = new google.maps.LatLngBounds();

        if($scope.truckTrackingParams.showOnlyStops) {
            var flightPathCoordinates=[];
            if (flightPath) {
                flightPath.setMap(null);
                setMapOnAll(null);
                $scope.markers = [];
                markerIndex = 0;
            }
            for (var i = 0; i < $scope.locations.length; i++) {
                var d = new Date($scope.locations[i].createdAt);
                var date = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
                var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                var functionContent = '<div>'+'<span> <b>Address:</b></span>'+$scope.locations[i].address+'<span><br></span>'+'<span><b>Speed:</b></span>'+parseInt($scope.locations[i].speed)+'<span><br></span>'+'<span><b>Date:</b></span>'+date+'<span><br></span>'+'<span><b>Time:</b></span>'+time+'</div>';
                var compiledContent = $compile(functionContent)($scope);
                var latlang = new google.maps.LatLng($scope.locations[i].location.coordinates[1],$scope.locations[i].location.coordinates[0]);
                flightPathCoordinates.push(latlang);
                if ($scope.locations[i].isStopped) {

                    var icon = {
                        url:'/images/gps_truck_stop.png', // url
                        scaledSize: new google.maps.Size(35, 35), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };
                    marker = new google.maps.Marker({
                        position: latlang,
                        map: map,
                        icon:icon,
                    });
                    latlngbounds.extend(marker.position);
                    click(marker,i,functionContent,compiledContent,map);

                }
                if(i === $scope.locations.length-1){
                    var flightPath = new google.maps.Polyline({
                        path: flightPathCoordinates,
                        geodesic: true,
                        strokeColor: '#393',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    flightPath.setMap(map);
                    map.setCenter(flightPathCoordinates[0]);

                }
            }
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

        }else{
            $scope.getTruckPositions();
        }
    };

    $scope.getTruckPositions=function () {
        $scope.truckTrackingParams.startDate.setHours(0);
        $scope.truckTrackingParams.startDate.setMinutes(0);
        $scope.truckTrackingParams.startDate.setSeconds(0);
        $scope.truckTrackingParams.endDate.setHours(23);
        $scope.truckTrackingParams.endDate.setMinutes(59);
        $scope.truckTrackingParams.endDate.setSeconds(59);
        getLocations($scope.truckTrackingParams);

    };

    function getLocations(params){
        truckTrackingService.getTruckLocations(params,function (success) {
            if(success.data.status){
                if(flightPath){
                    flightPath.setMap(null);
                    setMapOnAll(null);
                    //$scope.markers=[];
                    //markerIndex=0;
                }
                $scope.locations=success.data.results.positions;
                $scope.distance=success.data.results.distanceTravelled;
                $scope.averageSpeed=success.data.results.averageSpeed;
                $scope.overSpeedLimit =success.data.results.overSpeedLimit;
                $scope.topSpeed=success.data.results.topSpeed;
                $scope.timeTravelled= success.data.results.timeTravelled;
                renderPolyline();
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        },function (err) {

        })
    };

    function renderPolyline() {
        var flightPathCoordinates=[];
        // map = new google.maps.Map(document.getElementById('map'),mapOptions);
        var marker;
        map = new google.maps.Map(document.getElementById('map'),mapOptions);
        for (var i = 0; i< $scope.locations.length; i++) {
            var d = new Date($scope.locations[i].createdAt);
            var date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
            var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
            var functionContent = '<div>' + '<span> <b>Speed:</b></span>' + parseInt($scope.locations[i].speed) + '<span><br></span>' + '<span><b>Date:</b></span>' + date + '<span><br></span>' + '<span> <b>Time:</b></span>' + time + '</div>';
            var compiledContent = $compile(functionContent)($scope);
            if ($scope.locations[i].location != undefined) {
                var latlang = new google.maps.LatLng($scope.locations[i].location.coordinates[1], $scope.locations[i].location.coordinates[0]);
                $scope.bounds.extend(latlang);
                flightPathCoordinates.push(latlang);
                if (i === 0) {
                    marker = new google.maps.Marker({
                        position: latlang,
                        icon: '/images/start.png',
                        map: map,
                        scaledSize: new google.maps.Size(35, 35)
                    });
                    click(marker, i, functionContent, compiledContent, map);
                } else if (i === $scope.locations.length - 1) {
                    map.fitBounds($scope.bounds);
                    map.panToBounds($scope.bounds);
                    flightPath = new google.maps.Polyline({
                        path: flightPathCoordinates,
                        geodesic: true,
                        strokeColor: '#393',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    flightPath.setMap(map);
                    marker = new google.maps.Marker({
                        position: latlang,
                        icon: '/images/stop.png',
                        scaledSize: new google.maps.Size(35, 35),
                        map: map
                    });
                    click(marker, i, functionContent, compiledContent, map);
                    map.setCenter(flightPathCoordinates[0]);
                } else {

                    if ($scope.locations[i].isStopped) {
                        var icon = {
                            url: '/images/gps_truck_stop.png', // url
                            scaledSize: new google.maps.Size(25, 25), // scaled size
                            origin: new google.maps.Point(0, 0), // origin
                            anchor: new google.maps.Point(0, 0) // anchor
                        };

                        marker = new google.maps.Marker({
                            position: latlang,
                            map: map,
                            icon: icon
                        });
                    } else if ($scope.locations[i].isIdle) {
                        var icon = {
                            url: '/images/idle.png', // url
                            scaledSize: new google.maps.Size(25, 25), // scaled size
                            origin: new google.maps.Point(0, 0), // origin
                            anchor: new google.maps.Point(0, 0) // anchor
                        };

                        marker = new google.maps.Marker({
                            position: latlang,
                            map: map,
                            icon: icon,
                        });
                    } else {
                        if($scope.locations[i].speed > $scope.overSpeedLimit){
                            var icon = {
                                url: '/images/overSpeed.png', // url
                                scaledSize: new google.maps.Size(25, 25), // scaled size
                                origin: new google.maps.Point(0, 0), // origin
                                anchor: new google.maps.Point(0, 0) // anchor
                            };

                            marker = new google.maps.Marker({
                                position: latlang,
                                map: map,
                                icon: icon,
                            });
                        }else{
                            try{

                                var icon = {
                                    url: '', // url
                                    scaledSize: new google.maps.Size(25, 25)
                                };
                                var course = parseFloat($scope.locations[i].course);
                                if (course >= 25 && course < 70) {
                                    icon.url = '/images/h1.png'
                                } else if (course >= 70 && course < 110) {
                                    icon.url = '/images/h2.png'
                                } else if (course >= 110 && course < 160) {
                                    icon.url = '/images/h3.png'
                                } else if (course >= 160 && course < 200) {
                                    icon.url = '/images/h4.png'
                                } else if (course >= 200 && course < 240) {
                                    icon.url = '/images/h5.png'
                                } else if (course >= 240 && course < 290) {
                                    icon.url = '/images/h6.png'
                                } else if (course >= 290 && course < 330) {
                                    icon.url = '/images/h7.png'
                                } else if (course >= 330 && course < 390) {
                                    icon.url = '/images/h0.png'
                                } else if (course >= 390 && course < 420) {
                                    icon.url = '/images/h1.png'
                                } else if (course >= 420 && course < 450) {
                                    icon.url = '/images/h2.png'
                                } else if (course >= 450 && course < 500) {
                                    icon.url = '/images/h3.png'
                                }
                                marker = new google.maps.Marker({
                                    position: latlang,
                                    icon: icon,
                                    map: map
                                });
                            }catch (markerError) {
                                console.log('error creating marker');
                                continue;
                            }
                        }
                    }
                    click(marker, i, functionContent, compiledContent, map);
                }
            }
        }
        marker = null;
    }
    function click(marker,i,content,compiledContent,map){
        google.maps.event.addListener(marker, 'click', (function (marker, i, content) {
            return function () {
                infowindow.setContent(content);
                infowindow.open(map, marker);
            }
        })(marker,i, compiledContent[0], $scope));
    }
    var symbolTwo = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //'M83.7,40.64h-49V6h49Zm-48-1h47V7h-47ZM35,36.86H29.72A1.86,1.86,0,0,1,27.86,35V10.86A1.86,1.86,0,0,1,29.72,9H35V8H29.72a2.86,2.86,0,0,0-2.86,2.86V35a2.86,2.86,0,0,0,2.86,2.86H35Zm-4.48,3a5.35,5.35,0,0,0,3.33-1.95L33,37.32a4.43,4.43,0,0,1-2.57,1.51H11.07c-13.6-15-1.63-29.28-.08-31,6.55-.05,18.81-.14,19.72-.08a2.48,2.48,0,0,1,1.58,1l.83-.56a3.46,3.46,0,0,0-2.35-1.48c-1.19-.08-19.24.07-20,.08h-.21L10.41,7c-.15.16-15,16.26.07,32.69l.15.16H30.51ZM16.67,36.3,16.48,36c-.08-.13-7.69-12.82.36-25.43l.19-.3,7.91,2V34.26Zm.82-24.9c-6.74,10.91-1.41,21.78-.34,23.75l6.78-1.68V13Zm9.08,25,0-1-7.71.18,0,1Zm0-26.52-7.44-.27,0,1,7.44.27ZM80,11H38.36v1H80ZM80,22.6H38.36v1H80Zm0,11.34H38.36v1H80ZM23.49,6.83a.21.21,0,0,1,.11.1,4.83,4.83,0,0,1,.26-1.4c.28-1,.52-1.94,0-2.39a1.24,1.24,0,0,0-1.3,0c-2.05,1-2.21,4-2.21,4.16l1,0S21.46,4.82,23,4L23.16,4a7.62,7.62,0,0,1-.27,1.3c-.29,1.09-.57,2.13.19,2.47Zm.35,36.67c.53-.45.29-1.35,0-2.39a4.83,4.83,0,0,1-.26-1.4.21.21,0,0,1-.11.1l-.41-.91c-.76.34-.49,1.38-.19,2.47a7.53,7.53,0,0,1,.27,1.3L23,42.59c-1.53-.78-1.67-3.29-1.67-3.31l-1,0c0,.13.16,3.12,2.23,4.17a1.83,1.83,0,0,0,.73.19A.83.83,0,0,0,23.84,43.49Z',
        strokeColor: '#393',
        // rotation: 90,
        // anchor: new google.maps.Point(10, 15),
        scale:4
    };
    var id;
    $scope.animate = function () {
        flightPath.setOptions({icons: [{
                icon: symbolTwo,
                offset: '0%',
                strokeWeight:8
            }]});

        id=animateTrigger();
    };
    $scope.trackFromHere = function(startTime){
        $scope.truckTrackingParams.startDate = new Date(startTime);
        $scope.getTruckPositions();
    };

    function animateTrigger() {
        var line=flightPath;
        var count = 0;
        return window.setInterval(function() {
            count = (count + 1) % 200;
            var icons = line.get('icons');
            icons[0].offset = (count / 2) + '%';
            line.set('icons', icons);
        }, 20);
    }

    $scope.pauseAnimation=function () {
        window.clearInterval(id);
    };

    $scope.downloadReport = function () {
        var body=$scope.truckTrackingParams;
        window.open('/v1/gps/downloadReport/'+body.regNo+'/'+body.startDate+'/'+body.endDate);
    };

    $scope.stopAnimation=function () {
        window.clearInterval(id);
        flightPath.setOptions({
            icons:null
        })
    };

    $scope.loadData();


    var that = this;
    // date and time picker
    $scope.pickerStart = {
        date: new Date()
    };
    $scope.pickerEnd = {
        date: new Date()
    };

    $scope.openCalendarStartDate = function (e, picker) {
        $scope[picker].open = true;
    };


    $scope.openCalendarEndDate = function (e, picker) {
        $scope[picker].open = true;
    };
    // destroy watcher
    /*   $scope.$on('$destroy', function () {
           unwatchMinMaxValues();
       });*/
    $scope.options = {
        showWeeks: false
    };
}]);
app.controller('liveTrackingController',['$scope','$stateParams','truckTrackingService',function($scope,$stateParams,truckTrackingService){
    $scope.message = "";
    $scope.loadLiveTracking = function(){
        truckTrackingService.getTruckLatestLocation($stateParams.truckNo,function(response){
            if(response.data.status){
                var latestLocation = response.data.data.latestLocation;
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 12,
                    center: new google.maps.LatLng(latestLocation.location.coordinates[1], latestLocation.location.coordinates[0]),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                var icon = {
                    url: '', // url
                    scaledSize: new google.maps.Size(50, 50),
                    labelOrigin: new google.maps.Point(20, -2)
                };
                if(latestLocation.isStopped){
                    icon.url = '/images/red_marker.svg'
                }else if(latestLocation.isIdle){
                    icon.url = '/images/orange_marker.svg'
                }else{
                    icon.url = '/images/green_marker.svg'
                }
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(latestLocation.location.coordinates[1], latestLocation.location.coordinates[0]),
                    icon: icon,
                    label: {
                        text: response.data.registrationNo,
                        color: "black",
                        fontSize: '15px',
                        labelClass: "labels"
                    },
                    map: map
                });
            } else {
                $scope.message = response.data.messages[0];
            }

        },function(errorCallback){});
    };
}]);
