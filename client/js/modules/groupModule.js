app.factory('GroupServices', function ($http) {
    return {
        addGroup: function (userData, success, error) {
            $http({
                url: '/v1/group/addGroup',
                method: "POST",
                data: userData
            }).then(success, error)
        },
        getGroups: function (success, error) {
            $http({
                url: '/v1/group/getGroups/',
                method: "GET"
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
        }
    }
});

app.controller('GroupCtrl', ['$scope', '$state', 'GroupServices', 'Notification', function ($scope, $state, GroupServices, Notification) {
    $scope.goToEditGroupPage = function (groupId) {
        $state.go('groupsEdit', {groupId: groupId});
    };

    $scope.totalItems = 200;
    $scope.maxSize = 5;
    $scope.pageNumber = 1;

    $scope.getAllGroups = function () {
        GroupServices.getGroups(function (success) {
            if (success.data.status) {
                $scope.groupGridOptions.data = success.data.groups;
                $scope.totalItems = success.data.count;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({message: message});
                });
            }
        })
    };
    $scope.getAllGroups();

    $scope.groupGridOptions = {
        enableSorting: true,
        paginationPageSizes: [9, 20, 50],
        paginationPageSize: 9,
        columnDefs: [{
            name: 'User name',
            field: 'userName'
        }, {
            name: 'Group Name',
            field: 'name'
        }, {
            name: 'Created By',
            field: 'attrs.createdByName'
        }, {
            name: 'Action',
            cellTemplate: '<div class="text-center">' +
            '<a href="#" ng-click="grid.appScope.goToEditGroupPage(row.entity._id)" class="glyphicon glyphicon-edit edit"> </a></div>'
        }],
        rowHeight: 30,
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
}]);

app.controller('groupEditController', ['$scope', 'GroupServices', 'AccountServices', 'TrucksService', 'Notification', '$stateParams', 'Utils', '$state', function ($scope, GroupServices, AccountServices, TrucksService, Notification, $stateParams, Utils, $state) {
    $scope.pagetitle = "Add Group";
    $scope.trucks = [];
    $scope.checked_trucks = [];
    $scope.groupDetails = {
        name: '',
        userName: '',
        password: '',
        status: true,
        isActive: true,
        errors: []
    };

    if ($stateParams.groupId) {
        $scope.pagetitle = "Update Group";
        GroupServices.getGroup($stateParams.groupId, function (success) {
            if (success.data.status) {
                $scope.groupDetails = success.data.group;

            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        }, function (err) {
            Notification.error(err);
        })
    }

    $scope.goToGroupsPage = function (groupId) {
        $state.go('groups');
    };

    function getTruckIds() {
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

    getTruckIds();

    $scope.AddorUpdateGroup = function () {
        var params = $scope.groupDetails;
        params.checkedTrucks = $scope.checked_trucks;

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
                    if (success.data.status) {
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
    $scope.example14model = [];
    $scope.example14settings = {
        scrollable: true,
        scrollableHeight: '300px',
        closeOnBlur: true,
        displayProp: 'registrationNo',
        idProp: 'registrationNo',
        buttonDefaultText: 'Select Trucks'
    };

    TrucksService.getUnAssignedTrucks(function (success) {
        if(success.data.status){
            $scope.example14data = success.data.trucks;
           /* console.log('------>',  $scope.example14data);*/
        }
    });

    $scope.example2settings = {
        displayProp: 'registrationNo'
    };



}]);