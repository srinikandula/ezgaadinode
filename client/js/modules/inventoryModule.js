app.factory('InventoryService',['$http', '$cookies', function ($http, $cookies) {
    return {
        addInventory: function (InventoryDetails, success, error) {
            $http({
                url: '/v1/trucks/add',
                method: "POST",
                data: InventoryDetails
            }).then(success, error)
        }, 

    }
}])
app.controller("inventoryController",['$scope','$http','InventoryService',function($scope,$http,InventoryService)
{
    $scope.inventory=
    {
        id:'',
        name:'',
        purchasedate:'',
        installationdate:'',
        error:[]
    };
   
    
 $scope.addorupdateinventory=function ()
{ 
    var params = $scope.inventory;
        params.errors = [];
    InventoryService.addInventory(params,function(success){

        if(sucess.data.status)
        {
            $state.go('inventorys')
            notification.success({message:'Inventorys updated successfully'})
        }
        else{
            params.error=success.data.message;
        }
    })
 }
}])