app.factory('LoadRequestService',['$http',function($http){
    return{
        addLoadRequest: function (info, successCallback, errorCallback) {
            $http({
                url: '/v1/loadRequest/add',
                method: "POST",
                data:info
            }).then(successCallback, errorCallback)
        },
        getLoadRequests:function(successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/getLoadRequests',
                method: "GET"
            }).then(successCallback, errorCallback)
        },
        getLoadRequest:function(id,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/getLoadRequest/'+id,
                method: "GET"
            }).then(successCallback, errorCallback)
        },
        updateLoadRequest:function(params,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/updateLoadRequest',
                method: "PUT",
                data:params
            }).then(successCallback, errorCallback)
        },
        deleteLoadRequest:function(id,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/deleteLoadRequest/'+id,
                method: "DELETE"
            }).then(successCallback, errorCallback)
        },
        getTruckTypes:function(params,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/getTruckTypes',
                method: "GET",
                params:params
            }).then(successCallback, errorCallback)
        }
    }

}]);
app.controller('loadRequestCtrl', ['$scope','LoadRequestService','$state','$stateParams','Notification',function($scope,LoadRequestService,$state,$stateParams,Notification){
    $scope.pageTitle = 'Add Load Request';
    $scope.loadRequest = {accountId:''};
    $scope.trucksList = [];

    $scope.getTruckTypes = function(){
        LoadRequestService.getTruckTypes({},function(successCallback){
            $scope.trucksList = successCallback.data.data;
            },function(errorCallback){

        });
    };
    $scope.addSearchSource = function () {
        var input = document.getElementById('source');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.source.sourceAddress = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function () {
        var input = document.getElementById('destination');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.destination.destinationAddress = place.formatted_address;
            });
    };
    if($stateParams.ID) {
        $scope.pageTitle = 'Update Load Request';
        LoadRequestService.getLoadRequest($stateParams.ID,function(successCallback){
            $scope.loadRequest = successCallback.data.data;
            $scope.loadRequest.dateAvailable = new Date($scope.loadRequest.dateAvailable);
            $scope.loadRequest.expectedDateReturn = new Date($scope.loadRequest.expectedDateReturn);
        },function(errorCallback){

        });
    }

    $scope.addOrUpdateLoadRequest = function () {
        var params = $scope.loadRequest;
        if($stateParams.ID){
            LoadRequestService.updateLoadRequest(params,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Updated Successfully"});
                }
            },function(errorCallback){
            });
        }else{
            LoadRequestService.addLoadRequest(params, function (successCallback) {
                if(successCallback.data.status){
                    Notification.success({message:"Added Successfully"});
                }else{
                    successCallback.data.errors.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }

            }, function (errorCallback) {

            });
        }
        $state.go('loadRequest');
        };

    $scope.cancel = function(){
        $state.go('loadRequest');
    }
}]);
app.controller('loadRequestListCtrl',['$scope','LoadRequestService','$state','Notification',function($scope,LoadRequestService,$state,Notification){
    $scope.loadRequests = [];
    $scope.reloadPage = function(){
        window.location.reload();
    };
    $scope.goToEditPage = function(id){
        $state.go('addLoadRequest',{ID:id});
    };

    LoadRequestService.getLoadRequests(function(successCallback){
        $scope.loadRequests = successCallback.data.data

    },function(errorCallback){

    });
    $scope.delete = function(id){
        LoadRequestService.deleteLoadRequest(id,function(successCallback){

        },function(errorCallback){

        });
        $scope.reloadPage();
    }
}]);
