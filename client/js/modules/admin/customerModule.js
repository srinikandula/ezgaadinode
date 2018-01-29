app.controller('customerCtrl',['$scope', '$state',function ($scope, $state) {

    $scope.cancel = function () {
        $state.go('customers');
    };

    $scope.leadStatus = ['Initiate', 'Duplicate', 'Junk Lead', 'Language Barrier', 'Callback', 'Not interested',
        'Request for Approval'];

    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
    };
}]);