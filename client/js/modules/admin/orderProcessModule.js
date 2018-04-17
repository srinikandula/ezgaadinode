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
        countTruckRequest: function (success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/countTruckRequest',
                method: "GET",
            }).then(success, error)
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
        getTruckRequestComments: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckRequestComments',
                method: "GET",
                params: {truckRequestId: params}
            }).then(success, error);
        },
        updateTruckRequestDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/updateTruckRequestDetails',
                method: "PUT",
                data: params
            }).then(success, error);
        },
        deleteTruckRequest: function (params, success, error) {
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
        addLoadRequest: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addLoadRequest',
                method: "POST",
                data: data
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
        getAllAccountsExceptTruckOwners: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getAllAccountsExceptTruckOwners',
                method: "GET",
                params: params
            }).then(success, error);
        },
        createOrder: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/createOrder',
                method: "POST",
                data: data
            }).then(success, error)
        },
        getTransporter: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getTransporter',
                method: "GET",
            }).then(success, error)
        },
        totalAdminTruckOrders: function (success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/totalAdminTruckOrders',
                method: "GET",
            }).then(success, error)
        },
        getAdminTruckOrdersList: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getAdminTruckOrdersList',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getTruckOwnerOrderDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckOwnerOrderDetails',
                method: "GET",
                params: {_id: params}
            }).then(success, error)
        },
        getLoadOwnerOrderDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getLoadOwnerOrderDetails',
                method: "GET",
                params: {_id: params}
            }).then(success, error)
        },
        addOrderPayment: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addOrderPayment',
                method: "POST",
                data: data
            }).then(success, error)
        },
        getEasygaadiEmployeesList: function (success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getEasygaadiEmployeesList',
                method: "GET"
            }).then(success, error)
        },
        addOrderTransaction: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addOrderTransaction',
                method: "POST",
                data: data
            }).then(success, error)
        },
        addOrderComment: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addOrderComment',
                method: "POST",
                data: data
            }).then(success, error)
        },
        addOrderLocation: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/addOrderLocation',
                method: "POST",
                data: data
            }).then(success, error)
        },
        updateOrderProcess: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/updateOrderProcess',
                method: "PUT",
                data: data
            }).then(success, error)
        },
        deleteOrderLocation: function (data, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/deleteOrderLocation',
                method: "DELETE",
                params: {_id: data}
            }).then(success, error)
        },
        getTruckOwnersAndCommisionAgents: function (params, success, error) {
            $http({
                url: '/v1/cpanel/orderProcess/getTruckOwnersAndCommisionAgents',
                method: "GET",
                params: params
            }).then(success, error);
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
        $scope.currentElement = 0;
        $scope.search = "";
        $scope.truckRequest = {
            customer: "",
            title: "",
            customerName: "",
            customerType: "",
            firstName: "",
            contactPhone: "",
            email: "",
            leadType: "Transporter",
            companyName: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            loadingCharge: "",
            unloadingCharge: "",
            pushMessage: "",
            trackingRequired: "",
            insuranceRequired: "",
            status: undefined,
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

        OrderProcessServices.getAllAccountsExceptTruckOwners({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });


    };
    $scope.loadMore = function () {
        $scope.currentElement = $scope.currentElement + 10;
        OrderProcessServices.getAllAccountsExceptTruckOwners({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = $scope.truckOwnersList.concat(success.data.data);
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });
    };
    $scope.searchAccountOwner = function (search) {
        $scope.currentElement = 0;
        $scope.search = search;
        OrderProcessServices.getAllAccountsExceptTruckOwners({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
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
            freightAmount: "",
            customer: "",

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
                    $scope.customer =  success.data.data.customerDetails;

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
        var truckDetails = $scope.truckRequest.truckDetails[$scope.truckRequest.truckDetails.length - 1];
        if (!truckDetails.source || !truckDetails.destination) {
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
        $scope.truckRequest.truckDetails.splice(index, 1);
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
        console.log(params);
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
                params.title = params.customer.firstName + " ," + params.customer.contactPhone;
                params.customerName = params.customer.firstName;
                params.customer = params.customer._id;
            } else {
                params.title = params.firstName + " , " + params.contactPhone;
                params.customerName = params.firstName;
            }
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

    $scope.count = 0;
    $scope.numOfTruckRequest = function () {
        OrderProcessServices.countTruckRequest(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initTruckRequests();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    $scope.initTruckRequests = function () {
        $scope.requestTruckParams = new NgTableParams({
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
            }
        });
    };

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
        };
        OrderProcessServices.getTruckRequests(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.truckRequestsList = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
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

            });
    };
    $scope.searchTrucksForRequest = function () {
        OrderProcessServices.searchTrucksForRequest({
            source: $scope.truckRequest.source,
            destination: $scope.truckRequest.destinationLocation,
            truckType: $scope.truckRequest.truckType
        }, function (success) {
            if (success.data.status) {
                $scope.availableTruckslist = success.data.data;
                $scope.table = $('#SearchTruckRequest').DataTable({
                    destroy: true,
                    responsive: false,
                    aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                    iDisplayLength: 10,


                    data: success.data.data,
                    columns: [
                        {
                            "title": "S No",
                            "data": "id",
                            render: function (data, type, row, meta) {
                                return meta.row + meta.settings._iDisplayStart + 1;
                            }
                        },
                        {
                            "title": "Name",
                            "data": "firstName"
                        },
                        {
                            "title": "Type",
                            "data": "role"
                        },
                        {
                            "title": "Mobile",
                            "data": "contactPhone"
                        },
                        {
                            "title": "No of Trucks", "data": "noOfTrucks",
                            "render": function (data, type, row) {
                                if (!data) {
                                    return '--'
                                } else {
                                    return data;
                                }

                            }
                        },
                        {
                            title: "Company", "data": "company",
                            "render": function (data, type, row) {
                                if (!data) {
                                    return '--'
                                } else {
                                    return data;
                                }

                            }
                        },
                        {
                            "title": "Address",
                            "data": "address",
                            "render": function (data, type, row) {
                                if (!data) {
                                    return '--'
                                } else {
                                    return data;
                                }

                            }
                        },
                    ],

                })

            } else {
                $scope.availableTruckslist = [];
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
                $scope.quotesList = [];
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
                    $scope.getTruckRequestQuotes();
                    // $scope.quotesList.push(success.data.data);
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
        if (!params.to_bookedAmount) {
            params.messages.push("Please enter amount");
        }
        if (!params.tripLane) {
            params.messages.push("Please enter pickup point");
        }
        if (!params.accountId) {
            params.messages.push("Please select truck provider");
        }
        if (!params.driverMobile) {
            params.messages.push("Please enter driver id");
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
            params.truckOwnerId = $scope.loadBooking.customer._id;
            params.source = $scope.truckRequest.source;
            params.destination = $scope.truckRequest.destination;
            params.loadOwnerType = $scope.truckRequest.customerType;
            params.to_loadingCharge = $scope.loadBooking.to_loadingCharge;
            params.to_unloadingCharge = $scope.loadBooking.to_unloadingCharge;
            params.lo_loadingCharge = $scope.truckRequest.loadingCharge;
            params.lo_unloadingCharge = $scope.truckRequest.unloadingCharge;
            params.egBookedAmount=$scope.truckRequest.expectedPrice;
            params.truckType=$scope.truckRequest.truckType;

            if ($scope.truckRequest.customerType === "Registered") {
                params.loadOwnerId =$scope.customer._id
            } else {
                params.loadCustomerLeadId = $scope.customer._id;
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
                    $scope.loadBooking.customer = $scope.loadBooking.accountId;
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
            } else {
                $scope.commentList = [];
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
            params.truckRequestId = $stateParams._id;
            OrderProcessServices.addTruckRequestComment(params, function (success) {
                if (success.data.status) {
                    if ($scope.commentList.length > 0) {
                        $scope.commentList.unshift(success.data.data);
                    } else {
                        $scope.commentList = [success.data.data];
                    }
                    $scope.truckRequest.status = success.data.data.status;
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
    $scope.updateTruckRequestDetails = function () {
        OrderProcessServices.updateTruckRequestDetails($scope.truckRequest, function (success) {
            if (success.data.status) {
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
    };

    $scope.deleteTruckRequest = function (id) {
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
                OrderProcessServices.deleteTruckRequest(id, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $scope.getTruckRequests();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                }, function (err) {

                })
            }
        });

    };


}]);

app.controller('loadRequestCtrl', ['$scope', '$state', 'SettingServices', 'customerServices', 'Notification', 'OrderProcessServices', 'NgTableParams', '$stateParams', function ($scope, $state, SettingServices, customerServices, Notification, OrderProcessServices, NgTableParams, $stateParams) {

    $scope.cancel = function () {
        $state.go('orderprocess.loadRequest');
    };

    $scope.status = {
        isOpen: true,
        isOpenTwo: true,
    };

    $scope.loadRequest = {
        customerType: "",
        customerId: "",
        firstName: "",
        contactPhone: "",
        truckDetails: [{
            sourceAddress: "",
            destination: [{
                destinationAddress: "",
                price: ""
            }],
            truckType: "",
            registrationNo: "",
            makeYear: "",
            driverInfo: "",
            dateAvailable: "",
            expectedDateReturn: "",
        }],
    }

    $scope.currentElement = 0;
    $scope.search = "";
    $scope.title = "Add Load Request";
    if ($stateParams.loadRequestId) {
        $scope.title = "Edit Load Request";
        OrderProcessServices.getLoadRequestDetails($stateParams.loadRequestId, function (success) {
            if (success.data.status) {
                $scope.loadRequest = success.data.data;
                $scope.loadRequest.dateAvailable = new Date($scope.loadRequest.dateAvailable);
                $scope.loadRequest.expectedDateReturn = new Date($scope.loadRequest.expectedDateReturn);
                if ($scope.loadRequest.destination.length === 0) {
                    $scope.loadRequest.truckDetails.destination = [{}];
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.count = 0;

    $scope.countLoadRequest = function () {
        OrderProcessServices.countLoadRequest(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                $scope.initLoadRequest("");
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            status: tableParams.status,
            loadRequest: tableParams.loadRequest
        };
        OrderProcessServices.getLoadRequest(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfLoadRequests = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initLoadRequest = function (status) {
        $scope.loadRequestParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.status = status;
                loadTableData(params);
            }
        });
    };

    $scope.deleteLoadRequest = function (id) {
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
                OrderProcessServices.deleteLoadRequest(id, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $scope.countLoadRequest();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                }, function (err) {

                })
            }
        });

    }

    $scope.getTruckTypes = function () {
        SettingServices.getTruckTypes({}, function (response) {
            if (response.data.status) {
                $scope.truckTypesList = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.getTruckOwnersAndCommisionAgents = function () {
        OrderProcessServices.getTruckOwnersAndCommisionAgents({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });
    }

    $scope.loadMore = function () {
        $scope.currentElement = $scope.currentElement + 10;
        OrderProcessServices.getTruckOwnersAndCommisionAgents({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = $scope.truckOwnersList.concat(success.data.data);
            } else {
                $scope.truckOwnersList = [];
            }

        }, function (error) {

        });
    };
    $scope.searchAccountOwner = function (search) {
        $scope.currentElement = 0;
        $scope.search = search;
        OrderProcessServices.getTruckOwnersAndCommisionAgents({
            name: $scope.search,
            size: $scope.currentElement
        }, function (success) {
            if (success.data.status) {
                $scope.truckOwnersList = success.data.data;
            } else {
                $scope.truckOwnersList = [];
            }
        }, function (error) {

        });
    };

    $scope.addTruckDetails = function () {
        var truckDetails = $scope.loadRequest.truckDetails[$scope.loadRequest.truckDetails.length - 1];
        if (!truckDetails.sourceAddress || !truckDetails.destination[truckDetails.destination.length - 1].destinationAddress || !truckDetails.destination[truckDetails.destination.length - 1].price || !truckDetails.truckType || !truckDetails.registrationNo) {
            swal("Please fill mandatory truck details", "", "info");
        } else {
            $scope.loadRequest.truckDetails.push({
                sourceAddress: "",
                destination: [{
                    destinationAddress: "",
                    price: ""
                }],
                truckType: "",
                registrationNo: "",
                makeYear: "",
                driverInfo: "",
                dateAvailable: "",
                expectedDateReturn: "",
            });
        }

    };

    $scope.removeTruckDetails = function (index) {
        $scope.loadRequest.truckDetails.splice(index, 1);
    };

    function checkTruckDetails() {
        for (var i = 0; i < $scope.loadRequest.truckDetails.length; i++) {
            if (!$scope.loadRequest.truckDetails[i].sourceAddress || !$scope.loadRequest.truckDetails[i].destination[$scope.loadRequest.truckDetails[i].destination.length - 1].destinationAddress || !$scope.loadRequest.truckDetails[i].destination[$scope.loadRequest.truckDetails[i].destination.length - 1].price || !$scope.loadRequest.truckDetails[i].truckType || !$scope.loadRequest.truckDetails[i].registrationNo) {
                return false;
            }
            if (i === $scope.loadRequest.truckDetails.length - 1) {
                return true;
            }
        }
    }

    $scope.addDestinationAndPrice = function (parentIndex, index) {
        var destinationAndPriceDetails = $scope.loadRequest.truckDetails[parentIndex].destination[$scope.loadRequest.truckDetails[parentIndex].destination.length - 1];
        if (!destinationAndPriceDetails.destinationAddress || !destinationAndPriceDetails.price) {
            swal("Please fill destination and price", "", "info");
        } else {
            $scope.loadRequest.truckDetails[parentIndex].destination.push({
                destinationAddress: "",
                price: ""
            });
        }

    };

    $scope.deleteDestinationAndPrice = function (parentIndex, index) {
        $scope.loadRequest.truckDetails[parentIndex].destination.splice(index, 1);
    };

    $scope.addDestinationAndPriceEdit = function (index) {
        var destinationAndPriceDetails = $scope.loadRequest.destination[$scope.loadRequest.destination.length - 1];
        if (!destinationAndPriceDetails.destinationAddress || !destinationAndPriceDetails.price) {
            swal("Please fill destination and price", "", "info");
        } else {
            $scope.loadRequest.destination.push({
                destinationAddress: "",
                price: ""
            });
        }

    };

    $scope.deleteDestinationAndPriceEdit = function (index) {
        $scope.loadRequest.destination.splice(index, 1);
    };

    $scope.addSearchSource = function (index) {
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.truckDetails[index].sourceAddress = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function (parentIndex, index) {
        var input = document.getElementById('searchDestination' + parentIndex + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.truckDetails[index].destination[index].destinationAddress = place.formatted_address;
            });
    };

    $scope.editSearchSource = function (index) {
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.sourceAddress = place.formatted_address;
            });
    };
    $scope.editSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.loadRequest.destination[index].destinationAddress = place.formatted_address;
            });
    };

    $scope.addLoadRequest = function () {
        var params = $scope.loadRequest;
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
            params.messages.push("Please provide mobile");
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
                params.customerName = params.customer.firstName;
                params.firstName = params.customer.firstName;
                params.contactPhone = params.customer.contactPhone;
                params.customerId = params.customer._id;
                params.customer = params.customer._id;
            } else {
                params.customerName = params.firstName;
                params.firstName = params.firstName;
                params.contactPhone = params.contactPhone;
            }

            OrderProcessServices.addLoadRequest(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $state.go("orderprocess.loadRequest");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }
    };


    $scope.updateLoadRequest = function () {
        var params = $scope.loadRequest;
        params.messages = [];

        if (!params.firstName) {
            params.messages.push("Please select name");
        }
        if (!params.contactPhone) {
            params.messages.push("Please provide mobile");
        }
        if (!checkTruckDetails) {
            params.messages.push("Please enter mandatory truck details")
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            if ($stateParams.loadRequestId) {
                OrderProcessServices.updateLoadRequest(params, function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        })
                        $state.go("orderprocess.loadRequest");
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        })
                    }
                }, function (error) {

                })
            } else {
                Notification.error("Not Found");
            }
        }
    };
}]);


