app.factory('SettingServices',['$http', function ($http) {
    return {
        getTruckTypes: function (success, error) {
            $http({
                url: '/v1/cpanel/settings/getTruckTypes',
                method: "GET"
            }).then(success, error)
        },
        getGoodsTypes:function (success, error) {
            $http({
                url: '/v1/cpanel/settings/getGoodsTypes',
                method: "GET"
            }).then(success, error)
        }

    }
}]);

app.controller('settingsCtrl', function ($scope, $uibModal) {

    $scope.openPopup = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html'
        });

    };


});