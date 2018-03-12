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
        searchTrucksForRequest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/searchTrucksForRequest',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getTruckRequestQuotes: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckRequestQuotes',
                method: "GET",
                params: {truckRequestId: params}
            }).then(success, error);
        },
        addTruckRequestQuote: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addTruckRequestQuote',
                method: "POST",
                data: data
            }).then(success, error);
        },
        getLoadBookingDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getLoadBookingDetails',
                method: "GET",
                params: {truckRequestId: params}
            }).then(success, error);
        },
        getTrucksAndDriversByAccountId: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTrucksAndDriversByAccountId',
                method: "GET",
                params: {_id: params}
            }).then(success, error);
        },
        loadBookingForTruckRequest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/loadBookingForTruckRequest',
                method: "POST",
                data: params
            }).then(success, error);
        },
        addTruckRequestComment: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addTruckRequestComment',
                method: "POST",
                data: params
            }).then(success, error);
        },
        getTruckRequestComments:function (params,success,error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckRequestComments',
                method: "GET",
                params: {truckRequestId: params}
            }).then(success, error);
        },
        updateTruckRequestDetails:function (params,success,error) {
            $http({
                url: '/v1/cpanel/orderProcess/updateTruckRequestDetails',
                method: "PUT",
                data: params
            }).then(success, error);
        },
        deleteTruckRequest:function (params,success,error) {
            $http({
                url: '/v1/cpanel/orderProcess/deleteTruckRequest',
                method: "DELETE",
                params: {_id: params}
            }).then(success, error);
        },
        getLoadRequest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getLoadRequest',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getLoadRequestDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getLoadRequestDetails',
                method: "GET",
                params: {loadRequestId: params}
            }).then(success, error)
        },
        updateLoadRequest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/updateLoadRequest',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        deleteLoadRequest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/deleteLoadRequest',
                method: "DELETE",
                params: {loadRequestId: params}
            }).then(success, error)
        },
        countLoadRequest: function (success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/countLoadRequest',
                method: "GET",
            }).then(success, error)
        },
        getAllAccountsExceptTruckOwners:function (params,success,error) {
            $http({
                url:'/v1/cpanel/orderProcess/getAllAccountsExceptTruckOwners',
                method:"GET",
                params:params
            }).then(success,error);
        }

    }
}]);

