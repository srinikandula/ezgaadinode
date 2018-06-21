app.factory('InventoriesService',['$http', '$cookies', function ($http, $cookies) {
    return{
        addInventory: function (params, success, error) {
            $http({
                url: '/v1/inventories/addInventory',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getInventories:function (success, error) {
            $http({
                url: '/v1/inventories/get',
                method: "GET"
            }).then(success, error)
        },
        remove:function (id,success, error) {
            $http({
                url: '/v1/inventories/delete/'+id,
                method: "DELETE"
            }).then(success, error)
        },
        getInventory:function (id,success, error) {
            $http({
                url: '/v1/inventories/get/'+id,
                method: "GET"
            }).then(success, error)
        },
        updateInventory:function (params,success, error) {
            $http({
                url: '/v1/inventories/updateIventory',
                method: "PUT",
                data:params
            }).then(success, error)
        }
    }
}]);

app.controller('AddEditInventoryCtrl',['$scope','InventoriesService','$state','$stateParams','Notification','PartyService',function($scope,InventoriesService,$state,$stateParams,Notification,PartyService){
    $scope.title = 'Add Inventory';
    if($stateParams.Id){
        $scope.title = 'Update Inventory';
        InventoriesService.getInventory($stateParams.Id,function(successCallback){
            if(successCallback.data.status){
                $scope.inventory = successCallback.data.data;
            }
        },function(errorCallback){});
    }

    PartyService.getAllPartiesBySupplier (function (successCallback) {
        if(successCallback.data.status){
            $scope.partyBySupplier = successCallback.data.parties;
        }else {
            Notification.error(successCallback.data.message);
        }
    });


    $scope.add_editInventory = function(){
        var params = $scope.inventory;
        console.log("params...",params);
        if($stateParams.Id){
            InventoriesService.updateInventory(params,function(successCallback){
                if(successCallback.data.status){
                    $state.go('inventories');
                    Notification.success({message:"Updated Successfully"});
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){

            });
        }else{
            InventoriesService.addInventory(params,function(successCallback){
                if(successCallback.data.status){
                    $state.go('inventories');
                    Notification.success({message:"Added Successfully"});
                }else{
                    successCallback.data.errors.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }

            },function(errorCallback){

            });
        }

    };
    $scope.cancel = function () {
        $state.go('inventories');
    }
}]);

app.controller('InventoryListCtrl',['$scope','InventoriesService','$state','Notification',function($scope,InventoriesService,$state,Notification){

    InventoriesService.getInventories(function(successCallback){
        if(successCallback.data.status){
            $scope.inventories = successCallback.data.data;
        }
    },function(errorCallback){});

    $scope.goToEditPage = function (id) {
        $state.go('addInventory',{Id:id});

    };
    $scope.delete = function (id) {
        InventoriesService.remove(id,function(successCallback){
            if(successCallback.data.status){
                Notification.success({message:"deleted Successfully"});
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){});
    };

}]);