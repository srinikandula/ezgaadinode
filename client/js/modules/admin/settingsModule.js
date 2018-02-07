app.controller('settingsCtrl', function ($scope, $uibModal, $uibModalInstance) {

    $scope.openPopup = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addNewGPS.html'
        });

    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});