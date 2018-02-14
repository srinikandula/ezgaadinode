app.factory('OrderProcessServices', ['$http', function ($http) {
    return {
        getTruckRequests: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckRequests',
                method: "GET",
                params: params
            }).then(success, error)
        },
        addTruckRequest: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addTruckRequest',
                method: "POST",
                data: data
            }).then(success, error)
        },
        getTruckRequestDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckRequestDetails',
                method: "GET",
                params: {_id: params}
            }).then(success, error)
        },
        searchTrucksForRequest:function (params,success,error) {
            $http({
                url:'/v1/cpanel/orderProcess/searchTrucksForRequest',
                method:"GET",
                params:params
            }).then(success,error);
        }

    }
}]);

app.controller('orderProcessCtrl', ['$scope', '$state', 'SettingServices', 'customerServices', 'Notification', 'OrderProcessServices', 'NgTableParams', '$stateParams', function ($scope, $state, SettingServices, customerServices, Notification, OrderProcessServices, NgTableParams, $stateParams) {

    $scope.cancel = function () {
        $state.go('customers.customersLead');
    };

    $scope.leadStatus = ['Initiate', 'Duplicate', 'Junk Lead', 'Language Barrier', 'Callback', 'Not interested',
        'Request for Approval'];

    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
    };
    $scope.initializeTruckRequest = function () {
        $scope.truckRequest = {
            customer: "",
            customerType: "",
            name: "",
            contactPhone: [""],
            email: "",
            leadType: "Transpoter",
            companyName: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            truckDetails: [{
                source: "",
                destination: "",
                goodsType: undefined,
                truckType: undefined,
                date: new Date(),
                pickupPoint: "",
                comment: "",
                expectedPrice: "",
                trackingAvailable: "",
                insuranceAvailable: ""
            }]
        };
        SettingServices.getTruckTypes({},function (success) {
            if(success.data.status){
                $scope.truckTypesList=success.data.data;
            }else{
                $scope.truckTypesList=[];

            }

        }, function (error) {

        });

        SettingServices.getGoodsTypes(function (success) {
            if (success.data.status) {
                $scope.goodsTypesList = success.data.data;
            } else {
                $scope.goodsTypesList = [];
            }

        }, function (error) {

        });

        customerServices.getTruckOwners(function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
            } else {
                $scope.goodsTypesList = [];
            }

        }, function (error) {

        });
    };
    $scope.initializeEditTruckRequest = function () {

        $scope.initializeTruckRequest();
        if ($stateParams._id) {
            OrderProcessServices.getTruckRequestDetails($stateParams._id, function (success) {
                if (success.data.status) {
                    $scope.truckRequest = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            Notification.error("Please try again");
        }
    };
    $scope.addTripDetails = function () {
        var trcuckDetails = $scope.truckRequest.truckDetails[$scope.truckRequest.truckDetails.length - 1];
        if (!trcuckDetails.source || !trcuckDetails.destination) {
            swal("Please fill mandatory truck details", "", "info");
        } else {
            $scope.truckRequest.truckDetails.push({
                source: "",
                destination: "",
                goodsType: undefined,
                truckType: undefined,
                date: new Date(),
                pickupPoint: "",
                comment: "",
                expectedPrice: "",
                trackingAvailable: "",
                insuranceAvailable: ""
            });
        }

    };

    $scope.removeTruckDetails = function (index) {
        $scope.truckRequest.truckDetail.splice(index, 1);
    };

    function checkTruckDetails() {
        for (var i = 0; i < $scope.truckRequest.truckDetails.length; i++) {
            if (!$scope.truckRequest.truckDetails[i].source || !$scope.truckRequest.truckDetails[i].destination) {
                return false;
            }
            if (i === $scope.truckRequest.truckDetails.length - 1) {
                return true;
            }
        }
    }

    $scope.addTruckRequest = function () {
        var params = $scope.truckRequest;
        params.messages = [];
        if (!params.customerType) {
            params.messages.push("Please select customer type");
        }
        if (params.customerType === "Registered" && !params.customer) {
            params.messages.push("Please select customer");
        }
        if (params.customerType === "UnRegistered" && !params.name) {
            params.messages.push("Please select name");
        }
        if (params.customerType === "UnRegistered" && !params.contactPhone) {
            params.messages.push("Please select customer");
        }

        if (!checkTruckDetails) {
            params.messages.push("Please enter mandatory truck details")
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            params.customer = params.customer._id;
            OrderProcessServices.addTruckRequest(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $state.go("orderprocess.truckRequest");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }
    };

    $scope.getTruckRequests = function () {
        $scope.requestTruckParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: 100,
            getData: function (tableParams) {

                var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};

                OrderProcessServices.getTruckRequests(pageable, function (success) {

                    if (success.data.status) {
                        $scope.truckRequestsList = success.data.data;
                        tableParams.data = $scope.truckRequestsList;
                        tableParams.total(parseInt(success.data.count));
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                }, function (error) {
                    error.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                });
            }

        });
    };
    $scope.addSearchSource = function (index) {
        var input = document.getElementById('searchSource'+index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.truckRequest.truckDetails[index].source = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination'+index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.truckRequest.truckDetails[index].destination = place.formatted_address;
            });
    };
    $scope.searchSource = function () {
        var input = document.getElementById('searchSource');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.truckRequest.source = place.formatted_address;
            });
    };
    $scope.searchDestination = function () {
        var input = document.getElementById('searchDestination');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.truckRequest.destination = place.formatted_address;
            });
    }
    $scope.searchTrucksForRequest=function () {
        OrderProcessServices.searchTrucksForRequest({source:$scope.truckRequest.source,destination:$scope.truckRequest.destination},function (success) {
        if(success.data.status){
            $scope.availableTruckslist=success.data.data;
        }else{
            success.data.messages.forEach(function (message) {
                Notification.error(message);
            })
        }
        },function (error) {

        })
    }


}]);