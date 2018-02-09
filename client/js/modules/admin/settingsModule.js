app.controller('settingsCtrl', function ($scope, $uibModal) {

    $scope.openPopup = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html'
        });

    };


});