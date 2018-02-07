app.factory('AdministratorService', function ($http) {
    return {
        getEmployee: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "GET",
            }).then(success, error)
        },
        addEmployee: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "POST",
            }).then(success, error)
        },
        getEmployeeDetails: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "GET",
            }).then(success, error)
        },
        updateEmployee: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "PUT",
            }).then(success, error)
        },
        deleteEmployee: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "DELETE",
            }).then(success, error)
        },
        countEmployee: function (success, error) {
            $http({
                url: '/v1/employees',
                method: "GET"
            }).then(success, error)
        }
    }
});
app.controller('administratorMenuCtrl', ['$scope', '$state', function ($scope, $state) {

    $scope.cancel = function () {
        $state.go('admin.administrators');
    };

    $scope.status = {
        isAdministratorHeaderOpen: false,
        isFirstOpen: true,
    };

}]);

/*
app.controller('administratorsCtrl', ['$scope', '$state', 'AdministratorService', 'Notification', 'paginationService', 'NgTableParams', function ($scope, $state, AdministratorService, Notification, paginationService, NgTableParams) {

    $scope.goToEditAdministratorPage = function (employeeId) {
        $state.go('administratorsEdit', {employeeId: employeeId});
    };

    $scope.count = 0;
    $scope.countEmployee = function () {
        AdministratorService.countEmployee(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.countEmployee();

    var loadTableData = function (tableParams) {

        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            employeeName: tableParams.employeeName
        };
        $scope.loading = true;
        AdministratorService.getEmployee(pageable, function (response) {
            console.log('employees',response);
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.data)) {
                $scope.loading = false;
                $scope.employees = response.data.data;
                $scope.accountId = response.data.accountId;
                $scope.type = response.data.type;
                tableParams.total(response.count);
                tableParams.data = $scope.employees;
                $scope.currentPageOfEmployees = $scope.employees;
            }
        });
    };

    $scope.init = function () {
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
                loadTableData(params);
                $scope.getEmployee();
            }
        });
    };

    $scope.deleteEmployee = function (employeeId) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E83B13',
            cancelButtonColor: '#9d9d9d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                AdministratorService.deleteEmployee(employeeId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Employee deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Error!',
                                message,
                                'error'
                            );
                        });
                    }
                });
            }
            ;
        });
    }

    $scope.searchByEmployeeName=function(employeeName){
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
                params.employeeName=employeeName;
                loadTableData(params);
            }
        });
    }

}]);*/
