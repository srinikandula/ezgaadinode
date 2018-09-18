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
        },
        getTruckTypes:function (success,error) {
            $http({
                url:'/v1/trucks/getTruckTypes',
                method:"GET"
            }).then(success,error);
        },
        getAllTrucksForAccount: function (params, success, error) {
            $http({
                url: '/v1/trucks/getAllTrucksForAccount',
                method: "GET",
                params: params
            }).then(success, error);
        },
        shareDetailsViaEmail:function(params,success,error){
            $http({
                url: '/v1/trucks/shareDetailsViaEmail',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getAddedTruckTypes:function (success,error) {
            $http({
                url: '/v1/trucks/getAddedTruckTypes',
                method: "GET"
            }).then(success, error)
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

    };
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

        var pageable = { page: tableParams.page(), size: tableParams.count(), sort: tableParams.sorting(),
            truckName:tableParams.truckName,truckType:tableParams.truckType};
        $scope.loading = true;
        // var pageable = {page:tableParams.page(), size:tableParams.count(), sort:sortProps};

        TrucksService.getAllTrucks(pageable, function (response) {
            console.log(response);
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
    $scope.getAddedTruckTypes=function () {
            TrucksService.getAddedTruckTypes(function (success) {
                if(success.data.status){
                    $scope.addedTruckTypes = success.data.data;

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
                    $scope.getAddedTruckTypes();
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
    $scope.params={};
    $scope.searchByTruckName = function (truckName) {
        $scope.truckParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [10],
            total: $scope.count,
            getData: function (params) {
                params.truckName = truckName;
                if($scope.params.truckType){
                    params.truckType=$scope.params.truckType.title;
                }
                loadTableData(params);
            }
        });
    };
    $scope.shareDetailsViaEmail=function(){
        swal({
            title: 'Share trucks data using mail',
            input: 'email',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (email) => {
            return new Promise((resolve) => {
                TrucksService.shareDetailsViaEmail({
                email:email
            },function(success){
                if (success.data.status) {
                    resolve()
                } else {

                }
            },function(error){

            })
        })

    },
        allowOutsideClick: false

    }).then((result) => {
            if (result.value) {
            swal({
                type: 'success',
                html: ' sent successfully'
            })
        }
    })
    }
    $scope.downloadDetails = function () {
        window.open('/v1/trucks/downloadDetails');
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

    function getTruckTypes() {
        TrucksService.getTruckTypes(function (success) {
            if(success.status){
                $scope.truckTypesList=success.data.data;
            }else{
                success.data.messages.forEach(function (message) {
                    Notification.error(message);
                });
            }
        },function (error) {

        })
    }
    getTruckTypes();
    function initializeTruck() {
        if ($stateParams.truckId) {

            TrucksService.getTruck($stateParams.truckId, function (success) {
                if (success.data.status) {
                    $scope.truck = success.data.truck;
                    if($scope.truck.fitnessExpiry !== undefined){
                        $scope.truck.fitnessExpiry = new Date($scope.truck.fitnessExpiry);
                    }
                    if($scope.truck.insuranceExpiry !== undefined){
                        $scope.truck.insuranceExpiry = new Date($scope.truck.insuranceExpiry);
                    }
                    if($scope.truck.permitExpiry !== undefined){
                        $scope.truck.permitExpiry = new Date($scope.truck.permitExpiry);
                    }
                    if($scope.truck.pollutionExpiry !== undefined){
                        $scope.truck.pollutionExpiry = new Date($scope.truck.pollutionExpiry);
                    }
                    if($scope.truck.taxDueDate !== undefined){
                        $scope.truck.taxDueDate = new Date($scope.truck.taxDueDate);
                    }
                    $scope.userId=success.data.userId;
                    $scope.userType=success.data.userType;
                    $scope.title=$scope.truck.truckType;
                    $scope.tonnes=$scope.truck.tonnage;

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
            params.errors.push('Invalid Registration Number');
        }
        if (!params.truckType) {
            params.errors.push('Invalid Truck Type');
        }/*
        if (!params.modelAndYear) {
            params.errors.push('Invalid Modal and Year');
        }*/

      /*  if (!params.fitnessExpiry) {
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
        }*/

        if (!params.errors.length) {
            if(typeof params.truckType==="object"){
                params.tonnage=params.truckType.tonnes;
                params.truckTypeId=params.truckType._id;
                params.truckType=params.truckType.title ;
            }
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

