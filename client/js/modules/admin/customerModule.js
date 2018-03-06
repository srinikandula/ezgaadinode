app.factory('customerServices', function ($http) {
    return {
        getCustomerLeads: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getCustomerLeads',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getCustomerLeadDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getCustomerLeadDetails',
                method: "GET",
                params: {_id: params}
            }).then(success, error)
        },
        deleteCustomerLead: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteCustomerLead',
                method: "DELETE",
                params: {_id: params}
            }).then(success, error)
        },
        getTruckOwners: function (success, error) {
            $http({
                url: '/v1/cpanel/customers/getTruckOwners',
                method: "GET"
            }).then(success, error)
        },
        getTruckOwnersDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getTruckOwnersDetails',
                method: "GET",
                params: {_id: params}
            }).then(success, error)
        },
        deleteTruckOwners: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteTruckOwners',
                method: "DELETE",
                params: {_id: params}
            }).then(success, error)
        },
        getTransporter: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getTransporter',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getTransporterDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getTransporterDetails',
                method: "GET",
                params: {transporterId: params}
            }).then(success, error)
        },
        deleteTransporter: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteTransporter',
                method: "DELETE",
                params: {transporterId: params}
            }).then(success, error)
        },
        countTransporter: function (success, error) {
            $http({
                url: '/v1/cpanel/customers/countTransporter',
                method: "GET",
            }).then(success, error)
        },
        getCommissionAgent: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getCommissionAgent',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getCommissionAgentDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getCommissionAgentDetails',
                method: "GET",
                params: {commissionAgentId: params}
            }).then(success, error)
        },
        deleteCommissionAgent: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteCommissionAgent',
                method: "DELETE",
                params: {commissionAgentId: params}
            }).then(success, error)
        },
        countCommissionAgent: function (success, error) {
            $http({
                url: '/v1/cpanel/customers/countCommissionAgent',
                method: "GET",
            }).then(success, error)
        },
        getFactoryOwner: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getFactoryOwner',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getFactoryOwnerDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getFactoryOwnerDetails',
                method: "GET",
                params: {factoryOwnerId: params}
            }).then(success, error)
        },
        deleteFactoryOwner: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteFactoryOwner',
                method: "DELETE",
                params: {factoryOwnerId: params}
            }).then(success, error)
        },
        countFactoryOwner: function (success, error) {
            $http({
                url: '/v1/cpanel/customers/countFactoryOwner',
                method: "GET",
            }).then(success, error)
        },
        getGuest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getGuest',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getGuestDetails: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/getGuestDetails',
                method: "GET",
                params: {guestId: params}
            }).then(success, error)
        },
        deleteGuest: function (params, success, error) {
            $http({
                url: '/v1/cpanel/customers/deleteGuest',
                method: "DELETE",
                params: {guestId: params}
            }).then(success, error)
        },
        countGuest: function (success, error) {
            $http({
                url: '/v1/cpanel/customers/countGuest',
                method: "GET",
            }).then(success, error)
        },
        convertCustomerLead: function (data, success, error) {
            $http({
                url: '/v1/cpanel/customers/convertCustomerLead',
                method: "POST",
                data: data
            }).then(success, error)
        },
        deleteOperatingRoutes:function (paramas,success,error) {
            $http({
                url:'/v1/cpanel/customers/deleteOperatingRoutes',
                method:"DELETE",
                params:{_id:paramas}
            }).then(success,error)
        }
    }
});

