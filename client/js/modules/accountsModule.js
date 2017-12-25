app.factory('AccountServices', function ($http, $cookies) {
    return {
        addAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/add',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        },
        getAllAccounts: function (pageable, success, error) {
            $http({
                url: '/v1/admin/accounts/fetch/',
                method: "GET",
                params:pageable
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
                method: "PUT",
                data: accountInfo
            }).then(success, error)
        },
        erpDashboard: function (success, error) {
            $http({
                url: '/v1/admin/erpDashboard',
                method: "GET",
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/admin/accounts/total/count',
                method: "GET"
            }).then(success, error)
        },
        userProfile: function (success, error) {
            $http({
                url: '/v1/admin/userProfile',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('ShowAccountsCtrl', ['$scope', '$uibModal', 'AccountServices', 'Notification', '$state', 'paginationService','NgTableParams', function ($scope, $uibModal, AccountServices, Notification, $state, paginationService, NgTableParams) {
    $scope.goToEditAccountPage = function (accountId) {
        $state.go('accountsEdit', {accountId: accountId});
    };
    $scope.filter;
    $scope.count = 0;
    $scope.getCount = function () {
        AccountServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                    $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        pageable.filter = $scope.filter;
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        AccountServices.getAllAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.accounts)) {
                $scope.loading = false;
                $scope.accounts = response.data.accounts;
                tableParams.total(response.data.count);
                tableParams.data = $scope.accounts;
                $scope.currentPageOfAccounts = $scope.accounts;

            }
        });
    };
    $scope.findAccounts = function(){
        $scope.accountParams.filter = $scope.filter;
        loadTableData($scope.accountParams);
    }
    $scope.init = function () {
        $scope.accountParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            },
            filter: $scope.filter
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

}]);

app.controller('AddEditAccountCtrl', ['$scope', 'Utils', '$state', 'AccountServices', '$stateParams', 'Notification', function ($scope, Utils, $state, AccountServices, $stateParams, Notification) {
    $scope.pagetitle = "Add Account";

    $scope.account = {
        profile: {userName: '',
            password: '',
            contactPhone: '',
            email: '',},
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        erpEnabled: '',
        gpsEnabled: '',
        isActive: true,
        success: [],
        errors: []
    };

    if ($stateParams.accountId) {
        $scope.pagetitle = "Update Account";
        AccountServices.getAccount($stateParams.accountId, function (success) {
            if (success.data.status) {
                $scope.
                $scope.account = success.data.account;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.userProfilee = function () {
        AccountServices.userProfile(function (success) {
            if (success.data.status) {
                $scope.account = success.data.result;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    $scope.addOrUpdateAccount = function () {
        var params = $scope.account;
        params.errors = [];
        params.success = [];

        if (!params.profile.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params.profile.contactPhone) {
            params.errors.push('Invalid Mobile Number');
        }

        if (!params.profile.email) {
            params.errors.push('Invalid Email');
        }
        if(params.oldPassword) {
            if (!params.newPassword) {
                params.errors.push('Please Provide New Password');
            }
            if (params.confirmPassword !== params.newPassword) {
                params.errors.push('Passwords Not Matched');
            }
        }
        if (!params.errors.length) {
            if (params.profile._id) {
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

