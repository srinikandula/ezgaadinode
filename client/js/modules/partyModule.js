app.factory('PartyService', function ($http, $cookies) {
    return {
        addParty: function (partyDetails, success, error) {
            $http({
                url: '/v1/party/',
                method: "POST",
                data: partyDetails
            }).then(success, error)
        },
        getAccountParties: function (pageNumber, success, error) {
            $http({
                url: '/v1/party//get/accountParties/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getParty: function (partyId, success, error) {
            $http({
                url: '/v1/party/' + partyId,
                method: "GET"
            }).then(success, error)
        },
        updateParty: function (partyDetails, success, error) {
            $http({
                url: '/v1/party',
                method: "PUT",
                data: partyDetails
            }).then(success, error)
        },
        deleteParty: function (partyId, success, error) {
            $http({
                url: '/v1/party/'+partyId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('PartyListController', ['$scope', '$uibModal', 'AccountServices', 'Notification', '$state', function ($scope, $uibModal, AccountServices, Notification, $state) {
    $scope.goToEditPartyPage = function (partyId) {
        $state.go('editParty', {partyId: partyId});
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

app.controller('AddEditAccountCtrl', ['$scope', 'Utils', 'PartyService', '$stateParams', 'Notification', function ($scope, Utils, PartyService, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.party = {};

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
        params.success = '';
        params.error = '';

        if (params._id) {
            delete params.userName;
            delete params.password;
        }

        if (!params.name) {
            params.error = 'Invalid account name';
        } else if (!params._id && !params.userName) {
            params.error = 'Invalid user name';
        } else if (!params._id && !Utils.isValidPassword(params.password)) {
            params.error = 'Invalid password';
        } else if (!params.address.trim()) {
            params.error = 'Invalid address'
        } else if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error = 'Invalid phone number';
        } else if (params._id) {
            // If _id update the account
            AccountServices.updateAccount(params, function (success) {
                if (success.data.status) {
                    params.success = success.data.message;
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
}]);