app.controller('customerCtrl', ['$scope', '$state', 'Notification', 'Upload', '$stateParams', 'customerServices', 'NgTableParams', function ($scope, $state, Notification, Upload, $stateParams, customerServices, NgTableParams) {

    $scope.pageTitle = "Create Customer Leads";

    if ($stateParams.customerId) {
        $scope.pageTitle = "Edit Customer Leads";
    }

    $scope.cancel = function () {
        $state.go('customers.customersLead');
    };

    $scope.leadStatus = ['Initiate', 'Duplicate', 'Junk Lead', 'Language Barrier', 'Callback', 'Not interested',
        'Request for Approval'
    ];

    $scope.status = {
        isOpen: true,
        isOpenOne: true,
        isOpenTwo: true,
        isOpenthree: true,
        isOpenFour: true,
        isOpenFive: true,
    };


    $scope.leadType = ['Truck Owner', 'Manufacturer', 'Commission Agent', 'Transporter', 'Factory Owners'];
    $scope.yrsInService = [2018, 2017, 2016,2015,2014,2013,2012,2011,2010,2009];
    $scope.serviceTeam = ['Marketing Team', 'Cold Calls', 'Existing Customer', 'Self Generater', 'Employee', 'Partner', 'Public Relations', 'Direct Mail', 'Conference', 'Trade Show', 'Website', 'Word of mouth', 'Other'];
    $scope.documentType = ['Aadhar Card', 'Passport'];
    $scope.paymentType = ['Cheque', 'NEFT', 'Cash'];

    function customerLeadsFunc() {
        $scope.customerLead = {
            firstName: "",
            userName: '',
            contactPhone: '',
            alternatePhone: [''],
            email: '',
            leadType: '',
            companyName: '',
            address: '',
            city: '',
            state: '',
            pinCode: '',
            gpsEnabled: undefined,
            erpEnabled: undefined,
            loadEnabled: undefined,
            yrsInService: '',
            operatingRoutes: [{}],
            documentType: '',
            companyName2: '',
            companyCity: '',
            companyPin: '',
            companyAddress: '',
            companyState: '',
            companyPhone: '',
            paymentType: '',
            leadSource: '',
            errorMessage: [],
            files: [{}],
            status: undefined,
            comment: ""
        };
        $scope.files = "";
    }

    //$scope.customerLead.contactPhone.push("");
    $scope.getCustomerLeadDetails = function () {
        if ($stateParams.customerId) {
            customerServices.getCustomerLeadDetails($stateParams.customerId, function (success) {

                if (success.data.status) {
                    $scope.customerLead = success.data.data.customerData;
                    if(success.data.data.operatingRoutes.length>0){
                        $scope.customerLead.operatingRoutes = success.data.data.operatingRoutes;
                    }else{
                        $scope.customerLead.operatingRoutes =[{}]
                    }
                    $scope.customerLead.files=[{}];

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (error) {

            })
        } else {
            customerLeadsFunc();
        }
    };

    $scope.addNumber = function () {

        if (!$scope.customerLead.alternatePhone[$scope.customerLead.alternatePhone.length - 1]) {
            //$scope.customerLead.errorMessage
            //routesLoop()
            Notification.error('Enter Alternate Number');
        } else {
            $scope.customerLead.alternatePhone.push('');
        }

    };
    $scope.removeNumber = function (index) {
        //$scope.showExtra = false;
        $scope.customerLead.alternatePhone.splice(index, 1)
    };

    function verifyMobNum() {
        for (var i = 0; i < $scope.customerLead.contactPhone.length; i++) {
            if (!$scope.customerLead.contactPhone[i]) {
                return false;
            }
            if (i === $scope.customerLead.contactPhone.length - 1) {
                return true;
            }
        }
    }

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

    $scope.createLeads = function () {
        var params = $scope.customerLead;
        params.errorMessage = [];

        if (!params.firstName) {
            params.errorMessage.push('Enter Your Full Name');
        }
        if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
            params.errorMessage.push('Enter Mobile Number');
        }
        if (params.errorMessage.length > 0) {
            params.errorMessage.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            if (!$scope.customerLead._id) {
                var files = $scope.customerLead.files;
                Upload.upload({
                    url: '/v1/cpanel/customers/addCustomerLead',
                    data: {
                        files: [files],
                        content: $scope.customerLead
                    },
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('customers.customersLead');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            } else {
                var files = $scope.customerLead.files;
                Upload.upload({
                    url: '/v1/cpanel/customers/updateCustomerLead',
                    data: {
                        files: [files],
                        content: $scope.customerLead
                    }
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('customers.customersLead');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            }
        }
    };

    $scope.delCustomer = function (customerId) {
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
                customerServices.deleteCustomerLead(customerId, function (success) {
                    $state.go('customers.customersLead');
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            success.data.messages[0],
                            'success'
                        );
                        $state.go('customers.customersLead');
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

    $scope.getCustomerLeads = function () {
        $scope.customerParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            getData: function (tableParams) {

                var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
                customerServices.getCustomerLeads(pageable, function (success) {
                    if (success.data.status) {

                        $scope.customerLeads = success.data.data;
                        tableParams.data = $scope.customerLeads;
                        tableParams.total(parseInt(success.data.count));
                    } else {

                        success.data.messages.forEach(function (message) {
                            Notification.error({message: message});
                        });
                    }
                }, function (error) {

                });
            }

        });
        // $scope.customerParams.reload();
    };

    $scope.convertCustomerLead = function () {
        var params = $scope.customerLead;
        params.messages = [];
        if (!params.status) {
            params.messages.push("Please customer lead status");
        }
        if (params.messages.length > 0) {
            params.messages.forEach(function (message) {
                Notification.error(message);
            });
        } else {
            customerServices.convertCustomerLead({
                _id: params._id,
                status: params.status,
                comment: params.comment
            }, function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success({message: message});
                    });
                    $state.go("customers.customersLead");
                } else {

                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        }
    };

    $scope.addSearchSource = function (index) {
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.customerLead.operatingRoutes[index].source = place.name;
                $scope.customerLead.operatingRoutes[index].sourceState = place.address_components[2].long_name;
                $scope.customerLead.operatingRoutes[index].sourceAddress = place.formatted_address;
                $scope.customerLead.operatingRoutes[index].sourceLocation = [parseFloat(place.geometry.location.lng()), parseFloat(place.geometry.location.lat())];

            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.customerLead.operatingRoutes[index].destination = place.name;
                $scope.customerLead.operatingRoutes[index].destinationState = place.address_components[2].long_name;
                $scope.customerLead.operatingRoutes[index].destinationAddress = place.formatted_address;
                $scope.customerLead.operatingRoutes[index].destinationLocation = [parseFloat(place.geometry.location.lng()), parseFloat(place.geometry.location.lat())];
            });
    };
    $scope.addOperatingRoute = function () {
        var routesObj = $scope.customerLead.operatingRoutes;
        if (!routesObj[routesObj.length - 1].source || !routesObj[routesObj.length - 1].destination) {
            Notification.error('Enter Source and Destination');
        } else {
            routesObj.push({});
        }
    };
    $scope.deleteOperatingRoute = function (index) {
        if( $scope.customerLead.operatingRoutes[index]._id){

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
                    customerServices.deleteOperatingRoutes($scope.customerLead.operatingRoutes[index]._id, function (success) {
                        if (success.data.status) {
                            swal(
                                'Deleted!',
                                success.data.messages[0],
                                'success'
                            );
                            $scope.customerLead.operatingRoutes.splice(index, 1)
                        } else {
                            success.data.messages.forEach(function (message) {
                                Notification.error(message);
                            });
                        }
                    }, function (err) {

                    });
                }
            });
        }else{
            $scope.customerLead.operatingRoutes.splice(index, 1)

        }
    };
    $scope.addDoc = function () {
        if ($scope.customerLead.files[$scope.customerLead.files.length - 1].file) {
            $scope.customerLead.files.push({});
        } else {
            Notification.error("Please select file");
        }
    };

    $scope.deleteDoc = function (index) {
        $scope.customerLead.files.splice(index, 1);
    }

}]);

