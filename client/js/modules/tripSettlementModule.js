app.factory('TripSettlement',['$http', '$cookies', function ($http, $cookies) {
    return {
        addTripSettlement: function (tripSettlement, success, error) {
            $http({
                url: '/v1/tripSettlement/',
                method: "POST",
                data: tripSettlement
            }).then(success, error)
        }
    }
    }]);
app.controller('addEditTripSettlement', ['$scope' ,'TrucksService','DriverService','Notification', function ($scope,TrucksService,DriverService,Notification) {

    $scope.pageTitle = "Add TripSettlement";
    $scope.tripSettlement = {
        truckNo:'',
        driverName:'',
        date:'',
      trip:[{
          index: 0,
          startFrom:"",
          startTo:"",
          startFromDate:'',
          startEndDate:'',
          startKm:'',
          from:'',
          to:'',
          fromDate:'',
          toDate:'',
          km:''

      }],
        totalKm:'',
        cashAdvanceFirstPoint:'',
        cashAdvanceSecondPoint:'',
        diselFirstPointLiters:'',
        diselFirstPointAmount:'',
        pump:'',
        billNo:'',
        diselSecondPointLiters:'',
        diselsecondpointAmount:'',
        pump:'',
        billNo:'',
        additionalAmountGiven:'',
        totalAdvnceToDriver:'',
        expensesAsPerKm:'',
        grossRecivablePaybledriver:'',
        otherExpenses:'',
        netAmountRecivablePayble:'',
        tripSheetNo:'',


    };

    $scope.addFromAndTo = function () {
        var length = $scope.party.tripLanes.length;
        console.log()
        if ($scope.tripSettlement.trip[$scope.tripSettlement.trip.length - 1].startFrom ) {
            Notification.error("Please enter details");

        } else {
            console.log("hiii")
            $scope.tripSettlement.trip.push({
                startFrom:"",
                startTo:"",
                startFromDate:'',
                startEndDate:'',
                startKm:'',
                from:'',
                to:'',
                fromDate:'',
                toDate:'',
                km:'',
                index:length
            });

        }
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
    },function(error)
    {
        Notification.error(error);
    });
    $scope.addorUpdateTripSettlement=function(){
            var params=$scope.trip;


    }
}]);