app.factory('RoleServices', function ($http) {
    return {
        addRole: function (roleData, success, error) {
            $http({
                url: '/v1/roles/role/add',
                method: "POST",
                data: roleData
            }).then(success, error)
        },
        getRoles: function (pageNumber, success, error) {
            $http({
                url: '/v1/roles/getRoles/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getRole: function (roleId, success, error) {
            $http({
                url: '/v1/roles/getRole/' + roleId,
                method: "GET"
            }).then(success, error)
        },
        updateRole: function (roleData, success, error) {
            $http({
                url: '/v1/roles/role/update',
                method: "POST",
                data: roleData
            }).then(success, error)
        },
        deleteRole: function (roleId, success, error) {
            $http({
                url: '/v1/roles/role/delete/' + roleId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('RolesCtrl', ['$scope', '$state', 'RoleServices', 'Notification', function ($scope, $state, RoleServices, Notification) {
    $scope.goToEditRolePage = function (roleId) {
        $state.go('rolesEdit', {roleId: roleId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getRoles = function () {
        RoleServices.getRoles($scope.pageNumber,function (success) {
            if (success.data.status) {
                $scope.userGridOptions.data = success.data.roles;
                console.log($scope.userGridOptions.data);
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {
        });
    };
    $scope.getRoles();

    $scope.deleteRole = function (id) {
        RoleServices.deleteRole(id, function (success) {
            if (success.data.status) {
                $scope.getRoles();
                Notification.success({message: success.data.message});
            } else {
                Notification.error({message: success.data.message});
            }
        })
    };

    $scope.userGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Role name',
            field: 'roleName'
        }, {
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditRolePage(row.entity._id)" class="btn btn-success">Edit</button></div>'
        }, {
            name: 'Delete',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.deleteRole(row.entity._id)" class="btn btn-success">Delete</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('rolesEditController', ['$scope', 'RoleServices', '$stateParams', function ($scope, RoleServices, $stateParams) {
    console.log('-->', $stateParams, $stateParams.roleId, !!$stateParams.roleId);
    $scope.rolesDetails = {
        roleName: '',
        error: '',
        success: ''
    };

    if ($stateParams.roleId) {
        console.log($stateParams.roleId);
        RoleServices.getRole($stateParams.roleId, function (success) {
            if (success.data.status) {
                $scope.rolesDetails = success.data.role;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.AddorUpdateRole = function () {
        var params = $scope.rolesDetails;
        params.error = '';
        params.success = '';
        if (!params.roleName) {
            params.error = 'Invalid role name';
        } else if ($stateParams.roleId) {
            RoleServices.updateRole(params, function (success) {
                console.log('update...', success.data);
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {
            });
        } else {
            RoleServices.addRole({roleName: params.roleName}, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
                console.log(params);
            }, function (err) {
            });
        }
    }
}]);