/*Author Naresh*/
/*Truck Owners Start*/
app.controller('truckOwnerCtrl', ['$scope', '$state', '$stateParams', 'customerServices', 'Notification', 'NgTableParams', function ($scope, $state, $stateParams, customerServices, Notification, NgTableParams) {

}]);
/*Truck Owners End*/

/*Author SVPrasadK*/
/*Transporter Start*/
app.controller('transporterCtrl', ['$scope', '$state', '$stateParams', 'customerServices', 'SettingServices', 'Notification', 'NgTableParams', 'Upload', function ($scope, $state, $stateParams, customerServices, SettingServices, Notification, NgTableParams, Upload) {
    $scope.status = {
        isOpen: true,
        isOpenTwo: true,
        isOpenThree: true,
        isOpenFour: true,
        isOpenFive: true,
        isOpenSix: true,
        isOpenSev: true,
    };
    $scope.leadType = [{"key": "Truck Owner", "value": "T"}, {
        "key": "Transporter",
        "value": "TR"
    }, {"key": "Commission Agent", "value": "C"}, {"key": "Factory Owners", "value": "L"}, {
        "key": "Guest",
        "value": "G"
    }];
    $scope.yearInService = [2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003];
    $scope.customerProofs = ['Aadhar Card', 'Passport'];
    $scope.smsEmailAds = [{"key": "None", "value": 0}, {"key": "SMS/Email", "value": 1}, {
        "key": "Email Only",
        "value": 2
    }, {"key": "SMS Only", "value": 3}];
    $scope.paymentType = ['Cheque', 'NEFT', 'Cash'];
    $scope.title = "Add Transporter";

    if ($stateParams.transporterId) {
        $scope.title = "Edit Transporter";
        customerServices.getTransporterDetails($stateParams.transporterId, function (success) {
            if (success.data.status) {
                $scope.transporter = success.data.data.accountData;
                $scope.transporter.confirmPassword = success.data.data.accountData.password;
                $scope.transporter.newDocumentFile = '';
                if ($scope.transporter.alternatePhone.length === 0) {
                    $scope.transporter.alternatePhone = [''];
                }
                $scope.transporter.operatingRoutes = success.data.data.operatingRoutesData;
                if ($scope.transporter.operatingRoutes.length === 0) {
                    $scope.transporter.operatingRoutes = [{source: "", destination: "", truckType: ""}];
                }
                $scope.transporter.trafficManagers = success.data.data.trafficManagersData;
                if ($scope.transporter.trafficManagers.length === 0) {
                    $scope.transporter.trafficManagers = [{fullName: "", mobile: "", city: ""}];
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.files = "";

    $scope.count = 0;

    $scope.countTransporter = function () {
        customerServices.countTransporter(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initTransporter("");
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
            role: tableParams.role,
            transporter: tableParams.transporter
        };
        customerServices.getTransporter(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfTransporters = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initTransporter = function (role) {
        $scope.transporterParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.role = role;
                loadTableData(params);
            }
        });
    };

    $scope.deleteTransporter = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the transporter'
        }).then(function (result) {
            if (result.value) {
                customerServices.deleteTransporter($scope.currentPageOfTransporters[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.initTransporter("");
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    };

    $scope.addNumber = function () {
        if (!$scope.transporter.alternatePhone[$scope.transporter.alternatePhone.length - 1]) {
            Notification.error('Enter Alternate Number');
        } else {
            $scope.transporter.alternatePhone.push('');
        }
    };
    $scope.removeNumber = function (index) {
        $scope.transporter.alternatePhone.splice(index, 1)
    };

    function verifyMobNum() {
        for (var i = 0; i < $scope.transporter.contactPhone.length; i++) {
            if (!$scope.transporter.contactPhone[i]) {
                return false;
            }
            if (i === $scope.transporter.contactPhone.length - 1) {
                return true;
            }
        }
    }

    $scope.addOperatingRoute = function () {
        var routesObj = $scope.transporter.operatingRoutes;
        if (!routesObj[routesObj.length - 1].source || !routesObj[routesObj.length - 1].destination || !routesObj[routesObj.length - 1].truckType) {
            Notification.error('Enter Source, Destination and Truck Type');
        } else {
            routesObj.push({source: '', destination: '', truckType: ''});
        }
    };
    $scope.deleteOperatingRoute = function (index) {
        $scope.transporter.operatingRoutes.splice(index, 1)
    };

    $scope.addTrafficManager = function () {
        var trafficManagersObj = $scope.transporter.trafficManagers;
        if (!trafficManagersObj[trafficManagersObj.length - 1].fullName || !trafficManagersObj[trafficManagersObj.length - 1].mobile || !trafficManagersObj[trafficManagersObj.length - 1].city) {
            Notification.error('Enter Full Name, Mobile and City');
        } else {
            trafficManagersObj.push({fullName: '', mobile: '', city: ''});
        }
    };

    $scope.deleteTrafficManager = function (index) {
        $scope.transporter.trafficManagers.splice(index, 1)
    };

    $scope.getTruckTypes = function () {
        SettingServices.getTruckTypes({}, function (response) {
            if (response.data.status) {
                $scope.getTruckTypes = response.data.data;
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
                $scope.transporter.operatingRoutes[index].source = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.transporter.operatingRoutes[index].destination = place.formatted_address;
            });
    };

    $scope.cancel = function () {
        $state.go('customers.transporters');
    };

    $scope.addUpdateTransporter = function () {
        var params = $scope.transporter;

        if (!params.leadType || !_.isString(params.leadType)) {
            Notification.error('Please Select Customer Type');
        }
        if (!params.firstName || !_.isString(params.firstName)) {
            Notification.error('Please Provide Full Name');
        }
        if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
            params.errorMessage.push('Enter Mobile Number');
        }
        if (params.isActive === undefined) {
            Notification.error('Invalid Status');
        }
        else {
            if ($stateParams.transporterId) {
                Upload.upload({
                    url: '/v1/cpanel/customers/updateTransporter',
                    method: "POST",
                    data: {
                        files: [$scope.transporter.newDocumentFile],
                        content: $scope.transporter
                    }
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('customers.transporters');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            } else {

            }
        }
    };

    $scope.searchByTransporter = function (transporter) {
        $scope.transporterParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.transporter = transporter;
                loadTableData(params);
            }
        });
    };
}]);
/*Transporter End*/

/*Author SVPrasadK*/
/*Commision Agent Start*/
app.controller('commissionAgentCtrl', ['$scope', '$state', '$stateParams', 'customerServices', 'SettingServices', 'Notification', 'NgTableParams', 'Upload', function ($scope, $state, $stateParams, customerServices, SettingServices, Notification, NgTableParams, Upload) {
    $scope.status = {
        isOpen: true,
        isOpenTwo: true,
        isOpenThree: true,
        isOpenFour: true,
        isOpenFive: true,
        isOpenSix: true,
        isOpenSev: true,
    };
    $scope.leadType = [{"key": "Truck Owner", "value": "T"}, {
        "key": "Transporter",
        "value": "TR"
    }, {"key": "Commission Agent", "value": "C"}, {"key": "Factory Owners", "value": "L"}, {
        "key": "Guest",
        "value": "G"
    }];
    $scope.yearInService = [2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003];
    $scope.customerProofs = ['Aadhar Card', 'Passport'];
    $scope.smsEmailAds = [{"key": "None", "value": 0}, {"key": "SMS/Email", "value": 1}, {
        "key": "Email Only",
        "value": 2
    }, {"key": "SMS Only", "value": 3}];
    $scope.paymentType = ['Cheque', 'NEFT', 'Cash'];
    $scope.title = "Add commission Agent";

    if ($stateParams.commissionAgentId) {
        $scope.title = "Edit Commission Agent";
        customerServices.getCommissionAgentDetails($stateParams.commissionAgentId, function (success) {
            if (success.data.status) {
                $scope.commissionAgent = success.data.data.accountData;
                $scope.commissionAgent.confirmPassword = success.data.data.accountData.password;
                $scope.commissionAgent.newDocumentFile = '';
                if ($scope.commissionAgent.alternatePhone.length === 0) {
                    $scope.commissionAgent.alternatePhone = [''];
                }
                $scope.commissionAgent.operatingRoutes = success.data.data.operatingRoutesData;
                if ($scope.commissionAgent.operatingRoutes.length === 0) {
                    $scope.commissionAgent.operatingRoutes = [{source: "", destination: "", truckType: ""}];
                }
                $scope.commissionAgent.trafficManagers = success.data.data.trafficManagersData;
                if ($scope.commissionAgent.trafficManagers.length === 0) {
                    $scope.commissionAgent.trafficManagers = [{fullName: "", mobile: "", city: ""}];
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.files = "";

    $scope.count = 0;

    $scope.countCommissionAgent = function () {
        customerServices.countCommissionAgent(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.initCommissionAgent("");
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
            role: tableParams.role,
            commissionAgent: tableParams.commissionAgent
        };
        customerServices.getCommissionAgent(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.data;
                $scope.currentPageOfCommissionAgents = response.data.data;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };

    $scope.initCommissionAgent = function (role) {
        $scope.commissionAgentParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.role = role;
                loadTableData(params);
            }
        });
    };

    $scope.deleteCommissionAgent = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the commission agent'
        }).then(function (result) {
            if (result.value) {
                customerServices.deleteCommissionAgent($scope.currentPageOfCommissionAgents[index]._id, function (success) {
                    if (success.data.status) {
                        $scope.initCommissionAgent("");
                        swal(
                            '',
                            'Successfully removed',
                            'success'
                        );
                    }
                });
            }
        });
    }

    $scope.addNumber = function () {
        if (!$scope.commissionAgent.alternatePhone[$scope.commissionAgent.alternatePhone.length - 1]) {
            Notification.error('Enter Alternate Number');
        } else {
            $scope.commissionAgent.alternatePhone.push('');
        }
    };
    $scope.removeNumber = function (index) {
        $scope.commissionAgent.alternatePhone.splice(index, 1)
    };

    function verifyMobNum() {
        for (var i = 0; i < $scope.commissionAgent.contactPhone.length; i++) {
            if (!$scope.commissionAgent.contactPhone[i]) {
                return false;
            }
            if (i === $scope.commissionAgent.contactPhone.length - 1) {
                return true;
            }
        }
    }

    $scope.addOperatingRoute = function () {
        var routesObj = $scope.commissionAgent.operatingRoutes;
        if (!routesObj[routesObj.length - 1].source || !routesObj[routesObj.length - 1].destination) {
            Notification.error('Enter Source and Destination');
        } else {
            routesObj.push({source: '', destination: ''});
        }
    };
    $scope.deleteOperatingRoute = function (index) {
        $scope.commissionAgent.operatingRoutes.splice(index, 1)
    };

    $scope.addSearchSource = function (index) {
        var input = document.getElementById('searchSource' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.commissionAgent.operatingRoutes[index].source = place.formatted_address;
            });
    };
    $scope.addSearchDestination = function (index) {
        var input = document.getElementById('searchDestination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.commissionAgent.operatingRoutes[index].destination = place.formatted_address;
            });
    };

    $scope.cancel = function () {
        $state.go('customers.commissionAgents');
    };

    $scope.addUpdateCommissionAgent = function () {
        var params = $scope.commissionAgent;

        if (!params.leadType || !_.isString(params.leadType)) {
            Notification.error('Please Select Customer Type');
        }
        if (!params.firstName || !_.isString(params.firstName)) {
            Notification.error('Please Provide Full Name');
        }
        if (!params.contactPhone || typeof parseInt(params.contactPhone) === 'NaN' || (params.contactPhone.length != 10 && typeof params.contactPhone === String)) {
            params.errorMessage.push('Enter Mobile Number');
        }
        if (params.isActive === undefined) {
            Notification.error('Invalid Status');
        }
        else {
            if ($stateParams.commissionAgentId) {
                Upload.upload({
                    url: '/v1/cpanel/customers/updateCommissionAgent',
                    method: "POST",
                    data: {
                        files: [$scope.commissionAgent.newDocumentFile],
                        content: $scope.commissionAgent
                    }
                }).then(function (success) {
                    if (success.data.status) {
                        success.data.messages.forEach(function (message) {
                            Notification.success(message);
                        });
                        $state.go('customers.commissionAgents');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message);
                        });
                    }
                });
            } else {

            }
        }
    };

    $scope.searchBycommissionAgent = function (commissionAgent) {
        $scope.commissionAgentParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.commissionAgent = commissionAgent;
                loadTableData(params);
            }
        });
    };
}]);
/*Commision Agent End*/

/*Author SVPrasadK*/
/*Factory Owner Start*/
/*Factory Owner End*/

/*Author SVPrasadK*/
/*Guest Start*/
/*Guest End*/
