app.factory('UserServices', function ($http) {
    return {
        addUser: function (userData, success, error) {
            $http({
                url: '/v1/user/addUser',
                method: "POST",
                data: userData
            }).then(success, error)
        },
        getAllUsers: function (pageNumber, success, error) {
            $http({
                url: '/v1/user/getAllUsers/' + pageNumber,
                method: 'GET'
            }).then(success, error)
        },
        getUser: function (userId, success, error) {
            $http({
                url: '/v1/user/getUser/' + userId,
                method: "GET"
            }).then(success, error)
        },
        updateUser: function (userData, success, error) {
            $http({
                url: '/v1/user/updateUser',
                method: "POST",
                data: userData
            }).then(success, error)
        }
    }
});

app.controller('UserCtrl', ['$scope', '$state', 'UserServices', 'Notification', function ($scope, $state, UserServices, Notification) {
    $scope.goToEditUserPage = function (userId) {
        $state.go('usersEdit', {userId:userId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAllUsers = function () {
        UserServices.getAllUsers($scope.pageNumber, function (success) {
            console.log(success.data);
            if (success.data.status) {
                $scope.userGridOptions.data = success.data.users;
                console.log('users...',$scope.userGridOptions.data);
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        })
    };
    $scope.getAllUsers();

    $scope.userGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'User name',
            field: 'userName'
        },{
            name: 'First name',
            field: 'firstName'
        },{
            name: 'Last name',
            field: 'lastName'
        },{
            name: 'Role',
            field: 'role'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditUserPage(row.entity._id)" class="glyphicon glyphicon-edit edit"> </a></div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('userEditController', ['$scope', 'UserServices', 'RoleServices', 'AccountServices', 'Notification', '$stateParams', 'Utils', '$state', function ($scope, UserServices, RoleServices, AccountServices, Notification, $stateParams, Utils, $state) {
    console.log('-->', $stateParams, !!$stateParams.userId);
    $scope.userDetails = {
        accountId : '',
        firstName : '',
        lastName : '',
        email : '',
        userName : '',
        role : '',
        password : '',
        error : [],
        success : [],
        isActive: true
    };

    if ($stateParams.userId) {
        console.log($stateParams.userId);
        UserServices.getUser($stateParams.userId, function (success) {
            if (success.data.status) {
                $scope.userDetails = success.data.user;
                console.log('$scope.userDetails', $scope.userDetails)
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    function getRoles() {
        RoleServices.getAllRoles(function (success) {
            if(success.data.status) {
                $scope.roles = success.data.roles;
                console.log('roles',$scope.roles);
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {
        });
    }
    getRoles();
    function getAccounts() {
        AccountServices.getAllAccounts(function (success) {
            if(success.data.status) {
                $scope.accountIds = success.data.accounts;
                console.log('accountIds',$scope.accountIds);
            } else {
                Notification.error({message: success.data.message});
            }
        },function (err) {
        });
    }
    // getAccounts();

    $scope.goToUsersPage = function (userId) {
        $state.go('users');
    };

    $scope.AddorUpdateUSer = function () {
        var params = $scope.userDetails;
        console.log(params);
        params.error = [];
        params.success = [];
        // if(!params.accountId){
        //     params.error.push('Invalid accountId');
        // }
        if(!params.firstName){
            params.error.push('Invalid first name');
        }
        if(!params.lastName){
            params.error.push('Invalid last name');
        }
        if(!params.email){
            params.error.push('Invalid email');
        }
        if(!params.userName){
            params.error.push('Invalid user name');
        }
        if(!params.role){
            params.error.push('Invalid role');
        }
        if(!Utils.isValidPassword(params.password)){
            params.error.push('Password must have  minimum 7 characters');
        }
        if(!params.error.length) {
            if($stateParams.userId) {
                UserServices.updateUser(params, function (success) {
                    console.log('update...', success.data);
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('users')
                    } else {
                        params.error = success.data.message;
                    }
                    // console.log('params red',params);
                }, function (err) {
                });
            } else {
                UserServices.addUser(params, function (success) {
                    console.log(success.data);
                    if (success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    }
}]);