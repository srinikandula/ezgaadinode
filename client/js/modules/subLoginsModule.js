app.factory('UsersService',['$http', '$cookies', function ($http, $cookies) {
    return{
        addUser:function (params,success, error) {
            $http({
                url: '/v1/users/addUser',
                method: "POST",
                data:params
            }).then(success, error)
        },
        updateUser:function (params,success, error) {
            $http({
                url: '/v1/users/updateUser',
                method: "POST",
                data:params
            }).then(success, error)
        },
        getUsers:function (success, error) {
            $http({
                url: '/v1/users/getUsers',
                method: "GET"
            }).then(success, error)
        },
        getUser:function (id,success, error) {
            $http({
                url: '/v1/users/getUser/'+id,
                method: "GET"
            }).then(success, error)
        },
        deleteUser:function(id,success,error){
            $http({
                url: '/v1/users/deleteUser/'+id,
                method: "DELETE"
            }).then(success, error)
        },
        adminRoles: function (success, error) {
            $http({
                url: '/v1/users/adminRolesDropDown',
                method: "GET",
            }).then(success, error)
        },
    }
}]);

app.controller('Add_EditUserController',['$scope','$state','UsersService','$stateParams','Notification',
    function($scope,$state,UsersService,$stateParams,Notification){

    $scope.user = {};

    if($stateParams.id){
        $scope.title = 'Update User';
        UsersService.getUser($stateParams.id,function(successCallback){
            if(successCallback.data.status){
                $scope.user = successCallback.data.data;
            }
        },function(errorCallback){});
    };
    $scope.add_editUser = function(){

        if($scope.user.password !== $scope.user.confirmPassword){
            Notification.error({ message: "Password is incorrect"});
        }else{
            if($stateParams.id){
                console.log("Welocme", $scope.user);
                UsersService.updateUser($scope.user,function(successCallback){
                    if(successCallback.data.status){
                        Notification.success({message:"updated Successfully"});
                        $state.go('users');
                    }else{
                        successCallback.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                },function(errorCallback){});
            }else{
                UsersService.addUser($scope.user,function(successCallback){
                    if(successCallback.data.status){
                        Notification.success({message:"Added Successfully"});
                        $state.go('users');
                    }else{
                        successCallback.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                },function(errorCallback){});
            }
        }

    };
    $scope.cancel = function(){
        $state.go('users');
    };


    $scope.getAllRoles = function () {
        UsersService.adminRoles(function (success) {
            if (success.data.status) {
                $scope.roles = success.data.data;
                // console.log("Roles", $scope.roles);
            }
        })
    };
         $scope.getAllRoles();

    }]);

app.controller('UserController',['$scope','$state','UsersService','Notification',function($scope,$state,UsersService,Notification){
    $scope.getUsers = function(){
        UsersService.getUsers(function(successCallback){
            if(successCallback.data.status){
                $scope.users = successCallback.data.data;
            }
        },function (errorCallback) {});
    };
    $scope.goToEditPage = function(id){
        $state.go('add_editUser',{id:id});
    };
    $scope.delete = function (id) {
        UsersService.deleteUser(id,function(successCallback){
            if(successCallback.data.status){
                Notification.success({message:"Deleted Successfully"});
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){

        });
    }

}]);