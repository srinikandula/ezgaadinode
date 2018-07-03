app.factory('InventoriesService',['$http', '$cookies', function ($http, $cookies) {
    return{
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
        deleteImage:function (params,success, error) {
            $http({
                url: '/v1/inventories/deleteImage',
                method: "DELETE",
                params:params
            }).then(success, error)
        }
    }
}]);

app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {
    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

app.controller('AddEditInventoryCtrl',['$scope','InventoriesService','$state','$stateParams','Notification','PartyService','Upload','TripServices','$uibModal',function($scope,InventoriesService,$state,$stateParams,Notification,PartyService,Upload,TripServices,$uibModal){
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
        var file;
        if($stateParams.Id){
            file = $scope.inventory.file;
            Upload.upload({
                url: '/v1/inventories/updateInventory',
                data: {
                    files:file,
                    content: $scope.inventory
                }
            }).then(function (successCallback,errorCallback) {
                if(successCallback.data.status){
                    Notification.success({message:"Updated Successfully"});
                    $state.go('inventories');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            });
        }else{
            file = $scope.inventory.file;
                Upload.upload({
                    url: '/v1/inventories/addInventory',
                    data: {
                        files:file,
                        content: $scope.inventory
                    }
                }).then(function (successCallback,errorCallback) {
                    if(successCallback.data.status){
                        Notification.success({message:"Added Successfully"});
                        $state.go('inventories');
                    }else{
                        successCallback.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                });
        }
    };
    $scope.viewAttachment = function (path) {
        TripServices.viewTripDocument({filePath: path}, function (success) {
            if (success.data.status) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'viewS3Image.html',
                    controller: 'ViewS3ImageCtrl',
                    size: 'sm',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        path: function () {
                            return success.data.data
                        }
                    }
                });
                modalInstance.result.then(function (path) {
                    if(path){
                        path = path;
                    }
                }, function () {});
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {})
    };
    $scope.cancel = function () {
        $state.go('inventories');
    };
    $scope.deleteImage = function (key,index) {
        InventoriesService.deleteImage({inventoryId:$scope.inventory._id, key: key}, function (successCallback) {
            if(successCallback.data.status){
                $scope.inventory.attachments.splice(index, 1);
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({message: message});
                });
            }else {
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        },function (err) {
            Notification.error({message: err});
        });
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