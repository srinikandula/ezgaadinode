app.factory('AdministratorService', function ($http) {
    return {
        getEmployee: function (params, success, error) {
            $http({
                url: '/v1/employees/getEmployee',
                method: "GET",
                params: params
            }).then(success, error)
        },
        addEmployee: function (success, error) {
            $http({
                url: '/v1/employees/addEmployee',
                method: "POST",
            }).then(success, error)
        },
        getEmployeeDetails: function (params, success, error) {
            $http({
                url: '/v1/employees/getEmployeeDetails',
                method: "GET",
                params: { employeeId: params }
            }).then(success, error)
        },
        updateEmployee: function (success, error) {
            $http({
                url: '/v1/employees/updateEmployee',
                method: "PUT",
            }).then(success, error)
        },
        deleteEmployee: function (success, error) {
            $http({
                url: '/v1/employees/deleteEmployee',
                method: "DELETE",
            }).then(success, error)
        }
    }
});

app.controller('administratorsCtrl', ['$scope', '$state', 'Notification', 'Upload', '$stateParams', 'AdministratorService', 'NgTableParams', function ($scope, $state, Notification, Upload, $stateParams, AdministratorService, NgTableParams) {

    function employeesFunc() {
        $scope.employee = {
            userName: '',
            contactPhone: '',
            password: '',
            confirmPassword: '',
            email: '',
            type: '',
            accountId: '',
            adminRoleId: '',
            franchiseId: '',
            groupName: '',
            firstName: '',
            lastName: '',
            contactName: '',
            displayName: '',
            contactAddress: '',
            city: '',
            state: '',
            location: '',
            profilePic: '',
        }
    }

    $scope.addNumber = function() {

        if (!$scope.employee.contactPhone[$scope.employee.contactPhone.length - 1]) {
            Notification.error('Enter Mobile Number');
        } else {
            $scope.employee.contactPhone.push('');
        }
    }

    $scope.removeNumber = function() {
        $scope.employee.contactPhone.splice($scope.employee.contactPhone, 1)
    }

    function verifyMobNum() {
        for (var i = 0; i < $scope.employee.contactPhone.length; i++) {
            if (!$scope.employee.contactPhone[i]) {
                return false;
            }
            if (i === $scope.employee.contactPhone.length - 1) {
                return true;
            }
        }
    }

    $scope.getEmployee = function () {
        $scope.employeeParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: 100,
            getData: function (tableParams) {
                var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
                AdministratorService.getEmployee(pageable, function (success) {
                    if (success.data.status) {
                        $scope.employees = success.data.data;
                        tableParams.data = $scope.employees;
                        tableParams.total(parseInt(success.data.count));
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                }, function (error) {

                });
            }
        });
        $scope.employeeParams.reload();
    }

    $scope.addEmployee = function() {
        var params = $scope.employee;
        params.errorMessage = [];

        if (!params.firstName) {
            params.errorMessage.push('Enter Your First Name');
        }
        if (!params.lastName) {
            params.errorMessage.push('Enter Your Last Name');
        }
        if (!params.password) {
            params.errorMessage.push('Enter Your Password');
        }
        if (!params.confirmPassword) {
            params.errorMessage.push('Enter Your Last Name');
        }
        if (!params.email) {
            params.errorMessage.push('Enter Your Email');
        }
        if (!verifyMobNum()) {
            params.errorMessage.push('Enter Mobile Number');
        }
        if (!params.adminRoleId) {
            params.errorMessage.push('Pleas Select Role');
        }
        if (!params.franchiseId) {
            params.errorMessage.push('Pleas Select Franchise');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function(message) {
                Notification.error(message);
            });
        } else {
            if (!$scope.employee._id) {
                var files = $scope.profilePic;
                Upload.upload({
                    url: '/v1/employees/addEmployee',
                    data: {
                        files: [files]
                    },
                    params: $scope.employee
                }).then(function(success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function(message) {
                            Notification.success(message);
                        });
                        employeesFunc();
                    } else {
                        success.data.messages.forEach(function(message) {
                            Notification.error(message);
                        });
                    }
                });
            } else {
                var files = $scope.profilePic;
                Upload.upload({
                    url: '/v1/employees/addEmployee',
                    data: {
                        files: [files]
                    },
                    params: $scope.employee
                }).then(function(success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function(message) {
                            Notification.success(message);
                        });
                        employeesFunc();
                    } else {
                        success.data.messages.forEach(function(message) {
                            Notification.error(message);
                        });
                    }
                });
            }
        }
    }
}]);
