app.factory('AnalyticsServices', function ($http, $cookies) {
    return {
        getLastLoginReports: function (action,from,to, success, error) {
            $http({
                url: '/v1/analytics/getReports/'+action+'/'+from+'/'+to,
                method: "GET",
            }).then(success, error)
        },
        getReportsByUserAgent: function (action,from,to, success, error) {
            $http({
                url: '/v1/analytics/getReportsByUserAgent/'+action+'/'+from+'/'+to,
                method: "GET",
            }).then(success, error)
        }
    }
});
app.controller('AnalyticsReportCtrl', ['$scope', 'AnalyticsServices', '$state', 'NgTableParams', function ($scope, AnalyticsServices, $state, NgTableParams) {
    $scope.dateParams={
        from:new Date(),
        to:new Date()
    };
    $scope.action='Select Action';
    // function getReports() {
    $scope.getReports = function () {
        console.log($scope.dateParams);
        AnalyticsServices.getLastLoginReports($scope.action,$scope.dateParams.from,$scope.dateParams.to,function (success) {
            if(success.data.status){
                $scope.reports=success.data.results;
                console.log($scope.reports);
            }else {

            }
        })
    };

    $scope.userAgent='Select User Agent';

    $scope.getReportsByUserAgent =function () {
        AnalyticsServices.getReportsByUserAgent($scope.userAgent,$scope.dateParams.from,$scope.dateParams.to,function (success) {
            if(success.data.status){
                $scope.reportsByUserAgent=success.data.results;
                console.log($scope.reportsByUserAgent);
            }else {

            }
        })
    }

    // getReports();
}]);