app.controller('orderProcessCtrl', ['$scope', '$state', 'SettingServices', 'customerServices', 'Notification', 'OrderProcessServices', 'NgTableParams', '$stateParams', function ($scope, $state, SettingServices, customerServices, Notification, OrderProcessServices, NgTableParams, $stateParams) {

    $scope.cancel = function () {
        $state.go('orderprocess.truckRequest');
    };

    $scope.leadStatus = ['Initiate', 'Duplicate', 'Junk Lead', 'Language Barrier', 'Callback', 'Not interested',
        'Request for Approval'];

    $scope.status = {
        isOpen: true,
        isOpenOne: true,
        isOpenTwo: true,
        isOpenThree: true,
        isOpenFour: true,
        isOpenFive: true,
    };
    $scope.initializeTruckRequest = function () {
        $scope.currentElement=0;
        $scope.search="";
        $scope.truckRequest = {
            customer: "",
            title:"",
            customerName:"",
            customerType: "",
            firstName: "",
            contactPhone: "",
            email: "",
            leadType: "Transpoter",
            companyName: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            loadingCharge:"",
            unloadingCharge:"",
            pushMessage:"",
            trackingRequired: "",
            insuranceRequired:"",
            status:undefined,
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
        SettingServices.getTruckTypes({}, function (success) {
            if (success.data.status) {
                $scope.truckTypesList = success.data.data;
            } else {
                $scope.truckTypesList = [];

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

        OrderProcessServices.getAllAccountsExceptTruckOwners({name:$scope.search,size:$scope.currentElement},function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });


    };
    $scope.loadMore=function(){
        console.log("loadMore");
        $scope.currentElement=$scope.currentElement+10;
        OrderProcessServices.getAllAccountsExceptTruckOwners( {name:$scope.search,size:$scope.currentElement},function (success) {
            if (success.data.status) {
                $scope.truckOwnersList= $scope.truckOwnersList.concat(success.data.data);
                console.log($scope.truckOwnersList.length);
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });
    };
    $scope.searchAccountOwner=function (search) {
        $scope.currentElement=0;
       $scope.search=search;
        OrderProcessServices.getAllAccountsExceptTruckOwners( {name:$scope.search,size:$scope.currentElement},function (success) {
            if (success.data.status) {
                $scope.truckOwnersList= success.data.data;
                console.log($scope.truckOwnersList.length);
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });
    };

    $scope.initializeEditTruckRequest = function () {
        $scope.loadBooking = {
            registrationNo: "",
            driverId: "",
            date: "",
            tripLane: "",
            accountId: "",
            tripLane: "",
            date: "",
            freightAmount: "",
            customer: ""
        };
        $scope.comment = {
            status: undefined,
            comment: ""
        };

        $scope.initializeTruckRequest();
        if ($stateParams._id) {
            OrderProcessServices.getTruckRequestDetails($stateParams._id, function (success) {
                if (success.data.status) {
                    $scope.truckRequest = success.data.data;
                    $scope.truckRequest.date = new Date($scope.truckRequest.date);

                    $scope.quote = {
                        truckRequestId: $stateParams._id,
                        quote: "",
                        comment: "",
                        messages: []
                    };
                    $scope.quotesList = [];
                    if ($scope.truckRequest.customerType === 'Registered') {
                        $scope.customer = $scope.truckRequest.customer;
                    } else {
                        $scope.customer = $scope.truckRequest.customerLeadId;
                    }
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
        console.log('params.customerType === "UnRegistered" && !params.name', params.customerType, params.name);
        params.messages = [];
        if (!params.customerType) {
            params.messages.push("Please select customer type");
        }
        if (params.customerType === "Registered" && !params.customer) {
            params.messages.push("Please select customer");
        }
        if (params.customerType === "UnRegistered" && !params.firstName) {
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
            if (params.customerType === "Registered") {
                params.title=params.customer.firstName+" ,"+params.customer.contactPhone;
                params.customerName=params.customer.firstName;
                params.customer = params.customer._id;

            }else{
                params.title=params.firstName+" , "+params.contactPhone;
                params.customerName=params.firstName;


            }
            console.log("Params",params);
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
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.truckRequest.truckDetails[index].source = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
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
                $scope.truckRequest.destinationLocation = [parseFloat(place.geometry.location.lng()), parseFloat(place.geometry.location.lat())];
                console.log('palece', $scope.truckRequest.destinationLocation);

            });
    };
    $scope.searchTrucksForRequest = function () {
        OrderProcessServices.searchTrucksForRequest({
            source: $scope.truckRequest.source,
            destination: $scope.truckRequest.destinationLocation,
            truckType:$scope.truckRequest.truckType
        }, function (success) {
            if (success.data.status) {
                $scope.availableTruckslist = success.data.data;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })
            }
        }, function (error) {


        })
    };
    $scope.getTruckRequestQuotes = function () {
        OrderProcessServices.getTruckRequestQuotes($stateParams._id, function (success) {
            if (success.data.status) {
                $scope.quotesList = success.data.data;
            } else {
                /*success.data.messages.forEach(function (message) {
                    Notification.error(message);
                })*/
            }
        }, function (error) {

        })
    };
    $scope.addTruckRequestQuote = function () {
        var params = $scope.quote;
        params.messages = [];
        if (!params.quote) {
            params.messages.push("Please enter quote");
        }
        if (!params.comment) {
            params.messages.push("Please enter comment");

        }
        if (!params.accountId) {
            params.messages.push("Please select customer");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            })
        } else {
            OrderProcessServices.addTruckRequestQuote(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $scope.quotesList.push(success.data.data);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    })
                }
            }, function (error) {

            })
        }
    };

    $scope.loadBookingForTruckRequest = function () {
        var params = $scope.loadBooking;
        params.messages = [];
        if (!params.registrationNo) {
            params.messages.push("Please select truck");
        }
        if (!params.freightAmount) {
            retObj.messages.push("Please enter amount");
        }
        if (!params.tripLane) {
            params.messages.push("Please enter pickup point");
        }
        if (!params.accountId) {
            params.messages.push("Please select truck provider");
        }
        if (!params.driverId) {
            params.messages.push("Please select driver");
        }
        if (!params.date) {
            params.messages.push("Please select pickup date");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message)
            })
        } else {
            params.truckRequestId = $stateParams._id;
            if($scope.truckRequest.customerType==="Registered"){
               params.partyId=$scope.truckRequest.customer._id
            }else{
                params.partyId=$scope.truckRequest.customerLeadId._id;
            }
            OrderProcessServices.loadBookingForTruckRequest(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message)
                    });
                    params.truckRequestId = success.data.data;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message)
                    })
                }
            }, function (error) {

            })
        }
    };
    $scope.loadBookingStatus = false;
    $scope.getLoadBookingDetails = function () {
        if (!$scope.loadBookingStatus) {
            $scope.getTruckRequestQuotes();
            $scope.loadBookingStatus = true;
            OrderProcessServices.getLoadBookingDetails($stateParams._id, function (success) {
                if (success.data.status) {
                    $scope.loadBooking = success.data.data;
                    $scope.loadBooking.date = new Date($scope.loadBooking.date);
                    $scope.loadBooking.customer=$scope.loadBooking.accountId;
                    $scope.getTrucksAndDriversByAccountId();
                } else {
                    $scope.loadBooking = {
                        registrationNo: "",
                        driverId: "",
                        date: "",
                        tripLane: "",
                        accountId: "",
                        tripLane: "",
                        date: "",
                        freightAmount: ""
                    }

                }
            }, function (error) {

            })
        }
    };
    $scope.getTrucksAndDriversByAccountId = function () {


        if ($scope.loadBooking.customer) {
            $scope.loadBooking.accountId = $scope.loadBooking.customer._id;

            OrderProcessServices.getTrucksAndDriversByAccountId($scope.loadBooking.accountId, function (success) {
                if (success.data.status) {
                    $scope.loadBooking.trucksList = success.data.data.trucksList;
                    $scope.loadBooking.driversList = success.data.data.driversList;


                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    })
                }
            }, function (error) {

            })
        }
    };

    $scope.acceptQuote = function (quote) {
        $scope.loadBooking.customer = quote;
        $scope.getTrucksAndDriversByAccountId();
    };
    $scope.getTruckRequestComments = function () {
        OrderProcessServices.getTruckRequestComments($stateParams._id, function (success) {
            if (success.data.status) {
                $scope.commentList = success.data.data;
            }
        }, function (error) {

        })
    };
    $scope.addTruckRequestComment = function () {
        var params = $scope.comment;
        params.messages = [];
        if (!params.status) {
            params.messages.push("Please select status");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            })
        } else {
            params.truckRequestId=$stateParams._id;
            OrderProcessServices.addTruckRequestComment(params, function (success) {
                if (success.data.status) {
                    if($scope.commentList.length>0){
                        $scope.commentList.unshift(success.data.data);
                    }else{
                        $scope.commentList=[success.data.data];
                    }
                    $scope.truckRequest.status=success.data.data.status;
                    $scope.comment = {
                        status: undefined,
                        comment: ""
                    };
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    })

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    })
                }
            }, function (error) {

            })

        }

    };
    $scope.updateTruckRequestDetails=function () {
      OrderProcessServices.updateTruckRequestDetails($scope.truckRequest,function (success) {
          if(success.data.status){
              success.data.messages.forEach(function (message) {
                  Notification.success(message);
              })

          }else{
              success.data.messages.forEach(function (message) {
                  Notification.error(message);
              })
          }
      },function (error) {

      })
    };

    $scope.deleteTruckRequest=function (id) {
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
                OrderProcessServices.deleteTruckRequest(id,function (success) {
                    if(success.data.status){
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $scope.getTruckRequests();
                    }else{
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                },function (err) {

                })
            }
        });

    }

    /*Load Request*/
    $scope.loadCount = 0;

    $scope.getLoadRequest = function () {
        $scope.requestLoadParams = new NgTableParams({
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
                OrderProcessServices.getLoadRequest(pageable, function (success) {
                    if (success.data.status) {
                        $scope.loadRequestsList = success.data.data;
                        tableParams.data = $scope.loadRequestsList;
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

    $scope.initializeLoadRequest = function () {
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
            loadingCharge:"",
            unloadingCharge:"",
            pushMessage:"",
            trackingRequired: "",
            insuranceRequired:"",
            status:undefined,
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
        SettingServices.getTruckTypes({}, function (success) {
            if (success.data.status) {
                $scope.truckTypesList = success.data.data;
            } else {
                $scope.truckTypesList = [];

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

    $scope.loadCancel = function () {
        $state.go('orderprocess.loadRequest');
    };

}]);