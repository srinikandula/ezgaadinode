app.factory('ReminderService',['$http', '$cookies', function ($http, $cookies) {
    return{
        getReminders:function (success, error) {
            $http({
                url: '/v1/reminders/getAllReminders',
                method: "GET"
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
        deleteReminder:function (id,success, error) {
            $http({
                url: '/v1/reminders/deleteReminder/'+id,
                method: "DELETE"
            }).then(success, error)
        }
    }
}]);

app.controller("reminderListCtrl",['$scope','ReminderService','$state','Notification',function($scope,ReminderService,$state,Notification){

    ReminderService.getReminders(function(successCallback){
        if(successCallback.data.status){
            $scope.reminders = successCallback.data.data;
        }
    });

    ReminderService.getReminderCount(function(successCallback){
        if(successCallback.data.status){
            $scope.remainder = successCallback.data.data;
            console.log($scope.remainder);
        }
    });

    $scope.goToEditPage = function (id) {
        $state.go('addReminder',{ID:id});
    };
    $scope.delete = function(id){
        ReminderService.deleteReminder(id,function(successCallback){
            if(successCallback.data.status){
                Notification.success({message:"Deleted Successfully"});
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){});
    }


}]);

app.controller("remindersCtrl",['$scope','$rootScope','ReminderService','Notification','$state','$stateParams',function($scope,$rootScope,ReminderService,Notification,$state,$stateParams){
    $scope.reminder = {};
    if($stateParams.ID){
        $scope.title = 'update Reminder';
        ReminderService.getReminder($stateParams.ID,function(successCallback){
            if(successCallback.data.status){
                $scope.reminder = successCallback.data.data;
                $scope.reminder.reminderDate = new Date($scope.reminder.reminderDate);
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

            });
        }

    };
    $scope.cancel = function () {
        $state.go('reminders');
    }

}]);
