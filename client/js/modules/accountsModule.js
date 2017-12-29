app.factory('AccountServices', function ($http, $cookies) {
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
                params:pageable
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
                params:pageable
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
        uploadUserProfilePic:function (data,success,error) {
            $http({
                url: '/v1/admin/uploadUserProfilePic',
                method: "POST",
                data: data
            }).then(success, error)
        }
    }
});

app.controller('ShowAccountsCtrl', ['$scope', '$uibModal', 'AccountServices', 'Notification', '$state', 'paginationService','NgTableParams', function ($scope, $uibModal, AccountServices, Notification, $state, paginationService, NgTableParams) {
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
    $scope.findAccounts = function(){
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
    $scope.findAccountGroup = function(){
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

app.controller('AddEditAccountCtrl', ['$scope', 'Utils', '$state', 'AccountServices', 'TrucksService', '$stateParams', 'Notification','$uibModal', function ($scope, Utils, $state, AccountServices, TrucksService, $stateParams, Notification, $uibModal) {
    $scope.pagetitle = "Add Account";

    $scope.account = {
        profile: {userName: '',
            password: '',
            contactPhone: '',
            email: '',},
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
        truckId: [],
        erpEnabled: '',
        gpsEnabled: '',
        type: '',
        isActive: true,
        success: [],
        errors: []
    };

    $scope.trucks = [];

    $scope.dropdownSetting = {
        scrollable: true,
        scrollableHeight : '200px',
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
    } else if($stateParams.accountGroupId){
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
        if(params.oldPassword) {
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
                       Notification.success({message: "Account Updated Successfully"});
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
    $scope.truckId2=[];
    function getTruckIds() {
        TrucksService.getAllTrucks(1, function (success) {
            if (success.data.status) {
                $scope.trucks = success.data.trucks
                if($scope.group.truckId.length>0){
                    for(var i=0;i<$scope.trucks.length;i++){
                        for(var j=0;j<$scope.group.truckId.length;j++){
                            if($scope.trucks[i]._id===$scope.group.truckId[j]){
                                $scope.truckId2.push(true);
                            }else{
                                $scope.truckId2.push(false);
                            }
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

    $scope.truckSelected = function (status,truckId) {
        if(status) {
            $scope.group.truckId.push(truckId);
        } else {
            var index = $scope.group.truckId.indexOf(truckId);
            $scope.group.truckId.splice(index,1);
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

        if (!params.truckId.length) {
            params.errors.push('Please Select Atleast One Vehicle');
        }
        if(!params.erpEnabled && !params.gpsEnabled) {
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
            windowClass:'profilePopup',
            resolve: {
                modelType: function () {
                    return { data: "", model: 'changeProfilePic' };
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
                $state.go('myProfile', {}, { reload: true });

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
        AccountServices.uploadUserProfilePic({ image: img }, function (success) {
            if (success.data.status) {
                $cookies.put('profilePic', success.data.profilePic);
                $rootScope.profilePic=success.data.profilePic;
                $uibModalInstance.close({ status: true, message: success.data.message });
            } else {
                swal(success.data.message, 'Error', 'warning');
            }
        }, function (err) {
        });
    };



}]);

