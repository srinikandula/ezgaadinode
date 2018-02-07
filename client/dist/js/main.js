app.factory('GpsSettingsService',['$http', function ($http) {
    return {
        addSecret: function (object, success, error) {
            $http({
                url: '/v1/gps/addSecret',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getAllSecrets: function (success, error) {
            $http({
                url: '/v1/gps/getAllSecrets',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('GpsSettingsCrtl', ['$scope', 'GpsSettingsService', 'Notification', '$state', function ($scope, GpsSettingsService, Notification, $state) {
    $scope.secretkey = '';
    $scope.addSecret = function () {
        if(!$scope.secretkey) {
            $scope.secretkeyerror = 'Please enter a secret key'
        } else {
            GpsSettingsService.addSecret({secret:$scope.secretkey, email: $scope.email}, function (success) {
                if(success.data.status) {
                    Notification.success(success.data.messages[0]);
                    $state.go('secretKeys')
                } else {
                    Notification.error(success.data.messages[0]);
                }
            });
        }
    };
    $scope.getAllSecrets = function () {
        GpsSettingsService.getAllSecrets(function (success) {
            if(success.data.status) {
                $scope.secretKeys = success.data.secretKeys;
            }
        });
    };
    $scope.getAllSecrets();

}]);
app.factory('AccountServices',['$http', '$cookies', function ($http, $cookies) {
    return {
        addAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/add',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        },
        getAllAccounts: function (pageable, success, error) {
            $http({
                url: '/v1/admin/accounts/fetch/',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getAccount: function (accountId, success, error) {
            $http({
                url: '/v1/admin/accounts/' + accountId,
                method: "GET"
            }).then(success, error)
        },
        updateAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/update',
                method: "PUT",
                data: accountInfo
            }).then(success, error)
        },
        updateNewAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/newUpdate',
                method: "PUT",
                data: accountInfo
            }).then(success, error)
        },
        erpDashboard: function (success, error) {
            $http({
                url: '/v1/admin/erpDashboard',
                method: "GET",
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/admin/accounts/total/count',
                method: "GET"
            }).then(success, error)
        },
        userProfile: function (success, error) {
            $http({
                url: '/v1/admin/userProfile',
                method: "GET"
            }).then(success, error)
        },
        addAccountGroup: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/addAccountGroup',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        },
        countAccountGroups: function (success, error) {
            $http({
                url: '/v1/admin/countAccountGroups',
                method: "GET"
            }).then(success, error)
        },
        getAllAccountGroup: function (pageable, success, error) {
            $http({
                url: '/v1/admin/getAllAccountGroup',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getAccountGroup: function (accountGroupId, success, error) {
            $http({
                url: '/v1/admin/getAccountGroup/' + accountGroupId,
                method: "GET"
            }).then(success, error)
        },
        updateAccountGroup: function (accountGroupInfo, success, error) {
            $http({
                url: '/v1/admin/updateAccountGroup',
                method: "PUT",
                data: accountGroupInfo
            }).then(success, error)
        },
        uploadUserProfilePic: function (data, success, error) {
            $http({
                url: '/v1/admin/uploadUserProfilePic',
                method: "POST",
                data: data
            }).then(success, error)
        },
        getErpSettings: function (success, error) {
            $http({
                url: '/v1/admin/getErpSettings',
                method: "GET"
            }).then(success, error)
        },
        updateErpSettings: function (params, success, error) {
            $http({
                url: '/v1/admin/updateErpSettings',
                method: "PUT",
                data: params
            }).then(success, error)
        },
        createKeyPair:function (body,success,error) {
            $http({
                url: '/v1/admin/createKeyPair/'+body.accountId,
                method: "GET"
            }).then(success, error)
        },
        getKeyPairsForAccount:function (body,success,error) {
            $http({
                url: '/v1/admin/getKeyPairsForAccount/'+body,
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('ShowAccountsCtrl', ['$scope', '$uibModal', 'AccountServices', 'Notification', '$state', 'paginationService', 'NgTableParams', function ($scope, $uibModal, AccountServices, Notification, $state, paginationService, NgTableParams) {
    $scope.goToEditAccountPage = function (accountId) {
        $state.go('accountsEdit', {accountId: accountId});
    };
    $scope.filter;
    $scope.count = 0;
    $scope.getCount = function () {
        AccountServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        pageable.filter = $scope.filter;
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        AccountServices.getAllAccounts(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.accounts)) {
                $scope.loading = false;
                $scope.accounts = response.data.accounts;
                tableParams.total(response.data.count);
                tableParams.data = $scope.accounts;
                $scope.currentPageOfAccounts = $scope.accounts;

            }
        });
    };
    $scope.findAccounts = function () {
        $scope.accountParams.filter = $scope.filter;
        loadTableData($scope.accountParams);
    }
    $scope.init = function () {
        $scope.accountParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            },
            filter: $scope.filter
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

    //Accounts Group

    $scope.goToEditAccountGroupPage = function (accountGroupId) {
        $state.go('addGroup', {accountGroupId: accountGroupId});
    };
    $scope.accountGroupFilter;
    $scope.accountGroupCount = 0;
    $scope.getAccountGroupCount = function () {
        AccountServices.countAccountGroups(function (success) {
            if (success.data.status) {
                $scope.accountGroupCount = success.data.count;
                $scope.initAccountGroup();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getAccountGroupCount();

    var loadAccountGroupTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        pageable.filter = $scope.accountGroupFilter;
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        AccountServices.getAllAccountGroup(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.accountGroup)) {
                $scope.loading = false;
                $scope.accountGroup = response.data.accountGroup;
                tableParams.total(response.data.count);
                tableParams.data = $scope.accountGroup;
                $scope.currentPageOfAccountGroup = $scope.accountGroup;

            }
        });
    };
    $scope.findAccountGroup = function () {
        $scope.accountGroupParams.filter = $scope.accountGroupFilter;
        loadAccountGroupTableData($scope.accountGroupParams);
    }

    $scope.initAccountGroup = function () {
        $scope.accountGroupParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            },
            filter: $scope.accountGroupFilter
        }, {
            counts: [],
            total: $scope.accountGroupCount,
            getData: function (params) {
                loadAccountGroupTableData(params);
            }
        });
    };

}]);

app.controller('AddEditAccountCtrl', ['$scope', 'Utils', '$state', 'AccountServices', 'TrucksService', '$stateParams', 'Notification', '$uibModal', function ($scope, Utils, $state, AccountServices, TrucksService, $stateParams, Notification, $uibModal) {
    $scope.pagetitle = "Add Account";

    $scope.account = {
        profile: {
            userName: '',
            password: '',
            contactPhone: '',
            email: '',
        },
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        erpEnabled: '',
        gpsEnabled: '',
        isActive: true,
        success: [],
        errors: []
    };

    $scope.group = {
        groupName: '',
        userName: '',
        password: '',
        confirmPassword: '',
        contactName: '',
        contactPhone: '',
        location: '',
        truckIds: [],
        erpEnabled: '',
        gpsEnabled: '',
        type: '',
        isActive: true,
        success: [],
        errors: []
    };


    $scope.addNewAccount = {
        userName: '',
        password: '',
        contactPhone: '',
        erpEnabled: '',
        gpsEnabled: '',
        isActive: true,
        success: [],
        errors: []
    };

    if ($stateParams.accountId) {
        $scope.pagetitle = "Update Account";
        AccountServices.getAccount($stateParams.accountId, function (success) {
            if (success.data.status) {
                $scope.addNewAccount = success.data.account;
                getKeyPairsForAccount();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateNewAccount = function () {
        var params = $scope.addNewAccount;
        params.errors = [];
        params.success = [];

        if (!params._id && !params.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params._id && !params.password) {
            params.errors.push('Invalid Password');
        }

        if (!params._id && !params.contactPhone) {
            params.errors.push('Invalid Mobile Number');
        }

        if (!params.errors.length) {
            if (params._id) {
                // If _id update the account
                AccountServices.updateNewAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('accounts');
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                // _id doesn\'t exist => create account
                AccountServices.addAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('accounts');
                        Notification.success({message: "Account Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }

    };

    $scope.trucks = [];

    $scope.dropdownSetting = {
        scrollable: true,
        scrollableHeight: '200px',
    }

    if ($stateParams.accountId) {
        $scope.pagetitle = "Update Account";
        AccountServices.getAccount($stateParams.accountId, function (success) {
            if (success.data.status) {
                $scope.account = success.data.account;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    } else if ($stateParams.accountGroupId) {
        AccountServices.getAccountGroup($stateParams.accountGroupId, function (success) {
            if (success.data.status) {
                $scope.group = success.data.accountGroup;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
        getTruckIds();
    } else {
        getTruckIds();
    }

    $scope.createKeyPair = function (id) {
        AccountServices.createKeyPair({accountId:id},function (success) {
            if (success.data.status) {
                // console.log(success.data.results);
                getKeyPairsForAccount();
            }else{

            }
        },function (error) {

        })
    };

    $scope.userProfilee = function () {
        AccountServices.userProfile(function (success) {
            if (success.data.status) {
                $scope.account = success.data.result;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    $scope.addOrUpdateAccount = function () {
        var params = $scope.account;
        params.errors = [];
        params.success = [];

        if (!params.profile.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params.profile.contactPhone) {
            params.errors.push('Invalid Mobile Number');
        }

        if (!params.profile.email) {
            params.errors.push('Invalid Email');
        }
        if (params.oldPassword) {
            if (!params.newPassword) {
                params.errors.push('Please Provide New Password');
            }
            if (params.confirmPassword !== params.newPassword) {
                params.errors.push('Passwords Not Matched');
            }
        }
        if (!params.errors.length) {
            if (params.profile._id) {
                // If _id update the account
                AccountServices.updateAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        Notification.success({message: "Account Updated Successfully"});
                        $state.go('myProfile');
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                // _id doesn\'t exist => create account
                AccountServices.addAccount(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data;
                        $state.go('myProfile');
                        Notification.success({message: "Account Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }

    };
    $scope.truckId2 = [];

    function getTruckIds() {
        TrucksService.getAllTrucks({}, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                console.log("$scope.group",$scope.group);

                if ($scope.group.truckIds.length > 0) {
                    for (var i = 0; i < $scope.trucks.length; i++) {

                        if( $scope.group.truckIds.indexOf($scope.trucks[i]._id) !=-1){
                            $scope.truckId2.push(true);

                        }else{
                            $scope.truckId2.push(false);

                        }

                    }
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(success.data.message);
                });
            }
        }, function (error) {
            Notification.error(error);
        });

    }

    $scope.truckSelected = function (status, truckId) {
        if (status) {
            $scope.group.truckIds.push(truckId);
        } else {
            var index = $scope.group.truckIds.indexOf(truckId);
            $scope.group.truckIds.splice(index, 1);
        }
    }

    $scope.addOrUpdateAccountGroup = function () {
        var params = $scope.group;
        params.errors = [];
        params.success = [];

        if (!params.groupName) {
            params.errors.push('Please Provide Group Name');
        }

        if (!params.userName) {
            params.errors.push('Please Provide User Name');
        }

        if (!params.password) {
            params.errors.push('Please Provide Password');
        }

        if (params.password !== params.confirmPassword) {
            params.errors.push('Passwords Not Matched');
        }

        if (!params.contactName) {
            params.errors.push('Please Provide Contact Name');
        }

        if (!params.contactPhone) {
            params.errors.push('Please Provide Mobile Number');
        }

        if (!params.location) {
            params.errors.push('Please Provide Location');
        }

        if (!params.truckIds.length) {
            params.errors.push('Please Select Atleast One Vehicle');
        }
        if (!params.erpEnabled && !params.gpsEnabled) {
            params.errors.push('Please Select Either ERP or GPS');
        }
        if (!params.errors.length) {
            params.type = 'group';
            if (params._id) {
                // If _id update the account
                AccountServices.updateAccountGroup(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('myGroup');
                        Notification.success({message: "Group Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            } else {
                // _id doesn\'t exist => create account
                AccountServices.addAccountGroup(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.messages;
                        $state.go('myGroup');
                        Notification.success({message: "Group Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }

    };

    $scope.cancel = function () {
        $state.go('accounts');
    }
    $scope.changeProfilePic = function () {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'pop-up-modal.html',
            controller: 'userProfilePicCtrl',
            size: 'lg',
            windowClass: 'profilePopup',
            resolve: {
                modelType: function () {
                    return {data: "", model: 'changeProfilePic'};
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            if (selectedItem.status) {
                swal({
                    type: 'success',
                    title: 'Successfully Uploaded',
                    showConfirmButton: false,
                    timer: 1500
                });
                $state.go('myProfile', {}, {reload: true});

            } else {
                swal({
                    type: 'error',
                    title: 'Error While Uploading',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }, function () {
        });
    }

    function getKeyPairsForAccount() {
        AccountServices.getKeyPairsForAccount($scope.addNewAccount._id,function (success) {
            if(success.data.status){
                console.log(success.data.results);
                $scope.keys=success.data.results;
            }else{

            }
        },function (error) {

        })
    }

}]);
app.controller('userProfilePicCtrl', ['$scope', '$uibModalInstance', 'AccountServices', '$cookies', '$rootScope', '$state', 'modelType', 'Upload', '$sce', function ($scope, $uibModalInstance, AccountServices, $cookies, $rootScope, $state, modelType, Upload, $sce) {


    $scope.myImage = '';
    $scope.myCroppedImage = '';


    $scope.closeModal = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.uploadFile = function (file) {
        if (file) {
            var imageReader = new FileReader();
            imageReader.onload = function (image) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = image.target.result;

                    console.log($scope.myImage)
                });
            };
            imageReader.readAsDataURL(file);
        }
    };
    $scope.template = 'views/partials/userProfile/userProfilePicModal.html';


    $scope.submitProfilePicture = function (img) {
        AccountServices.uploadUserProfilePic({image: img}, function (success) {
            if (success.data.status) {
                $cookies.put('profilePic', success.data.profilePic);
                $rootScope.profilePic = success.data.profilePic;
                $uibModalInstance.close({status: true, message: success.data.message});
            } else {
                swal(success.data.message, 'Error', 'warning');
            }
        }, function (err) {
        });
    };
}]);

app.controller('ERPSettingsCtrl', ['$scope', 'AccountServices', 'Notification', '$state', '$stateParams', function ($scope, AccountServices, Notification, $state, $stateParams) {

    $scope.settings = {
        revenue: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        payment: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        expense: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        expiry: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        tollCard: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        fuelCard: {
            filterType: '',
            fromDate: '',
            toDate: ''
        },
        success: [],
        errors: []
    }

    $scope.init = function () {
        AccountServices.getErpSettings(function (success) {
            if (success.data.status) {
                $scope.settings = success.data.erpSettings;
                if($scope.settings.revenue.filterType === 'custom') {
                    $scope.settings.revenue.fromDate=new Date($scope.settings.revenue.fromDate);
                    $scope.settings.revenue.toDate=new Date($scope.settings.revenue.toDate);
                }
                if($scope.settings.payment.filterType === 'custom') {
                    $scope.settings.payment.fromDate=new Date($scope.settings.payment.fromDate);
                    $scope.settings.payment.toDate=new Date($scope.settings.payment.toDate);
                }
                if($scope.settings.expense.filterType === 'custom') {
                    $scope.settings.expense.fromDate=new Date($scope.settings.expense.fromDate);
                    $scope.settings.expense.toDate=new Date($scope.settings.expense.toDate);
                }
                if($scope.settings.tollCard.filterType === 'custom') {
                    $scope.settings.tollCard.fromDate=new Date($scope.settings.tollCard.fromDate);
                    $scope.settings.tollCard.toDate=new Date($scope.settings.tollCard.toDate);
                }
                if($scope.settings.fuelCard.filterType === 'custom') {
                    $scope.settings.fuelCard.fromDate=new Date($scope.settings.fuelCard.fromDate);
                    $scope.settings.fuelCard.toDate=new Date($scope.settings.fuelCard.toDate);
                }
                if($scope.settings.expiry.filterType === 'custom') {
                    $scope.settings.expiry.fromDate=new Date($scope.settings.expiry.fromDate);
                    $scope.settings.expiry.toDate=new Date($scope.settings.expiry.toDate);
                }
                //console.log('getErpSettings',$scope.settings)
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.init();

    $scope.updateCustomDate = function (filterType) {
        var params = $scope.settings;
        params.errors = [];
        params.success = [];

        if(filterType === 'revenue') {
            $scope.settings.revenue.fromDate=new Date();
            $scope.settings.revenue.toDate=new Date();
        } else if(filterType === 'payment') {
            $scope.settings.payment.fromDate=new Date();
            $scope.settings.payment.toDate=new Date();
        } else if(filterType === 'expense') {
            $scope.settings.expense.fromDate=new Date();
            $scope.settings.expense.toDate=new Date();
        } else if(filterType === 'tollCard') {
            $scope.settings.tollCard.fromDate=new Date();
            $scope.settings.tollCard.toDate=new Date();
        } else if(filterType === 'fuelCard') {
            $scope.settings.fuelCard.fromDate=new Date();
            $scope.settings.fuelCard.toDate=new Date();
        } else if(filterType === 'expiry') {
            $scope.settings.expiry.fromDate=new Date();
            $scope.settings.expiry.toDate=new Date();
        }
    }

    $scope.editSettings = function (filterType) {
        var params = $scope.settings;
        params.errors = [];
        params.success = [];

        if(filterType === 'revenue') {
            if(!params.revenue.fromDate || !params.revenue.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.revenue.fromDate > params.revenue.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else if(filterType === 'payment') {
            if(!params.payment.fromDate || !params.payment.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.payment.fromDate > params.payment.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else if(filterType === 'expense') {
            if(!params.expense.fromDate || !params.expense.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.expense.fromDate > params.expense.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else if(filterType === 'tollCard') {
            if(!params.tollCard.fromDate || !params.tollCard.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.tollCard.fromDate > params.tollCard.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else if(filterType === 'fuelCard') {
            if(!params.fuelCard.fromDate || !params.fuelCard.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.fuelCard.fromDate > params.fuelCard.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else if(filterType === 'expiry') {
            if(!params.expiry.fromDate || !params.expiry.toDate) {
                Notification.error({message: "Please Provide From and To Dates"});
            } else if(params.expiry.fromDate > params.expiry.toDate) {
                Notification.error({message: "Invalid Date Selection"});
            } else {
                $scope.updateSettings(params);
            }
        } else {
            $scope.updateSettings(params);
        }
    }

    $scope.updateSettings = function (params) {
        AccountServices.updateErpSettings(params, function (success) {
            if (success.data.status) {
                params.success = success.data.messages;
                $scope.init();
                Notification.success({message: "Settings Updated Successfully"});
            } else {
                params.errors = success.data.messages;
            }
        }, function (err) {

        });
    }

}]);

app.factory('AnalyticsServices', ['$http', '$cookies',function ($http, $cookies) {
    return {
        getLastLoginReports: function (action,from,to, success, error) {
            $http({
                url: '/v1/analytics/getReports/'+action+'/'+from+'/'+to,
                method: "GET",
            }).then(success, error)
        },
        getReportsByUserAgent: function (action,from,to, success, error) {
            $http({
                url: '/v1/analytics/getReportsByUserAgent/'+action+'/'+from+'/'+to,
                method: "GET",
            }).then(success, error)
        }
    }
}]);
app.controller('AnalyticsReportCtrl', ['$scope', 'AnalyticsServices', '$state', 'NgTableParams', function ($scope, AnalyticsServices, $state, NgTableParams) {
    $scope.dateParams={
        from:new Date(),
        to:new Date()
    };
    $scope.action='Select Action';
    // function getReports() {
    $scope.getReports = function () {
        console.log($scope.dateParams);
        AnalyticsServices.getLastLoginReports($scope.action,$scope.dateParams.from,$scope.dateParams.to,function (success) {
            if(success.data.status){
                $scope.reports=success.data.results;
                console.log($scope.reports);
            }else {

            }
        })
    };

    $scope.userAgent='Select User Agent';

    $scope.getReportsByUserAgent =function () {
        AnalyticsServices.getReportsByUserAgent($scope.userAgent,$scope.dateParams.from,$scope.dateParams.to,function (success) {
            if(success.data.status){
                $scope.reportsByUserAgent=success.data.results;
                console.log($scope.reportsByUserAgent);
            }else {

            }
        })
    }

    // getReports();
}]);
app.controller('dashboardController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', 'paginationService', 'NgTableParams', 'TripServices', 'ExpenseService', 'PartyService', 'PaymentsService', 'AccountServices', '$stateParams',
    function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, TripServices, ExpenseService, PartyService, PaymentsService, AccountServices, $stateParams) {

        $scope.vehicleId = $stateParams.vehicleId;
        $scope.id = $stateParams.id;

        $scope.partyName = $stateParams.name;
        $scope.partyId = $stateParams.partyId;

        $scope.initializeparams = function (tableType) {
            var pageable = {};
            $scope.loading = true;
            $scope.filters = {
                fromDate: "",
                toDate: "",
                regNumber: "",
                error: [],
            };
            $scope.partyId = "";
            $scope.regNumber = "";
        };

        $scope.initializeparams();
        $scope.gotoPayableBypartyId = function (id, name) {
            $scope.partyName = name;
            $scope.getAmountsBypartyId(id);
            $scope.initializeparams();
        };

        $scope.erpDashBoard = function () {
            AccountServices.erpDashboard(function (success) {
                if (success.data.status) {
                    $scope.totals = success.data.result;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };
        $scope.erpDashBoard();

        $scope.getTruckExpires = function () {
            TrucksService.findExpiryTrucks({
                regNumber: $scope.regNumber
            }, function (success) {
                if (success.data.status) {
                    $scope.expiryTrucks = success.data.expiryTrucks;
                    $scope.table = $('#truckExpirylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.expiryTrucks,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "registrationNo"
                            },
                            {
                                title: 'Fitness Expiry', "data": "fitnessExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Permit Expiry", "data": "permitExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Tax Expiry", "data": "taxDueDate",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Insurance Expiry", "data": "insuranceExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Pollution Expiry", "data": "pollutionExpiry",
                                "render": function (data, type, row) {
                                    if (data !== '--') {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            }
                        ],

                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getRevenueByParty = function () {
            PartyService.getRevenueByPartyId($stateParams.id, function (success) {
                if (success.data.status) {
                    $scope.totalRevenueByVehicleId = success.data.totalRevenue;
                    $scope.table = $('#revenueByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: false,

                            responsivePriority: 1
                        }],

                        data: success.data.trips,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: 'Trip ID', "data": "tripId",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Party Name", "data": "attrs.partyName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Frieight Amount", "data": "freightAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: "Expenses", "data": "cost",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '--';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };
        $scope.getRevenueByVehicle = function () {
            TripServices.findRevenueByVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber

            }, function (success) {
                if (success.data.status) {
                    $scope.revenueByVehicle = success.data.revenue;
                    $scope.totalRevenue = success.data.grossAmounts;
                    $scope.table = $('#revenuelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,
                            targets: 0,
                            responsivePriority: 1
                        }],

                        data: $scope.revenueByVehicle,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "attrs.truckName",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Total Freight', "data": "totalFreight"},
                            {title: "Total Expense", "data": "totalExpense"},
                            {title: "Net Revenue", "data": "totalRevenue"}

                        ],


                        searching: true

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('revenueByvehicleId', {vehicleId: data.attrs.truckName, id: data.registrationNo});
                    })


                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

        $scope.getPaybleByParty = function () {
            ExpenseService.getPaybleAmountByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId,

            }, function (success) {
                if (success.data.status) {
                    $scope.paybleList = success.data.paybleAmounts;
                    $scope.gross = success.data.gross;
                    $scope.table = $('#payablelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.paybleAmounts,
                        columns: [
                            {
                                "title": "Party Name",
                                "data": "_id.name",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Party Mobile', "data": "_id.contact"},
                            {title: "Total Amount", "data": "totalAmount"},
                            {title: "Paid Amount", "data": "paidAmount"},
                            {title: "Payable", "data": "payableAmount"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('payableByPartyName', {partyId: data._id._id, name: data._id.name});
                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
            PartyService.getAllPartiesBySupplier(function (success) {
                if (success.data.status) {
                    $scope.suppliersList = success.data.parties;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        };

        $scope.getAllTrucks = function () {
            TrucksService.getAllTrucksForFilter(function (success) {
                if (success.data.status) {
                    $scope.trucksList = success.data.trucks;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        };


        $scope.validateFilters = function (paramType) {
            var params = $scope.filters;
            if ((!params.fromDate || !params.toDate) && !params.regNumber) {
                params.error.push('Please Select Dates or Register Number');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }
            if (!params.error.length) {
                if (paramType === 'expense') {
                    $scope.getExpenseByVehicle();

                } else if (paramType === 'revenue') {
                    $scope.getRevenueByVehicle();
                }
            }
        };
        $scope.selectTruckId = function (truck) {
            $scope.regNumber = truck._id;
        };
        $scope.selectPartyId = function (party) {
            $scope.partyId = party._id;
        };
        $scope.resetPartyName = function () {
            $scope.partyId = "";
        };

        $scope.resetTruckName = function () {
            $scope.regNumber = "";
        };
        $scope.getExpenseByVehicle = function () {
            ExpenseService.findExpensesbyGroupVehicle({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                regNumber: $scope.regNumber

            }, function (success) {
                if (success.data.status) {
                    $scope.totalExpenses = success.data.totalExpenses;
                    $scope.table = $('#expenselist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.expenses,
                        columns: [
                            {
                                "title": "Registration No",
                                "data": "regNumber",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Diesel', "data": "exps[0].dieselExpense"},
                            {title: "Toll", "data": "exps[0].tollExpense"},
                            {title: "Maintenance", "data": "exps[0].mExpense"},
                            {title: "Miscellaneous", "data": "exps[0].misc"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('expenseByVehicleId', {vehicleId: data.regNumber, id: data.id});
                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getAmountsByparty = function () {

            PaymentsService.getDuesByParty({
                fromDate: $scope.filters.fromDate,
                toDate: $scope.filters.toDate,
                partyId: $scope.partyId

            }, function (success) {
                if (success.data.status) {

                    $scope.parties = success.data.parties;
                    $scope.partiesAmount = success.data.grossAmounts;
                    $scope.table = $('#receivablelist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            responsivePriority: 1
                        }],

                        data: success.data.parties,
                        columns: [
                            {
                                "title": "Party Name",
                                "data": "attrs.partyName",
                                "render": function (data, type, row) {

                                    return '<a href="#" class="ui-sref" >' + data + '</a>';

                                }
                            },
                            {title: 'Party Mobile', "data": "attrs.partyContact"},
                            {title: "Total Fright", "data": "totalFright"},
                            {title: "Paid Amount", "data": "totalPayment"},
                            {title: "Due Amount", "data": "totalDue"}


                        ],

                    }).on('click', '.ui-sref', function () {
                        var data = $scope.table.row($(this).parents('tr')).data();
                        $state.go('receivableByPartyName', {partyId: data.id, name: data.attrs.partyName});
                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

        $scope.getTotalAmountReceivable = function () {
            PaymentsService.getTotalPaymentsReceivable(function (success) {
                if (success.data.status) {
                    $scope.amounts = success.data.amounts;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getAllParties = function () {
            PartyService.getParties(null, function (success) {
                if (success.data.status) {
                    $scope.partiesList = success.data.parties;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };


        $scope.getAmountsBypartyWithFilters = function () {
            var params = $scope.filters;
            params.error = [];

            if ((!params.fromDate || !params.toDate) && !params.partyName) {
                params.error.push('Please Select Dates or Party Name');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }

            if (!params.error.length) {
                $scope.getAmountsByparty();
            }
        };
        $scope.getPaybleBypartyWithFilters = function () {
            var params = $scope.filters;
            params.error = [];

            if ((!params.fromDate || !params.toDate) && !params.partyName) {
                params.error.push('Please Select Dates or Party Name');
            }
            if (new Date(params.fromDate) > new Date(params.toDate)) {
                params.error.push('Invalid Date Selection');
            }

            if (!params.error.length) {
                $scope.getPaybleByParty();
            }
        };

        $scope.getexpenseByVehicleId = function () {
            ExpenseService.findExpensesbyVehicleId($stateParams.id, function (success) {
                if (success.data.status) {
                    $scope.expensesByVehicleId = success.data.expenses;
                    $scope.totalExpenses = success.data.totalExpenses;
                    $scope.table = $('#expenseByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data: success.data.expenses,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: 'Diesel', "data": "attrs.expenseName",
                                "render": function (data, type, row) {
                                    if (data.toLowerCase() == 'diesel' ) {
                                        return row.totalAmount;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Toll", "data": "attrs.expenseName",
                                "render": function (data, type, row) {
                                    if (data.toLowerCase() == 'toll' ) {
                                        return row.totalAmount;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Maintenance", "data": "attrs.expenseName",
                                "render": function (data, type, row) {
                                    if (data.toLowerCase() == 'maintenance' ) {
                                        return row.totalAmount;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Miscellaneous", "data": "attrs.expenseName",
                                "render": function (data, type, row) {
                                    if ((data.toLowerCase() == 'diesel') || (data.toLowerCase() == 'toll') || (data.toLowerCase() == 'maintenance')) {
                                        return 0;
                                    } else {
                                        return row.totalAmount;
                                    }

                                }
                            }

                        ],


                        searching: true

                    })
                } else {
                    Notification.error(success.data.message);
                }
            }, function (err) {

            });
        };


        $scope.Expenseamount = 0;

        $scope.GetExpense = function (expenseName, ExpenseAMount) {
            if ((expenseName.toLowerCase() == 'diesel') || (expenseName.toLowerCase() == 'toll') || (expenseName.toLowerCase() == 'maintenance')) {
                return 0;
            } else {
                return ExpenseAMount;
            }

        };
        $scope.getAmountsBypartyId = function () {
            PartyService.amountByPartyid($stateParams.partyId, function (success) {
                if (success.data.status) {
                    $scope.amountPaid = success.data.totalPendingPayments;
                    $scope.table = $('#amountsByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data:success.data.results,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '--';
                                    }

                                }
                            },
                            {
                                title: 'Trip Id', "data": "tripId",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Registration No", "data": "attrs.truckName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Freight Amount", "data": "freightAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            },
                            {
                                title: "Paid Amount", "data": "amount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (err) {

            });
        };

        $scope.getPaybleAmountByPartyId = function () {
            ExpenseService.getPaybleAmountByPartyId($stateParams.partyId, function (success) {
                if (success.data.status) {
                    $scope.grossAmounts = success.data.grossAmounts;
                    $scope.table = $('#payableByPartylist').DataTable({
                        destroy: true,
                        responsive: true,
                        aLengthMenu: [[10, 50, 75, -1], [10, 50, 75, "All"]],
                        iDisplayLength: 10,
                        sDom: 'tp',
                        order: [[0, 'des']],
                        columnDefs: [{

                            orderable: true,

                            responsivePriority: 1
                        }],

                        data:success.data.partyData,
                        columns: [
                            {
                                "title": "Date",
                                "data": "date",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return new Date(data).toLocaleDateString();
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: 'Expense Type', "data": "expenseType.expenseName",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Total Amount", "data": "totalAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Paid Amount", "data": "paidAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            },
                            {
                                title: "Payable", "data": "payableAmount",
                                "render": function (data, type, row) {
                                    if (data) {
                                        return data;
                                    } else {
                                        return '0';
                                    }

                                }
                            }

                        ],


                        searching: true

                    })
                } else {
                    success.data.message.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        };
        $scope.shareRevenueDetailsByVechicleViaEmail = function () {
            swal({
                title: 'Share revenue data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        TripServices.shareRevenueDetailsByVechicleViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
                            }
                        }, function (error) {
                        })
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        type: 'success',
                        html: 'Revenue details sent successfully'
                    })
                }
            })
        };

        $scope.sharePaymentsDetailsByPartyViaEmail = function () {
            swal({
                title: 'Share payment data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        PaymentsService.sharePaymentsDetailsByPartyViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            partyId: $scope.partyId,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
                            }
                        }, function (error) {
                        })
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        type: 'success',
                        html: 'Payments details sent successfully'
                    })
                }
            })
        };
        $scope.shareExpensesDetailsViaEmail = function () {
            swal({
                title: 'Share expense data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        ExpenseService.shareExpensesDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
                            }
                        }, function (error) {
                        })
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        type: 'success',
                        html: 'Expense details sent successfully'
                    })
                }
            })
        };
        $scope.shareExpairedDetailsViaEmail = function () {
            swal({
                title: 'Share expiry data using email',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        TrucksService.shareExpiredDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            regNumber: $scope.regNumber,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
                            }
                        }, function (error) {
                        })
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        type: 'success',
                        html: 'Expiry details sent successfully'
                    })
                }
            })
        };
        $scope.sharePayableDetailsViaEmail = function () {
            swal({
                title: 'Share payable data using mail',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (email) => {
                    return new Promise((resolve) => {
                        ExpenseService.sharePayableDetailsViaEmail({
                            fromDate: $scope.filters.fromDate,
                            toDate: $scope.filters.toDate,
                            partyId: $scope.partyId,
                            email: email,
                            page: $scope.filters.page,
                            sort: $scope.filters.sort,
                            size: $scope.filters.size
                        }, function (success) {
                            if (success.data.status) {
                                resolve()
                            } else {
                                success.data.messages.forEach(function (message) {
                                    swal.showValidationError(message);
                                });
                            }
                        }, function (error) {
                        })
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        type: 'success',
                        html: 'Payble details sent successfully'
                    })
                }
            })
        };
        $scope.downloadRevenueDetailsByVechicle = function () {
            window.open('/v1/trips/downloadRevenueDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadExpenseDetailsByVechicle = function () {
            window.open('/v1/expense/downloadExpenseDetailsByVechicle?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadPaymentDetailsByParty = function () {
            window.open('/v1/payments/downloadPaymentDetailsByParty?fromDate=' + $scope.filters.fromDate + '&toDate=' + $scope.filters.toDate + '&partyId=' + $scope.partyId + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadExpairyDetailsByTruck = function () {
            window.open('/v1/trucks/downloadExpiryDetailsByTruck?regNumber=' + $scope.regNumber + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        };
        $scope.downloadPaybleDetailsByParty = function () {
            window.open('/v1/expense/downloadPaybleDetailsByParty?partyId=' + $scope.partyId + '&page=' + $scope.filters.page + '&sort=' + JSON.stringify($scope.filters.sort) + '&size=' + $scope.filters.size);
        }
    }]);


app.factory('DriverService',['$http', function ($http) {
    return {
        addDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers',
                method: "POST",
                data: driverInfo
            }).then(success, error)
        },
        getAllDrivers: function (success, error) {
            $http({
                url: '/v1/drivers/account/drivers',
                method: "GET"
            }).then(success, error)
        },
        getDrivers: function (pageable, success, error) {
            $http({
                url: '/v1/drivers/account/drivers',
                method: "GET",
                params:pageable
            }).then(success, error)
        },
        getDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/get/' + driverId,
                method: "GET"
            }).then(success, error)
        },
        updateDriver: function (driverInfo, success, error) {
            $http({
                url: '/v1/drivers/',
                method: "PUT",
                data: driverInfo
            }).then(success, error)
        },
        deleteDriver: function (driverId, success, error) {
            $http({
                url: '/v1/drivers/' + driverId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/drivers/total/count',
                method: "GET"
            }).then(success, error)
        },getAllDriversForFilter: function (success, error) {
            $http({
                url: '/v1/drivers/getAllDriversForFilter',
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('DriversListCtrl', ['$scope', '$state', 'DriverService', 'Notification','paginationService','NgTableParams',
    function ($scope, $state, DriverService, Notification, paginationService, NgTableParams) {

        $scope.goToEditDriverPage = function (driverId) {
            $state.go('driversEdit', {driverId: driverId});
        };

        $scope.count = 0;
        $scope.getCount = function () {
            DriverService.count(function (success) {
                if (success.data.status) {
                    $scope.count = success.data.count;
                    $scope.init();
                } else {
                    Notification.error({message: success.data.message});
                }
            });
        };
        $scope.getCount();

        var loadTableData = function (tableParams) {

            var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),driverName:tableParams.driverName};
            $scope.loading = true;
            // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
            DriverService.getDrivers(pageable, function (response) {
                $scope.invalidCount = 0;
                if (angular.isArray(response.data.drivers)) {
                    $scope.loading = false;
                    $scope.drivers = response.data.drivers;
                    $scope.userId=response.data.userId;
                    $scope.userType=response.data.userType;
                    tableParams.total(response.totalElements);
                    tableParams.data = $scope.drivers;
                    $scope.currentPageOfDrivers = $scope.drivers;
                   // console.log('<<>>===', $scope.drivers);
                }
            });
        };
    $scope.getAllDrivers=function(){
        DriverService.getAllDriversForFilter(function (success) {
            if (success.data.status) {
                $scope.driversList = success.data.drivers;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }
    $scope.init = function () {
        $scope.driverParams = new NgTableParams({
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
                $scope.getAllDrivers();
            }
        });
    };

    $scope.deleteDriver = function (driverId) {
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
                DriverService.deleteDriver(driverId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Driver deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Error!',
                                message,
                                'error'
                            );
                        });
                    }
                });
            };
        });
    }

    $scope.searchByDriverName=function(driverName){
        $scope.driverParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.driverName=driverName;
                loadTableData(params);
            }
        });
    }

    // $scope.getDrivers();
}]);

app.controller('AddEditDriverCtrl', ['$scope', '$state', 'TrucksService', 'DriverService', 'Notification', 'Utils', '$stateParams', function ($scope, $state, TrucksService, DriverService, Notification, Utils, $stateParams) {
    $scope.pagetitle = "Add Driver";

    $scope.trucks = [];
    $scope.driver = {
        fullName: '',
        truckId: '',
        accountId: '',
        mobile: '',
        joiningDate: '',
        licenseValidity: new Date(),
        salary: '',
        licenseNumber: '',
        errors: [],
        isActive: true
    };

    $scope.pageTitle = "Add Driver";
    if ($stateParams.driverId) {
        $scope.pageTitle = "Update Driver";
        DriverService.getDriver($stateParams.driverId, function (success) {
            if (success.data.status) {
                $scope.driver = success.data.driver;
                $scope.driver.licenseValidity = new Date($scope.driver.licenseValidity);
                getTruckIds();
                //console.log('driver',$scope.driver);

            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message)
                });
            }
        }, function (err) {
        })
    } else{
        getTruckIds();
    }

    function getTruckIds() {
     // TrucksService.getAllAccountTrucks(1, function (success) {
        TrucksService.getAllTrucks(1, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find( $scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.driver.truckId;
                });
                if(selectedTruck){
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(success.data.message);
                });
            }
        }, function (error) {
            Notification.error(error);
        });
    }



    $scope.cancel = function () {
        $state.go('drivers');
    };
    $scope.selectTruckId = function (truck) {
        $scope.driver.truckId = truck._id;
    }
    $scope.addOrSaveDriver = function () {
        var params = $scope.driver;
        console.log("params",params);
        params.errors = [];

        if (!params.fullName) {
            params.errors.push('Please provide driver\'s full name')
        }
/*
        if (!Utils.isValidPhoneNumber(params.mobile)) {
            params.errors.push('Please provide valid mobile number');
        }

        if (!params.licenseValidity) {
            params.errors.push('Please provide license validity date');
        }

        if (!params.salary) {
            params.errors.push('Please provide  salary');
        }

        if (!params.licenseNumber) {
            params.errors.push('Please provide  licenseNumber');
        }
*/
        if (!params.errors.length) {
            if (params._id) {
                DriverService.updateDriver(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: "Driver Updated Successfully"});
                        $state.go('drivers');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message)
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            } else {
                DriverService.addDriver(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: "Driver Added Successfully"});
                        $state.go('drivers');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error(message)
                        });
                    }
                }, function (error) {

                });
            }
        }
    }
}]);
app.factory('ExpenseMasterServices',['$http', function ($http) {
    return {
        addExpense: function (expenseData, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "POST",
                data: expenseData
            }).then(success, error)
        },
        getExpenses: function (pageable, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        deleteExpense: function (expenseId, success, error) {
            $http({
                url: '/v1/expenseMaster/' + expenseId,
                method: "DELETE"
            }).then(success, error)
        },
        getExpense: function (expenseId, success, error) {
            $http({
                url: '/v1/expenseMaster/getExpense/' + expenseId,
                method: "GET"
            }).then(success, error)
        },
        updateExpense: function (expenseData, success, error) {
            $http({
                url: '/v1/expenseMaster',
                method: "PUT",
                data: expenseData
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/expenseMaster/count',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('ExpenseMasterCrtl', ['$scope', '$state', 'ExpenseMasterServices', 'NgTableParams', 'Notification', function ($scope, $state, ExpenseMasterServices, NgTableParams, Notification) {
    $scope.goToEditExpenseTypePage = function (expenseTypeId) {
        $state.go('expenseMasterEdit', {expenseTypeId: expenseTypeId});
    };

    $scope.count = 0;
    ExpenseMasterServices.count(function (success) {
        if (success.data.status) {
            $scope.count = success.data.count;
            $scope.init();
        } else {
            Notification.error({message: success.data.messages[0]});
        }
    });

    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(), size:tableParams.count(), sort:tableParams.sorting()};
        $scope.loading = true;

        ExpenseMasterServices.getExpenses(pageable, function(response){
            $scope.invalidCount = 0;
            if(angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.expenses = response.data.expenses;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.expenses;
                $scope.currentPageOfexpenses =  $scope.expenses;
            }
        });
    };

    $scope.init = function() {
        $scope.expenseMasterParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            count: 10,
            sorting: {
                createdAt: -1
            },
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

    $scope.deleteExpense = function (expenseId) {
        ExpenseMasterServices.deleteExpense(expenseId, function (success) {
            if(success.data.status) {
                $scope.count--;
                $scope.init();
                Notification.error({message: "Successfully Deleted"});
            } else {
                Notification.error({message: success.data.message});
            }
        });
    }
}]);

app.controller('ExpenseMasterEditCrtl', ['$scope', '$state', 'ExpenseMasterServices', 'Notification', '$stateParams', function ($scope, $state, ExpenseMasterServices, Notification, $stateParams) {

    $scope.pagetitle = "Add Expense Type";

    $scope.cancel = function () {
        $state.go('expenseMaster');
    };

    $scope.expenseType = {
        expenseName: '',
        error:[],
        success: []
    };

    if ($stateParams.expenseTypeId) {
        $scope.pagetitle = "Edit Expense Type";
        ExpenseMasterServices.getExpense($stateParams.expenseTypeId, function (success) {

            if (success.data.status) {
                $scope.expenseType = success.data.expenseType;
            } else {
                Notification.error(success.data.messages[0])
            }
        }, function (err) {
        })
    }

    $scope.cancel = function () {
        $state.go('expense-master');
    }

    $scope.addOrUpdateExpenseType = function () {
        var params = $scope.expenseType;
        params.success = [];
        params.error = [];

        if(!params.expenseName) {
            params.error.push('Invalid Expense Type Name');
        }
        if(!params.error.length) {
            if (params._id) {
                ExpenseMasterServices.updateExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('expense-master');
                        Notification.success({message: success.data.messages[0]});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            } else {
                ExpenseMasterServices.addExpense(params, function (success) {
                    if(success.data.status) {
                        params.success = success.data.message;
                        $state.go('expense-master');
                        Notification.success({message: success.data.messages[0]});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {
                });
            }
        }
    };
}]);
app.factory('ExpenseService',['$http', function ($http) {
    return {
        addExpense: function (object, success, error) {
            $http({
                url: '/v1/expense/addExpense',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getExpenseRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/expense/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/expense/getAll',
                method: "GET"
            }).then(success, error)
        },
        getExpenseRecord: function (expenseId, success, error) {
            $http({
                url: '/v1/expense/getExpense/' + expenseId,
                method: "GET"
            }).then(success, error)
        },
        getExpenses: function (pageable, success, error) {
            $http({
                url: '/v1/expense/getAllExpenses',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        updateRecord: function (object, success, error) {
            $http({
                url: '/v1/expense/updateExpense',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deleteRecord: function (expenseId, success, error) {
            $http({
                url: '/v1/expense/' + expenseId,
                method: "DELETE"
            }).then(success, error)
        },
        findTotalExpenses: function (success, error) {
            $http({
                url: '/v1/expense/total',
                method: "GET"
            }).then(success, error)
        },
        findExpensesbyGroupVehicle: function (params, success, error) {
            $http({
                url: '/v1/expense/groupByVehicle',
                method: "GET",
                params: params
            }).then(success, error)
        },
        findExpensesbyVehicleId: function (vehicleId, success, error) {
            $http({
                url: '/v1/expense/vehicleExpense/' + vehicleId,
                method: "GET"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/expense/total/count',
                method: "GET"
            }).then(success, error)
        },
        shareExpensesDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/expense/shareExpensesDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        },
        sharePayableDetailsViaEmail: function (params, success, error) {
            $http({
                url: '/v1/expense/sharePayableDetailsViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPaybleAmountByParty:function(params,success,error){
            $http({
                url: '/v1/expense/getPaybleAmountByParty',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPaybleAmountByPartyId:function(params,success,error){
            $http({
                url: '/v1/expense/getPaybleAmountByPartyId',
                method: "GET",
                params: {
                    partyId:params
                }
            }).then(success, error);
        }
    }
}]);


app.controller('ExpenseCtrl', ['$scope', '$state', 'ExpenseService', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, ExpenseService, Notification, NgTableParams, paginationService,TrucksService) {
     $scope.goToEditExpensePage = function (expenseId) {
        $state.go('expensesEdit', {expenseId: expenseId});
    };

    $scope.count = 0;
    $scope.getCount = function () {
        ExpenseService.count(function (success) {

            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();


    var loadTableData = function (tableParams) {

        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),truckNumber:tableParams.truckNumber};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        ExpenseService.getExpenses(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.expenses)) {
                $scope.loading = false;
                $scope.maintanenceCosts = response.data.expenses;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.maintanenceCosts;
                $scope.currentPageOfMaintanence = $scope.maintanenceCosts;
            }

        });
    };
    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }
    $scope.init = function () {
        $scope.expenseParams = new NgTableParams({
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
                $scope.getAllTrucks();
            }
        });
    };

    $scope.deleteExpenseRecord = function (id) {
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
                ExpenseService.deleteRecord(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Expenses deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                })
            }
        })
    };

    $scope.searchByVechicleNumber=function(truckNumber){
        $scope.expenseParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.truckNumber=truckNumber;
                loadTableData(params);
            }
        });
    }
}]);

app.controller('expenseEditController', ['$scope', 'ExpenseService','PartyService', '$stateParams', '$state', 'DriverService', 'Notification', 'TrucksService', 'ExpenseMasterServices', function ($scope, ExpenseService,PartyService, $stateParams, $state, DriverService, Notification, TrucksService, ExpenseMasterServices) {
    $scope.pagetitle = "Add Expenses";
    $scope.dateCallback = "past";

    $scope.trucks = [];
    $scope.expenses = [];
    $scope.parties = [];

    $scope.expenseDetails = {
        vehicleNumber: '',
        expenseType: '',
        description: '',
        partyId: undefined,
        totalAmount:0,
        paidAmount:0,
        cost:0,
        date: '',
        mode:'',
        expenseName: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('expenses');
    };

    $scope.addExpenseTypeField = false;
    $scope.addExpenseType = function () {
        $scope.addExpenseTypeField = true;
    }


    function getPartiesbySupplier () {
        PartyService.getAllPartiesBySupplier (function (success) {
            if(success.data.status){
                $scope.partyBySupplier = success.data.parties;
                var selectedParty = _.find($scope.partyBySupplier, function (party) {
                    return party._id.toString() === $scope.expenseDetails.partyId;
                });
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                }
            }else {
                Notification.error(success.data.message);
            }
        })
    }


    $scope.selectPartyId = function (party) {
        $scope.expenseDetails.partyId = party._id;

    }

    function getAllExpenses(params) {
        ExpenseMasterServices.getExpenses(params, function (success) {
            if (success.data.status) {
                $scope.expenses = success.data.expenses;
                var selectedExpesneType = _.find($scope.expenses, function (expenses) {
                    return expenses._id.toString() === $scope.expenseDetails.expenseType;
                });
                if (selectedExpesneType) {
                    $scope.expenseTitle = selectedExpesneType.expenseName;
                }
            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectExpenseType = function (expenses) {
        $scope.expenseDetails.expenseType = expenses._id;
    };

    function getTruckIds() {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.expenseDetails.vehicleNumber;
                });
                if (selectedTruck) {
                    $scope.truckRegNo = selectedTruck.registrationNo;
                    console.log('success', $scope.truckRegNo)

                }

            } else {
                Notification.error(success.data.message);
            }
        }, function (error) {

        });
    }

    $scope.selectTruckId = function (truck) {
        $scope.expenseDetails.vehicleNumber = truck._id;
    };


    if ($stateParams.expenseId) {
        $scope.pagetitle = "Edit expenses";
        ExpenseService.getExpenseRecord($stateParams.expenseId, function (success) {
            if (success.data.status) {
                $scope.expenseDetails = success.data.expense;
                $scope.expenseDetails.date = new Date($scope.expenseDetails.date);
                getAllExpenses();
                getTruckIds();
                getPartiesbySupplier();
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    } else {
        getAllExpenses();
        getTruckIds();
        getPartiesbySupplier();
    }

    $scope.AddorUpdateExpense = function () {
        var params = $scope.expenseDetails;
        params.error = [];
        params.success = [];

        if (!params.vehicleNumber) {
            params.error.push('Invalid vehicle Number');
        }
        if (!params.expenseType) {
            params.error.push('Invalid expenseType');
        }
        if (params.expenseType === 'others' && !params.expenseName) {
            params.error.push('Enter other expenseType');
        }
        if (!params.date) {
            params.error.push('Invalid date');
        }
        if (!params.mode) {
            params.error.push('Please Select Cash or Credit');
        }
        if (!_.isNumber(params.cost)&& params.mode === 'Cash') {
            params.error.push('Invalid Total Expense Amount');
        }
        if (!params.partyId && params.mode === 'Credit') {
            params.error.push('Please Select party');
        }
        if (!params.totalAmount && params.mode === 'Credit') {
            params.error.push('Please Enter Total Expense Amount');
        }
        if (!_.isNumber(params.paidAmount) && params.mode === 'Credit') {
            params.error.push('Invalid Paid Amount');
        }
        if(params.mode === 'Credit') {
            if (params.paidAmount > params.totalAmount) {
                params.error.push('Paid Amount Should be less than total Amount');
            }
        }
        if (!params.error.length) {
            if ($stateParams.expenseId) {
                ExpenseService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        Notification.success({message: success.data.message});
                        $state.go('expenses');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }

                }, function (err) {
                });
            } else {
                ExpenseService.addExpense(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        success.data.messages.forEach(function (message) {
                            Notification.success({ message: message });
                        });
                        $state.go('expenses');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                });
            }
        }
    }
}]);
app.factory('GpsService',['$http', function ($http) {
    return {
        addDevice: function (object, success, error) {
            $http({
                url: '/v1/gps/addDevice',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getDevices:function (success,error) {
            $http({
                url: '/v1/gps/getDevices',
                method: "GET",
            }).then(success, error)
        },
        gpsTrackingByMapView:function (success,error) {
            $http({
                url: '/v1/gps/gpsTrackingByMapView',
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('GpsCtrl', ['$scope', '$state', 'GpsService', 'Notification', 'NgTableParams', 'paginationService','TrucksService', function ($scope, $state, GpsService, Notification, NgTableParams, paginationService,TrucksService) {

    $scope.getDevices=function () {
        GpsService.getDevices(function (success) {
            if(success.data.status){
                $scope.devicesList=success.data.devices;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        },function (error) {

        })
    };

    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    };
    function initializeDevice() {
        $scope.device={
            deviceId:"",
            truckId:"",
            errors:[],
            success:[]
        }
    }
    initializeDevice();
    $scope.addDevice=function () {
        console.log('devices');
        var params=$scope.device;
        params.errors = [];
        if(!params.deviceId){
            params.errors.push('Please provide device id');
        }
        if(!params.truckId){
            params.errors.push('select truck number');
        }
        if(!params.simNumber){
            params.errors.push('select truck number');
        }
        if(!params.imei){
            params.errors.push('select truck number');
        }

        if (!params.errors.length) {
            GpsService.addDevice($scope.device,function (success) {
                if (success.data.status) {
                    success.data.messages.forEach(function (message) {
                        Notification.success({message: message});
                    });
                    $scope.getDevices();
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error({message: message});
                    });
                }
            }, function (error) {

            })
        }
    }

    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            console.log('response',success);
        },function (error) {

        })
    }

}]);
app.factory('groupMapService',['$http','$cookies', function ($http, $cookies) {
    return {
        getGroupMap: function (success, error) {
            $http({
                url: '/v1/events/get/groupMap',
                method: "GET",
                data: success
            }).then(success, error)
        },
        getParties: function (success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('GroupMapController', ['$scope', '$state','groupMapService','GpsService', function ($scope, $state,groupMapService,GpsService) {

    var locations = [];
    var regNos=[];
    var truckTypes=[];
    $scope.gpsTrackingByMapView=function () {
        GpsService.gpsTrackingByMapView(function (success) {
            if (success.data.status) {
                locations = success.data.data;
                regNos=success.data.regNos;
                truckTypes=success.data.truckTypes;
                $scope.loadData();

            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        });
    };

    $scope.loadData = function (){
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: new google.maps.LatLng(18.2699, 78.0489),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var infowindow = new google.maps.InfoWindow();
        var marker;
        for (var i = 0; i< locations.length; i++) {
            marker = new google.maps.Marker({
                // new google.maps.LatLng($scope.addBranchParams.loc.coordinates[1], $scope.addBranchParams.loc.coordinates[0/]);
                position: new google.maps.LatLng(locations[i].location.coordinates[1], locations[i].location.coordinates[0]),
                icon: "/images/Track_Vehicle_Red.png",
                /*label: {
                    text: locations[i].name,
                    color: "black"
                },*/
                map: map
            });
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(regNos[i]+"<br>"+truckTypes[i]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
        }
    };
    $scope.gpsTrackingByMapView();
    // setTimeout(function () {$scope.loadData();}, 40);

}]);
app.factory('GroupServices',['$http', function ($http) {
    return {
        addGroup: function (userData, success, error) {
            $http({
                url: '/v1/group/addGroup',
                method: "POST",
                data: userData
            }).then(success, error)
        },
        getGroups: function (pageable, success, error) {
            $http({
                url: '/v1/group/getGroups/',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getGroup: function (id, success, error) {
            $http({
                url: '/v1/group/getGroup/' + id,
                method: "GET"
            }).then(success, error)
        },
        updateGroup: function (groupData, success, error) {
            $http({
                url: '/v1/group/updateGroup',
                method: "PUT",
                data: groupData
            }).then(success, error)
        },
        forgotPassword: function (data, success, error) {
            $http({
                url: '/v1/group/forgot-password',
                method: "POST",
                data: data
            }).then(success, error)
        },
        verifyOtp: function (data, success, error) {
            $http({
                url: '/v1/group/verify-otp',
                method: "POST",
                data: data
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/group/total/count',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('GroupCtrl', ['$scope', '$state', 'GroupServices', 'Notification', 'paginationService', 'NgTableParams', function ($scope, $state, GroupServices, Notification, paginationService, NgTableParams) {
    $scope.goToEditGroupPage = function (groupId) {
        $state.go('groupsEdit', {groupId: groupId});
    };
    $scope.count = 0;
    $scope.getCount = function () {
        GroupServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        GroupServices.getGroups(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.groups)) {
                $scope.loading = false;
                $scope.groups = response.data.groups;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.groups;
                $scope.currentPageOfGroups = $scope.groups;
            }
        });
    };

    $scope.init = function () {
        $scope.groupParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }
        });
    };

}]);

app.controller('groupEditController', ['$scope', 'GroupServices', 'AccountServices', 'TrucksService', 'Notification', '$stateParams', 'Utils', '$state', '$cookies', function ($scope, GroupServices, AccountServices, TrucksService, Notification, $stateParams, Utils, $state, $cookies) {
    $scope.pagetitle = "Add Group";
    $scope.trucks = [];
    $scope.checkedTrucks = [];
    $scope.uncheckedTruckList = [];
    $scope.groupDetails = {
        name: '',
        userName: '',
        password: '',
        status: true,
        isActive: true,
        errors: []
    };

    $scope.getGroupDetails = function () {
        if ($stateParams.groupId) {
            $scope.pagetitle = "Update Group";
            GroupServices.getGroup($stateParams.groupId, function (success) {
                if (success.data.status) {
                    $scope.groupDetails = success.data.group;
                    $scope.groupId = $scope.groupDetails._id;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (err) {
                Notification.error(err);
            })
        }
        else {
            $scope.goToGroupsPage = function () {
                $state.go('groups');
            };
        }
        getFullGroupTruckDetails();
        TrucksService.getUnAssignedTrucks({groupId: $scope.groupId}, function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            }
        });

    };
    $scope.goToGroupsPage = function () {
        $state.go('groups');
    };


    /*function getTruckIds() {
        TrucksService.getUnAssignedTrucks(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(success.data.message);
                });
            }
        }, function (error) {

        });
    }

    getTruckIds();*/
    var params = [];
    $scope.checkboxModel = [];


    $scope.AddorUpdateGroup = function () {

        params = $scope.groupDetails;
        $scope.checkboxModel.forEach(function (assignedTruck) {
            console.log('assignedTruck',assignedTruck);
            if (assignedTruck) {
                $scope.checkedTrucks.push(assignedTruck);
            }
        });

        console.log($scope.checkedTrucks);
        params.errors = [];

        if (params._id) {
            delete params.password;
        }

        if (!params.name) {
            params.errors.push('Invalid group name');
        }

        if (!params.userName) {
            params.errors.push('Invalid user name');
        }

        if (!params._id && !Utils.isValidPassword(params.password)) {
            params.errors.push('Password must have  minimum 7 characters');
        }

        if (!params.errors.length) {
            if (params._id) {
                unassignTruck();
                TrucksService.unAssignTrucks($scope.uncheckedTruckList, function (success) {
                    if (success.data.status) {
                    } else {
                    }
                }, function (error) {

                });
                TrucksService.assignTrucks({
                    groupId: $scope.groupDetails._id,
                    trucks: $scope.checkedTrucks
                }, function (success) {
                    if (success.data.status) {
                    } else {
                    }
                }, function (error) {

                });

                GroupServices.updateGroup(params, function (success) {
                    if (success.data.status) {
                        $state.go('groups');
                        Notification.success({message: "Group Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });

            } else {
                GroupServices.addGroup(params, function (success) {
                    console.log(success);
                    if (success.data.status) {
                        TrucksService.assignTrucks({
                            groupId: $scope.groupId,
                            trucks: $scope.checkedTrucks
                        }, function (success) {
                            if (success.data.status) {
                                getFullGroupTruckDetails();
                            } else {
                            }
                        }, function (error) {

                        });
                        $state.go('groups');
                        Notification.success({message: "Group Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                    Notification.error(err)
                });
            }
        }

    };

    $scope.pageNumber = 0;

    function getFullGroupTruckDetails() {
        TrucksService.getAccountTrucks($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.allTrucks = success.data.trucks;
                $scope.allTrucks.forEach(function (truck) {
                    if ((truck.groupId === $scope.groupId)) {
                        $scope.trucksList.push(truck);
                    }
                });
                $scope.trucksList.forEach(function (truck, key) {
                    if (truck.groupId) {
                        $scope.checkboxModel[key] = truck._id;
                    }
                });
            }
        });
    }

    function unassignTruck() {
        $scope.trucksList.forEach(function (truck, key) {
            if (truck.groupId) {
                if (!$scope.checkboxModel[key]) {
                    $scope.uncheckedTruckList.push(truck._id);
                }
            }
        });
    }

}]);
app.controller('LoginCtrl', ['$scope', 'Utils', 'CommonServices', '$state', '$cookies', '$rootScope', 'GroupServices', function ($scope, Utils, CommonServices, $state, $cookies, $rootScope, GroupServices) {
    if (Utils.isLoggedIn()) {
        $state.go('reports');
    }

    $scope.loginParams = {
        userName: $cookies.get('rememberUserName'),
        password: $cookies.get('rememberPassword'),
        contactPhone: $cookies.get('rememberContactPhone'),
        errors: []
    };

    $scope.login = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.userName) {
            params.errors.push('Invalid User Name');
        }

        if (!params.password) {

            params.errors.push('Invalid Password');
        }

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if (!params.errors.length) {
            $scope.rememberMe();
            CommonServices.login($scope.loginParams, function (success) {
                if (success.data.status) {
                    $cookies.put('token', success.data.token);
                    $cookies.put('type', success.data.type);
                    $cookies.put('userName', success.data.userName);
                    $cookies.put('editAccounts', success.data.editAccounts);
                    $cookies.put('profilePic', success.data.profilePic);
                    $rootScope.loggedTrue();
                    $state.go('reports');
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    };

    $scope.otpField = false;
    $scope.forgotPassword = function () {
        var params = $scope.loginParams;
        params.errors = [];

        if (!params.contactPhone) {
            params.errors.push('Invalid Contact Number');
        }
        if (!params.errors.length) {
            GroupServices.forgotPassword($scope.loginParams, function (success) {
                if (success.data.status) {
                    params.success = success.data.messages;
                    $scope.otpField = true;
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    }

    $scope.otpParams = {
        contactPhone: '',
        otp: '',
        errors: []
    };
    $scope.otpValidate = function () {
        var params = $scope.otpParams;
        $scope.otpParams.contactPhone = $scope.loginParams.contactPhone;
        params.errors = [];

        if (!params.errors.length) {
            console.log("Cphone", $scope.otpParams);
            GroupServices.verifyOtp($scope.otpParams, function (success) {
                if (success.data.status) {
                    params.success = success.data.messages;
                    // $state.go("login");
                } else {
                    params.errors = success.data.messages;
                }
            }, function (error) {
            });
        }
    }

    $scope.rememberMe=function () {
        if($scope.remember){
            $cookies.put('rememberUserName',$scope.loginParams.userName);
            $cookies.put('rememberPassword', $scope.loginParams.password);
            $cookies.put('rememberContactPhone', $scope.loginParams.contactPhone);
        }
    }
}]);

app.controller('NavCtrl', ['$scope', '$state', 'Utils', 'AccountServices', '$cookies', '$rootScope', function ($scope, $state, Utils, AccountServices, $cookies, $rootScope) {
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $scope.displayName = "";
        $rootScope.loggedTrue();
        $state.go('login');
    };
    $scope.isLoggedIn = function () {
        return $cookies.get('token') != undefined;
    }
    $scope.loggedInName=function(){
        $scope.displayName=$cookies.get('userName');

    }
    $scope.loggedInName();

    $scope.isLoggedInn = '';

    $rootScope.loggedTrue = function () {
        if ($cookies.get('token')) {
            $scope.isLoggedInn = true;            
        }
        else {
            $scope.isLoggedInn = false;
            $state.go('login');
        }
    };
    $rootScope.loggedTrue();
    
    $scope.isLoggedin=$cookies.get('token');

    $scope.loginParams = {
        userName: '',
        password: '',
        contactPhone: '',
        email: '',
        errors: []
    };


}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', '$stateParams', function ($scope, $rootScope, $state, Utils, $cookies, $stateParams) {

    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };

}]);
app.factory('PartyService',['$http', '$cookies', function ($http, $cookies) {
    return {
        addParty: function (partyDetails, success, error) {
            $http({
                url: '/v1/party/addParty',
                method: "POST",
                data: partyDetails
            }).then(success, error)
        },
        getParties: function (pageable, success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getAccountParties: function (success, error) {
            $http({
                url: '/v1/party/get/accountParties',
                method: "GET"
            }).then(success, error)
        },
        getAllPartiesByTransporter: function (success, error) {
            $http({
                url: '/v1/party/getAllPartiesByTransporter',
                method: "GET"
            }).then(success, error)
        },
        getAllPartiesBySupplier: function (success, error) {
            $http({
                url: '/v1/party/getAllPartiesBySupplier',
                method: "GET"
            }).then(success, error)
        },
        getParty: function (partyId, success, error) {
            $http({
                url: '/v1/party/' + partyId,
                method: "GET"
            }).then(success, error)
        },
        updateParty: function (partyDetails, success, error) {
            $http({
                url: '/v1/party/updateParty',
                method: "PUT",
                data: partyDetails
            }).then(success, error)
        },
        deleteParty: function (partyId, success, error) {
            $http({
                url: '/v1/party/' + partyId,
                method: "DELETE"
            }).then(success, error)
        },
        getRevenueByPartyId: function (vehicleId, success, error) {
            $http({
                url: '/v1/party/vehiclePayments/' + vehicleId,
                method: "GET"
            }).then(success, error)
        },
        amountByPartyid: function (partyId, success, error) {
            $http({
                url: '/v1/party/tripsPayments/' + partyId,
                method: "GET"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/party/total/count',
                method: "GET"
            }).then(success, error)
        },getAllPartiesForFilter: function (success, error) {
            $http({
                url: '/v1/party/getAllPartiesForFilter',
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('PartyListController', ['$scope', '$uibModal', 'PartyService', 'Notification', '$state', 'paginationService', 'NgTableParams', function ($scope, $uibModal, PartyService, Notification, $state, paginationService, NgTableParams) {

    $scope.goToEditPartyPage = function (partyId) {
        $state.go('editParty', { partyId: partyId });
    };

    $scope.count = 0;
    $scope.getCount = function () {
        PartyService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({ message: success.data.message });
            }
        });
    };


    var loadTableData = function (tableParams) {
        var pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(), partyName: tableParams.partyName };
        $scope.loading = true;
        PartyService.getParties(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.parties)) {
                $scope.loading = false;
                $scope.parties = response.data.parties;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.parties;
                $scope.currentPageOfParties = $scope.parties;
            }
        });
    };
    $scope.getAllParties = function () {
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    };
    $scope.init = function () {
        $scope.partyParams = new NgTableParams({
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
                    $scope.getAllParties();
                }
            });
    };
    $scope.getCount();

    $scope.deleteParty = function (partyId) {
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
                PartyService.deleteParty(partyId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Party deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                }, function (err) {

                });
            }
        });
       
    };
    $scope.searchByPartyName = function (partyName) {
        $scope.partyParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
                counts: [],
                total: $scope.count,
                getData: function (params) {
                    params.partyName = partyName;
                    loadTableData(params);
                }
            });
    }
    
}]);

app.controller('AddEditPartyCtrl', ['$scope', 'Utils', 'PartyService', '$rootScope', '$stateParams', 'Notification', '$state', function ($scope, Utils, PartyService, $rootScope, $stateParams, Notification, $state) {

    $scope.showAddTripLane = false;

    $scope.addTripLane = function () {
        $scope.showAddTripLane = true;
    };

    $scope.pageTitle = "Add Party";

    if ($stateParams.partyId) {
        $scope.pageTitle = "Edit Party";
    }

    $scope.party = {
        name: '',
        contact: '',
        email: '',
        city: '',
        tripLanes: [{
            index: 0
        }],
        partyType: '',
        isEmail: false,
        isSms: false,
        error: [],
        success: []

    };

    if ($stateParams.partyId) {
        PartyService.getParty($stateParams.partyId, function (success) {
            if (success.data.status) {
                $scope.party = success.data.party;

            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        });
    };

    $scope.addTripLane = function () {
        $scope.party.error = [];
        var length = $scope.party.tripLanes.length;
        if (!$scope.party.tripLanes[length - 1].name || !$scope.party.tripLanes[length - 1].from || !$scope.party.tripLanes[length - 1].to) {
            $scope.party.error.push("Please Fill all TripLane Fields");
        }
        else {
            $scope.party.tripLanes.push({
                index: length
            });
        }
    };

    $scope.deleteTripLane = function (index) {
        if ($scope.party.tripLanes.length > 1) {
            $scope.party.tripLanes.splice(index, 1);
        } else {
            $scope.party.error.push("Please add at least one trip lane");
        }

    };

    $scope.addOrUpdateParty = function () {
        var params = $scope.party;
        params.success = [];
        params.error = [];

        if (!params.name) {
            params.error.push('Invalid party name');
        }
        if (!Utils.isValidPhoneNumber(params.contact)) {
            params.error.push('Invalid mobile number');
        }
        if (!Utils.isValidEmail(params.email)) {
            params.error.push('Invalid email ID');
        }
        if (!params.city) {
            params.error.push('Invalid city');
        }
        if (!params.partyType) {
            params.error.push('Please select party type');
        }
        if (params.partyType === 'Transporter') {
            if (!params.isSms && !params.isEmail) {
                params.error.push('Please select notification type');
            }
            for(var i = 0;i < params.tripLanes.length;i++) {
                if (!params.tripLanes[i].name) {
                    params.error.push('Please provide TripLane Name');
                }

                if (!params.tripLanes[i].from) {
                    params.error.push('Please provide From Name');
                }

                if (!params.tripLanes[i].to) {
                    params.error.push('Please provide To Name');
                }
            }
        }

        if (!params.error.length) {
            if (params._id) {
                PartyService.updateParty($scope.party, function (success) {
                    if (success.data.status) {
                        $state.go('parties');
                        Notification.success({ message: "Party Updated Successfully" });
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });

                    }
                }, function (err) {

                });
            } else {
                PartyService.addParty($scope.party, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('parties');
                        Notification.success({ message: "Party Added Successfully" });
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                }, function (err) {
                });
            }
        }
    };
    $scope.cancel = function () {
        $state.go('parties');
    }
}]);


app.factory('PaymentsService',['$http', function ($http) {
    return {
        addPayments: function (object, success, error) {
            $http({
                url: '/v1/payments/addPayments',
                method: "POST",
                data: object
            }).then(success, error)
        },
        getPaymentsRecords: function (pageNumber, success, error) {
            $http({
                url: '/v1/payments/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRecords: function (success, error) {
            $http({
                url: '/v1/payments/getAll',
                method: "GET"
            }).then(success, error)
        },
        getPaymentsRecord: function (paymentsId, success, error) {
            $http({
                url: '/v1/payments/getPaymentsRecord/' + paymentsId,
                method: "GET"
            }).then(success, error)
        },
        getPayments: function (pageable, success, error) {
            $http({
                url: '/v1/payments/getPayments/',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        getTotalPaymentsReceivable: function (success, error) {
            $http({
                url: '/v1/payments/getTotalAmount/',
                method: "GET"
            }).then(success, error)
        },
        getDuesByParty: function (params, success, error) {
            $http({
                url: '/v1/payments/getDuesByParty/',
                method: "GET",
                params: params
            }).then(success, error)
        },
        updateRecord: function (object, success, error) {
            $http({
                url: '/v1/payments/updatePayments',
                method: "PUT",
                data: object
            }).then(success, error)
        },
        deletePaymentsRecord: function (paymentsId, success, error) {
            $http({
                url: '/v1/payments/' + paymentsId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/payments/countPayments',
                method: "GET"
            }).then(success, error)
        },
        sharePaymentsDetailsByPartyViaEmail: function (params, success, error) {
            $http({
                url: '/v1/payments/sharePaymentsDetailsByPartyViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        }
    }
}]);

app.controller('PaymentsCtrl', ['$scope', '$state', 'PaymentsService', 'Notification', 'NgTableParams', 'paginationService', 'PartyService', function ($scope, $state, PaymentsService, Notification, NgTableParams, paginationService, PartyService) {
    $scope.goToEditPaymentsPage = function (paymentsId) {
        $state.go('paymentsEdit', { paymentsId: paymentsId });
    };
    $scope.count = 0;
    $scope.getCount = function () {
        PaymentsService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();

            } else {
                Notification.error({ message: success.data.message });
            }
        });
    };
    $scope.getCount();

    var pageable;

    var loadTableData = function (tableParams) {
        pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(), partyName: tableParams.partyName };
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        PaymentsService.getPayments(pageable, function (response) {
            $scope.invalidCount = 0;

            if (angular.isArray(response.data.paymentsCosts)) {
                $scope.loading = false;
                $scope.payments = response.data.paymentsCosts;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.payments;
                $scope.currentPageOfPayments = $scope.payments;
            }
        });
    };
    $scope.getAllParties = function () {
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (err) {

        });
    }

    $scope.init = function () {
        $scope.paymentParams = new NgTableParams({
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
                    $scope.getAllParties();
                }
            });
    };

    $scope.deletePaymentsRecord = function (id) {
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
                PaymentsService.deletePaymentsRecord(id, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Party deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Error!',
                                message,
                                'error'
                            );
                        });
                    }

                    ;
                });

            };
        });
    };

    $scope.searchByPartyName = function (partyName) {
        $scope.paymentParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
                counts: [],
                total: $scope.count,
                getData: function (params) {
                    params.partyName = partyName;
                    loadTableData(params);
                }
            });
    }



        
}]);

app.controller('paymentsEditController', ['$scope', 'PaymentsService', '$stateParams', '$state', 'Notification', 'TripServices', 'TrucksService', 'PartyService', function ($scope, PaymentsService, $stateParams, $state, Notification, TripServices, TrucksService, PartyService) {
    $scope.paymentRefNumber = false;

    $scope.refNum = function () {
        $scope.paymentRefNumber = true;
    };

    $scope.pagetitle = "Add Payments";
    $scope.dateCallback = "past";

    $scope.paymentsDetails = {
        date: '',
        partyId: '',
        description: '',
        amount: '',
        paymentType: '',
        paymentRefNo: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('payments');
    };
    

    function getPartyIds() {
        TripServices.getPartiesByTrips(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.partyList;
                 var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.paymentsDetails.partyId;
                });
                
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                }
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
               
            }
        }, function (error) {

        });
    }
    getPartyIds();

    $scope.selectPartyId = function (party) {
        $scope.paymentsDetails.partyId = party._id;
    }

    if ($stateParams.paymentsId) {
        $scope.pagetitle = "Edit Payments";
        PaymentsService.getPaymentsRecord($stateParams.paymentsId, function (success) {
            if (success.data.status) {
                $scope.paymentsDetails = success.data.paymentsDetails;
                //console.log(success.data);
                $scope.paymentsDetails.date = new Date($scope.paymentsDetails.date);
                $scope.paymentsDetails.amount = parseInt($scope.paymentsDetails.amount);
                getPartyIds();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (err) {
        })
    }
    $scope.cancel = function () {
        $state.go('payments');
    };
    $scope.AddorUpdatePayments = function () {
        var params = $scope.paymentsDetails;
        //console.log(params);
        params.error = [];
        params.success = [];

        if (!params.date) {
            params.error.push('InValid Date');
        }
        if (!params.partyId) {
            params.error.push('Invalid Party Id');
        }
        if (!(params.amount)) {
            params.error.push('Invalid Amount');
        }
        if (!params.paymentType) {
            params.error.push('Select payment type');
        }
        if ((params.paymentType === 'NEFT' || params.paymentType === 'Cheque') && !params.paymentRefNo) {
            params.error.push('Enter payment reference number');
        }
        if (!params.error.length) {
            if ($stateParams.paymentsId) {
                PaymentsService.updateRecord(params, function (success) {
                    if (success.data.status) {
                        // params.success = success.data.message[0];
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('payments');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                    $state.go('payments');

                }, function (err) {
                    console.log(err);
                });
            } else {
                PaymentsService.addPayments(params, function (success) {

                    if (success.data.status) {
                        params.success = success.data.message;
                        Notification.success({ message: success.data.messages[0] });
                        $state.go('payments');
                    } else {
                        success.data.messages.forEach(function (message) {
                            Notification.error({ message: message });
                        });
                    }
                });
            }
        }
    }
}]);
app.controller('PendingBalanceCtrl', ['$scope', '$state', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification','TrucksService','PaymentsService', function ($scope, $state, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService,PaymentsService) {

    $scope.frieghtAmountPartyIdDetails=[];
    $scope.PartyAmountPartyIdDetails=[];

    $scope.getPendingBalance=function(){
      TripServices.getFrieghtSum(function(success){
          if(success.data.status){
              $scope.totalFreightAmount=success.data.amounts[0].total;
          }else{

          }
      },function(error){

      });
        PaymentsService.getTotalAmount(function(success){
            if(success.data.status){
                $scope.totalAmount=success.data.amounts[0].total;
            }else{

            }
        },function(error){

        });
    };


    $scope.getPartyDetailsPendingBalance=function(){
        TripServices.partyTotalFrieghtAmount(function(success){
           if(success.data.status){
              $scope.partiesTotalFrieghtDetails=success.data.amounts;
              console.log($scope.partiesTotalFrieghtDetails);
           } else{

           }
        },function(error){

        });
        PaymentsService.partyTotalAmount(function(success){
            if(success.data.status){
               $scope.partiesTotalAmountDetails=success.data.amounts;
                console.log($scope.partiesTotalAmountDetails);
            }else{

            }
        },function(error){

        });


    };

}]);
app.factory('RoleServices',['$http', function ($http) {
    return {
        addRole: function (roleData, success, error) {
            $http({
                url: '/v1/roles/role/add',
                method: "POST",
                data: roleData
            }).then(success, error)
        },
        getRoles: function (pageNumber, success, error) {
            $http({
                url: '/v1/roles/getRoles/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllRoles: function (success, error) {
            $http({
                url: '/v1/roles/getAllRoles',
                method: "GET"
            }).then(success, error)
        },
        getRole: function (roleId, success, error) {
            $http({
                url: '/v1/roles/getRole/' + roleId,
                method: "GET"
            }).then(success, error)
        },
        updateRole: function (roleData, success, error) {
            $http({
                url: '/v1/roles/role/update',
                method: "POST",
                data: roleData
            }).then(success, error)
        },
        deleteRole: function (roleId, success, error) {
            $http({
                url: '/v1/roles/role/delete/' + roleId,
                method: "DELETE"
            }).then(success, error)
        }
    }
}]);

app.controller('RolesCtrl', ['$scope', '$state', 'RoleServices', 'Notification', function ($scope, $state, RoleServices, Notification) {
    $scope.goToEditRolePage = function (roleId) {
        $state.go('rolesEdit', {roleId: roleId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getRoles = function () {
        RoleServices.getRoles($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.roleGridOptions.data = success.data.roles;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
        });
    };
    $scope.getRoles();

    $scope.deleteRole = function (id) {
        RoleServices.deleteRole(id, function (success) {
            if (success.data.status) {
                $scope.getRoles();
                Notification.success({message: "Successfully deleted"});
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        });
    };

    $scope.roleGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'Role name',
            field: 'roleName'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a ng-click="grid.appScope.goToEditRolePage(row.entity._id)" class="glyphicon glyphicon-edit edit"></a>' +
            '<a ng-click="grid.appScope.deleteRole(row.entity._id)" class="glyphicon glyphicon-trash dele"></a>' +
            '</div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('rolesEditController', ['$scope', 'RoleServices', '$stateParams', '$state', 'Notification', function ($scope, RoleServices, $stateParams, $state, Notification) {
    $scope.pagetitle = "Add Role";
    $scope.rolesDetails = {
        roleName: '',
        errors: []
    };

    $scope.goToRolesPage = function () {
        $state.go('roles');
    };

    if ($stateParams.roleId) {
        $scope.pagetitle = "Update Role";
        RoleServices.getRole($stateParams.roleId, function (success) {
            if (success.data.status) {
                $scope.rolesDetails = success.data.role;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    $scope.AddorUpdateRole = function () {
        var params = $scope.rolesDetails;
        params.errors = [];

        if (!params.roleName) {
            params.errors.push('Invalid role name');
        }

        if(!params.errors.length){
            if ($stateParams.roleId) {
                RoleServices.updateRole(params, function (success) {
                    if (success.data.status) {
                        $state.go('roles');
                        Notification.success({message: "Role Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                RoleServices.addRole({roleName: params.roleName}, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('roles');
                        Notification.success({message: "Role Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            }
        }
    }
}]);
app.factory('TrackMapServices',['$http', function ($http) {
    return {
        getEventsData: function (vehicleNumber, success, error) {
            $http({
                url: '/v1/events/get/trackEvents/'+vehicleNumber,
                method: "GET",
            }).then(success, error)
        }
    }
}]);

app.controller('ShowTrackMapCtrl', ['$scope', '$uibModal','TrackMapServices','TrucksService','Notification', function ($scope, $uibModal,TrackMapServices,TrucksService, Notification) {

    $scope.eventData = null;
    $scope.showOnlyStops = false;
    $scope.totalSpeed = 0;
    // $scope.trucks = ["AP10V1335","AP11X7832","AP29TB5417","AP29TB5903","AP29U2342","AP29U2533","AP31TH1041","HR55N1311"];

    TrucksService.getAccountTrucks(1, function (success) {
        if (success.data.status) {
            $scope.trucks = success.data.trucks;
            var selectedTruck = _.find( $scope.trucks, function (truck) {
                return truck._id.toString() === $scope.registrationNo;
            });
            if(selectedTruck){
                $scope.truckRegNo = selectedTruck.registrationNo;
            }
        } else {
            success.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {

    });

    $scope.loadMap = function(){
        $scope.lat = $scope.eventData[$scope.eventData.length/2].latitude;
        $scope.long = $scope.eventData[$scope.eventData.length/2].longitude;
        var myOptions = {
            center: new google.maps.LatLng($scope.lat, $scope.long),
            zoom: 9,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),myOptions);

        if(!$scope.showOnlyStops){
            $scope.totalSpeed = 0;
            for(var i=0;i<$scope.eventData.length;i++){
                $scope.lat = $scope.eventData[i].latitude;
                $scope.long = $scope.eventData[i].longitude;
                var latlng=new google.maps.LatLng($scope.lat, $scope.long);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: "marker"+(i+1)+": "+$scope.eventData[i].speed
                });
                $scope.totalSpeed += $scope.eventData[i].speed;
            }
        }
        else {
            for(var i=0;i<$scope.eventData.length;i++){
                if($scope.eventData[i].speed == 0){
                    $scope.lat = $scope.eventData[i].latitude;
                    $scope.long = $scope.eventData[i].longitude;
                    var latlng=new google.maps.LatLng($scope.lat, $scope.long);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: "marker : "+(i+1)
                    });
                    }
                else{

                }
            }
        }
        $scope.averageSpeed = $scope.totalSpeed/$scope.eventData.length
    };

    $scope.getData = function (regNo) {
        TrackMapServices.getEventsData(regNo,function (success) {
            if (success.data.status) {
                $scope.eventData = success.data.results;
                if($scope.eventData.length == 0){
                    Notification.error("No data exists for :" + $scope.registrationNo);
                    var map = new google.maps.Map(document.getElementById("map"));

                }else{
                    $scope.loadMap();
                }
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {
            Notification.error(error);
        });
    };

    $scope.selectTruckId = function (truck) {
        $scope.registrationNo = truck.registrationNo;
        $scope.getData($scope.registrationNo);
    };
}]);

app.factory('TripLaneServices',['$http', function ($http) {
    return {
        addTripLane: function (tripLane, success, error) {
            $http({
                url: '/v1/tripLanes/',
                method: "POST",
                data: tripLane
            }).then(success, error)
        },
        getAllAccountTripLanes: function (success, error) {
            $http({
                url: '/v1/tripLanes/all/accountTrips',
                method: "GET"
            }).then(success, error)
        },
        getTripLanes: function (params, success, error) {
            $http({
                url: '/v1/tripLanes/getTripLanes',
                method: "GET",
                params: params
            }).then(success, error)
        },
        getTripLane: function (tripLaneId, success, error) {
            $http({
                url: '/v1/tripLanes/update/' + tripLaneId,
                method: "GET"
            }).then(success, error)
        },
        updateTripLane: function (tripLane, success, error) {
            $http({
                url: '/v1/tripLanes/',
                method: "PUT",
                data: tripLane
            }).then(success, error)
        },
        deleteTripLane: function (tripLaneId, success, error) {
            $http({
                url: '/v1/tripLanes/' + tripLaneId,
                method: "DELETE"
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/tripLanes/total/count',
                method: "GET"
            }).then(success, error)
        }
    }
}]);

app.controller('ShowTripLanesCtrl', ['$scope', '$uibModal', 'NgTableParams', 'TripLaneServices', 'paginationService', '$state', 'Notification', function ($scope, $uibModal, NgTableParams, TripLaneServices, paginationService, $state, Notification) {
    $scope.goToEditTripLanePage = function (tripLaneId) {
        $state.go('tripLanesEdit', {tripLaneId: tripLaneId});
    };
    $scope.count = 0;
    TripLaneServices.count(function (success) {
        if (success.data.status) {
            $scope.count = success.data.count;
            $scope.init();

        } else {
            Notification.error({message: success.data.message});
        }
    });
    var pageable;

    var loadTableData = function (tableParams) {
        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting()};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        TripLaneServices.getTripLanes(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.tripLanes)) {
                $scope.loading = false;
                $scope.trips = response.data.tripLanes;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trips;
                $scope.currentPageOfTrips = $scope.trips;

            }
        });
    };

    $scope.init = function () {
        $scope.tripLanesParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                name: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                loadTableData(params);
            }

        });
    };



    $scope.deleteTripLane = function (tripLaneId) {
        TripLaneServices.deleteTripLane(tripLaneId, function (success) {
            if (success) {
                $scope.init();
                Notification.error({message: "Trip Lane Deleted"});
            } else {
                console.log("Error in deleting")
            }
        })
    };
}]);

app.controller('AddEditTripLaneCtrl', ['$scope', '$state', 'Utils', 'TripLaneServices', '$stateParams', 'Notification', function ($scope, $state, Utils, TripLaneServices, $stateParams, Notification) {
    console.log('tl-->', $stateParams);
    $scope.pagetitle = "Add Trip Lane";

    $scope.drivers = [];
    $scope.parties = [];

    $scope.tripLane = {
        name: '',
        from: '',
        to: '',
        estimatedDistance: '',
        error: [],
        success: []
    };

    $scope.cancel = function () {
        $state.go('tripLanes');
    };

    if ($stateParams.tripLaneId) {
        $scope.pagetitle = "Edit Trip Lane";
        TripLaneServices.getTripLane($stateParams.tripLaneId, function (success) {
            console.log('acc===>', success.data);
            if (success.data.status) {
                $scope.tripLane = success.data.tripLane;
            } else {
                Notification.error(success.data.message)
            }
        }, function (err) {
        })
    }

    $scope.addOrUpdateTripLane = function () {
        var params = $scope.tripLane;
        params.success = [];
        params.error = [];
        console.log(params.error);
        if (!params.name) {
            params.error.push('Invalid Trip Lane Name');
        }
        if (!params.from) {
            params.error.push('Invalid From Location');
        }
        if (!params.to) {
            params.error.push('Invalid to Location');
        }
        if (!params.estimatedDistance) {
            params.error.push('Invalid Estimated Dist');
        }
        if (!params.error.length) {
            if (params._id) {
                TripLaneServices.updateTripLane(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('tripLanes');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
            else {
                TripLaneServices.addTripLane(params, function (success) {
                    if (success.data.status) {
                        params.success = success.data.message;
                        $state.go('tripLanes');
                        Notification.success({message: success.data.message});
                    } else {
                        params.error = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);


app.factory('TripServices',['$http', function ($http) {
    return {
        addTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/addTrip',
                method: "POST",
                data: trip
            }).then(success, error)
        },
        getAllTrips: function (success, error) {
            $http({
                url: '/v1/trips/getAllTrips/',
                method: "GET",
            }).then(success, error)
        },
        getTrip: function (tripId, success, error) {
            $http({
                url: '/v1/trips/' + tripId,
                method: "GET"
            }).then(success, error)
        },
        updateTrip: function (trip, success, error) {
            $http({
                url: '/v1/trips/',
                method: "PUT",
                data: trip
            }).then(success, error)
        },
        deleteTrip: function (tripId, success, error) {
            $http({
                url: '/v1/trips/' + tripId,
                method: "DELETE"
            }).then(success, error)
        },
        addPayment: function (paymentdetails, success, error) {
            $http({
                url: '/v1/payments',
                method: "PUT",
                data: paymentdetails
            }).then(success, error)
        },
        getAllAccountTrips: function (pageable, success, error) {
            $http({
                url: '/v1/trips/getAllAccountTrips',
                method: "GET",
                params: pageable
            }).then(success, error)
        },
        findTotalRevenue: function (success, error) {
            $http({
                url: '/v1/trips/find/totalRevenue',
                method: "GET"
            }).then(success, error)
        },
        findRevenueByVehicle: function (params, success, error) {
            $http({
                url: '/v1/trips/find/revenueByVehicle',
                method: "GET",
                params: params
            }).then(success, error)
        },
        count: function (success, error) {
            $http({
                url: '/v1/trips/total/count',
                method: "GET"
            }).then(success, error)
        },
        shareRevenueDetailsByVechicleViaEmail: function (params, success, error) {
            $http({
                url: '/v1/trips/shareRevenueDetailsByVechicleViaEmail',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getPartiesByTrips:function(success,error){
            $http({
                url: '/v1/trips/getPartiesByTrips',
                method: "GET"
            }).then(success, error);
        }


    }
}]);

app.controller('ShowTripsCtrl', ['$scope', '$uibModal', 'TripServices', '$state', 'Notification', 'paginationService', 'NgTableParams','TrucksService', function ($scope, $uibModal, TripServices, $state, Notification, paginationService, NgTableParams,TrucksService) {
    $scope.goToEditTripPage = function (tripId) {
        $state.go('tripsEdit', {tripId: tripId});
    };

    $scope.count = 0;
    $scope.getCount = function () {0
        TripServices.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {

        var pageable = {page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),truckNumber:tableParams.truckNumber};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};
        TripServices.getAllAccountTrips(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.trips)) {
                $scope.loading = false;
                $scope.trips = response.data.trips;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trips;
                $scope.currentPageOfTrips = $scope.trips;
            }
        });
    };
    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }
    $scope.init = function () {
        $scope.tripParams = new NgTableParams({
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
                $scope.getAllTrucks();
            }
        });
    };


    $scope.deleteTrip = function (tripId) {
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
                TripServices.deleteTrip(tripId, function (success) {
                        if (success.data.status) {
                            swal(
                                'Deleted!',
                                'Trip deleted successfully.',
                                'success'
                            );
                            $scope.getCount();
                        } else {
                            success.data.messages.forEach(function (message) {
                                swal(
                                    'Error!',
                                    message,
                                    'error'
                                );
                            });
                        }

                });
            };
        
    });
}
    $scope.searchByVechicleNumber=function(truckNumber){
        $scope.tripParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.truckNumber=truckNumber;
                loadTableData(params);
            }
        });
    }

}]);


app.controller('AddEditTripCtrl', ['$scope', '$state', 'Utils', 'TripServices', 'DriverService', 'PartyService', 'TripLaneServices', '$stateParams', 'Notification', 'TrucksService', function ($scope, $state, Utils, TripServices, DriverService, PartyService, TripLaneServices, $stateParams, Notification, TrucksService) {
    $scope.pagetitle = "Add Trip";

    $scope.drivers = [];
    $scope.parties = [];
    $scope.trucks = [];
    $scope.isFirstOpen = true;
    $scope.trip = {
        date: '',
        driverId: '',
        partyId: '',
        registrationNo: '',
        freightAmount: '',
        tripLane: '',  //new..//new...
        tonnage: '',    //new...
        rate: '',   //new...
        remarks: '',    //new
        error: [],
        success: [],
        share: false,
        vechicleNo: "",
        driverName: ""
    };

    $scope.cancel = function () {
        $state.go('trips');
    };


    function getParties() {
        PartyService.getAllPartiesByTransporter(function (success) {
            if (success.data.status) {
                $scope.parties = success.data.parties;
                var selectedParty = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.trip.partyId;
                });
                if (selectedParty) {
                    $scope.partyName = selectedParty.name;
                    $scope.tripLanes = selectedParty.tripLanes;
                }

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.selectBookedFor = function (booked) {
        $scope.trip.bookedFor = booked._id;
    }


    function getTruckIds() {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks;
                var selectedTruck = _.find($scope.trucks, function (truck) {
                    return truck._id.toString() === $scope.trip.registrationNo;
                });
                if (selectedTruck) {
                    $scope.truckRegNo = selectedTruck.registrationNo;
                }
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.selectTruckId = function (truck) {
        $scope.trip.registrationNo = truck._id;
        $scope.trip.vechicleNo = truck.registrationNo;
    }

    function getDriverIds() {
        DriverService.getAllDriversForFilter(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
                var selectedDriver = _.find($scope.drivers, function (driver) {
                    return driver._id.toString() === $scope.trip.driverId;
                });
                if (selectedDriver) {
                    $scope.driverName = selectedDriver.fullName;
                }
            } else {
                success.data.messages(function (message) {
                    Notification.error(message);
                });
            }
        }, function (error) {

        });
    }

    $scope.selectTruckDriver = function (driver) {
        $scope.trip.driverId = driver._id;
        $scope.trip.driverName = driver.fullName;
        $scope.trip.driverNumber = driver.mobile;
    }

    $scope.selectParty = function (party) {
        $scope.tripLanes = party.partyId.tripLanes;

    }


    $scope.getTrip = function () {
        TripServices.getTrip($stateParams.tripId, function (success) {
            if (success.data.status) {
                $scope.trip = success.data.trip;
                $scope.trip.date = new Date($scope.trip.date);
                getTruckIds();
                getParties();
                getDriverIds();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    };
    $scope.showHistory = false;

    if ($stateParams.tripId) {
        $scope.showHistory = true;
        $scope.pagetitle = "Edit Trip";
        $scope.getTrip();
    } else {
        getTruckIds();
        getParties();
        getDriverIds();
    }

    $scope.paymentFlag = false;
    $scope.addPaymentFlag = function () {
        $scope.paymentFlag = true;
    };
    $scope.removePaymentFlag = function () {
        $scope.paymentFlag = false;
    };

    $scope.paymentDetails = {
        tripId: '',
        paymentDate: '',
        amount: '',
        paymentType: '',
        errors: [],
        success: []
    };


    $scope.addOrUpdateTrip = function () {
        var params = $scope.trip;
        params.errors = [];
        if (!params.date) {
            params.errors.push('Please Provide Trip Date');
        }
        if (!params.registrationNo) {
            params.errors.push('Please Provide Registration Number');
        }
        if (!params.driverId) {
            params.errors.push('Please Select Driver');
        }

        if (!params.errors.length) {
            if (params._id) {
                params.date = Number(params.date);
                if(typeof  $scope.trip.tripLane ==="string") {
                    $scope.trip.tripLane = {name: $scope.trip.tripLane}
                }
                TripServices.updateTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success({message: 'Trip updated successfully'});
                        $state.go('trips');
                    } else {
                        params.errors.push(success.data.message);
                    }
                }, function (err) {

                });
            } else {
                TripServices.addTrip($scope.trip, function (success) {
                    if (success.data.status) {
                        Notification.success('Trip added successfully');
                        $state.go('trips');
                    } else {
                        params.errors = success.data.message;
                    }
                }, function (err) {

                });
            }
        }
    };
    $scope.$watch("trip.tonnage", function (newValue, oldValue) {
        $scope.calculateFreightAmount();
    });
    $scope.$watch("trip.rate", function (newValue, oldValue) {
        $scope.calculateFreightAmount();
    });
    $scope.calculateFreightAmount = function () {
        if ($scope.trip.tonnage > 0 && $scope.trip.rate > 0) {
            $scope.trip.freightAmount = $scope.trip.tonnage * $scope.trip.rate;
        }
        return $scope.trip.freightAmount;
    };
}]);


app.factory('TrucksService',['$http', '$cookies', function ($http, $cookies) {
    return {
        addTruck: function (truckDetails, success, error) {
            $http({
                url: '/v1/trucks/',
                method: "POST",
                data: truckDetails
            }).then(success, error)
        },
        getTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "GET"
            }).then(success, error)
        },
        getAccountTrucks: function (pageNumber, success, error) {
            $http({
                url: '/v1/trucks/get/accountTrucks/' + pageNumber,
                method: "GET"
            }).then(success, error)
        },
        getAllTrucks: function (pagebale, success, error) {
            $http({
                url: '/v1/trucks/groupTrucks/',
                method: "GET",
                params: pagebale
            }).then(success, error)
        },
        getUnAssignedTrucks: function (groupId, success, error) {
            $http({
                url: '/v1/trucks/getUnAssignedTrucks/getAll/',
                method: "GET",
                params: groupId
            }).then(success, error)
        },
        updateTruck: function (truckInfo, success, error) {
            $http({
                url: '/v1/trucks',
                method: "PUT",
                data: truckInfo
            }).then(success, error)
        },
        deleteTruck: function (truckId, success, error) {
            $http({
                url: '/v1/trucks/' + truckId,
                method: "DELETE"
            }).then(success, error)
        },
        getAllAccountTrucks: function (success, error) {
            $http({
                url: '/v1/trucks',
                method: "GET"
            }).then(success, error)
        },
        assignTrucks: function (assignedTrucks, success, error) {
            $http({
                url: '/v1/trucks/assignTrucks',
                method: "POST",
                data: assignedTrucks
            }).then(success, error);
        },
        unAssignTrucks: function (unAssignTrucks, success, error) {
            $http({
                url: '/v1/trucks/unassign-trucks',
                method: "POST",
                data: unAssignTrucks
            }).then(success, error);
        },
        findExpiryCount: function (success, error) {
            $http({
                url: '/v1/trucks/findExpiryCount',
                method: "GET"
            }).then(success, error)
        },
        findExpiryTrucks: function (params,success, error) {
            $http({
                url: '/v1/trucks/findExpiryTrucks',
                method: "GET",
                params:params
            }).then(success, error)
        },
        fitnessExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/fitnessExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        permitExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/permitExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        insuranceExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/insuranceExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        pollutionExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/pollutionExpiryTrucks',
                method: "GET"
            }).then(success, error)
        },
        taxExpiryTrucks: function (success, error) {
            $http({
                url: '/v1/trucks/taxExpiryTrucks',
                method: "GET",
            }).then(success, error);
        },
        count: function (success, error) {
            $http({
                url: '/v1/trucks/total/count',
                method: "GET"
            }).then(success, error)
        },
        searchByTruckName:function(truckName,success,error){
            $http({
                url:'/v1/trucks/searchByTruckName',
                method:"GET",
                params:{
                    truckName:truckName
                }
            }).then(success,error);
        },
        shareExpiredDetailsViaEmail:function(params,success,error){
            $http({
                url:'/v1/trucks/shareExpiredDetailsViaEmail',
                method:"GET",
                params:params
            }).then(success,error);
        },
        getAllTrucksForFilter:function (success,error) {
            $http({
                url:'/v1/trucks/getAllTrucksForFilter',
                method:"GET"
            }).then(success,error);
        }
    }
}]);

app.controller('TrucksController', ['$scope', '$uibModal', 'TrucksService', 'Notification', '$state', 'paginationService', 'NgTableParams', '$rootScope', function ($scope, $uibModal, TrucksService, Notification, $state, paginationService, NgTableParams, $rootScope) {


    $scope.goToEditTruckPage = function (truckId) {
        $state.go('trucksEdit', {truckId: truckId});
    };

    $scope.getBackGroundColor = function (date) {
        var expDate = new Date(date);
        if (expDate < new Date()) {
            return "expired";
        } else if (new Date() > new Date(expDate.setDate(expDate.getDate() - 15))) {
            return "expirewithin15days";
        } else {
            return "";
        }

    }
    $scope.count = 0;
    $scope.getCount = function () {
        TrucksService.count(function (success) {
            if (success.data.status) {
                $scope.count = success.data.count;
                $scope.init();
            } else {
                Notification.error({message: success.data.message});
            }
        });
    };
    $scope.getCount();

    var loadTableData = function (tableParams) {

        var pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),truckName:tableParams.truckName};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        TrucksService.getAllTrucks(pageable, function (response) {
            $scope.invalidCount = 0;
            if (angular.isArray(response.data.trucks)) {
                $scope.loading = false;
                $scope.trucks = response.data.trucks;
                $scope.userId=response.data.userId;
                $scope.userType=response.data.userType;
                tableParams.total(response.totalElements);
                tableParams.data = $scope.trucks;
                $scope.currentPageOfTrucks = $scope.trucks;

            }
        });
    };
    $scope.getAllTrucks = function () {
        TrucksService.getAllTrucksForFilter(function (success) {
            if (success.data.status) {
                $scope.trucksList = success.data.trucks;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({ message: message });
                });
            }
        }, function (error) {

        })
    }

    $scope.init = function () {
        $scope.truckParams = new NgTableParams({
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
                    $scope.getAllTrucks();
                }
            });

    };

    $scope.deleteTruck = function (truckId) {

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
                TrucksService.deleteTruck(truckId, function (success) {
                    if (success.data.status) {
                        swal(
                            'Deleted!',
                            'Truck deleted successfully.',
                            'success'
                        );
                        $scope.getCount();
                    } else {
                        success.data.messages.forEach(function (message) {
                            swal(
                                'Deleted!',
                                message,
                                'error'
                            );
                        });
                    }
                }, function (err) {

                });
            }
        })
    };
    $scope.searchByTruckName = function (truckName) {
        $scope.truckParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                params.truckName = truckName;
                loadTableData(params);
            }
        });
    };


}]);

app.controller('AddEditTruckCtrl', ['$scope', 'Utils', 'TrucksService', 'DriverService', '$stateParams', 'Notification', '$state', function ($scope, Utils, TrucksService, DriverService, $stateParams, Notification, $state) {
    $scope.goToTrucksPage = function () {
        $state.go('trucks');
    };

    $scope.drivers = [];
    $scope.truck = {
        registrationNo: '',
        truckType: '',
        tonnage: '',
        modelAndYear: '',
        driverId: '',
        fitnessExpiry: '',
        permitExpiry: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
        taxDueDate: '',
        errors: []
    };
    $scope.driverName = "";

    $scope.pageTitle = $stateParams.truckId ? 'Update Truck' : 'Add Truck';


    function initializeTruck() {
        if ($stateParams.truckId) {

            TrucksService.getTruck($stateParams.truckId, function (success) {
                if (success.data.status) {
                    $scope.truck = success.data.truck;
                    $scope.truck.fitnessExpiry = new Date($scope.truck.fitnessExpiry);
                    $scope.truck.insuranceExpiry = new Date($scope.truck.insuranceExpiry);
                    $scope.truck.permitExpiry = new Date($scope.truck.permitExpiry);
                    $scope.truck.pollutionExpiry = new Date($scope.truck.pollutionExpiry);
                    $scope.truck.taxDueDate = new Date($scope.truck.taxDueDate);
                    $scope.userId=success.data.userId;
                    $scope.userType=success.data.userType;
                    var selectedDriver = _.find($scope.drivers, function (driver) {
                        return driver._id.toString() === $scope.truck.driverId;
                    });
                    if (selectedDriver) {
                        $scope.driverName = selectedDriver.fullName;

                    }

                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (err) {
            })
        }
    }

    function getAccountDrivers() {
        DriverService.getAllDrivers(function (success) {
            if (success.data.status) {
                $scope.drivers = success.data.drivers;
                initializeTruck();
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {

        });
    }

    getAccountDrivers();
    $scope.addOrUpdateTruck = function () {
        var params = $scope.truck;
        params.errors = [];

        if (!params.registrationNo) {
            params.errors.push('Invalid Registration ID');
        }
        if (!params.truckType) {
            params.errors.push('Invalid truckType');
        }
        if (!params.modelAndYear) {
            params.errors.push('Invalid Modal and Year');
        }

        if (!params.fitnessExpiry) {
            params.errors.push('Invalid Fitness Expiry');
        }
        if (!params.permitExpiry) {
            params.errors.push('Invalid Permit Expiry');
        }
        if (!params.insuranceExpiry) {
            params.errors.push('Invalid Insurance Expiry');
        }
        if (!params.pollutionExpiry) {
            params.errors.push('Invalid Pollution Expiry');
        }
        if (!params.taxDueDate) {
            params.errors.push('Invalid Tax due date');
        }

        if (!params.errors.length) {
            if (!params._id) {
                TrucksService.addTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                TrucksService.updateTruck(params, function (success) {
                    if (success.data.status) {
                        $state.go('trucks');
                        Notification.success({message: "Truck Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {

                });
            }
        }
    }
}]);


app.factory('UserServices',['$http', function ($http) {
    return {
        addUser: function (userData, success, error) {
            $http({
                url: '/v1/user/addUser',
                method: "POST",
                data: userData
            }).then(success, error)
        },
        getAllUsers: function (pageNumber, success, error) {
            $http({
                url: '/v1/user/getAllUsers/' + pageNumber,
                method: 'GET'
            }).then(success, error)
        },
        getUser: function (userId, success, error) {
            $http({
                url: '/v1/user/getUser/' + userId,
                method: "GET"
            }).then(success, error)
        },
        updateUser: function (userData, success, error) {
            $http({
                url: '/v1/user/updateUser',
                method: "POST",
                data: userData
            }).then(success, error)
        }
    }
}]);

app.controller('UserCtrl', ['$scope', '$state', 'UserServices', 'Notification', function ($scope, $state, UserServices, Notification) {
    $scope.goToEditUserPage = function (userId) {
        $state.go('usersEdit', {userId: userId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAllUsers = function () {
        UserServices.getAllUsers($scope.pageNumber, function (success) {
            if (success.data.status) {
                $scope.userGridOptions.data = success.data.users;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function(message) {
                    Notification.error({message: message});
                });
            }
        })
    };
    $scope.getAllUsers();

    $scope.userGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'User name',
            field: 'userName'
        }, {
            name: 'First name',
            field: 'firstName'
        }, {
            name: 'Last name',
            field: 'lastName'
        }, {
            name: 'Role',
            field: 'attrs.roleName'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditUserPage(row.entity._id)" class="glyphicon glyphicon-edit edit"> </a></div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('userEditController', ['$scope', 'UserServices', 'RoleServices', 'AccountServices', 'Notification', '$stateParams', 'Utils', '$state', function ($scope, UserServices, RoleServices, AccountServices, Notification, $stateParams, Utils, $state) {
    $scope.pagetitle = "Add User";
    $scope.userDetails = {
        accountId: '',
        firstName: '',
        lastName: '',
        email: '',
        userName: '',
        role: '',
        password: '',
        status: true,
        isActive: true,
        errors: []
    };

    if ($stateParams.userId) {
        $scope.pagetitle = "Update User";
        UserServices.getUser($stateParams.userId, function (success) {
            if (success.data.status) {
                $scope.userDetails = success.data.user;
                console.log('$scope.userDetails',$scope.userDetails);
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
        })
    }

    function getRoles() {
        RoleServices.getAllRoles(function (success) {
            if (success.data.status) {
                $scope.roles = success.data.roles;
                console.log('roles',$scope.roles);
            } else {
                success.data.messages.forEach(function(message) {
                    Notification.error({message: message});
                });
            }
        }, function (err) {
        });
    }

    getRoles();

    $scope.goToUsersPage = function (userId) {
        $state.go('users');
    };

    $scope.AddorUpdateUSer = function () {
        var params = $scope.userDetails;
        console.log(params);
        params.errors = [];

        if (!params.firstName) {
            params.errors.push('Invalid first name');
        }
        if (!params.lastName) {
            params.errors.push('Invalid last name');
        }
        if (!params.email) {
            params.errors.push('Invalid email');
        }
        if (!params.userName) {
            params.errors.push('Invalid user name');
        }
        if (!params.role) {
            params.errors.push('Invalid role');
        }
        if (!Utils.isValidPassword(params.password)) {
            params.errors.push('Password must have  minimum 7 characters');
        }

        if (!params.errors.length) {
            if ($stateParams.userId) {
                UserServices.updateUser(params, function (success) {
                    if (success.data.status) {
                        $state.go('users');
                        Notification.success({message: "User Updated Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            } else {
                UserServices.addUser(params, function (success) {
                    if (success.data.status) {
                        $state.go('users');
                        Notification.success({message: "User Added Successfully"});
                    } else {
                        params.errors = success.data.messages;
                    }
                }, function (err) {
                });
            }
        }
    }
}]);