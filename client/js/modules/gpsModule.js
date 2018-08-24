app.factory('GpsService',['$http', function ($http) {
    return {
        addDevice: function (object, success, error) {
            $http({
                url: '/v1/gps/addDevice',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getDevices:function (success,error) {
            $http({
                url: '/v1/gps/getDevices',
                method: "GET",
            }).then(success, error)
        },
        gpsTrackingByMapView:function (success,error) {
            $http({
                url: '/v1/gps/gpsTrackingByMapView',
                method: "GET",
            }).then(success, error)
        },
        getTruckReport:function (body,success,error) {
            $http({
                url: '/v1/gps/getTruckReport/'+body.startDate+'/'+body.endDate+'/'+body.truckNo,
                method: "GET"
            }).then(success, error)
        },
        shareTripDetailsByVechicleViaEmail:function (body,success,error) {
            $http({
                url: '/v1/gps/shareTripDetailsByVechicleViaEmail',
                method: "POST",
                data: body
            }).then(success, error)
        }
    }
}]);

app.controller('GpsCtrl', ['$scope', '$state', 'GpsService', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, GpsService, Notification, NgTableParams, paginationService,TrucksService) {

    $scope.getDevices=function () {
        GpsService.getDevices(function (success) {
            if(success.data.status){
                $scope.devicesList=success.data.devices;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function (error) {

        })
    };

    $scope.reportParams={
        startDate:'',
        endDate:'',
        truckNo:'',
        currentElement:0
    };

    function reportParamsValidation() {
        if(!$scope.reportParams.startDate){
            Notification.error({ message: "Please select a start date" });
            return false;
        }else if(!$scope.reportParams.endDate){
            Notification.error({ message: "Please select a end date" });
            return false;
        }else if(!$scope.reportParams.truckNo.registrationNo && !$scope.reportParams.truckNo){
            Notification.error({ message: "Please select a truck" });
            return false;
        }else{
            return true;
        }
    }

    $scope.downloadReport = function () {
        if(reportParamsValidation()){
            var body=$scope.reportParams;
            window.open('/v1/gps/downloadReport/'+body.truckNo+'/'+body.startDate+'/'+body.endDate);
        }
    };

    $scope.getTruckReport = function () {
        if(reportParamsValidation()) {
            $scope.reportParams.truckNo=$scope.reportParams.truckNo.registrationNo;
            GpsService.getTruckReport($scope.reportParams, function (success) {
                if (success.data.status) {
                    $scope.truckReports = success.data.results;
                } else {
                    $scope.truckReports = [];
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        }
    };


    $scope.shareTripDetailsByVechicleViaEmail = function () {
        swal({
            title: 'Share trip data using email',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                GpsService.shareTripDetailsByVechicleViaEmail({
                fromDate: $scope.reportParams.startDate,
                toDate: $scope.reportParams.endDate,
                regNumber: $scope.reportParams.truckNo.registrationNo,
                email: email,
            }, function (success) {
                if (success.data.status) {
                    resolve()
                } else {
                    success.data.messages.forEach(function (message) {
                        swal.showValidationError(message);
                    });
                }
            }, function (error) {
            })
        })
    },
        allowOutsideClick: false
    }).then((result) => {
            if (result.value) {
            swal({
                type: 'success',
                html: 'Trip details sent successfully'
            })
        }
    })
    };


    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    };
    function initializeDevice() {
        $scope.device={
            deviceId:"",
            truckId:"",
            errors:[],
            success:[]
        }
    }
    initializeDevice();
    $scope.addDevice=function () {
        console.log('devices');
        var params=$scope.device;
        params.errors = [];
        if(!params.deviceId){
            params.errors.push('Please provide device id');
        }
        if(!params.truckId){
            params.errors.push('select truck number');
        }
        if(!params.simNumber){
            params.errors.push('select truck number');
        }
        if(!params.imei){
            params.errors.push('select truck number');
        }

        if (!params.errors.length) {
            GpsService.addDevice($scope.device,function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success({message: message});
                    });
                    $scope.getDevices();
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        }
    }

    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
        },function (error) {

        })
    }

    $scope.trucks=[];
    $scope.getAllTrucksForAccount = function (search) {
        TrucksService.getAllTrucksForAccount({
            name: search,
            size: $scope.reportParams.currentElement
        },function (success) {
            if(success.data.status){
                $scope.trucks=success.data.data;
            }else{
                $scope.trucks=[];
            }
        },function (error) {

        })
    };

    $scope.loadMore = function () {
        $scope.reportParams.currentElement = $scope.reportParams.currentElement + 10;
        TrucksService.getAllTrucksForAccount({
            name: $scope.reportParams.truckNo,
            size: $scope.reportParams.currentElement
        }, function (success) {
            if (success.data.status) {
                if(success.data.data>0){
                    $scope.trucks=$scope.trucks.concat(success.data.data);

                }
            } else {
                $scope.trucks = [];
            }

        }, function (error) {

        });
    };


    $scope.getAllTrucksForAccount('');

}]);