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
            params.messages.push("Please enter amount");
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
            params.truckOwnerId = $scope.loadBooking.customer._id;
            params.source = $scope.truckRequest.source;
            params.destination = $scope.truckRequest.destination;
            if ($scope.truckRequest.customerType === "Registered") {
                params.loadOwnerId = $scope.truckRequest.customer._id
            } else {
                params.loadCustomerLeadId = $scope.truckRequest.customerLeadId._id;
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

    }

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

    $scope.getAllAccountsExceptTruckOwners = function () {
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
    }

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

app.controller('viewOrderCtrl', ['$scope', '$state', 'OrderProcessServices', 'customerServices', 'Notification', 'SettingServices', 'NgTableParams', '$stateParams', '$uibModal', function ($scope, $state, OrderProcessServices, customerServices, Notification, SettingServices, NgTableParams, $stateParams, $uibModal) {

    $scope.status = {
        isOpen: true,
        isOpenOne: true,
    }

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
    $scope.truckOwnerOrderOnfo = function () {
        if ($stateParams.orderId) {
            OrderProcessServices.getTruckOwnerOrderDetails($stateParams.orderId, function (success) {
                if (success.data.status) {
                    $scope.orderDetails = success.data.orderDetails;
                    $scope.transactionsDetails = success.data.transactionsDetails;
                    $scope.paymentsDetails = success.data.paymentsDetails;
                    $scope.comments = success.data.comments;
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

    $scope.truckPayment = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addPayment.html',
            controller: 'addTruckPaymentCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                modelData: function () {
                    return {
                        ownerType: 'Truck Owner',
                        orderId: $scope.orderDetails._id,
                        truckOwnerId: $scope.orderDetails.truckOwnerId._id
                    }
                }
            }
        });

    };
}]);

app.controller('addTruckPaymentCtrl', ['$scope', '$state', '$uibModalInstance', 'Notification', 'modelData', function ($scope, $state, $uibModalInstance, Notification, modelData) {
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
    ]
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.data = modelData;
    $scope.initAddTruckPayment = {
        errors: []
    }

   /* $scope.paymentCommentPrefix=function () {
        $scope.initAddTruckPayment.prefix=$scope.initAddTruckPayment.comment.prefix;
        $scope.initAddTruckPayment.comment=$scope.initAddTruckPayment.comment.comment;
    }*/

   $scope.addTruckPayment = function () {
       var params = $scope.initAddTruckPayment;
       console.log("", params);
   }

}]);