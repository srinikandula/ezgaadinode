app.controller('AddAccountCtrl', ['$scope', 'Utils', 'AdminServices', function ($scope, Utils, AdminServices) {
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

        if (!_.isString(params.name)) {
            params.error = 'Invalid account name';
        } else if (!_.isString('userName')) {
            params.error = 'Invalid user name';
        } else if (!Utils.isValidPassword(params.password)) {
            params.error = 'Invalid password';
        } else {
            // http call
            AdminServices.addAccount(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
                } else {
                    params.error = success.data.message;
                }
            }, function (err) {

            });
        }
    }

}]);