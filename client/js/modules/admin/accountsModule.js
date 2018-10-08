app.factory('AccountService', ['$http', function ($http) {
    return {
        addAccount: function (account, success, error) {
            $http({
                url: '/v1/cpanel/accounts/addAccount',
                method: "POST",
                data: account
            }).then(success, error);
        },
        count: function (type,searchParams, success, error) {
            $http({
                url: '/v1/cpanel/accounts/count/' + type,
                method: "GET",
                params:{searchParams:searchParams}
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
        checkAvailablity: function (data, success, error) {
            $http({
                url: '/v1/cpanel/accounts/checkAvailablity',
                method: "POST",
                data: data
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
        },
        getTruckLocations: function (body,success, error) {
            $http({
                url: '/v1/cpanel/accounts/gpsTrackingByTruck/'+body.regNo+'/'+body.startDate+'/'+body.endDate,
                method: "GET"
            }).then(success, error)
        }
    }
}]);
app.controller('getLocationController', ['$scope','$uibModalInstance','NgMap','DeviceService','accountId','$compile', function ($scope,$uibModalInstance,NgMap,DeviceService,accountId,$compile) {
    $scope.reloadPage = function(){
        window.location.reload();
    };
    var marker;

    DeviceService.getAllTrucksOfAccount(accountId,function(success){
        if(success.data.trucks){
            var icon = {
                url:'',
                scaledSize: new google.maps.Size(40, 40),
                labelOrigin: new google.maps.Point(20, -2)};
            NgMap.getMap().then(function(map) {
                var truckList=success.data.trucks;
                for(var i=0;i<truckList.length;i++){
                    if(truckList[i].attrs){
                        var latestLocation =truckList[i].attrs.latestLocation;
                        if(!latestLocation || !latestLocation.location){
                            continue;
                        }
                        var location = latestLocation.location;
                        var latlng = location.coordinates;
                        if(latestLocation.isStopped || latestLocation.isIdle ){
                            icon.url = '/images/red_marker.svg';
                        }else{
                            icon.url = '/images/green_marker.svg';
                        }
                        marker = new google.maps.Marker(
                            {position:new google.maps.LatLng(latlng[1],latlng[0]),
                                icon:icon
                            });
                        marker.setMap(map);
                        var infowindow = new google.maps.InfoWindow();
                        var functionContent = '<div>'+'<span><b>TruckNo:</b></span>'+truckList[i].registrationNo+'<span><br></span>'+'<span><b>Speed:</b></span>'+latestLocation.speed+'<span><br></span>'+'<span><b>Address:</b></span>'+latestLocation.address+'</div>';
                        var compiledContent = $compile(functionContent)($scope);
                        google.maps.event.addListener(marker, 'click', (function (marker, i, content) {
                            return function () {
                                infowindow.setContent(content);
                                infowindow.open(map, marker);
                            }
                        })(marker,i, compiledContent[0], $scope));
                        }
                }
            });
        }else {
            Notification.error(success.data.message);
        }
    });

    $scope.cancel = function () {
        $uibModalInstance.close();
        $scope.reloadPage();

    };
}]);
app.controller('accountsListCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', 'NgTableParams','$uibModal', function ($scope, $stateParams, AccountService, Notification, NgTableParams,$uibModal) {
    $scope.searchString = {searchParams:''};
    $scope.sortableString = '';
    $scope.count = 0;
    $scope.getCount = function () {
        AccountService.count($stateParams.type,$scope.searchString.searchParams,function (success) {
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
            counts: [],
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
            searchString: $scope.searchString.searchParams,
            sortableString: $scope.sortableString
        };
        AccountService.getAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (response.data.status) {
                tableParams.total(response.data.count);
                tableParams.data = response.data.accounts;
                // tableParams.reload();
                $scope.currentPageOfAccounts = response.data.accounts;
            } else {
                Notification.error({message: response.data.messages[0]});
            }
        });
    };
    $scope.getMap = function(accountId){
        var modalInstance = $uibModal.open({
            templateUrl: 'getLocation.html',
            controller: 'getLocationController',
            size: 'md',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                accountId: function () {
                    if(accountId){
                        return accountId;
                    }
                }
            }
        });
        modalInstance.result.then(function (accountId) {
            if(accountId){
                accountId = accountId;
            }
        }, function () {});
    }
}]);

app.controller('accountsAddEditCrtl', ['$scope', '$stateParams', 'AccountService', 'Notification', '$state', 'SettingServices', 'Utils', function ($scope, $stateParams, AccountService, Notification, $state, SettingServices, Utils) {

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
                sourceLocation: [],
                destination: '',
                destinationState: '',
                destinationAddress: '',
                destinationLocation:[]
            });
        } else {
            params.push({
                accountId: $stateParams.accountId,
                source: '',
                sourceState: '',
                sourceAddress: '',
                sourceLocation:[],
                destination: '',
                destinationState: '',
                destinationAddress: '',
                destinationLocation:[]
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
                $scope.operatingRoutes[index].sourceLocation = [lng, lat];
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
                $scope.operatingRoutes[index].destinationLocation= [lng, lat];
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
    $scope.availableStatusError = '';
    $scope.checkAvailablity = function () {
        if($scope.accountDetails.userName.length > 2) {
            var params = {userName: $scope.accountDetails.userName};
            if ($scope.accountDetails._id) params._id = $scope.accountDetails._id;
            AccountService.checkAvailablity(params, function (success) {
                if (success.data.status) {
                    $scope.availableStatus = true;
                    $scope.availableStatusError = 'username available';
                } else {
                    $scope.availableStatus = false;
                    $scope.availableStatusError = 'username not available';
                }
            });
        }
    };

    $scope.addUpdateAccount = function () {
        var params = $scope.accountDetails;
        params.errors = [];
        if (!params.userName) {
            params.errors.push('Invalid User Name');
        }
        if (params.userName) {
            if(params.userName.length < 3)
            params.errors.push('User Name should be minimum of 3 characters');
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
        if (!params.email || !Utils.isValidEmail(params.email)) {
            params.errors.push('Invalid email');
        }
        /*if (!params.gpsEnabled && !params.erpEnabled) {
            params.errors.push('Select atleast 1 service');
        }*/
        if (!params.errors.length && $scope.availableStatus) {
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