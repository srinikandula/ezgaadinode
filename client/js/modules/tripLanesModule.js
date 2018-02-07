app.factory('TripLaneServices',['$http', function ($http) {
    return {
        addTripLane: function (tripLane, success, error) {
            $http({
                url: '/v1/tripLanes/',
                method: "POST",
                data: tripLane
            }).then(success, error)
        },
        getAllAccountTripLanes: function (success, error) {
            $http({
                url: '/v1/tripLanes/all/accountTrips',
                method: "GET"
            }).then(success, error)
        },
        getTripLanes: function (params, success, error) {
            $http({
                url: '/v1/tripLanes/getTripLanes',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getTripLane: function (tripLaneId, success, error) {
            $http({
                url: '/v1/tripLanes/update/' + tripLaneId,
                method: "GET"
            }).then(success, error)
        },
        updateTripLane: function (tripLane, success, error) {
            $http({
                url: '/v1/tripLanes/',
                method: "PUT",
                data: tripLane
            }).then(success, error)
        },
        deleteTripLane: function (tripLaneId, success, error) {
            $http({
                url: '/v1/tripLanes/' + tripLaneId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/tripLanes/total/count',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('ShowTripLanesCtrl', ['$scope', '$uibModal', 'NgTableParams', 'TripLaneServices', 'paginationService', '$state', 'Notification', function ($scope, $uibModal, NgTableParams, TripLaneServices, paginationService, $state, Notification) {
    $scope.goToEditTripLanePage = function (tripLaneId) {
        $state.go('tripLanesEdit', {tripLaneId: tripLaneId});
    };
    $scope.count = 0;
    TripLaneServices.count(function (success) {
        if (success.data.status) {
            $scope.count = success.data.count;
            $scope.init();

        } else {
            Notification.error({message: success.data.message});
        }
    });
    var pageable;

    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        TripLaneServices.getTripLanes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.tripLanes)) {
                $scope.loading = false;
                $scope.trips = response.data.tripLanes;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trips;
                $scope.currentPageOfTrips = $scope.trips;

            }
        });
    };

    $scope.init = function () {
        $scope.tripLanesParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }

        });
    };



    $scope.deleteTripLane = function (tripLaneId) {
        TripLaneServices.deleteTripLane(tripLaneId, function (success) {
            if (success) {
                $scope.init();
                Notification.error({message: "Trip Lane Deleted"});
            } else {
                console.log("Error in deleting")
            }
        })
    };
}]);

app.controller('AddEditTripLaneCtrl', ['$scope', '$state', 'Utils', 'TripLaneServices', '$stateParams', 'Notification', function ($scope, $state, Utils, TripLaneServices, $stateParams, Notification) {
    console.log('tl-->', $stateParams);
    $scope.pagetitle = "Add Trip Lane";

    $scope.drivers = [];
    $scope.parties = [];

    $scope.tripLane = {
        name: '',
        from: '',
        to: '',
        estimatedDistance: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('tripLanes');
    };

    if ($stateParams.tripLaneId) {
        $scope.pagetitle = "Edit Trip Lane";
        TripLaneServices.getTripLane($stateParams.tripLaneId, function (success) {
            console.log('acc===>', success.data);
            if (success.data.status) {
                $scope.tripLane = success.data.tripLane;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTripLane = function () {
        var params = $scope.tripLane;
        params.success = [];
        params.error = [];
        console.log(params.error);
        if (!params.name) {
            params.error.push('Invalid Trip Lane Name');
        }
        if (!params.from) {
            params.error.push('Invalid From Location');
        }
        if (!params.to) {
            params.error.push('Invalid to Location');
        }
        if (!params.estimatedDistance) {
            params.error.push('Invalid Estimated Dist');
        }
        if (!params.error.length) {
            if (params._id) {
                TripLaneServices.updateTripLane(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('tripLanes');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
            else {
                TripLaneServices.addTripLane(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('tripLanes');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);

