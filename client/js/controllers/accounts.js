app.controller('AccountsCtrl', ['$scope', '$uibModal', 'AdminServices', 'Notification', function ($scope, $uibModal, AdminServices, Notification) {
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
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAccountsData = function () {
        AdminServices.getAccounts($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.accountGridOptions.data = success.data.accounts;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getAccountsData();

    $scope.accountGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Id',
            field: '_id'
        }, {
            name: 'Account name',
            field: 'name'
        }, {
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.openEditModal(row.entity)" class="btn btn-success">Edit</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.openEditModal = function (accountData) {
        alert('API is ready' );
    }
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