app.controller('DashboardCtrl', ['$scope', function ($scope) {
    var templates = {
        accounts: '/views/templates/accounts/display.html',
        accountEdit: '/views/templates/accounts/edit.html',
        userPage: '/views/templates/users.html',
        driverPage: '/views/templates/drivers.html',
        trucksPage: '/views/templates/trucks.html',
        tripsPage: '/views/templates/trips.html',
        partyPage: '/views/templates/party.html',
        maintenanceCost: '/views/templates/maintenance.html',
        tripLane: '/views/templates/trip-lane.html'
    };

    $scope.template = templates['accounts'];

    $scope.navigate = function (name) {
        $scope.template = templates[name];
    }
}]);