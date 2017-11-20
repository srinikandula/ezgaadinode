app.factory('TrackMapServices', function ($http) {
    return {
        getEventsData: function (vehicleNumber, success, error) {
            $http({
                url: '/v1/events/get/trackEvents/'+vehicleNumber,
                method: "GET",
            }).then(success, error)
        }
    }
});

app.controller('ShowTrackMapCtrl', ['$scope', '$uibModal','TrackMapServices','TrucksService','Notification', function ($scope, $uibModal,TrackMapServices,TrucksService, Notification) {

    $scope.eventData = null;
    $scope.showOnlyStops = false;
    $scope.totalSpeed = 0;
    $scope.trucks = ["AP10V1335","AP11X7832","AP29TB5417","AP29TB5903","AP29U2342","AP29U2533","AP31TH1041","HR55N1311"];

    // TrucksService.getGroupTrucks(1, function (success) {
    //     if (success.data.status) {
    //         $scope.trucks = success.data.trucks;
    //         var selectedTruck = _.find( $scope.trucks, function (truck) {
    //             return truck._id.toString() === $scope.trip.registrationNo;
    //         });
    //         if(selectedTruck){
    //             $scope.truckRegNo = selectedTruck.registrationNo;
    //         }
    //     } else {
    //         success.data.messages(function (message) {
    //             Notification.error(message);
    //         });
    //     }
    // }, function (error) {
    //
    // });

    $scope.loadMap = function(){
        $scope.lat = $scope.eventData[$scope.eventData.length/2].latitude;
        $scope.long = $scope.eventData[$scope.eventData.length/2].longitude;
        var myOptions = {
            center: new google.maps.LatLng($scope.lat, $scope.long),
            zoom: 9,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),myOptions);

        if(!$scope.showOnlyStops){
            $scope.totalSpeed = 0;
            for(var i=0;i<$scope.eventData.length;i++){
                $scope.lat = $scope.eventData[i].latitude;
                $scope.long = $scope.eventData[i].longitude;
                var latlng=new google.maps.LatLng($scope.lat, $scope.long);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: "marker"+(i+1)+": "+$scope.eventData[i].speed
                });
                $scope.totalSpeed += $scope.eventData[i].speed;
            }
        }
        else {
            for(var i=0;i<$scope.eventData.length;i++){
                if($scope.eventData[i].speed == 0){
                    $scope.lat = $scope.eventData[i].latitude;
                    $scope.long = $scope.eventData[i].longitude;
                    var latlng=new google.maps.LatLng($scope.lat, $scope.long);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: "marker : "+(i+1)
                    });
                    }
                else{

                }
            }
        }
        $scope.averageSpeed = $scope.totalSpeed/$scope.eventData.length
    };

    $scope.getData = function (regNo) {
        TrackMapServices.getEventsData(regNo,function (success) {
            if (success.data.status) {
                $scope.eventData = success.data.results;

                $scope.loadMap();
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {
            Notification.error(error);
        });
    };

    $scope.selectTruckId = function (truck) {
        $scope.registrationNo = truck;
        $scope.getData($scope.registrationNo);
    };
    $scope.getData($scope.registrationNo);
}]);
