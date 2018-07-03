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
        }
    }
}]);

app.controller('Add_EditJobController',['$scope','Upload','Notification','$state','ExpenseMasterServices','TrucksService','InventoriesService','$stateParams','JobsService','TripServices','$uibModal',function($scope,Upload,Notification,$state,ExpenseMasterServices,TrucksService,InventoriesService,$stateParams,JobsService,TripServices,$uibModal){
    $scope.title = 'Add Job';
    $scope.reminder = {};

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
            }
        },function(errorCallback){});

    }
    $scope.add_editJob = function(){
        var file = $scope.job.file;
        if($stateParams.ID){
            Upload.upload({
                url: '/v1/jobs/updateJob',
                data: {
                    files:file,
                    content:$scope.job
                }
            }).then(function (successCallback,errorCallback) {
                if(successCallback.data.status){
                    Notification.success({message:"updated Successfully"});
                    $state.go('jobs');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            });
        }else{
            Upload.upload({
                url: '/v1/jobs/addJob',
                data: {
                    files:file,
                    content:$scope.job
                }
            }).then(function (successCallback,errorCallback) {
                if(successCallback.data.status){
                    Notification.success({message:"Added Successfully"});
                    $state.go('jobs');
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