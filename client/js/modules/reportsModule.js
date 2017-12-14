app.factory('ReportService', function ($http) {
    return {
        getReport: function (success, error) {
            $http({
                url: '/v1/reports',
                method: "GET"
            }).then(success, error)
        }
    }
});