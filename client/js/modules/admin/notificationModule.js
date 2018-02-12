app.controller('NotificationCntrl', ['$scope', '$uibModal', function ($scope, $uibModal) {

    $scope.newGpsTruckNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsTruckNtfcn.html',
            controller:'addNtfnCtrl',
            windowClass:'window-custom'
        });
    };
    $scope.newGpsLoadNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newGpsLoadNtfcn.html',
            controller:'addNtfnCtrl',
            windowClass:'window-custom'

        });
    };
    $scope.addAppNtfcn = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addAppNtfcn.html',
            controller:'addNtfnCtrl',

        });
    };

}]);


app.controller('addNtfnCtrl',['$scope','$uibModalInstance', function ($scope, $uibModalInstance) {

    $scope.closeGPS = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);