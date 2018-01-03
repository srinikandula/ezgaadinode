app.factory('PartyService', function ($http, $cookies) {
    return {
        addParty: function (partyDetails, success, error) {
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
        getAllPartiesByTransporter: function (success, error) {
            $http({
                url: '/v1/party/getAllPartiesByTransporter',
                method: "GET"
            }).then(success, error)
        },
        getAllPartiesBySupplier: function (success, error) {
            $http({
                url: '/v1/party/getAllPartiesBySupplier',
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
        $state.go('editParty', { partyId: partyId });
    };

    $scope.count = 0;
    $scope.getCount = function () {
        PartyService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({ message: success.data.message });
            }
        });
    };


    var loadTableData = function (tableParams) {
        var pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(), partyName: tableParams.partyName };
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
    $scope.getAllParties = function () {
        PartyService.getParties(null, function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (err) {

        });
    }
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
                    $scope.getAllParties();
                }
            });
    };
    $scope.getCount();

    $scope.deleteParty = function (partyId) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E83B13',
            cancelButtonColor: '#9d9d9d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                PartyService.deleteParty(partyId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Party deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Deleted!',
                                message,
                                'error'
                            );
                        });
                    }
                }, function (err) {

                });
            }
        });
       
    };
    $scope.searchByPartyName = function (partyName) {
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
                    params.partyName = partyName;
                    loadTableData(params);
                }
            });
    }
    
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
        tripLanes: [{
            index: 0
        }],
        partyType: '',
        isEmail: false,
        isSms: false,
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

    $scope.addTripLane = function () {
        $scope.party.error = [];
        var length = $scope.party.tripLanes.length;
        if (!$scope.party.tripLanes[length - 1].name || !$scope.party.tripLanes[length - 1].from || !$scope.party.tripLanes[length - 1].to) {
            $scope.party.error.push("Please Fill all TripLane Fields");
        }
        else {
            $scope.party.tripLanes.push({
                index: length
            });
        }
    };

    $scope.deleteTripLane = function (index) {
        if ($scope.party.tripLanes.length > 1) {
            $scope.party.tripLanes.splice(index, 1);
        } else {
            $scope.party.error.push("Please add at least one trip lane");
        }

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
        if (!params.partyType) {
            params.error.push('Please select party type');
        }
        if (params.partyType === 'Transporter') {
            if (!params.isSms && !params.isEmail) {
                params.error.push('Please select notification type');
            }
            for(var i = 0;i < params.tripLanes.length;i++) {
                if (!params.tripLanes[i].name) {
                    params.error.push('Please provide TripLane Name');
                }

                if (!params.tripLanes[i].from) {
                    params.error.push('Please provide From Name');
                }

                if (!params.tripLanes[i].to) {
                    params.error.push('Please provide To Name');
                }
            }
        }

        if (!params.error.length) {
            if (params._id) {
                PartyService.updateParty($scope.party, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('parties');
                        Notification.success({ message: "Party Updated Successfully" });
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
                        Notification.success({ message: "Party Added Successfully" });
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    };
    $scope.cancel = function () {
        $state.go('parties');
    }
}]);

