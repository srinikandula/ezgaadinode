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
        getParties: function (pageable, success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getAccountParties: function (success, error) {
            $http({
                url: '/v1/party/get/accountParties',
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
        },
        getRevenueByPartyId: function (vehicleId, success, error) {
            $http({
                url: '/v1/party/vehiclePayments/' + vehicleId,
                method: "GET"
            }).then(success, error)
        },
        amountByPartyid: function (partyId, success, error) {
            $http({
                url: '/v1/party/tripsPayments/' + partyId,
                method: "GET"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/party/total/count',
                method: "GET"
            }).then(success, error)
        }
    }
});

app.controller('PartyListController', ['$scope', '$uibModal', 'PartyService', 'Notification', '$state', 'paginationService', 'NgTableParams', function ($scope, $uibModal, PartyService, Notification, $state, paginationService, NgTableParams) {
    $scope.goToEditPartyPage = function (partyId) {
        $state.go('editParty', {partyId: partyId});
    };

    $scope.count = 0;
    $scope.getCount = function () {
        PartyService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };


    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        PartyService.getParties(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.parties)) {
                $scope.loading = false;
                $scope.parties = response.data.parties;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.parties;
                $scope.currentPageOfParties = $scope.parties;
            }
        });
    };

    $scope.init = function () {
        $scope.partyParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };
    $scope.getCount();

    $scope.deleteParty = function (partyId) {
        PartyService.deleteParty(partyId, function (success) {
            if (success.data.status) {
                $scope.getCount();
                Notification.error({message: "Successfully Deleted"});
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
            console.log('error deleting party');
        });
    };
}]);

app.controller('AddEditPartyCtrl', ['$scope', 'Utils', 'PartyService', '$rootScope', '$stateParams', 'Notification', '$state', function ($scope, Utils, PartyService, $rootScope, $stateParams, Notification, $state) {

    $scope.showAddTripLane = false;

    $scope.addTripLane = function () {
        $scope.showAddTripLane = true;
    };

    $scope.pageTitle = "Add Party";

    if ($stateParams.partyId) {
        $scope.pageTitle = "Edit Party";
    }

    $scope.party = {
        name: '',
        contact: '',
        email: '',
        city: '',
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
    };
    $scope.cancel = function () {
        console.log("Welcome to Cancel");
        $state.go('parties');

    }



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


        if (!params.error.length) {
            if (params._id) {
                PartyService.updateParty($scope.party, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('parties');
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
                        $state.go('parties');
                        Notification.success({message: "Party Added Successfully"});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    };

}]);

