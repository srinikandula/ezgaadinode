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

app.controller('groupEditController', ['$scope', 'GroupServices', 'AccountServices', 'TrucksService', 'Notification', '$stateParams', 'Utils', '$state','$cookies', function ($scope, GroupServices, AccountServices, TrucksService, Notification, $stateParams, Utils, $state,$cookies) {
    $scope.pagetitle = "Add Group";
    $scope.trucks = [];
    $scope.checkedTrucks=[];
    $scope.uncheckedTruckList=[];
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
                    $scope.groupId=$scope.groupDetails._id;
                } else {
                    success.data.messages.forEach(function (message) {
                        Notification.error(message);
                    });
                }
            }, function (err) {
                Notification.error(err);
            })
        }
        else{
            $scope.goToGroupsPage = function () {
                $state.go('groups');
            };
        }
        getFullGroupTruckDetails();
        TrucksService.getUnAssignedTrucks({groupId: $scope.groupId}, function (success) {
            if (success.data.status) {
                console.log(success.data.trucks);
                $scope.trucksList = success.data.trucks;
            }
        });

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
    $scope.checkboxModel=[];



    $scope.AddorUpdateGroup = function () {

        params = $scope.groupDetails;
        console.log($scope.checkboxModel);
        $scope.checkboxModel.forEach(function(assignedTruck){
            console.log(assignedTruck);
            if(assignedTruck){
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
                TrucksService.unAssignTrucks($scope.uncheckedTruckList,function(success){
                    if(success.data.status){
                        console.log(success.data);
                    }else{
                        console.log(success.data);
                    }
                },function(error){

                });
                TrucksService.assignTrucks({
                    groupId: $scope.groupDetails._id,
                    trucks: $scope.checkedTrucks
                }, function (success) {
                    if (success.data.status) {
                        console.log(success);
                    } else {
                        console.log(success);
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
                    if (success.data.status) {
                        TrucksService.assignTrucks({
                            groupId: $scope.groupId,
                            trucks: params.checkedTrucks
                        }, function (success) {
                            if (success.data.status) {
                                getFullGroupTruckDetails();
                                console.log(success);
                            } else {
                                console.log(success);
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

    $scope.pageNumber=0;
    function getFullGroupTruckDetails() {
        TrucksService.getAccountTrucks($scope.pageNumber,function (success) {
            if (success.data.status) {
                $scope.allTrucks=success.data.trucks;
                console.log($scope.allTrucks);
                $scope.allTrucks.forEach(function(truck){
                    if((truck.groupId===$scope.groupId)){
                        $scope.trucksList.push(truck);
                    }
                });
                $scope.trucksList.forEach(function(truck,key){
                    console.log(truck,key);
                    if(truck.groupId){
                        $scope.checkboxModel[key]=truck._id;
                    }
                });
            }
        });
    }

    function unassignTruck(){
        $scope.trucksList.forEach(function(truck,key){
            if(truck.groupId) {
                if (!$scope.checkboxModel[key]){
                    $scope.uncheckedTruckList.push(truck._id);
                }
                    }
        });
    }

}]);