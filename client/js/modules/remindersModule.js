app.factory('ReminderService',['$http', '$cookies', function ($http, $cookies) {
    return{
        getReminders:function (pageable,success, error) {
            $http({
                url: '/v1/reminders/getAllReminders',
                method: "GET",
                params:pageable
            }).then(success, error)
        },
        addReminder:function (info,success, error) {
            $http({
                url: '/v1/reminders/addReminder',
                method: "POST",
                data:info
            }).then(success, error)
        },
        getReminder:function (id,success, error) {
            $http({
                url: '/v1/reminders/getReminder/'+id,
                method: "GET"
            }).then(success, error)
        },
        updateReminder:function (info,success, error) {
            $http({
                url: '/v1/reminders/updateReminder',
                method: "PUT",
                data:info
            }).then(success, error)
        },
        getReminderCount:function (success) {
            $http({
                url: '/v1/reminders/getCount',
                method: "GET",
            }).then(success)
        },
        getAllRemindersCount:function (success) {
            $http({
                url: '/v1/reminders/getAllRemindersCount',
                method: "GET",
            }).then(success)
        },
        deleteReminder:function (id,success, error) {
            $http({
                url: '/v1/reminders/deleteReminder/'+id,
                method: "DELETE"
            }).then(success, error)
        }
    }
}]);

app.controller("reminderListCtrl",['$scope','ReminderService','$state','Notification','$rootScope','NgTableParams',function($scope,ReminderService,$state,Notification,$rootScope,NgTableParams){
    $scope.count = 0;
    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting()
        };
        ReminderService.getReminders(pageable,function(successCallback){
            if(successCallback.data.status){
                $scope.reminders = successCallback.data.data;
                tableParams.total(successCallback.totalElements);
                tableParams.data = $scope.reminders;
                $scope.currentPageOfreminders = $scope.reminders;
            }
    },function(errorCallback){});
    };
    $scope.init = function () {
        $scope.reminderParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });

    };
    ReminderService.getReminderCount(function(successCallback){
        if(successCallback.data.status){
            $scope.remainder = successCallback.data.data;
        }
    });
    $scope.getCount = function(){
        ReminderService.getAllRemindersCount(function (successCallback) {
            if(successCallback.data.status){
                $scope.count = successCallback.data.data;
                $scope.init();
            }
        },function(errorCallbacck){});
    };

    $scope.goToEditPage = function (id) {
        $state.go('addReminder',{ID:id});
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
            ReminderService.deleteReminder(id, function (success) {
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
    $scope.getCount();


}]);

app.controller("remindersCtrl",['$scope','$rootScope','ReminderService','Notification','$state','$stateParams',function($scope,$rootScope,ReminderService,Notification,$state,$stateParams){
    $scope.reminder = {};
    $scope.job = {};
    $scope.trip = {};
    if($stateParams.ID){
        $scope.title = 'update Reminder';
        ReminderService.getReminder($stateParams.ID,function(successCallback){
            if(successCallback.data.status){
                if(successCallback.data.reminder.type === 'job'){
                    $scope.job = successCallback.data.job;
                    $scope.reminder = successCallback.data.reminder;
                    $scope.reminder.reminderDate = new Date($scope.reminder.reminderDate);
                }else if(successCallback.data.reminder.type === 'trip'){
                    $scope.trip = successCallback.data.trip;
                    $scope.reminder = successCallback.data.reminder;
                    $scope.reminder.reminderDate = new Date($scope.reminder.reminderDate);
                }else{
                    $scope.reminder = successCallback.data.reminder;
                    $scope.reminder.reminderDate = new Date($scope.reminder.reminderDate);
                }
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function (errorCallback) {});
    }else{
        $scope.title = 'Add Reminder';
    }

    $scope.AddorUpdateReminder = function(){
        var params = $scope.reminder;
        if($stateParams.ID){
            ReminderService.updateReminder(params,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"updated Successfully"});
                    $rootScope.$broadcast("reminderEdited");
                    $state.go('reminders');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){
            });
        }else{
            ReminderService.addReminder(params,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Added Successfully"});
                    $rootScope.$broadcast("reminderEdited");
                    $state.go('reminders');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){
                console.log(errorCallback);

            });
        }
    };
    $scope.cancel = function () {
        $state.go('reminders');
    }

}]);
