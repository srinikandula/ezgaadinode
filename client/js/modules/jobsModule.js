app.factory('JobsService',['$http', '$cookies', function ($http, $cookies) {
    return {
        getAllJobs: function (params,success, error) {
            $http({
                url: '/v1/jobs/getAllJobs',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getJob:function (id,success, error) {
            $http({
                url: '/v1/jobs/getJob/'+id,
                method: "GET"
            }).then(success, error)
        },
        getRecords:function (params,success, error) {
            $http({
                url: '/v1/jobs/getPreviousJobsForVehicle',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getCount: function (params,success, error) {
            $http({
                url: '/v1/jobs/total/count',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getJobsForInventory:function (params,success, error) {
            $http({
                url: '/v1/jobs/getJobsForInventory',
                method: "GET",
                params:params
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
        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/jobs/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getAllPartsLocation:function(success,error){
            $http({
                url: '/v1/jobs/getAllPartsLocations',
                method: "GET"
            }).then(success, error)
        },
        getJobForSelectedPartLocation:function(params,success,error){
            $http({
                url: '/v1/jobs/getJobForPartLocation',
                method: "GET",
                params:params
            }).then(success, error)
        }
    }
}]);

app.controller('Add_EditJobController',['$scope','Upload','Notification','$state','ExpenseMasterServices','TrucksService','InventoriesService','$stateParams','JobsService','TripServices','$uibModal','$rootScope',function($scope,Upload,Notification,$state,ExpenseMasterServices,TrucksService,InventoriesService,$stateParams,JobsService,TripServices,$uibModal,$rootScope){
    $scope.title = 'Add Job';
    $scope.reminder = {};
    $scope.records = {};
    $scope.vehicle = '';
    $scope.parts = [];
    $scope.jobsForSelectedPart = [];
    $scope.job = {};
    $scope.selectedInventoryName = null;

    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});

    InventoriesService.getInventories({},function(successCallback){
        if(successCallback.data.status){
            $scope.inventories = successCallback.data.data;
        }
    },function(errorCallback){});

    JobsService.getAllPartsLocation(function(successCallback){
        if(successCallback.data.status){
           $scope.parts =  successCallback.data.data;
        }
    },function(errorCallback){});

    $scope.getRecords = function(vehicle){
        var params = {};
        if($stateParams.ID){
            params.vehicleId = $scope.job.vehicle._id;
            params.jobId = $stateParams.ID;
            $scope.vehicle = $scope.job.vehicle.registrationNo ;
        }else{
            params.vehicleId = vehicle._id;
            $scope.vehicle = vehicle.registrationNo ;
        }
        JobsService.getRecords(params,function(successCallback){
            $scope.records = successCallback.data.records;
        },function(errorCallback){});
    };
    $scope.getJobForSelectedPartLocation = function (partLocation,vehicle) {
        var params = {};
        params.partLocation = partLocation;
        params.vehicle = vehicle._id;
        if(partLocation !== 'others'){
            if(!vehicle){
                Notification.error("Please select Vehicle");
            }
                JobsService.getJobForSelectedPartLocation(params,function(successCallback){
                    $scope.jobsForSelectedPart = successCallback.data.data;
                },function(errorCallback){});
        }
    };

    $scope.getJobsForInventory = function(inventory){
        $scope.selectedInventoryName = inventory.name;
        var params = {inventoryId:inventory._id,jobId:$stateParams.ID};
        JobsService.getJobsForInventory(params,function(successCallback){
            $scope.jobsForInventory = successCallback.data.records;
            $scope.inventory = $scope.job.inventory.name ;
        },function(errorCallback){});
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

                $scope.getRecords($stateParams.ID, $scope.job.vehicle._id);
                $scope.getJobsForInventory($scope.job.inventory);
                if($scope.job.partLocation !== 'others'){
                    var params = {};
                    params.partLocation = $scope.job.partLocation;
                    params.vehicle = $scope.job.vehicle._id;
                    params.jobId = $stateParams.ID;
                    JobsService.getJobForSelectedPartLocation(params,function(successCallback){
                        $scope.jobsForSelectedPart = successCallback.data.data;
                    },function(errorCallback){});
                }
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
                    success.data.errors.forEach(function (message) {
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

app.controller('JobsListController',['$scope','$state','JobsService','Notification','TrucksService','InventoriesService','NgTableParams',function($scope,$state,JobsService,Notification,TrucksService,InventoriesService,NgTableParams){
   $scope.query = {
       truckName:'',
       inventory:''
   };
    $scope.count = 0;
    $scope.shareDetailsViaEmail = function(){
        $scope.shareDetailsViaEmail=function(){
            swal({
                title: 'Share jobs data using mail',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                return new Promise((resolve) => {
                    JobsService.shareDetailsViaEmail({
                    email:email,truckName:$scope.query.truckName._id,
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
    $scope.goToEditPage = function(id){
        $state.go('addJob',{ID:id});
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
            JobsService.deleteJob(id, function (success) {
                if (success.data.status) {
                    swal(
                        'Deleted!',
                        'Job deleted successfully.',
                        'success'
                    );
                    $scope.getCount();
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
    })
    };
    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            truckName:tableParams.truckName,
            inventory:tableParams.inventory,
            fromDate:$scope.fromDate,
            toDate:$scope.toDate
        };
        JobsService.getAllJobs(pageable,function(successCallback){
            if(successCallback.data.status){
                $scope.jobs = successCallback.data.data;
                tableParams.total(successCallback.totalElements);
                tableParams.data = $scope.jobs;
                $scope.currentPageOfJobs = $scope.jobs;
            }
        },function(errorCallback){});
    };

    $scope.init = function () {
        $scope.jobParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                if($scope.query.truckName){
                    params.truckName = $scope.query.truckName._id;
                }else{
                    params.inventory = $scope.query.inventory._id;
                }
                loadTableData(params);
            }
        });

    };
    $scope.getCount = function(){
        var params = {};
        if($scope.query.truckName){
            params.truckName = $scope.query.truckName._id;
        }else if($scope.query.inventory){
            params.inventory = $scope.query.inventory._id;
        }else if( $scope.fromDate &&  $scope.toDate){
            params.fromDate = $scope.fromDate;
            params.toDate = $scope.toDate;
        }else{
            params = {};
        }
        JobsService.getCount(params,function(successCallback){
            if(successCallback.data.status){
                $scope.count = successCallback.data.data;
                $scope.init();
            }
        },function(errorCallback){

        });
    };
    $scope.getCount();
    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});
    InventoriesService.getInventories({},function(successCallback){
        if(successCallback.data.status){
            $scope.inventories = successCallback.data.data;
        }
    },function(errorCallback){});
}]);

app.controller('ViewS3ImageCtrl', ['$scope', '$uibModalInstance', 'path', function ($scope, $uibModalInstance, path) {
    $scope.path = path;
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);