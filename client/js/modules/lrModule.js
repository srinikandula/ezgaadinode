app.factory('LrServices', ['$http', function ($http) {
    return {
        addLR: function (params, success, error) {
            $http({
                url: '/v1/lrs/add',
                method: "POST",
                data: params,
            }).then(success, error)
        },
        updateLR: function (params, success, error) {
            $http({
                url: '/v1/lrs/update',
                method: "PUT",
                data: params,
            }).then(success, error)
        },
        getLR: function (lrId, success, error) {
            $http({
                url: '/v1/lrs/get/'+lrId,
                method: "GET"
            }).then(success, error)
        },
        getAllLrs: function (params,success, error) {
            $http({
                url: '/v1/lrs/getAll',
                method: "GET",
                params:params
            }).then(success, error)
        },
        deleteLR: function (lrId, success, error) {
            $http({
                url: '/v1/lrs/'+lrId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/lrs/total/count',
                method: "GET"
            }).then(success, error)
        },

    }
}]);

app.controller('LrsListController', ['$scope', '$state', 'LrServices', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, LrServices, Notification, NgTableParams, paginationService, TrucksService) {

    $scope.count = 0;
    $scope.getCount = function () {
        LrServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.init();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })
            }
        });
    };


    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            partyName: tableParams.partyName
        };
        $scope.loading = true;
        LrServices.getAllLrs(pageable, function (success) {
            if(success.data.status){
                $scope.lrsList = success.data.data;
                tableParams.data = $scope.lrsList;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }

        },function (error) {

        });
    };

    $scope.init = function () {
        $scope.lrParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
               // $scope.getAllParties();
            }
        });
    };
    $scope.getCount();
    $scope.goToEditLrPage = function (lrId) {
        $state.go('lrEdit', {lrId: lrId});
    };
    $scope.deleteLR = function (lrId) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E83B13',
            cancelButtonColor: '#9d9d9d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                LrServices.deleteLR(lrId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'LR deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                }, function (err) {

                });
            }
        });

    };
    $scope.generatePdf=function (lrId) {
        window.open('/v1/lrs/generatePDF/' + lrId );
    }


}]);

app.controller('AddEditLRCtrl', ['$scope', '$state', 'LrServices', 'Notification', 'NgTableParams', 'paginationService','TrucksService','$stateParams','PartyService','AccountServices', function ($scope, $state, LrServices, Notification, NgTableParams, paginationService, TrucksService,$stateParams,PartyService,AccountServices) {

    AccountServices.userProfile(function (success) {
        if (success.data.status) {
            $scope.account = success.data.result.profile;
            $scope.lr.consigneeGSTNo = $scope.account.GST;
        } else {
            success.data.messages.forEach(function (message) {
                Notification.error({message: message});
            });
        }
    }, function (err) {});

    $scope.getParties = function(){
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (error) {

        });
    };
    $scope.getGSTNo = function(){
        $scope.lr.consignorGSTNo = $scope.lr.consignorName.gstNo;
    };
    function getTrucks() {
        TrucksService.getAllTrucksForFilter(function (success) {
            if(success.data.status){
                $scope.trucksList=success.data.trucks;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })

            }
        },function (error) {

        })
    }
    getTrucks();
    $scope.getParties();
    $scope.pageTitle = "Add LR Details";

    if ($stateParams.lrId) {
        $scope.pageTitle = "Edit LR Details";
        LrServices.getLR($stateParams.lrId, function (success) {
            if (success.data.status) {
                $scope.lr = success.data.data;
                $scope.lr.date=new Date($scope.lr.date);
                $scope.truckRegNo=$scope.lr.registrationNo;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })
            }
        }, function (err) {
        });
    }
    $scope.lr={};
    $scope.addOrUpdateLR=function () {
        var params=$scope.lr;
        params.error = [];
        if(!params.consignorName){
            params.error.push("Enter consignor name");
        }
        if(!params.consigneeBanksNameAndAddress){
            params.error.push("Enter consignee name");
        }
        if(!params.addressOfDeliveryOffice){
            params.error.push("Enter delivery office");
        }
        if(params.error.length>0){
            params.error.forEach(function (message) {
                Notification.error(message);
            })
        }else{
            if(params.registrationNo && params.registrationNo.registrationNo){
                params.registrationNo=params.registrationNo.registrationNo;
            }
            if(params._id){
                LrServices.updateLR(params,function (success) {
                    if(success.data.status){
                        Notification.success(success.data.messages[0]);
                        $state.go('lrs');
                    }else{
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                },function (error) {

                })
            }else{
                LrServices.addLR(params,function (success) {
                    if(success.data.status){
                        Notification.success(success.data.messages[0]);
                        $state.go('lrs');
                    }else{
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                },function (error) {

                })
            }
        }

    };
    $scope.searchSource = function () {
        var input = document.getElementById('source');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.lr.from = place.formatted_address;

            });
    };
    $scope.searchDestination = function () {
        var input = document.getElementById("destination");
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.lr.to = place.formatted_address;
            });
    };
    $scope.selectedTruck = function () {
        $scope.lr.truckId = parseInt($scope.lr.registrationNo._id);
    };
}]);


