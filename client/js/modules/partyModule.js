app.factory('PartyService', function ($http, $cookies) {
    return {
        addParty: function (partyDetails, success, error) {
            console.log(partyDetails);
            $http({
                url: '/v1/party/addParty',
                method: "POST",
                data: partyDetails
            }).then(success, error)
        },
        getParties: function (success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET"
            }).then(success, error)
        },
        getAllParties: function (success, error) {
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
                url: '/v1/party/updateParty',
                method: "PUT",
                data: partyDetails
            }).then(success, error)
        },
        deleteParty: function (partyId, success, error) {
            $http({
                url: '/v1/party/' + partyId,
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
                Notification.error({message: "Successfully Deleted"});
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
        PartyService.getParties(function (success) {
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
        columnDefs: [{
            name: 'Party name',
            field: 'name'
        }, {
            name: 'Contact',
            field: 'contact'
        }, {
            name: 'Email',
            field: 'email'
        }, {
            name: 'City',
            field: 'city'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a ng-click="grid.appScope.goToEditPartyPage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteParty(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

}]);

app.controller('AddEditPartyCtrl', ['$scope', 'Utils', 'PartyService', '$stateParams', 'Notification', '$state', function ($scope, Utils, PartyService, $stateParams, Notification, $state) {

    $scope.pageTitle = "Add Party";

    if ($stateParams.partyId) {
        $scope.pageTitle = "Edit Party";
    }


    $scope.party = {
        name: '',
        contact: '',
        email: '',
        city: '',
        tripLanes: [{
            index:0
        }],
        error: [],
        success: []


    };
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


    $scope.addTripLane = function () {
        var length = $scope.party.tripLanes.length;
        console.log($scope.party.tripLanes[0].name);
        if(!$scope.party.tripLanes[length-1].name || !$scope.party.tripLanes[length-1].from || !$scope.party.tripLanes[length-1].to){
            $scope.party.error.push("Please Fill all TripLane Fields");
        }else{
            $scope.party.tripLanes.push({
                index:length
            });
        }
        console.log($scope.party);
    };

    $scope.deleteTripLane=function(index){

          $scope.party.tripLanes.splice(index,1);

    };


    $scope.addOrUpdateParty = function () {
        var params = $scope.party;
        params.success = [];
        params.error = [];

        if (!params.name) {
            params.error.push('Invalid party name');
        }
        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error.push('Invalid mobile number');
        }
        if (!Utils.isValidEmail(params.email)) {
            params.error.push('Invalid email ID');
        }
        if (!params.city) {
            params.error.push('Invalid city');
        }
        if (!params.tripLanes) {
            params.error.push('Invalid Lane');
        }

        if (!params.error.length) {
            if (params._id) {
                PartyService.updateParty($scope.party, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('party');
                        Notification.success({message: "Party Updated Successfully"});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            } else {
                PartyService.addParty($scope.party, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('party');
                        Notification.success({message: "Party Added Successfully"});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    };
    $scope.cancel = function () {
        $state.go('partyEdit');
    }
}]);

