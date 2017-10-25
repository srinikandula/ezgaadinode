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