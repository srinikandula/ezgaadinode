app.factory('UserServices', function ($http) {
    return {
        addAccount: function (userData, success, error) {
            $http({
                url: '/v1/user/add',
                method: "POST",
                data: userData
            }).then(success, error)
        }
    }
});

app.controller('UserCtrl', ['$scope', '$state', function ($scope, $state) {
    $scope.goToEditUserPage = function () {
        $state.go('usersEdit');
    };
}]);

app.controller('userEditController', ['$scope', function ($scope) {

    $scope.userDetails = {
        firstName : '',
        lastName : '',
        email : '',
        role : '',
        accountId : '',
        userName : '',
        password : '',
        error : '',
        success : ''
    };

    $scope.AddorUpdateUSer = function () {
        //
    }
}]);