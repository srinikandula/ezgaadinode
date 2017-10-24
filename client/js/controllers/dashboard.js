app.controller('DashboardCtrl', ['$scope', function ($scope) {
    var templates = {
        addAccount: '/views/templates/accounts.html'
    };

    $scope.template = templates['addAccount'];

    $scope.navigate = function(name) {
        $scope.template = templates[name];
    }


}]);