app.controller('viewOrderCtrl', ['$scope', '$state', 'OrderProcessServices', 'customerServices', 'Notification', 'SettingServices', 'NgTableParams', '$stateParams', '$uibModal', 'Upload', '$http', '$timeout', '$rootScope', '$compile', function ($scope, $state, OrderProcessServices, customerServices, Notification, SettingServices, NgTableParams, $stateParams, $uibModal, Upload, $http, $timeout, $rootScope, $compile) {

    $scope.status = {
        isOpen: true,
        isOpenOne: true,
    };

    $scope.cancel = function () {
        $state.go('orderprocess.viewOrder');
    };

    $scope.getTransportersList = function () {
        customerServices.getTransporter({}, function (response) {
            if (response.data.status) {
                $scope.getTransporters = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.getTruckTypes = function () {
        SettingServices.getTruckTypes({}, function (response) {
            if (response.data.status) {
                $scope.truckTypesList = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };


    $scope.addSearchSource = function () {
        var input = document.getElementById('searchSource');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.newOrderRequest.source = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function () {
        var input = document.getElementById('searchDestination');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.newOrderRequest.destination = place.formatted_address;

            });
    };

    $scope.newOrderRequest = {
        error: []
    }

    $scope.addOrderRequest = function () {
        var params = $scope.newOrderRequest;
        params.messages = [];

        if (!params.loadOwnerType) {
            params.messages.push("Please select Load Owner");
        }
        if (!params.truckOwnerId) {
            params.messages.push("Please select Truck Owner");
        }
        if (params.loadOwnerType === "Registered" && !params.loadOwnerId) {
            params.messages.push("Please select Load Owner");
        }
        if (params.loadOwnerType === "UnRegistered" && !params.loadOwner_firstName) {
            params.messages.push("Please enter load owner name");
        }
        if (params.loadOwnerType === "UnRegistered" && !params.loadOwner_contactPhone) {
            params.messages.push("Please enter load owner phone");
        }
        if (!params.truckType) {
            params.messages.push("Please select Truck type");
        }
        if (!params.source) {
            params.messages.push("Please Enter Source Location");
        }
        if (!params.destination) {
            params.messages.push("Please Enter Destination Location");
        }
        if (!params.registrationNo) {
            params.messages.push("Please Enter Vehicle Registration Number");
        }
        if (!params.egCommission) {
            params.messages.push("Please Enter Easygaadi Commission");
        }
        if (!params.to_bookedAmount) {
            params.messages.push("Please Enter Truck Booked Amount");
        }
        if (!params.to_advance) {
            params.messages.push("Please Truck Advance Amount");
        }
        if (!params.applyTds) {
            params.messages.push("select apply TDS type");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            if (params.customerType === "Registered") {
                params.customerName = params.customer.firstName;
                params.firstName = params.customer.firstName;
                params.contactPhone = params.customer.contactPhone;
                params.customerId = params.customer._id;
                params.customer = params.customer._id;
            } else {
                params.customerName = params.firstName;
                params.firstName = params.firstName;
                params.contactPhone = params.contactPhone;
            }
            OrderProcessServices.createOrder(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $state.go("orderprocess.viewOrder");
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }

    }

    $scope.count = 0;
    $scope.numOfOrders = function () {
        OrderProcessServices.totalAdminTruckOrders(function (success) {
            if (success.data.status) {
                $scope.count = success.data.data;
                console.log($scope.count);
                $scope.initOrders();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };

    $scope.initOrders = function () {
        $scope.viewOrderParams = new NgTableParams({
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
            }
        });
    };

    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
        };
        OrderProcessServices.getAdminTruckOrdersList(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.viewOrderList = response.data.data;

            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    /*-------------------------- Truck Owner Billing Module starts Here -------------------*/
    $scope.truckOwnerOrderOnfo = function () {
        if ($stateParams.orderId) {
            OrderProcessServices.getTruckOwnerOrderDetails($stateParams.orderId, function (success) {
                if (success.data.status) {
                    $scope.orderDetails = success.data.orderDetails;
                    $scope.transactionsDetails = success.data.transactionsDetails;
                    $scope.paymentsDetails = success.data.paymentsDetails;
                    $scope.comments = success.data.comments;
                    $scope.locationsList = success.data.locations;
                    if ($scope.orderDetails.truckStartDate) {
                        $scope.orderDetails.truckStartDate = new Date($scope.orderDetails.truckStartDate);
                    }
                    if ($scope.orderDetails.truckDestinationDate) {
                        $scope.orderDetails.truckDestinationDate = new Date($scope.orderDetails.truckDestinationDate);
                    }
                    if ($scope.orderDetails.dateOfPOD) {
                        $scope.orderDetails.dateOfPOD = new Date($scope.orderDetails.dateOfPOD);
                    }
                }
                else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            });
        }
    }

    $scope.truckPayment = function (ownerType) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addPayment.html',
            controller: 'addTruckPaymentCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {
                        ownerType: ownerType,
                        orderId: $scope.orderDetails._id,
                        truckOwnerId: $scope.orderDetails.truckOwnerId ? $scope.orderDetails.truckOwnerId._id : undefined,
                        loadOwnerId: $scope.orderDetails.loadOwnerDetails ? $scope.orderDetails.loadOwnerDetails._id : undefined
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.paymentsDetails = data;
        }, function () {
        });
    };
    $scope.truckTransaction = function (ownerType) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addTransaction.html',
            controller: 'addTruckTransactionCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {
                        ownerType: ownerType,
                        orderId: $scope.orderDetails._id,
                        truckOwnerId: $scope.orderDetails.truckOwnerId ? $scope.orderDetails.truckOwnerId._id : undefined,
                        loadOwnerId: $scope.orderDetails.loadOwnerDetails ? $scope.orderDetails.loadOwnerDetails._id : undefined
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.transactionsDetails = data;
        }, function () {
        });
    };
    $scope.addOrderComment = function (ownerType) {
        var modalInstance = $uibModal.open({
            templateUrl: 'addOrderComment.html',
            controller: 'addOrderCommentCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {
                        ownerType: ownerType,
                        orderId: $scope.orderDetails._id,
                        truckOwnerId: $scope.orderDetails.truckOwnerId ? $scope.orderDetails.truckOwnerId._id : undefined,
                        loadOwnerId: $scope.orderDetails.loadOwnerDetails ? $scope.orderDetails.loadOwnerDetails._id : undefined
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.comments = data;
        }, function () {
        });
    };
    $scope.location = {};
    $scope.searchLocation = function () {
        var input = document.getElementById('location');
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.location.location = place.formatted_address;
            });
    };
    $scope.addOrderLocation = function () {
        var params = $scope.location;
        params.messages = [];
        if (!params.location) {
            params.messages.push("Please enter location");
        }
        if (!params.date) {
            params.messages.push("Please select Date");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            })
        } else {
            params.orderId = $scope.orderDetails._id;
            OrderProcessServices.addOrderLocation(params, function (success) {
                if (success.data.status) {
                    if ($scope.locationsList.length > 0) {
                        $scope.locationsList.unshift(success.data.data);
                    } else {
                        $scope.locationsList = [success.data.data];
                    }
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $scope.location = {};
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    })
                }
            }, function (error) {

            })
        }
    };

    $scope.updateOrderProcess = function () {
        OrderProcessServices.updateOrderProcess($scope.orderDetails, function (success) {
            if (success.data.status) {
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
    };
    $scope.updateOrderPOD = function () {
        var params = {
            messages: []
        };
        if (!$scope.orderDetails._id) {
            params.messages.push("Invalid request");
        }
        if (!$scope.orderDetails.dateOfPOD) {
            params.messages.push("Please select date of POD");
        }
        if (!$scope.orderDetails.frontFile) {
            params.messages.push("Please select Front POD");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            })
        } else {
            var files = [];
            if ($scope.orderDetails.frontFile) {
                files.push($scope.orderDetails.frontFile);
            }
            if ($scope.orderDetails.backFile) {
                files.push($scope.orderDetails.backFile);
            }
            Upload.upload({
                url: '/v1/cpanel/orderProcess/updateOrderPOD',
                data: {
                    files: files,
                    content: {_id: $scope.orderDetails._id, dateOfPOD: $scope.orderDetails.dateOfPOD}
                },
            }).then(function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            });
        }

    };
    var printHtml = function (html) {
        var hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
        hiddenFrame.contentWindow.printAndRemove = function() {
            hiddenFrame.contentWindow.focus();
            hiddenFrame.contentWindow.print();
            $(hiddenFrame).remove();
        };

        var htmlDocument = "<!doctype html>"+
            "<html>"+
            '<body onload="printAndRemove();">' + // Print only after document is loaded
            html +
            '</body>'+
            "</html>";
        var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
        doc.write(htmlDocument);
        doc.close();
    };

    $scope.printTruckOwnerBill = function () {
        $http.get("/views/partials/admin/templates/printTruckOwnerBill.html").then(function (template) {
            var printScope = angular.extend($rootScope.$new(), {
                orderDetails: $scope.orderDetails,
                transactionsDetails: $scope.transactionsDetails,
                paymentsDetails: $scope.paymentsDetails,
                comments: $scope.comments,
                locationsList: $scope.locationsList
            });
            var element = $compile($('<div>' + template.data + '</div>'))(printScope);
            var waitForRenderAndPrint = function () {
                if (printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(waitForRenderAndPrint);
                } else {
                    printHtml(element.html());
                    printScope.$destroy(); // To avoid memory leaks from scope create by $rootScope.$new()
                }
            };
            waitForRenderAndPrint();
        });
    };
    $scope.printLoadOwnerBill = function () {
        $http.get("/views/partials/admin/templates/printLoadOwnerBill.html").then(function (template) {
            var printScope = angular.extend($rootScope.$new(), {
                orderDetails: $scope.orderDetails,
                transactionsDetails: $scope.transactionsDetails,
                paymentsDetails: $scope.paymentsDetails,
                comments: $scope.comments,
                locationsList: $scope.locationsList
            });
            var element = $compile($('<div>' + template.data + '</div>'))(printScope);
            var waitForRenderAndPrint = function () {
                if (printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(waitForRenderAndPrint);
                } else {
                    printHtml(element.html());
                    printScope.$destroy(); // To avoid memory leaks from scope create by $rootScope.$new()
                }
            };
            waitForRenderAndPrint();
        });
        $http.get(templateUrl).success(function(template){
            var printScope = angular.extend($rootScope.$new(), data);
            var element = $compile($('<div>' + template + '</div>'))(printScope);
            var waitForRenderAndPrint = function() {
                if(printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(waitForRenderAndPrint);
                } else {
                    printHtml(element.html());
                    printScope.$destroy(); // To avoid memory leaks from scope create by $rootScope.$new()
                }
            };
            waitForRenderAndPrint();
        });
    };
    $scope.deleteOrderLocation = function (index, loc) {

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
                OrderProcessServices.deleteOrderLocation(loc._id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $scope.locationsList.splice(index, 1)
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                }, function (err) {

                });
            }
        });
    };


    /*--------------------------Load Owner Billing Module Starts Here ----------------------*/
    $scope.loadOwnerInfo = function () {
        if ($stateParams.orderId) {
            OrderProcessServices.getLoadOwnerOrderDetails($stateParams.orderId, function (success) {
                if (success.data.status) {
                    $scope.orderDetails = success.data.orderDetails;
                    $scope.transactionsDetails = success.data.transactionsDetails;
                    $scope.paymentsDetails = success.data.paymentsDetails;
                    $scope.comments = success.data.comments;
                    $scope.locationsList = success.data.locations;

                }
                else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            });
        }
    }


}]);

