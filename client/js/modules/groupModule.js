app.factory('GroupServices', function ($http) {
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
});

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