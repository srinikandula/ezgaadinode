app.factory('GEoFencesReportsServices', ['$http', function ($http) {
    return {
        getGeoFenceReports: function (params, success, error) {
            $http({
                url: '/v1/geoFenceReports/getGroFenceReports',
                method: "get",
                params: params,
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/geoFenceReports/count',
                method: "GET"
            }).then(success, error)
        },

    }
}]);

app.controller('GeoFencesReportsListController', ['$scope', '$state', 'GEoFencesReportsServices', 'Notification', 'NgTableParams', 'paginationService', function ($scope, $state, GEoFencesReportsServices, Notification, NgTableParams, paginationService) {

    $scope.count = 0;
    $scope.getCount = function () {
        GEoFencesReportsServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.init();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })
            }
        });
    };


    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            partyName: tableParams.partyName
        };
        $scope.loading = true;
        GEoFencesReportsServices.getGeoFenceReports(pageable, function (success) {
            if(success.data.status){
                $scope.geoFencesList = success.data.data;
                tableParams.data = $scope.geoFencesList;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }

        },function (error) {

        });
    };

    $scope.init = function () {
        $scope.lrParams = new NgTableParams({
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
                // $scope.getAllParties();
            }
        });
    };
    $scope.getCount();





}]);



