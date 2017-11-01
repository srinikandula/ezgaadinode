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
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    };

    $scope.getAccountsData();

    $scope.accountGridOptions = {
        enableSorting: true,
        columnDefs: [{
            name: 'Account name',
            field: 'name'
        }, {
            name: 'Address',
            field: 'address'
        }, {
            name: 'Contact',
            field: 'contact'
        }, {
            name: 'Status',
            field: 'isActive'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditAccountPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a> </div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditAccountCtrl', ['$scope', 'Utils', '$state', 'AccountServices', '$stateParams', 'Notification', function ($scope, Utils, $state, AccountServices, $stateParams, Notification) {
    console.log('-->', $stateParams);
    $scope.pagetitle = "Add Account";

    $scope.account = {
        name: '',
        userName: '',
        password: '',
        address: '',
        contact: '',
        isActive: true,
        success: [],
        errors: []
    };

    if ($stateParams.accountId) {
        $scope.pagetitle = "Update Account";
        AccountServices.getAccount($stateParams.accountId, function (success) {
            if (success.data.status) {
                $scope.account = success.data.account;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateAccount = function () {
        var params = $scope.account;
        params.errors = [];
        params.success = [];

        if (params._id) {
            delete params.userName;
            delete params.password;
        }

        if (!params.name) {
            params.errors.push('Invalid Account Name');
        }

        if (!params._id && !params.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params._id && !Utils.isValidPassword(params.password)) {
            params.errors.push('Invalid Password');
        }

        if (!params.address || !params.address.trim()) {
            params.errors.push('Invalid Address');
        }

        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.errors.push('Invalid phone number, it should be 10 digits');
        }

        if (!params.errors.length) {
            if (params._id) {
                // If _id update the account
                AccountServices.updateAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('accounts');
                       Notification.success({message: "Account Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                // _id doesn\'t exist => create account
                AccountServices.addAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('accounts');
                      Notification.success({message: "Account Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }

    };

    $scope.cancel = function () {
        $state.go('accounts');
    }
}]);

