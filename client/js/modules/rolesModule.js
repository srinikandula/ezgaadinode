app.factory('RoleServices',['$http', function ($http) {
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
        getAllRoles: function (success, error) {
            $http({
                url: '/v1/roles/getAllRoles',
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
}]);

app.controller('RolesCtrl', ['$scope', '$state', 'RoleServices', 'Notification', function ($scope, $state, RoleServices, Notification) {
    $scope.goToEditRolePage = function (roleId) {
        $state.go('rolesEdit', {roleId: roleId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getRoles = function () {
        RoleServices.getRoles($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.roleGridOptions.data = success.data.roles;
                console.log("Roles.........", $scope.roleGridOptions);
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
        });
    };
    $scope.getRoles();

    $scope.deleteRole = function (id) {
        RoleServices.deleteRole(id, function (success) {
            if (success.data.status) {
                $scope.getRoles();
                Notification.success({message: "Successfully deleted"});
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };

    $scope.roleGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Role name',
            field: 'roleName'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a ng-click="grid.appScope.goToEditRolePage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteRole(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('rolesEditController', ['$scope', 'RoleServices', '$stateParams', '$state', 'Notification', function ($scope, RoleServices, $stateParams, $state, Notification) {
    $scope.pagetitle = "Add Role";
    $scope.rolesDetails = {
        roleName: '',
        errors: []
    };

    $scope.goToRolesPage = function () {
        $state.go('roles');
    };

    if ($stateParams.roleId) {
        $scope.pagetitle = "Update Role";
        RoleServices.getRole($stateParams.roleId, function (success) {
            if (success.data.status) {
                $scope.rolesDetails = success.data.role;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.AddorUpdateRole = function () {
        var params = $scope.rolesDetails;
        params.errors = [];

        if (!params.roleName) {
            params.errors.push('Invalid role name');
        }

        if(!params.errors.length){
            if ($stateParams.roleId) {
                RoleServices.updateRole(params, function (success) {
                    if (success.data.status) {
                        $state.go('roles');
                        Notification.success({message: "Role Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                RoleServices.addRole({roleName: params.roleName}, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('roles');
                        Notification.success({message: "Role Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            }
        }
    }
}]);