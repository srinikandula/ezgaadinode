app.factory('UserCrudServices',['$http', function ($http) {
    return {
        addUser: function (params, success, error) {
            $http({
                url: '/v1/usersCrud/',
                method: "POST",
                data: params
            }).then(success, error)
        },
        getUsers: function ( success, error) {
            $http({
                url: '/v1/usersCrud/',
                method: "get"
            }).then(success, error)
        },
    }
}]);
app.controller('UserCrudCtrl',['$scope', '$state', 'UserCrudServices', 'Notification', function ($scope, $state, UserCrudServices, Notification) {
    $scope.user={username:'',password:'',confirmpassword:'',address:''}
    $scope.addorupdate=function()
    { console.log("hii");

    var params=$scope.user;
        console.log(params);
        UserCrudServices.addUser(params,function(success)
        {
            if(success.data.status){
                console.log("user Details added successfully");
            }
            else {
                console.log("error while adding user Details");
            }
        }),function(error){

        }
    }

}]);
app.controller('UsersDetails',['$scope', '$state', 'UserCrudServices', 'Notification', function ($scope, $state, UserCrudServices, Notification) {
    /*$scope.user={username:'',password:'',confirmpassword:'',address:''}*/
    $scope.users="";
    $scope.getUsers=function()
    { console.log("hii");

        console.log(params);
        UserCrudServices.getUsers(function(success)
        {
            if(success.data.status){

                console.log("user Details get successfully");
                $scope.users=success.data.data;
            }
            else {
                console.log("error while getting user Details");
            }
        }),function(error){

        }
    }

}]);