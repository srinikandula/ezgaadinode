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
        shareLoadRequest:function(id,params,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/shareDetails/'+id,
                method: "GET",
                // params:{parties:params}
                params:params
            }).then(successCallback, errorCallback)
        },
        shareViaSMS:function(params,successCallback,errorCallback){
            $http({
                url: '/v1/loadRequest/shareDetailsViaSMS',
                method: "GET",
                params:params
            }).then(successCallback, errorCallback)
        }
    }

}]);
app.controller('loadRequestCtrl', ['$scope','LoadRequestService','$state','$stateParams','Notification','PartyService','TrucksService',function($scope,LoadRequestService,$state,$stateParams,Notification,PartyService,TrucksService){
    $scope.pageTitle = 'Add Load Request';
    $scope.loadRequest = {accountId:''};
    $scope.trucksList = [];
    $scope.parties = [];
    $scope.dateAvailable ;
    $scope.expectedDateReturn;
    $scope.shareDetails ='';
    $scope.partiesToShare = [];

    $scope.loadData = function(){
        LoadRequestService.getLoadRequest($stateParams.Id,function(successCallback){
            if(successCallback.data.status) {
                $scope.loadRequest = successCallback.data.data;
                $scope.loadRequest.truckType = $scope.loadRequest.truckType.title+','+$scope.loadRequest.truckType.tonnes+'tonnes'
                $scope.loadRequest.dateAvailable = new Date($scope.loadRequest.dateAvailable);
                var dateAvailable = $scope.loadRequest.dateAvailable.getMonth()+1;
                $scope.dateAvailable = $scope.loadRequest.dateAvailable.getDate()+"-"+dateAvailable+"-"+$scope.loadRequest.dateAvailable.getFullYear()
                $scope.loadRequest.expectedDateReturn = new Date($scope.loadRequest.expectedDateReturn);
                var expectedDateReturn = $scope.loadRequest.expectedDateReturn.getMonth()+1;
                $scope.expectedDateReturn = $scope.loadRequest.expectedDateReturn.getDate()+"-"+expectedDateReturn+"-"+$scope.loadRequest.expectedDateReturn.getFullYear()
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){

        });
    };

    $scope.getTruckTypes = function(){
        TrucksService.getTruckTypes(function(successCallback){
            if(successCallback.data.status){
                $scope.trucksList = successCallback.data.data;
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
            },function(errorCallback){
            });
    };
    $scope.getAllParties = function(){
        PartyService.getAllPartiesForFilter(function(successCallback){
            if(successCallback.data.status){
                $scope.parties = successCallback.data.parties;
                for(var i =0;i<$scope.parties.length;i++){
                    if($scope.parties[i].partyType === "Load Owner"){
                        $scope.partiesToShare.push($scope.parties[i]);
                    }
                }
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
            },function(errorCallback){
            });
        $scope.loadData();
    };
    $scope.shareLoadRequest = function(parties){
        var params = {parties:parties,content:$scope.shareDetails};
        LoadRequestService.shareLoadRequest($stateParams.Id,params,function(successCallback){
            if(successCallback.data.status){
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({ message: message });
                });
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
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
             if(successCallback.data.status) {
                 $scope.loadRequest = successCallback.data.data;
                 $scope.loadRequest.dateAvailable = new Date($scope.loadRequest.dateAvailable);
                 $scope.loadRequest.expectedDateReturn = new Date($scope.loadRequest.expectedDateReturn);
             }else{
                 successCallback.data.messages.forEach(function (message) {
                     Notification.error({ message: message });
                 });
             }
             },function(errorCallback){
             });
    }

    $scope.addOrUpdateLoadRequest = function () {
        var params = $scope.loadRequest;
        if($stateParams.ID){
            LoadRequestService.updateLoadRequest(params,function(successCallback){
                if(successCallback.data.status){
                    $state.go('loadRequests');
                    Notification.success({message:"Updated Successfully"});
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){
            });
        }else{
            LoadRequestService.addLoadRequest(params, function (successCallback) {
                if(successCallback.data.status){
                    $state.go('loadRequests');
                    Notification.success({message:"Added Successfully"});
                }else{
                    successCallback.data.errors.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
                }, function (errorCallback) {
                });
        }
        };

    $scope.cancel = function(){
        $state.go('loadRequests');
    };

    $scope.selectAllParties=function () {
        $scope.parties.forEach(function (party) {
            party.isChecked=$scope.all;
        })
    };

    $scope.checkParties = function () {
        $scope.all=true;
        $scope.parties.forEach(function (party) {

            if(!party.isChecked){
                $scope.all=false;
            }
        })
    };

}]);
app.controller('loadRequestListCtrl',['$scope','LoadRequestService','$state','Notification',function($scope,LoadRequestService,$state,Notification){
    $scope.loadRequests = [];
    $scope.goToEditPage = function(id){
        $state.go('add-editLoadRequest',{ID:id});
    };
    $scope.share = function(id){
        $state.go('sendLoadRequest',{Id:id});
    };
    LoadRequestService.getLoadRequests(function(successCallback){
        if(successCallback.data.status){
            $scope.loadRequests = successCallback.data.data;
        }else{
            successCallback.data.messages.forEach(function (message) {
                Notification.error({ message: message });
            });
        }
        },function(errorCallback){
        });
    $scope.delete = function(id){
        LoadRequestService.deleteLoadRequest(id,function(successCallback){
            if(successCallback.data.status){
                Notification.success({message:"deleted Successfully"});
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){

        });
    }
}]);
app.controller('smsCtrl',['$scope','LoadRequestService','Notification',function($scope,LoadRequestService,Notification){
    $scope.content = {contact:[],text:''};
    $scope.sendSMS = function(){
        var params = $scope.content;
        LoadRequestService.shareViaSMS(params,function(successCallback){
            if(successCallback.data.status){
                successCallback.data.messages.forEach(function (message) {
                    Notification.success({ message: message });
                    $scope.content = null;
                });
            }else{
                successCallback.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function(errorCallback){

        });
    };


}]);

