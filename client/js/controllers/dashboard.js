app.controller('DashboardCtrl', ['$scope', function ($scope) {
    var templates = {
        addAccount: '/views/templates/accounts.html',
        userPage: '/views/templates/users.html',
        driverPage: '/views/templates/drivers.html',
        trucksPage: '/views/templates/trucks.html',
        tripsPage: '/views/templates/trips.html',
        partyPage: '/views/templates/party.html',
        maintenanceCost: '/views/templates/maintenance.html',
        tripLane: '/views/templates/trip-lane.html'
    };

    $scope.template = templates['addAccount'];

    $scope.navigate = function(name) {
        $scope.template = templates[name];
    }


}]);