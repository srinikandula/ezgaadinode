app.factory('InventoriesService', ['$http', '$cookies', function ($http, $cookies) {
    return {
        getInventories: function (pageable,success, error) {
            $http({
                url: '/v1/inventories/get',
                method: "GET",
                params:pageable
            }).then(success, error)
        },
        remove: function (id, success, error) {
            $http({
                url: '/v1/inventories/delete/' + id,
                method: "DELETE"
            }).then(success, error)
        },
        getCount:function (params,success,error) {
            $http({
                url: '/v1/inventories/getCount',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getInventory: function (id, success, error) {
            $http({
                url: '/v1/inventories/get/' + id,
                method: "GET"
            }).then(success, error)
        },
        deleteImage: function (params, success, error) {
            $http({
                url: '/v1/inventories/deleteImage',
                method: "DELETE",
                params: params
            }).then(success, error)
        },
        addInventory: function (params, success, error) {
            $http({
                url: '/v1/inventories/addInventory',
                method: "POST",
                data: params
            }).then(success, error)
        },
        updateInventory: function (params, success, error) {
            $http({
                url: '/v1/inventories/updateInventory',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        shareDetailsViaEmail:function(email,success,error){
            $http({
                url: '/v1/inventories/shareDetailsViaEmail',
                method: "GET",
                params:email
            }).then(success, error)
        },
    }
}]);

app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {
    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

app.controller('AddEditInventoryCtrl', ['$scope', 'InventoriesService', '$state', '$stateParams', 'Notification', 'PartyService', 'Upload', 'TripServices', '$uibModal', function ($scope, InventoriesService, $state, $stateParams, Notification, PartyService, Upload, TripServices, $uibModal) {
    $scope.title = 'Add Inventory';
    if ($stateParams.Id) {
        $scope.title = 'Update Inventory';
        InventoriesService.getInventory($stateParams.Id, function (successCallback) {
            if (successCallback.data.status) {
                $scope.inventory = successCallback.data.data;
            }
        }, function (errorCallback) {
        });
    }

    PartyService.getAllPartiesBySupplier(function (successCallback) {
        if (successCallback.data.status) {
            $scope.partyBySupplier = successCallback.data.parties;
        } else {
            Notification.error(successCallback.data.message);
        }
    });


    $scope.add_editInventory = function () {
        if ($stateParams.Id) {
            if ($scope.inventory.attachments.length > 0 ) {
                $scope.files.forEach(function (file) {
                    if(file.key){
                        $scope.inventory.attachments.push(file);
                    }
                })
            } else {
                $scope.inventory.attachments = $scope.files;
            }
            InventoriesService.updateInventory($scope.inventory, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Updated Successfully"});
                    $state.go('inventories');
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            });

        } else {
            $scope.inventory.attachments=$scope.files;
            InventoriesService.addInventory($scope.inventory, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Added Successfully"});
                    $state.go('inventories');
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

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
                    if (path) {
                        path = path;
                    }
                }, function () {
                });
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    };
    $scope.cancel = function () {
        $state.go('inventories');
    };
    $scope.deleteImage = function (key, index) {
        InventoriesService.deleteImage({inventoryId: $scope.inventory._id, key: key}, function (successCallback) {
            if (successCallback.data.status) {
                $scope.inventory.attachments.splice(index, 1);
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({message: message});
                });
            } else {
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
            Notification.error({message: err});
        });
    }
}
]);

app.controller('InventoryListCtrl', ['$scope', 'InventoriesService', '$state', 'Notification','TrucksService','NgTableParams', function ($scope, InventoriesService, $state, Notification,TrucksService,NgTableParams) {
    $scope.query = {
        truckName : '',
        inventory : ''
    };
    $scope.count = 0;
    $scope.shareDetailsViaEmail = function(){
        $scope.shareDetailsViaEmail=function(){
            swal({
                title: 'Share data using mail',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                return new Promise((resolve) => {
                    InventoriesService.shareDetailsViaEmail({
                    email:email,
                    vehicle:$scope.query.truckName.registrationNo,
                    inventory:$scope.query.inventory._id,
                    fromDate:$scope.fromDate,
                    toDate:$scope.toDate
                },function(success){
                    if (success.data.status) {
                        resolve()
                    } else {

                    }
                },function(error){

                })
            })

        },
            allowOutsideClick: false

        }).then((result) => {
                if (result.value) {
                swal({
                    type: 'success',
                    html: ' sent successfully'
                })
            }
        })
        }
    };
    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            inventory:tableParams.inventory,
            vehicle:tableParams.truckName,
            fromDate:$scope.fromDate,
            toDate:$scope.toDate
        };
        InventoriesService.getInventories(pageable,function (successCallback) {
           if (successCallback.data.status) {
               $scope.inventories = successCallback.data.data;
               tableParams.total(successCallback.totalElements);
               tableParams.data = $scope.inventories;
               $scope.currentPageOfinventories = $scope.inventories;
           }
       }, function (errorCallback) {
       });
    };
    $scope.init = function(){
        $scope.inventoryParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                if($scope.query.inventory){
                    params.inventory = $scope.query.inventory._id;
                }else{
                    params.truckName = $scope.query.truckName.registrationNo;
                }
                loadTableData(params);
            }
        });
    };
    $scope.getCount = function () {
        var params = {};
        if($scope.query.truckName){
            params.truckName = $scope.query.truckName.registrationNo;
        }else if($scope.query.inventory){
            params.inventory = $scope.query.inventory._id;
        }else if( $scope.fromDate &&  $scope.toDate){
            params.fromDate = $scope.fromDate;
            params.toDate = $scope.toDate;
        }else{
            params = {} ;
        }
      InventoriesService.getCount(params,function(successCallback){
          if (successCallback.data.status) {
              $scope.count = successCallback.data.data;
          }
          $scope.init();
      },function(errorCallback){

      });
    };
    $scope.getCount();

    $scope.goToEditPage = function (id) {
        $state.go('addInventory', {Id: id});
    };

    $scope.delete = function (id) {
        InventoriesService.remove(id, function (successCallback) {
            if (successCallback.data.status) {
                Notification.success({message: "deleted Successfully"});
            } else {
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (errorCallback) {
        });
    };
    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});
}]);