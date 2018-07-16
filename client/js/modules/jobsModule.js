app.factory('JobsService',['$http', '$cookies', function ($http, $cookies) {
    return {
        getAllJobs: function (success, error) {
            $http({
                url: '/v1/jobs/getAllJobs',
                method: "GET"
            }).then(success, error)
        },
        getJob:function (id,success, error) {
            $http({
                url: '/v1/jobs/getJob/'+id,
                method: "GET"
            }).then(success, error)
        },
        getRecords:function (vehicle,success, error) {
            $http({
                url: '/v1/jobs/getRecords',
                method: "GET",
                params:vehicle
            }).then(success, error)
        },
        getJobsForInventory:function (inventory,success, error) {
            $http({
                url: '/v1/jobs/getJobsForInventory',
                method: "GET",
                params:inventory
            }).then(success, error)
        },
        deleteJob:function(id,success,error){
            $http({
                url: '/v1/jobs/deleteJob/'+id,
                method: "DELETE"
            }).then(success, error)
        },
        deleteImage:function (params,success, error) {
            $http({
                url: '/v1/jobs/deleteImage',
                method: "DELETE",
                params:params
            }).then(success, error)
        },
        searchBytruckName:function (truckName,success, error) {
            $http({
                url: '/v1/jobs/searchByTruck/'+truckName,
                method: "GET",
            }).then(success, error)
        },
        addJob:function (params,success, error) {
            $http({
                url: '/v1/jobs/addJob',
                method: "POST",
                data:params
            }).then(success, error)
        },
        updateJob:function (params,success, error) {
            $http({
                url: '/v1/jobs/updateJob',
                method: "PUT",
                data:params
            }).then(success, error)
        }
    }
}]);

app.controller('Add_EditJobController',['$scope','Upload','Notification','$state','ExpenseMasterServices','TrucksService','InventoriesService','$stateParams','JobsService','TripServices','$uibModal','$rootScope',function($scope,Upload,Notification,$state,ExpenseMasterServices,TrucksService,InventoriesService,$stateParams,JobsService,TripServices,$uibModal,$rootScope){
    $scope.title = 'Add Job';
    $scope.reminder = {};
    $scope.records = {};
    $scope.vehicle = '';

    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});

    InventoriesService.getInventories(function(successCallback){
        if(successCallback.data.status){
            $scope.inventories = successCallback.data.data;
        }
    },function(errorCallback){});

    $scope.getRecords = function(vehicle){
        JobsService.getRecords(vehicle,function(successCallback){
            $scope.records = successCallback.data.records;
            $scope.vehicle = successCallback.data.vehicle;
        },function(errorCallback){

        });
    };

    $scope.getJobsForInventory = function(inventory){
        JobsService.getJobsForInventory(inventory,function(successCallback){
            $scope.jobsForInventory = successCallback.data.records;
            $scope.inventory = successCallback.data.inventory;
        },function(errorCallback){

        });
    };

    function getExpenses(params){
        ExpenseMasterServices.getExpenses(params, function (success) {
            if (success.data.status) {
                $scope.expenses = success.data.expenses;

            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }
    if($stateParams.ID){
        $scope.title = 'Update Job';
        JobsService.getJob($stateParams.ID,function(successCallback){
            if(successCallback.data.status){
                $scope.job = successCallback.data.data;
                $scope.job.date = new Date($scope.job.date);
                $scope.job.reminderDate = new Date($scope.job.reminderDate);
                $scope.getRecords($scope.job.vehicle);
                $scope.getJobsForInventory($scope.job.inventory);
            }
        },function(errorCallback){});

    };
    $scope.add_editJob = function(){
        if($stateParams.ID){
            if ($scope.job.attachments.length > 0 ) {
                $scope.files.forEach(function (file) {
                    if(file.key){
                        $scope.job.attachments.push(file);
                    }
                })
            } else {
                $scope.job.attachments = $scope.files;
            }
            JobsService.updateJob($scope.job,function (success) {
                if(success.data.status){
                    Notification.success({message:"updated Successfully"});
                    $rootScope.$broadcast("reminderEdited");
                    $state.go('jobs');
                }else{
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function (error) {

            });
        }else{
            $scope.job.attachments=$scope.files;
            JobsService.addJob($scope.job,function (success) {
                if(success.data.status){
                    Notification.success({message:"Added Successfully"});
                    $rootScope.$broadcast("reminderEdited");
                    $state.go('jobs');
                }else{
                    success.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function (error) {

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
        }, function (err) {

        })
    };
    $scope.deleteImage = function (key,index) {
        JobsService.deleteImage({jobId:$scope.job._id, key: key}, function (successCallback) {
            if(successCallback.data.status){
                $scope.job.attachments.splice(index, 1);
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({message: message});
                });
            }else {
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        },function (err) {

        });
    };
    $scope.cancel = function(){
        $state.go('jobs');
    };
    getExpenses();

}]);

app.controller('JobsListController',['$scope','$state','JobsService',function($scope,$state,JobsService){

    $scope.goToEditPage = function(id){
        $state.go('addJob',{ID:id});
    };
    JobsService.getAllJobs(function(successCallback){
        if(successCallback.data.status){
            $scope.jobs = successCallback.data.data;
        }
    },function(errorCallback){

    });

    $scope.searchByTruckName = function(truckName){
        JobsService.searchBytruckName(truckName,function(successCallback){
            $scope.jobs = successCallback.data.data;
            },function(errorCallback){});

    };

    $scope.delete = function(id){
        JobsService.deleteJob(id,function(successCallback){

        },function(errorCallback){

        });
    }

}]);

app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {
    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);