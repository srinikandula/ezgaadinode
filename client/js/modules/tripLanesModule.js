app.factory('TripLaneServices', function ($http) {
    return {
        addTripLane: function (tripLane, success, error) {
            $http({
                url: '/v1/tripLanes/',
                method: "POST",
                data: tripLane
            }).then(success, error)
        },
        getTripLanes: function (pageNumber, success, error) {
            $http({
                url: '/v1/tripLanes/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getTripLane: function (tripLaneId, success, error) {
            $http({
                url: '/v1/tripLanes/' + tripLaneId,
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
                url: '/v1/tripLanes/'+tripLaneId,
                method: "DELETE"
            }).then(success, error)
        }
    }
});

app.controller('ShowTripLanesCtrl', ['$scope', '$uibModal', 'TripLaneServices', '$state','Notification', function ($scope, $uibModal, TripLaneServices, $state, Notification) {
    $scope.goToEditTripLanePage = function (tripLaneId) {
        $state.go('tripLanesEdit', {tripLaneId: tripLaneId});
    };

    // pagination options
    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.tripLaneGridOptions = {
        enableSorting: true,
        columnDefs: [ {
            name: 'Name',
            field: 'name'
        }, {
            name: 'From',
            field: 'from'
        },{
            name: 'To',
            field: 'to'
        },{
            name: 'Estimated Distance',
            field: 'estimatedDistance'
        },{
            name: 'Created By',
            field: 'createdBy'
        },{
            name: 'Updated By',
            field: 'updatedBy'
        },{
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditTripLanePage(row.entity._id)" class="glyphicon glyphicon-edit" style="padding-right: 10px;font-size: 20px;"></a><button ng-click="grid.appScope.deleteTripLane(row.entity._id)" class="btn btn-danger">Delete</button></div>'
        }],
        rowHeight: 40,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.getTripLanesData = function () {
        TripLaneServices.getTripLanes($scope.pageNumber, function (success) {
            console.log(success);
            if (success.data.status) {
                $scope.tripLaneGridOptions.data = success.data.tripLanes;
                $scope.totalItems = success.data.count;
                console.log('---here---', success.data.tripLanes);
            } else {
                Notification.error({message: success.data.message});
            }
        }, function (err) {

        });
    };

    $scope.getTripLanesData();

    $scope.deleteTripLane = function (tripLaneId) {
        TripLaneServices.deleteTripLane(tripLaneId,function (success) {
            if (success){
                $scope.getTripLanesData();
                Notification.error({message: "Trip Lane Deleted"});
            }else {
                console.log("Error in deleting")
            }
        })
    };
}]);

app.controller('AddEditTripLaneCtrl', ['$scope','$state', 'Utils', 'TripLaneServices','$stateParams', 'Notification', function ($scope,$state, Utils, TripLaneServices, $stateParams, Notification) {
    console.log('-->', $stateParams);

    $scope.drivers = [];
    $scope.parties = [];

    $scope.tripLane = {
        name: '',
        from:'',
        to:'',
        estimatedDistance: '',
        success:''
    };
    $scope.cancel = function () {
        $state.go('tripLanes');
    };


    if ($stateParams.tripLaneId) {
        TripLaneServices.getTripLane($stateParams.tripLaneId, function (success) {
            console.log('acc--->', success.data.tripLane);
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
        params.success = '';
        params.error = '';

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
        } else {
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
}]);

