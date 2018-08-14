app.factory('TripSettlementService',['$http', '$cookies', function ($http, $cookies) {
    return {
        addTripSettlement: function (tripSettlementDetails, success, error) {
            $http({
                url: '/v1/tripSettlements/addTripSettlement',
                method: "POST",
                data: tripSettlementDetails
            }).then(success, error)
        },
        getAllTripSettlements:function(params,success,error){
            $http({
                url: '/v1/tripSettlements/getTripSettlements',
                method: "GET",
                params:params
            }).then(success, error)
        },
        deleteTripSettlement:function(id,success,error){
            $http({
                url: '/v1/tripSettlements/deleteTripSettlement/'+id,
                method: "DELETE"
            }).then(success, error)
        },
        getTripSettlement:function(id,success,error){
            $http({
                url: '/v1/tripSettlements/getTripSettlement/'+id,
                method: "GET"
            }).then(success, error)
        },
        updateTripSettlement:function (tripSettlementDetails, success, error) {
            $http({
                url: '/v1/tripSettlements/updateTripSettlement',
                method: "POST",
                data: tripSettlementDetails
            }).then(success, error)
        }
    }
}]);
app.controller('addEditTripSettlement', ['$scope' ,'TrucksService','DriverService','Notification','$state','TripSettlementService','$stateParams',function ($scope,TrucksService,DriverService,Notification,$state,TripSettlementService,$stateParams) {
    $scope.pageTitle = "Add TripSettlement";
    $scope.truckRegNo = '';
    $scope.driver = '';
    $scope.tripSettlement = {
        trip:[{
          startFrom:undefined,
          startTo:undefined,
          startFromDate:undefined,
          startToDate:undefined,
          startKm:undefined
          
        }],
        cashAdvances:[{
            cashAdvanceFirstPoint:undefined,
        }],
        dieselLiters:[{
            dieselFirstPointLiters:undefined,
            dieselFirstPointAmount:undefined,
            pumpFirstPoint:undefined,
            billNoFirstPoint:undefined
        }]
    };
   

    TrucksService.getAllTrucksForFilter(function (success) {
        if (success.data.status) {
            $scope.trucks = success.data.trucks;
        } else {
            success.data.messages.forEach(function (message) {
                Notification.error(message);
            });
        }
    },function(error){
        Notification.error(error);
    });

    DriverService.getAllDriversForFilter(function (success) {
        if (success.data.status) {
            $scope.driversList = success.data.drivers;
        } else {
            success.data.messages.forEach(function (message) {
                Notification.error({ message: message });
            });
        }
    },function(error){
        Notification.error(error);
    });
    if($stateParams.id){
        $scope.pageTitle = 'Edit Trip Settlement';
        TripSettlementService.getTripSettlement($stateParams.id,function(successCallback){
            if(successCallback.data.status){
                $scope.tripSettlement = successCallback.data.data;
                $scope.tripSettlement.date = new Date($scope.tripSettlement.date);
                $scope.driver = $scope.tripSettlement.driverName.fullName;
                var truck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.tripSettlement.truckNo;
                });
                if (truck) {
                    $scope.truckRegNo = truck.registrationNo;
                }

                for(var i = 0;i < $scope.tripSettlement.trip.length ; i++){
                    $scope.tripSettlement.trip[i].startFromDate = new Date($scope.tripSettlement.trip[i].startFromDate);
                    $scope.tripSettlement.trip[i].startToDate = new Date($scope.tripSettlement.trip[i].startToDate);
                    $scope.tripSettlement.trip[i].endFromDate = new Date($scope.tripSettlement.trip[i].endFromDate);
                    $scope.tripSettlement.trip[i].endToDate = new Date($scope.tripSettlement.trip[i].endToDate);
                }
            }
        },function(errorCallback){

        });
    }

    $scope.addFromAndTo = function () {
     
        if (!$scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startFrom||
            !$scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startTo||
            !$scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startFromDate||
            !$scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startToDate||
            !$scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startKm) {
            Notification.error("Please enter details");
        }else {
            $scope.tripSettlement.trip.push({
                startFrom:undefined,
                startTo:undefined,
                startFromDate:undefined,
                startToDate:undefined,
                startKm:undefined,
               
            });
        }
    };
    $scope.addCashAdvances = function () {
        if (!$scope.tripSettlement.cashAdvances[$scope.tripSettlement.cashAdvances.length - 1].cashAdvanceFirstPoint) {
            Notification.error("Please enter details");
        }else {
            $scope.tripSettlement.cashAdvances.push({
               
                cashAdvanceFirstPoint:undefined
            });
        }
    };
    $scope.addDiselLiters = function () {
        if (!$scope.tripSettlement.dieselLiters[$scope.tripSettlement.dieselLiters.length - 1].dieselFirstPointLiters||
            !$scope.tripSettlement.dieselLiters[$scope.tripSettlement.dieselLiters.length - 1].dieselFirstPointAmount||
            !$scope.tripSettlement.dieselLiters[$scope.tripSettlement.dieselLiters.length - 1].pumpFirstPoint||
            !$scope.tripSettlement.dieselLiters[$scope.tripSettlement.dieselLiters.length - 1].billNoFirstPoint) {
            Notification.error("Please enter details");
        }else {
            $scope.tripSettlement.dieselLiters.push({
                dieselFirstPointLiters:undefined,
                dieselFirstPointAmount:undefined,
                pumpFirstPoint:undefined,
                billNoFirstPoint:undefined
               
            });
        }
    };
    
    $scope.delete = function (index) {
        if ($scope.tripSettlement.trip.length > 1) {
            $scope.tripSettlement.trip.splice(index, 1);
        } else {
            $scope.tripSettlement.error.push("Please add at least one trip lane");
        }

    };

    $scope.cashDelete = function (index) {
        if ($scope.tripSettlement.cashAdvances.length > 1) {
            $scope.tripSettlement.cashAdvances.splice(index, 1);
        } else {
            $scope.tripSettlement.error.push("Please add at least one trip lane");
        }

    };
    $scope.diselDelete = function (index) {
        if ($scope.tripSettlement.dieselLiters.length > 1) {
            $scope.tripSettlement.dieselLiters.splice(index, 1);
        } else {
            $scope.tripSettlement.error.push("Please add at least one trip lane");
        }

    };
    $scope.cancel = function(){
        $state.go('tripSettlement');
    };
    $scope.addOrUpdateTripSettlement = function(){
        if($stateParams.id){
            TripSettlementService.updateTripSettlement($scope.tripSettlement,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Updated Successfully"});
                    $state.go('tripSettlement');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){

            });
        }else{
            TripSettlementService.addTripSettlement($scope.tripSettlement,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Added Successfully"});
                    $state.go('tripSettlement');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){

            });
        }
    };


}]);
app.controller("tripSettlementsController",['$scope','TripSettlementService','Notification','$state',function($scope,TripSettlementService,Notification,$state){

    $scope.getAllTripSettlements = function(){
        var params = {};
        params.fromDate = $scope.fromDate;
        params.toDate = $scope.toDate;
        TripSettlementService.getAllTripSettlements(params,function(successCallback){
            if(successCallback.data.status){
                $scope.tripSettlements = successCallback.data.data;
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){});
    };

    $scope.delete = function(id){
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
            TripSettlementService.deleteTripSettlement(id, function (success) {
                if (success.data.status) {
                    swal(
                        'Deleted!',
                        'Trip settlement deleted successfully.',
                        'success'
                    );
                    $scope.getAllTripSettlements();
                } else {
                    success.data.messages.forEach(function (message) {
                        swal(
                            'Deleted!',
                            message,
                            'error'
                        );
                    });
                }
            }, function (err) {

            });
        }
    });
    };
    $scope.getAllTripSettlements();
    $scope.goToEditPage = function(id){
        $state.go('addTripSettlement',{id:id});
    };
    $scope.generatePdf = function(tripSettlementId){
        console.log("generate pdf...");
        window.open('/v1/tripSettlements/generatePDF/' + tripSettlementId );
    };
}]);