app.controller('addTruckPaymentCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'modelData', 'OrderProcessServices', function ($scope, $state, $uibModalInstance, Notification, modelData, OrderProcessServices) {
    $scope.paymentComments = [
        {comment: "Late Receivable", prefix: '-'},
        {comment: "Hamali Charges", prefix: '+'},
        {comment: "Booked Amount ", prefix: '+'},
        {comment: "Commission", prefix: '-'},
        {comment: "Goods Damage", prefix: '-'},
        {comment: "Loading Charges", prefix: '-'},
        {comment: "Payment Mamul", prefix: '-'},
        {comment: "Unloading Charges", prefix: '-'},
        {comment: "Loading Charges", prefix: '+'},
        {comment: "Unloading Charges", prefix: '+'},
        {comment: "Waiting Charges", prefix: '+'},
        {comment: "Extra Charges", prefix: '-'},
        {comment: "Extra Charges", prefix: '+'},
        {comment: "Theft", prefix: '-'},
        {comment: "Overload Charge", prefix: '+'},
        {comment: "Deduct TDS", prefix: '-'}
    ];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.data = modelData;
    $scope.initAddTruckPayment = {
        errors: []
    };

    $scope.addTruckPayment = function () {
        var params = $scope.initAddTruckPayment;
        params.ownerType = modelData.ownerType;
        params.loadOwnerId = modelData.loadOwnerId;
        params.truckOwnerId = modelData.truckOwnerId;
        params.orderId = modelData.orderId;
        params.messages = [];
        var comment = angular.copy(JSON.parse($scope.initAddTruckPayment.comment));
        $scope.initAddTruckPayment.prefix = comment.prefix;
        $scope.initAddTruckPayment.comment = comment.comment;
        if (!params.ownerType) {
            params.messages.push("Please select Owner Type");
        }
        if (params.ownerType === "Load Owner" && !params.loadOwnerId) {
            params.messages.push("Please select Load Owner");
        }
        if (params.ownerType === "Truck Owner" && !params.truckOwnerId) {
            params.messages.push("Please select Truck Owner");
        }
        if (!params.orderId) {
            params.messages.push("Please select Order Id");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            OrderProcessServices.addOrderPayment(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $uibModalInstance.close(success.data.data);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }
    }


}]);

