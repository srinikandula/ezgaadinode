app.factory('InvoiceService',['$http', '$cookies', function ($http, $cookies) {
    return {
        addInvoice: function (invoiceDetails, success, error) {
            $http({
                url: '/v1/invoices/addInvoice',
                method: "POST",
                data: invoiceDetails
            }).then(success, error)
        },
        getCount: function (params,success, error) {
            $http({
                url: '/v1/invoices/count',
                method: "GET",
                params:params
            }).then(success, error)
        },
        getAllInvoices:function (params,success, error) {
            $http({
                url: '/v1/invoices/getAllInvoices',
                method: "GET",
                params:params
            }).then(success, error)
        },
        deleteInvoice:function (id,success, error) {
            $http({
                url: '/v1/invoices/deleteInvoice/'+id,
                method: "DELETE"
            }).then(success, error)
        },
        getInvoice:function (id,success, error) {
            $http({
                url: '/v1/invoices/getInvoice/'+id,
                method: "GET"
            }).then(success, error)
        },
        updateInvoice: function (invoiceDetails, success, error) {
            $http({
                url: '/v1/invoices/updateInvoice',
                method: "POST",
                data: invoiceDetails
            }).then(success, error)
        }
    }
}]);
app.controller('AddEditInvoiceCtrl',['$scope','PartyService','Notification','InvoiceService','$state','$stateParams','TrucksService',function($scope,PartyService,Notification,InvoiceService,$state,$stateParams,TrucksService){
    $scope.pageTitle = "Add Invoice";
    $scope.partyName = '';
    $scope.truckRegNo = '';
    $scope.invoice = {
        trip:[{
            from: undefined,
            to: undefined,
            loadedOn:undefined,
            unloadedOn:undefined
        }]
    };
    PartyService.getAllPartiesForFilter(function(successCallback){
        $scope.parties = successCallback.data.parties;
    },function(errorCallback){});

    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});

    if($stateParams.id){
        $scope.pageTitle = "Edit Invoice";
        InvoiceService.getInvoice($stateParams.id,function (successCallback) {
            if(successCallback.data.status){
                $scope.invoice =  successCallback.data.data;
                $scope.truckRegNo = $scope.invoice.vehicleNo;
                var party = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.invoice.partyId;
                });
                if (party) {
                    $scope.partyName = party.name;
                }
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    $scope.invoice.trip[i].type = $scope.invoice.trip[i].from;
                    $scope.invoice.trip[i].loadedOn = new Date($scope.invoice.trip[i].loadedOn);
                    $scope.invoice.trip[i].unloadedOn = new Date($scope.invoice.trip[i].unloadedOn);
                }
            }
        },function (errorCallback) {});
    }
    $scope.addFromAndTo = function () {
        if (!$scope.invoice.trip[$scope.invoice.trip.length - 1].from ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].to ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].loadedOn ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].unloadedOn) {
            Notification.error("Please enter details");
        } else {
            $scope.invoice.trip.push({
                from: undefined,
                to: undefined,
                loadedOn:undefined,
                unloadedOn:undefined
            });
        }
    };
    $scope.delete = function (index) {
        if ($scope.invoice.trip.length > 1) {
            $scope.invoice.trip.splice(index, 1);
        } else {
            $scope.invoice.error.push("Please add at least one lane");
        }

    };
    $scope.add_editInvoice = function(){
        if($stateParams.id){
            InvoiceService.updateInvoice($scope.invoice,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Updated Successfully"});
                    $state.go('invoice');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){});
        }else{
            InvoiceService.addInvoice($scope.invoice,function(successCallback){
                if(successCallback.data.status){
                    Notification.success({message:"Added Successfully"});
                    $state.go('invoice');
                }else{
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({ message: message });
                    });
                }
            },function(errorCallback){});
        }

    };
    $scope.cancel = function(){
        $state.go('invoice');
    };
}]);

app.controller('invoicesListController',['$scope','InvoiceService','$state','NgTableParams',function($scope,InvoiceService,$state,NgTableParams){

    $scope.delete = function(id){
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
            InvoiceService.deleteInvoice(id, function (success) {
                if (success.data.status) {
                    swal(
                        'Deleted!',
                        'Invoice deleted successfully.',
                        'success'
                    );
                    $scope.getAllInvoices();
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
    });
    };
    var loadTableData = function (tableParams) {
        var pageable = {page:tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            fromDate:tableParams.fromDate,
            toDate:tableParams.toDate
        };
        InvoiceService.getAllInvoices(pageable,function(successCallback){
            if(successCallback.data.status){
                $scope.invoices = successCallback.data.data;
                tableParams.total(successCallback.totalElements);
                tableParams.data = $scope.invoices;
            }
        },function(errorCallback){});
    };
    $scope.init = function () {
        $scope.invoiceParams = new NgTableParams({
            page: 1, // show first page
            size: 10,
            sorting: {
                createdAt: -1
            }
        }, {
            counts: [],
            total: $scope.count,
            getData: function (params) {
                if($scope.fromDate && $scope.toDate){
                    params.fromDate = $scope.fromDate;
                    params.toDate = $scope.toDate;
                }
                loadTableData(params);
            }
        });

    };
   $scope.getCount = function () {
       var params = {};
       params.fromDate = $scope.fromDate;
       params.toDate = $scope.toDate;
       InvoiceService.getCount(params,function(successCallback){
           if(successCallback.data.status){
               $scope.count = successCallback.data.data;
               $scope.init();
           }
       },function(errorCallback){});
   };
   $scope.goToEditPage = function(id){
       $state.go('invoiceEdit',{id:id});
   };
   $scope.getCount();
   // $scope.getAllInvoices();
    $scope.generatePdf=function (invoiceId) {
        window.open('/v1/invoices/generatePDF/' + invoiceId );
    }
}]);