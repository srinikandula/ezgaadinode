app.controller('AccountsCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {
    $scope.openAddAccountModal = function () {
        var modalInstance = $uibModal.open({
            controller: 'AddAccountCtrl',
            templateUrl: 'add-account.html',
            size: 'sm'
        });

        modalInstance.result.then(function (status) {
        }, function () {
        });
    };

    // pagination options
    $scope.totalItems = 100;
    $scope.maxSize = 10;
    $scope.pageNumber = 1;

    $scope.getAccountsData = function () {
        var pageNum = $scope.pageNumber;

        console.log('--->', pageNum);
        //http call
    };

    $scope.accountGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [
        ],
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('AddAccountCtrl', ['$scope', 'Utils', 'AdminServices', '$uibModalInstance', function ($scope, Utils, AdminServices, $uibModalInstance) {
    $scope.closeModal = function () {
        $uibModalInstance.close();
    };

    $scope.account = {
        name: '',
        userName: '',
        password: '',
        error: '',
        success: ''
    };

    $scope.addAccount = function () {
        var params = $scope.account;
        params.success = '';
        params.error = '';

        if (!params.name) {
            params.error = 'Invalid account name';
        } else if (!params.userName) {
            params.error = 'Invalid user name';
        } else if (!Utils.isValidPassword(params.password)) {
            params.error = 'Invalid password';
        } else {
            AdminServices.addAccount(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                    $scope.closeModal();
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        }
    }
}]);