app.controller('addTruckTransactionCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'modelData', 'OrderProcessServices', function ($scope, $state, $uibModalInstance, Notification, modelData, OrderProcessServices) {

    $scope.transactionComments = [
        {comment: "Advance Paid", prefix: '+'},
        {comment: "Balance Amount Paid", prefix: '+'},
        {comment: "Amount Received For Damage", prefix: '-'},
        {comment: "Others", prefix: '-'}

    ];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.data = modelData;
    $scope.transaction = {
        errors: []
    };

    function getEasygaadiEmployeesList() {
        OrderProcessServices.getEasygaadiEmployeesList(function (success) {
            if (success.data.status) {
                $scope.employessList = success.data.data;
            } else {
                $scope.employessList = [];
            }
        }, function (error) {

        })
    }

    getEasygaadiEmployeesList();

    $scope.addOrderTransaction = function () {
        var params = $scope.transaction;
        params.ownerType = modelData.ownerType;
        params.loadOwnerId = modelData.loadOwnerId;
        params.truckOwnerId = modelData.truckOwnerId;
        params.orderId = modelData.orderId;
        params.messages = [];

        if (!params.comment) {
            params.messages.push("Please select Comment");
        }
        if (params.ownerType === "Load Owner" && !params.loadOwnerId) {
            params.messages.push("Please select Load Owner");
        }
        if (params.ownerType === "Truck Owner" && !params.truckOwnerId) {
            params.messages.push("Please select Truck Owner");
        }
        if (!params.orderId) {
            params.messages.push("Please select Order Id");
        }
        if (!params.amount) {
            params.messages.push("Enter amount");
        }
        if (!params.transactionDate) {
            params.messages.push("Select transaction date")
        }
        if (!params.paymentType) {
            params.messages.push("Please select payment type")
        }
        if (params.paymentType === "Cheque" && !params.chequeNo) {
            params.messages.push("Enter cheque no")
        }
        if (params.paymentType === "Cash" && !params.paymentBy) {
            params.messages.push("Select payment by person")
        }
        if (params.paymentType === "Account Transfer" && !params.bank) {
            params.messages.push("Select bank")
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            var comment = angular.copy(JSON.parse($scope.transaction.comment));
            params.prefix = comment.prefix;
            params.comment = comment.comment;
            OrderProcessServices.addOrderTransaction(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $uibModalInstance.close(success.data.data);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }
    }
}]);

app.controller('addOrderCommentCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'modelData', 'OrderProcessServices', function ($scope, $state, $uibModalInstance, Notification, modelData, OrderProcessServices) {


    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.data = modelData;
    $scope.comment = {
        errors: []
    };
    $scope.addOrderComment = function () {
        var params = $scope.comment;
        params.loadOwnerId = modelData.loadOwnerId;
        params.ownerType = modelData.ownerType;
        params.truckOwnerId = modelData.truckOwnerId;
        params.orderId = modelData.orderId;
        params.messages = [];

        if (!params.comment) {
            params.messages.push("Please Enter Comment");
        }

        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            OrderProcessServices.addOrderComment(params, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success(message);
                    });
                    $uibModalInstance.close(success.data.data);
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        }
    }
}]);