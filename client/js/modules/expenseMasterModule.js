app.factory('ExpenseMasterServices', function ($http) {
    return {
        addExpense: function (expenseData, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "POST",
                data: expenseData
            }).then(success, error)
        },
        getExpenses: function (pageable, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        deleteExpense: function (expenseId, success, error) {
            $http({
                url: '/v1/expenseMaster/' + expenseId,
                method: "DELETE"
            }).then(success, error)
        },
        getExpense: function (expenseId, success, error) {
            $http({
                url: '/v1/expenseMaster/getExpense/' + expenseId,
                method: "GET"
            }).then(success, error)
        },
        updateExpense: function (expenseData, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "PUT",
                data: expenseData
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/expenseMaster/count',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('ExpenseMasterCrtl', ['$scope', '$state', 'ExpenseMasterServices', 'NgTableParams', 'Notification', function ($scope, $state, ExpenseMasterServices, NgTableParams, Notification) {
    $scope.goToEditExpenseTypePage = function (expenseTypeId) {
        $state.go('expenseMasterEdit', {expenseTypeId: expenseTypeId});
    };

    $scope.count = 0;
    ExpenseMasterServices.count(function (success) {
        if (success.data.status) {
            $scope.count = success.data.count;
            $scope.init();
        } else {
            Notification.error({message: success.data.messages[0]});
        }
    });

    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(), size:tableParams.count(), sort:tableParams.sorting()};
        $scope.loading = true;

        ExpenseMasterServices.getExpenses(pageable, function(response){
            $scope.invalidCount = 0;
            if(angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.expenses = response.data.expenses;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.expenses;
                $scope.currentPageOfexpenses =  $scope.expenses;
            }
        });
    };

    $scope.init = function() {
        $scope.expenseMasterParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            count: 10,
            sorting: {
                expenseName: -1
            },
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

    $scope.deleteExpense = function (expenseId) {
        ExpenseMasterServices.deleteExpense(expenseId, function (success) {
            if(success.data.status) {
                $scope.count--;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    }
}]);

app.controller('ExpenseMasterEditCrtl', ['$scope', '$state', 'ExpenseMasterServices', 'Notification', '$stateParams', function ($scope, $state, ExpenseMasterServices, Notification, $stateParams) {
    console.log('tl-->', $stateParams);
    $scope.pagetitle = "Add Expense Type";

    $scope.cancel = function () {
        $state.go('expenseMaster');
    };

    $scope.expenseType = {
        expenseName: '',
        error:[],
        success: []
    };

    if ($stateParams.expenseTypeId) {
        $scope.pagetitle = "Edit Expense Type";
        ExpenseMasterServices.getExpense($stateParams.expenseTypeId, function (success) {

            if (success.data.status) {
                $scope.expenseType = success.data.expenseType;
            } else {
                Notification.error(success.data.messages[0])
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateExpenseType = function () {
        var params = $scope.expenseType;
        params.success = [];
        params.error = [];

        if(!params.expenseName) {
            params.error.push('Invalid Expense Type Name');
        }
        if(!params.error.length) {
            if (params._id) {
                ExpenseMasterServices.updateExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('expenseMaster');
                        Notification.success({message: success.data.messages[0]});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            } else {
                ExpenseMasterServices.addExpense(params, function (success) {
                    if(success.data.status) {
                        params.success = success.data.message;
                        $state.go('expenseMaster');
                        Notification.success({message: success.data.messages[0]});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    };
}]);