app.controller('DashboardCtrl', ['$scope', function ($scope) {
    var templates = {
        addAccount: '/views/templates/addAccount.html'
    };

    $scope.template = templates['addAccount'];

    $scope.navigate = function(name) {
        $scope.template = templates[name];
    }


}]);