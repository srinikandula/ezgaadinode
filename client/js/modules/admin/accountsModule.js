app.factory('AccountService', ['$http', function ($http) {
    return {
        addAccount: function (account, success, error) {
            $http({
                url: '/v1/cpanel/accounts/addAccount',
                method: "POST",
                data: account
            }).then(success, error);
        },
        count: function (type, success, error) {
            $http({
                url: '/v1/cpanel/accounts/count/' + type,
                method: "GET"
            }).then(success, error)
        },
        getAccounts: function (pageable, success, error) {
            $http({
                url: '/v1/cpanel/accounts/getAccounts',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getAccountDetails: function (accountId, success, error) {
            $http({
                url: '/v1/cpanel/accounts/getAccountDetails/' + accountId,
                method: "GET"
            }).then(success, error)
        },
        checkAvailablity: function (userName, success, error) {
            $http({
                url: '/v1/cpanel/accounts/checkAvailablity/' + userName,
                method: "GET"
            }).then(success, error);
        },
        deleteRoute: function (id, success, error) {
            $http({
                url: '/v1/cpanel/accounts/deleteRoute/' + id,
                method: "GET"
            }).then(success, error);
        },
        assignPlan: function (plan, success, error) {
            $http({
                url: '/v1/cpanel/accounts/assignPlan',
                method: "POST",
                data: plan
            }).then(success, error);
        }
    }
}]);

app.controller('accountsListCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', 'NgTableParams', function ($scope, $stateParams, AccountService, Notification, NgTableParams) {
    $scope.searchString = '';
    $scope.sortableString = '';
    $scope.count = 0;
    $scope.getCount = function () {
        AccountService.count($stateParams.type, function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();
    $scope.init = function () {
        $scope.accountParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [10, 50, 100, 200],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
                // $scope.getDevices();
            }
        });
    };
    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            type: $stateParams.type,
            searchString: $scope.searchString,
            sortableString: $scope.sortableString
        };
        AccountService.getAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.accounts;
                $scope.currentPageOfAccounts = response.data.accounts;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
}]);

