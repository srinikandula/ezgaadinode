app.controller('PendingBalanceCtrl', ['$scope', '$state', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification','TrucksService','PaymentsService', function ($scope, $state, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService,PaymentsService) {

    $scope.frieghtAmountPartyIdDetails=[];
    $scope.PartyAmountPartyIdDetails=[];

    $scope.getPendingBalance=function(){
      TripServices.getFrieghtSum(function(success){
          if(success.data.status){
              $scope.totalFreightAmount=success.data.amounts[0].total;
          }else{

          }
      },function(error){

      });
        PaymentsService.getTotalAmount(function(success){
            if(success.data.status){
                $scope.totalAmount=success.data.amounts[0].total;
            }else{

            }
        },function(error){

        });
    };


    $scope.getPartyDetailsPendingBalance=function(){
        TripServices.partyTotalFrieghtAmount(function(success){
           if(success.data.status){
              $scope.partiesTotalFrieghtDetails=success.data.amounts;
              console.log($scope.partiesTotalFrieghtDetails);
           } else{

           }
        },function(error){

        });
        PaymentsService.partyTotalAmount(function(success){
            if(success.data.status){
               $scope.partiesTotalAmountDetails=success.data.amounts;
                console.log($scope.partiesTotalAmountDetails);
            }else{

            }
        },function(error){

        });


    };

}]);