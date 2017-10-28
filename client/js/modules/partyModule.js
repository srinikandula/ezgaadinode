app.factory('PartyService', function ($http, $cookies) {
    return {
        addParty: function (partyDetails, success, error) {
            $http({
                url: '/v1/party/',
                method: "POST",
                data: partyDetails
            }).then(success, error)
        },
        getParties: function (pageNumber, success, error) {
            $http({
                url: '/v1/party/get/all',
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

app.controller('PartyListController', ['$scope', '$uibModal', 'PartyService', 'Notification', '$state', function ($scope, $uibModal, PartyService, Notification, $state) {
    $scope.goToEditPartyPage = function (partyId) {
        $state.go('editParty', {partyId: partyId});
    };

    $scope.deleteParty = function (partyId) {
        PartyService.deleteParty(partyId, function (success) {
        if (success.data.status) {
            $scope.getParties();
        } else {
            Notification.error(success.data.message)
        }
        }, function (err) {
            console.log('error deleting party');
        });
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getParties = function () {
        PartyService.getParties($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.partyGridOptions.data = success.data.parties;
                $scope.totalItems = success.data.count;
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getParties();

    $scope.partyGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [ {
            name: 'Party name',
            field: 'name'
        }, {
            name: 'Contact',
            field: 'contact'
        },{
            name: 'Email',
            field: 'email'
        },{
            name: 'City',
            field: 'city'
        },{
            name: 'Operating Lane',
            field: 'operatingLane'
        },{
            name: 'Action',
            cellTemplate: '<div class="text-center"><button ng-click="grid.appScope.goToEditPartyPage(row.entity._id)" class="btn btn-success">Edit</button><button ng-click="grid.appScope.deleteParty(row.entity._id)" class="btn btn-danger">Delete</button></div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditPartyCtrl', ['$scope', 'Utils', 'PartyService', '$stateParams', 'Notification','$state', function ($scope, Utils, PartyService, $stateParams, Notification, $state) {
    console.log('adding a party....');
    $scope.pageTitle = "Add Party";
    if ($stateParams.partyId){
        $scope.pageTitle = "Edit Party";
    }
    $scope.party = {};
    if ($stateParams.partyId) {
        PartyService.getParty($stateParams.partyId, function (success) {
            if (success.data.status) {
                $scope.party = success.data.party;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        });
    }
    $scope.addOrUpdateParty = function () {
        var params = $scope.party;
        params.success = '';
        params.error = '';

        if (!params.name) {
            params.error += 'Invalid party name \n';
        }
        if (!Utils.isValidEmail(params.email)) {
            params.error += 'Invalid email \n';
        }
        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error += 'Invalid phone number \n';
        }
        if(!Utils.isEmpty(params.error)) {
            if (params._id) {
                PartyService.updateParty($scope.party, function (success) {
                    if (success.data.status) {
                        $state.go('party');
                        params.success = success.data.message;
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                PartyService.addParty($scope.party, function (success) {
                    if (success.data.status) {
                        $state.go('party');
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
        $state.go('party');
    }
}]);

