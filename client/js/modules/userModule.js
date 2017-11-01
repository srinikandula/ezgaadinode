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
        $state.go('usersEdit', {userId: userId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAllUsers = function () {
        UserServices.getAllUsers($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.userGridOptions.data = success.data.users;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function(message) {
                    Notification.error({message: message});
                });
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
        }, {
            name: 'First name',
            field: 'firstName'
        }, {
            name: 'Last name',
            field: 'lastName'
        }, {
            name: 'Role',
            field: 'role'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
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
    $scope.pagetitle = "Add User";
    $scope.userDetails = {
        accountId: '',
        firstName: '',
        lastName: '',
        email: '',
        userName: '',
        role: '',
        password: '',
        status: true,
        isActive: true,
        errors: []
    };

    if ($stateParams.userId) {
        $scope.pagetitle = "Update User";
        UserServices.getUser($stateParams.userId, function (success) {
            if (success.data.status) {
                $scope.userDetails = success.data.user;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    function getRoles() {
        RoleServices.getAllRoles(function (success) {
            if (success.data.status) {
                $scope.roles = success.data.roles;
            } else {
                success.data.messages.forEach(function(message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
        });
    }

    getRoles();

    $scope.goToUsersPage = function (userId) {
        $state.go('users');
    };

    $scope.AddorUpdateUSer = function () {
        var params = $scope.userDetails;
        console.log(params);
        params.errors = [];

        if (!params.firstName) {
            params.errors.push('Invalid first name');
        }
        if (!params.lastName) {
            params.errors.push('Invalid last name');
        }
        if (!params.email) {
            params.errors.push('Invalid email');
        }
        if (!params.userName) {
            params.errors.push('Invalid user name');
        }
        if (!params.role) {
            params.errors.push('Invalid role');
        }
        if (!Utils.isValidPassword(params.password)) {
            params.errors.push('Password must have  minimum 7 characters');
        }

        if (!params.errors.length) {
            if ($stateParams.userId) {
                UserServices.updateUser(params, function (success) {
                    if (success.data.status) {
                        $state.go('users');
                        Notification.success({message: "User Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                UserServices.addUser(params, function (success) {
                    if (success.data.status) {
                        $state.go('users');
                        Notification.success({message: "User Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            }
        }
    }
}]);