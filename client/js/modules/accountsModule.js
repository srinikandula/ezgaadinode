app.factory('AccountServices', function ($http, $cookies) {
    return {
        addAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/add',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        },
        getAccounts: function (pageNumber, success, error) {
            $http({
                url: '/v1/admin/accounts/fetch/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAccount: function (accountId, success, error) {
            $http({
                url: '/v1/admin/accounts/' + accountId,
                method: "GET"
            }).then(success, error)
        },
        updateAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/update',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        }
    }
});

app.controller('ShowAccountsCtrl', ['$scope', '$uibModal', 'AccountServices', 'Notification', '$state', function ($scope, $uibModal, AccountServices, Notification, $state) {
    $scope.goToEditAccountPage = function (accountId) {
        $state.go('accountsEdit', {accountId: accountId});
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAccountsData = function () {
        AccountServices.getAccounts($scope.pageNumber, function (success) {
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
        columnDefs: [ {
            name: 'Account name',
            field: 'name'
        }, {
            name: 'Address',
            field: 'address'
        },{
            name: 'Contact',
            field: 'contact'
        },{
            name: 'Edit',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditAccountPage(row.entity._id)" class="btn btn-success">Edit</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditAccountCtrl', ['$scope', 'Utils','$state', 'AccountServices', '$stateParams', 'Notification', function ($scope, Utils, $state, AccountServices, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.account = {
        name: '',
        userName: '',
        password: '',
        address: '',
        contact: '',
        error: '',
        success: ''
    };

    if ($stateParams.accountId) {
        AccountServices.getAccount($stateParams.accountId, function (success) {
            console.log('acc--->', success.data.account);
            if (success.data.status) {
                $scope.account = success.data.account;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateAccount = function () {
        var params = $scope.account;
        params.success = null;
        delete params.error;
        if (params._id) {
            delete params.userName;
            delete params.password;
        }

        if (!params.name) {
            params.error = params.error ? params.error +' Invalid account name': 'Invalid account name';
        }
        if (!params._id && !params.userName) {
            params.error = params.error ? params.error +' Invalid user name': 'Invalid user name';
        }
        if (!params._id && !Utils.isValidPassword(params.password)) {
            params.error = params.error ? params.error +'Invalid password \n': 'Invalid password \n';
        }
        if (!params.address || !params.address.trim()) {
            params.error = params.error ? params.error +' Invalid address \n': ' Invalid address \n';
        }
        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error = params.error ? params.error +'Invalid phone number, it should be 10 digits \n': 'Invalid phone number,  it should be 10 digits \n';
        }
        if(!params.error) {
            if (params._id) {
                // If _id update the account
                AccountServices.updateAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('accounts');
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                // _id doesn\'t exist => create account
                AccountServices.addAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
        }

    }
    $scope.cancel = function() {
        $state.go('accounts');
    }
}]);