app.controller('accountsAddEditCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', '$state', 'SettingServices', function ($scope, $stateParams, AccountService, Notification, $state, SettingServices) {

    $scope.enableForm = true;
    function getAccountDetails() {
        AccountService.getAccountDetails($stateParams.accountId, function (success) {
            if (success.data.status) {
                $scope.accountDetails = success.data.accountDetails;
                $scope.operatingRoutes = success.data.accountRoutes;
                $scope.enableForm = success.data.enableForm;
            } else {
                Notification.error({message: 'unable to get account details'});
            }
        });
    }
    $scope.pageTitle = "Add New GPS / ERP Account";
    if ($stateParams.accountId) {
        $scope.pageTitle = "Edit GPS / ERP Account";
        getAccountDetails();
    }
    $scope.serviceSelected = '';
    $scope.getPlansOfService = function () {
    };
    $scope.status = {
        isOpen: true,
        isOpenOne: true,
        isOpenTwo: true,
        isOpenThre: true,
    };

    function initAccountDetails() {
        $scope.accountDetails = {
            userName: '',
            contactName: '',
            password: '',
            contactPhone: '',
            role: '',
            companyName: '',
            contactAddress: '',
            city: '',
            state: '',
            pincode: '',
            addressPreference: 'osm',
            gpsEnabled: '',
            erpEnabled: '',
            loadEnabled: true,
            smsEnabled: '',
            isActive: '',
            errors: []
        };
        $scope.operatingRoutes = [];
    }

    initAccountDetails();
    $scope.addRoute = function () {
        var params = $scope.operatingRoutes;
        if (params.length) {
            if (params[params.length - 1].source && params[params.length - 1].destination) params.push({
                accountId: $stateParams.accountId,
                source: '',
                sourceState: '',
                sourceAddress: '',
                sourceLocation: {
                    coordinates: [] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
                },
                destination: '',
                destinationState: '',
                destinationAddress: '',
                destinationLocation: {
                    coordinates: [] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
                }
            });
        } else {
            params.push({
                accountId: $stateParams.accountId,
                source: '',
                sourceState: '',
                sourceAddress: '',
                sourceLocation: {
                    coordinates: [] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
                },
                destination: '',
                destinationState: '',
                destinationAddress: '',
                destinationLocation: {
                    coordinates: [] //[longitude(varies b/w -180 and 180 W/E), latitude(varies b/w -90 and 90 N/S)]
                }
            });
        }
    };

    $scope.deleteRoute = function (index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete the route'
        }).then(function (result) {
            if (result.value) {
                var params = $scope.operatingRoutes;
                AccountService.deleteRoute(params[index]._id, function (success) {
                    if (success.data.status) {
                        params.splice(index, 1);
                        swal(
                            '',
                            'Successfully deleted',
                            'success'
                        );
                    } else {
                        Notification.error({message: 'unable to delete route'});
                    }
                });
            }
        });
    };
    $scope.getLonLat = function (index, type) {
        var input = '';
        if (type === 'source') input = document.getElementById(index + 's');
        else input = document.getElementById(index + 'd');
        var options = {types: ['(cities)'], componentRestrictions: {country: "in"}};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            var lng = place.geometry.location.lng();
            var lat = place.geometry.location.lat();
            if (type === 'source') {
                $scope.operatingRoutes[index].sourceLocation.coordinates = [lng, lat];
                for (var i = 0; i < place.address_components.length; i++) {
                    var base = place.address_components[i];
                    if (base.types[0] === 'locality') {
                        $scope.operatingRoutes[index].source = base.long_name;
                    } else if (base.types[0] === 'administrative_area_level_1') {
                        $scope.operatingRoutes[index].sourceState = base.long_name;
                    }
                }
                $scope.operatingRoutes[index].sourceAddress = place.formatted_address
            } else {
                $scope.operatingRoutes[index].destinationLocation.coordinates = [lng, lat];
                for (var i = 0; i < place.address_components.length; i++) {
                    var base = place.address_components[i];
                    if (base.types[0] === 'locality') {
                        $scope.operatingRoutes[index].destination = base.long_name;
                    } else if (base.types[0] === 'administrative_area_level_1') {
                        $scope.operatingRoutes[index].destinationState = base.long_name;
                    }
                }
                $scope.operatingRoutes[index].destinationAddress = place.formatted_address
            }
        });
    };
    $scope.availableStatus = true;
    $scope.checkAvailablity = function () {
        AccountService.checkAvailablity($scope.accountDetails.userName, function (success) {
            if (success.data.status) {
                $scope.availableStatus = true;
            } else {
                $scope.availableStatus = true;
            }
        });
    };

    $scope.addOrUpdateAccount = function () {
        var params = $scope.accountDetails;
        params.errors = [];
        if (!params.userName) {
            params.errors.push('Invalid User Name');
        }
        if (!params.contactName) {
            params.errors.push('Invalid Fullname');
        }
        if (!params.contactPhone) {
            params.errors.push('Invalid mobile number');
        }
        if (!params.role) {
            params.errors.push('Invalid role');
        }
        if (params.password.trim().length < 5) {
            params.errors.push('Invalid password. Password has to be at least 5 characters');
        }
        if (!params.gpsEnabled && !params.erpEnabled) {
            params.errors.push('Select atleast 1 service');
        }
        if (!params.errors.length) {
            AccountService.addAccount({
                account: $scope.accountDetails,
                routes: $scope.operatingRoutes
            }, function (success) {
                if (success.data.status) {
                    Notification.success({message: "Successfully added"});
                    $state.go('services.gpsAccounts');
                } else {
                    params.errors = success.data.messages;
                }
            });
        }
    };

    function getPlans() {
        SettingServices.getAllPlans('erp', function (success) {
            if (success.data.status) {
                $scope.plans = success.data.plans;
            }
        });
    }
    getPlans();

    function initPlan() {
        $scope.ERPPlanDEtails = {
            accountId: $stateParams.accountId,
            planId: '',
            amount: '',
            remark: '',
            startTime: '',
            expiryTime: '',
            errors: []
        }
    }
    initPlan();
    $scope.assignERPPlan = function () {
        var params = $scope.ERPPlanDEtails;
        params.errors = [];
        if (!params.planId) {
            params.errors.push('Select a plan');
        }
        if (!params.startTime) {
            params.errors.push('Select start date');
        }
        if (!params.expiryTime) {
            params.errors.push('Select expiry date');
        }
        if (params.expiryTime < params.startTime) {
            params.errors.push('expiry date should be greater than start date');
        }
        if (!params.amount) {
            params.errors.push('select an amount');
        }
        if (params.errors.length < 1) {
            AccountService.assignPlan({planDetails: $scope.ERPPlanDEtails, type: 'erp'}, function (success) {
                if (success.data.status) {
                    initPlan();
                    getAccountDetails();
                    Notification.success({message: "Successfully updated"});
                }
            });
        }
    };
}]);