app.factory('AccountService', ['$http', function ($http) {
    return {
        addAccount: function (account, success, error) {
            $http({
                url: '/v1/cpanel/accounts/addAccount',
                method: "POST",
                data: account
            }).then(success, error);
        },
        count: function (success, error) {
            $http({
                url: '/v1/cpanel/accounts/count',
                method: "GET"
            }).then(success, error)
        },
        getAccounts: function (pageable, success, error) {
            $http({
                url: '/v1/cpanel/accounts/getAccounts',
                method: "GET",
                params: pageable
            }).then(success, error)
        }
    }
}]);

app.controller('accountsListCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', 'NgTableParams', function ($scope, $stateParams, AccountService, Notification, NgTableParams) {
    $scope.count = 0;
    $scope.getCount = function () {
        AccountService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                console.log('count', $scope.count);
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting()
        };
        AccountService.getAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            console.log(response.data);
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.accounts;
                $scope.currentPageOfAccounts = response.data.accounts;
                console.log('accounts', $scope.currentPageOfAccounts);
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.init = function () {
        $scope.accountParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [50, 100, 200],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                // $scope.getDevices();
            }
        });
    };
}]);

app.controller('accountsAddEditCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', function ($scope, $stateParams, AccountService, Notification) {
    $scope.accountDetails = {
        userName: '',
        contactName: '',
        password: '',
        contactPhone: '',
        type: '',
        companyName: '',
        contactAddress: '',
        city: '',
        state: '',
        pincode: '',
        gpsEnabled: '',
        erpEnabled: '',
        loadEnabled: '',
        smsEnabled: '',
        isActive: '',
        operatingRoutes: [{
            source: '',
            destination: ''
        }],
        errors: []
    };

    $scope.addRoute = function () {
        var params = $scope.accountDetails.operatingRoutes;
        if(params[params.length-1].source && params[params.length-1].destination) params.push({source:'', destination: ''});
    };

    $scope.deleteRoute = function (index) {
        var params = $scope.accountDetails.operatingRoutes;
        params.splice(index, 1);
    };

    if($stateParams.accountId) {
        $scope.getAccountDetails();
    }

    $scope.addAccount = function () {
        var params = $scope.accountDetails;
        params.errors = [];
        if(!params.userName) {
            params.errors.push('Invalid User Name');
        }
        if(!params.contactName) {
            params.errors.push('Invalid Fullname');
        }
        if(!params.contactPhone) {
            params.errors.push('Invalid mobile number');
        }
        if(!params.type) {
            params.errors.push('Invalid type');
        }
        if(params.password.trim().length < 5) {
            console.log(params.password, params.password.trim().length);
            params.errors.push('Invalid password. Password has to be at least 5 characters');
        }
        if(!params.errors.length) {
            AccountService.addAccount($scope.accountDetails, function (success) {
                console.log(success.data);
                if(success.data.status) {
                    Notification.success({message: "Successfully added"});
                } else {
                    params.errors = success.data.messages;
                }
            });
        }
    }
}]);