app.factory('AdministratorService', ["$http", function ($http) {
    return {
        getEmployee: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getEmployee',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getEmployeeDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getEmployeeDetails',
                method: "GET",
                params: {employeeId: params}
            }).then(success, error)
        },
        deleteEmployee: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/deleteEmployee',
                method: "DELETE",
                params: {employeeId: params}
            }).then(success, error)
        },
        countEmployee: function (success, error) {
            $http({
                url: '/v1/cpanel/employees/countEmployee',
                method: "GET",
            }).then(success, error)
        },
        adminRolesDropDown: function (success, error) {
            $http({
                url: '/v1/cpanel/employees/adminRolesDropDown',
                method: "GET",
            }).then(success, error)
        },
        franchiseDropDown: function (success, error) {
            $http({
                url: '/v1/cpanel/employees/franchiseDropDown',
                method: "GET",
            }).then(success, error)
        },
        getRole: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getRole',
                method: "GET",
                params: params
            }).then(success, error)
        },
        addRole: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/addRole',
                method: "POST",
                data: params,
            }).then(success, error)
        },
        getRoleDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getRoleDetails',
                method: "GET",
                params: {roleId: params}
            }).then(success, error)
        },
        updateRole: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/updateRole',
                method: "PUT",
                data: params,
            }).then(success, error)
        },
        deleteRole: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/deleteRole',
                method: "DELETE",
                params: {roleId: params}
            }).then(success, error)
        },
        countRole: function (success, error) {
            $http({
                url: '/v1/cpanel/employees/countRole',
                method: "GET",
            }).then(success, error)
        },
        getFranchise: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getFranchise',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getFranchiseDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/getFranchiseDetails',
                method: "GET",
                params: {franchiseId: params}
            }).then(success, error)
        },
        deleteFranchise: function (params, success, error) {
            $http({
                url: '/v1/cpanel/employees/deleteFranchise',
                method: "DELETE",
                params: {franchiseId: params}
            }).then(success, error)
        },
        countFranchise: function (success, error) {
            $http({
                url: '/v1/cpanel/employees/countFranchise',
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('administratorsCtrl', ['$scope', '$state', '$stateParams', 'AdministratorService', 'Notification', 'NgTableParams', 'Upload', function ($scope, $state, $stateParams, AdministratorService, Notification, NgTableParams, Upload) {
    /*EMPLOYEE START*/
    if ($stateParams.employeeId) {
        AdministratorService.getEmployeeDetails($stateParams.employeeId, function (success) {
            if (success.data.status) {
                $scope.employee = success.data.data;
                $scope.employee.confirmPassword = success.data.data.password;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }
    $scope.employee = {
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        contactAddress: '',
        city: '',
        state: '',
        email: '',
        contactPhone: '',
        adminRoleId: '',
        franchiseId: '',
        profilePic: '',
        isActive: undefined,
        newProfilePic: '',
    }

    $scope.count = 0;

    $scope.countEmployee = function () {
        AdministratorService.countEmployee(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init("");
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            role: tableParams.role,
            employee: tableParams.employee
        };
        AdministratorService.getEmployee(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfEmployees = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.init = function (role) {
        $scope.employeeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.role = role;
                loadTableData(params);
            }
        });
    };

    $scope.deleteEmployee = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the employee'
        }).then(function (result) {
            if (result.value) {
                AdministratorService.deleteEmployee($scope.currentPageOfEmployees[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.init("");
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    }

    $scope.adminRolesDropDown = function () {
        AdministratorService.adminRolesDropDown(function (success) {
            if (success.data.status) {
                $scope.adminRoles = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    };

    $scope.franchiseDropDown = function () {
        AdministratorService.franchiseDropDown(function (success) {
            if (success.data.status) {
                $scope.franchises = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    };

    $scope.addUpdateEmployee = function () {
        var params = $scope.employee;

        if (!params.firstName || !_.isString(params.firstName)) {
            Notification.error('Invalid First Name');
        }
        if (!params.lastName || !_.isString(params.lastName)) {
            Notification.error('Invalid Last Name');
        }
        if (!params.password) {
            Notification.error('Invalid Password');
        }
        if (!params.confirmPassword) {
            Notification.error('Invalid Confirm Password');
        }
        if (params.password !== params.confirmPassword) {
            Notification.error('Password not match');
        }
        if (!params.email) {
            Notification.error('Invalid Email');
        }
        if (!params.contactPhone || !_.isNumber(parseInt(params.contactPhone))) {
            Notification.error('Invalid Phone Number');
        }
        if (!params.adminRoleId) {
            Notification.error('Invalid Role');
        }
        if (!params.franchiseId) {
            Notification.error('Invalid Franchise');
        }
        if (params.isActive === undefined) {
            Notification.error('Invalid Status');
        }
        else {
            if ($stateParams.employeeId) {
                Upload.upload({
                    url: '/v1/cpanel/employees/updateEmployee',
                    data: {
                        files: [$scope.employee.newProfilePic]
                    }, params: $scope.employee
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('admin.administrators');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
                /*AdministratorService.updateEmployee(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.administrators');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });*/
            } else {
                Upload.upload({
                    url: '/v1/cpanel/employees/addEmployee',
                    data: {
                        files: [$scope.employee.newProfilePic]
                    }, params: $scope.employee
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('admin.administrators');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
                /*AdministratorService.addEmployee(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.administrators');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });*/
            }
        }
    };

    $scope.searchByEmployee = function (employee) {
        $scope.employeeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.employee = employee;
                loadTableData(params);
            }
        });
    };
    /*EMPLOYEE END*/

    /*ROLE START*/
    if ($stateParams.roleId) {
        AdministratorService.getRoleDetails($stateParams.roleId, function (success) {
            if (success.data.status) {
                $scope.role = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }
    $scope.role = {
        role: '',
        status: undefined,
        createdAt: '',
        updatedAt: '',
    }

    $scope.roleCount = 0;

    $scope.countRole = function () {
        AdministratorService.countRole(function (success) {
            if (success.data.status) {
                $scope.roleCount = success.data.count;
                $scope.initRole("");
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    var loadTableDataRole = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            role: tableParams.role
        };
        AdministratorService.getRole(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfRoles = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initRole = function (role) {
        $scope.roleParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.roleCount,
            getData: function (params) {
                params.role = role;
                loadTableDataRole(params);
            }
        });
    };

    $scope.deleteRole = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the role'
        }).then(function (result) {
            if (result.value) {
                AdministratorService.deleteRole($scope.currentPageOfRoles[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.initRole("");
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    }

    $scope.addUpdateRole = function () {
        var params = $scope.role;
        if (!params.role || !_.isString(params.role)) {
            Notification.error('Invalid Role');
        }
        if (params.status === undefined) {
            Notification.error('Invalid Status');
        }
        else {
            if ($stateParams.roleId) {
                AdministratorService.updateRole(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.adminRoles');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            } else {
                AdministratorService.addRole(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.adminRoles');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            }
        }
    };

    /*FRANCHISE START*/
    if ($stateParams.franchiseId) {
        AdministratorService.getFranchiseDetails($stateParams.franchiseId, function (success) {
            if (success.data.status) {
                $scope.franchise = success.data.data;
                $scope.franchise.doj = new Date(success.data.data.doj);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }
    $scope.franchise = {
        fullName: '',
        account: '',
        mobile: '',
        landLine: '',
        email: '',
        city: '',
        state: '',
        address: '',
        company: '',
        bankDetails: '',
        panCard: '',
        gst: '',
        doj: '',
        status: undefined,
        profilePic: '',
        newProfilePic: '',
    }

    $scope.franchiseCount = 0;

    $scope.countFranchise = function () {
        AdministratorService.countFranchise(function (success) {
            if (success.data.status) {
                $scope.franchiseCount = success.data.count;
                $scope.initFranchise("");
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    var loadTableDataFranchise = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            franchise: tableParams.franchise
        };
        AdministratorService.getFranchise(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfFranchises = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initFranchise = function (status) {
        $scope.franchiseParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.franchiseCount,
            getData: function (params) {
                params.status = status;
                loadTableDataFranchise(params);
            }
        });
    };

    $scope.deleteFranchise = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the franchise'
        }).then(function (result) {
            if (result.value) {
                AdministratorService.deleteFranchise($scope.currentPageOfFranchises[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.initFranchise("");
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    }

    $scope.addUpdateFranchise = function () {
        var params = $scope.franchise;

        if (!params.fullName || !_.isString(params.fullName)) {
            Notification.error('Invalid Full Name');
        }
        if (!params.account) {
            Notification.error('Invalid Account');
        }
        if (!params.mobile || !_.isNumber(parseInt(params.mobile))) {
            Notification.error('Invalid Mobile');
        }
        if (!params.email) {
            Notification.error('Invalid Email');
        }
        if (!params.address) {
            Notification.error('Invalid Address');
        }
        if (params.status === undefined) {
            Notification.error('Invalid Status');
        }
        else {
            if ($stateParams.franchiseId) {
                Upload.upload({
                    url: '/v1/cpanel/employees/updateFranchise',
                    data: {
                        files: [$scope.franchise.newProfilePic]
                    }, params: $scope.franchise
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('admin.franchises');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
                /*AdministratorService.updateFranchise(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.franchises');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });*/
            } else {
                Upload.upload({
                    url: '/v1/cpanel/employees/addFranchise',
                    data: {
                        files: [$scope.franchise.newProfilePic]
                    }, params: $scope.franchise
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('admin.franchises');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
                /*AdministratorService.addFranchise(params, function (success) {
                    if (success.data.status) {
                        Notification.success(success.data.messages[0]);
                        $state.go('admin.franchises');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });*/
            }
        }
    };

    $scope.searchByFranchise = function (franchise) {
        $scope.franchiseParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.franchiseCount,
            getData: function (params) {
                params.franchise = franchise;
                loadTableDataFranchise(params);
            }
        });
    };
    /*FRANCHISE END*/
}]);