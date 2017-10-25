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

    $scope.accountGridOptions = {
        enableSorting: true,
        columnDefs: [{
            name: 'Name',
            field: 'name'
        }],
        data: [{name: 'sunil'}, {name: 'sai'}],
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
            params.error = 'Password should me minimum 8 characters';
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