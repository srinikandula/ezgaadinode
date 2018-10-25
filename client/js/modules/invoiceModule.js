app.factory('InvoiceService', ['$http', '$cookies', function ($http, $cookies) {
    return {
        addInvoice: function (invoiceDetails, success, error) {
            $http({
                url: '/v1/invoices/addInvoice',
                method: "POST",
                data: invoiceDetails
            }).then(success, error);
        },
        downloadInvoice: function (params, success, error) {
            $http({
                url: 'v1/invoices/downloadDetails',
                method: 'GET',
                params: params
            }).then(success, error)
        },
        getInnvoiceByParty: function (params, success, error) {
            $http({
                url: '/v1/invoices/getinvoiceByParty',
                method: 'GET',
                params: params
            }).then(success, error);
        },
        getCount: function (params, success, error) {
            $http({
                url: '/v1/invoices/count',
                method: "GET",
                params: params
            }).then(success, error);
        },
        getAllInvoices: function (params, success, error) {
            $http({
                url: '/v1/invoices/getAllInvoices',
                method: "GET",
                params: params
            }).then(success, error);
        },
        deleteInvoice: function (id, success, error) {
            $http({
                url: '/v1/invoices/deleteInvoice/' + id,
                method: "DELETE"
            }).then(success, error);
        },
        getInvoice: function (id, success, error) {
            $http({
                url: '/v1/invoices/getInvoice/' + id,
                method: "GET"
            }).then(success, error);
        },
        updateInvoice: function (invoiceDetails, success, error) {
            $http({
                url: '/v1/invoices/updateInvoice',
                method: "POST",
                data: invoiceDetails
            }).then(success, error);
        },
        getTrip: function (params, success, error) {
            $http({
                url: '/v1/invoices/getTrip',
                method: "GET",
                params: params
            }).then(success, error);
        }
    }
}]);
app.controller('AddEditInvoiceCtrl', ['$scope', 'PartyService', 'Notification', 'InvoiceService', '$state', '$stateParams', 'TrucksService', 'TripServices', function ($scope, PartyService, Notification, InvoiceService, $state, $stateParams, TrucksService, TripServices) {
    $scope.pageTitle = "Add Invoice";
    $scope.partyName = '';
    $scope.getTrip = {};
    $scope.temp = false;
    $scope.truckRegNo = [];
    $scope.invoice = {
        addTrip: false,
        trip: [{
            vehicleNo: undefined,
            from: undefined,
            to: undefined,
            loadedOn: undefined,
            unloadedOn: undefined
        }]

    };

    PartyService.getAllPartiesForFilter(function (successCallback) {
        $scope.parties = successCallback.data.parties;
    }, function (errorCallback) {});

    $scope.getTrips = function () {
        TripServices.getAllAccountTrips([], function (successCallback) {
            $scope.trips = successCallback.data.trips;
        }, function (errorCallback) {});
    };

    TrucksService.getAllTrucksForFilter(function (successCallback) {
        if (successCallback.data.status) {
            $scope.trucks = successCallback.data.trucks;
        } else {
            successCallback.data.messages(function (message) {
                Notification.error(message);
            });
        }
    }, function (error) {});
    if ($stateParams.id) {
        $scope.pageTitle = "Edit Invoice";
        InvoiceService.getInvoice($stateParams.id, function (successCallback) {
            if (successCallback.data.status) {
                $scope.invoice = successCallback.data.data;
                var party = _.find($scope.parties, function (party) {
                    return party._id.toString() === $scope.invoice.partyId;
                });
                if (party) {
                    $scope.partyName = party.name;
                }
                if ($scope.invoice.addTrip) {
                    var trip = _.find($scope.trips, function (trip) {
                        return trip._id.toString() === $scope.invoice.tripId;
                    });
                    if (trip) {
                        $scope.tripId = trip.tripId;
                    }
                    for (var i = 0; i < $scope.invoice.trip.length; i++) {
                        $scope.temp = true;
                        $scope.invoice.trip[i].date = new Date($scope.invoice.trip[i].date);
                    }
                };
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    $scope.truckRegNo[i] = $scope.invoice.trip[i].vehicleNo;
                    if ($scope.invoice.trip[i].loadedOn !== undefined) {
                        $scope.invoice.trip[i].loadedOn = new Date($scope.invoice.trip[i].loadedOn);
                    }
                    if ($scope.invoice.trip[i].unloadedOn !== undefined) {
                        $scope.invoice.trip[i].unloadedOn = new Date($scope.invoice.trip[i].unloadedOn);
                    }
                }
                if ($scope.invoice.lrDate) {
                    $scope.invoice.lrDate = new Date($scope.invoice.lrDate);
                    $scope.invoice.consignorInvoiceDate = new Date($scope.invoice.consignorInvoiceDate);
                    $scope.invoice.gatePassDate = new Date($scope.invoice.gatePassDate)
                }
                // else if($scope.invoice.consignorInvoiceDate){
                //     $scope.invoice.consignorInvoiceDate=new Date($scope.invoice.consignorInvoiceDate)
                // }else if($scope.invoice.gatePassDate){
                //     $scope.invoice.gatePassDate=new Date($scope.invoice.gatePassDate) 
                // }
            }
        }, function (errorCallback) {});
    }
    $scope.addFromAndTo = function () {
        if (!$scope.invoice.trip[$scope.invoice.trip.length - 1].from ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].to ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].loadedOn ||
            !$scope.invoice.trip[$scope.invoice.trip.length - 1].unloadedOn) {
            Notification.error("Please enter details");
        } else {
            $scope.invoice.trip.push({
                vehicleNo: undefined,
                from: undefined,
                to: undefined,
                loadedOn: undefined,
                unloadedOn: undefined
            });
        }
    };
    $scope.addFromAndToTrip = function () {
        if (!$scope.invoice.tripId) {
            Notification.error("Please enter details");
        } else {
            $scope.temp = true;
            $scope.status = 'diable';
            var query = {
                tripId: $scope.invoice.tripId.tripId
            };
            InvoiceService.getTrip(query, function (success) {
                if (success.data.status) {
                    $scope.getTrip = success.data.data;
                    $scope.getTrip.vehicleNo = success.data.truckName;
                    if (!$scope.invoice.trip[0].from) {
                        $scope.invoice.trip[0].vehicleNo = $scope.getTrip.vehicleNo;
                        $scope.invoice.trip[0].from = $scope.getTrip.source;
                        $scope.invoice.trip[0].to = $scope.getTrip.destination;
                        $scope.invoice.trip[0].date = new Date($scope.getTrip.date);
                        $scope.invoice.trip[0].tonnage = $scope.getTrip.tonnage;
                        $scope.invoice.trip[0].ratePerTonne = $scope.getTrip.rate;
                    } else {
                        $scope.invoice.trip.push({
                            vehicleNo: $scope.getTrip.vehicleNo,
                            from: $scope.getTrip.source,
                            to: $scope.getTrip.destination,
                            date: new Date($scope.getTrip.date),
                            tonnage: $scope.getTrip.tonnage,
                            ratePerTonne: $scope.getTrip.rate
                        });
                    }
                }
            }, function (error) {
                success.data.messages.forEach(function (message) {
                    Notification.error({
                        message: message
                    });
                })
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
    $scope.add_editInvoice = function () {
        if ($stateParams.id) {
            if ($scope.invoice.tripId) {
                $scope.invoice.partyId = $scope.invoice.tripId.partyId;
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    $scope.invoice.trip[i].amountPerTonne = parseFloat($scope.invoice.trip[i].ratePerTonne * $scope.invoice.trip[i].tonnage);
                }
            } else {
                $scope.invoice.partyId = $scope.invoice.partyId._id;
                $scope.invoice.totalAmount = $scope.invoice.rate * $scope.invoice.quantity;
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    if ($scope.invoice.trip[i].vehicleNo.registrationNo) {
                        $scope.invoice.trip[i].vehicleNo = $scope.invoice.trip[i].vehicleNo.registrationNo;
                    }
                }
            }
            InvoiceService.updateInvoice($scope.invoice, function (successCallback) {
                if (successCallback.data.status) {
                    Notification.success({
                        message: "Updated Successfully"
                    });
                    $state.go('invoice');
                } else {
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({
                            message: message
                        });
                    });
                }
            }, function (errorCallback) {});
        } else {
            if ($scope.invoice.tripId) {
                $scope.invoice.partyId = $scope.invoice.tripId.partyId;
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    $scope.invoice.trip[i].amountPerTonne = parseFloat($scope.invoice.trip[i].ratePerTonne * $scope.invoice.trip[i].tonnage);
                }
            } else {
                $scope.invoice.partyId = $scope.invoice.partyId._id;
                $scope.invoice.totalAmount = $scope.invoice.rate * $scope.invoice.quantity;
                for (var i = 0; i < $scope.invoice.trip.length; i++) {
                    $scope.invoice.trip[i].vehicleNo = $scope.invoice.trip[i].vehicleNo.registrationNo;
                }
            }
            InvoiceService.addInvoice($scope.invoice, function (successCallback) {
                if (successCallback.data.status) {
                    Notification.success({
                        message: "Added Successfully"
                    });
                    $state.go('invoice');
                } else {
                    successCallback.data.messages.forEach(function (message) {
                        Notification.error({
                            message: message
                        });
                    });
                }
            }, function (errorCallback) {});
        }

    };
    $scope.cancel = function () {
        $state.go('invoice');
        getAllPartiesForFilter
    };
    $scope.searchSource = function (index) {
        var input = document.getElementById('source' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.invoice.trip[index].from = place.formatted_address;
            });
    };
    $scope.searchDestination = function (index) {
        var input = document.getElementById('destination' + index);
        var options = {};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed',
            function () {
                var place = autocomplete.getPlace();
                $scope.invoice.trip[index].to = place.formatted_address;
            });
    };
    $scope.getTrips();
}]);
app.controller('invoicesListController', ['$scope', '$rootScope', 'InvoiceService', '$state', 'NgTableParams', 'PartyService', function ($scope, $rootScope, InvoiceService, $state, NgTableParams, PartyService) {

    $scope.date = new Date();
    $scope.partyName = {
        party: ''
    };

    $scope.delete = function (id) {
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
        });
    };
    var loadTableData = function (tableParams) {
        var pageable = {
            page: tableParams.page(),
            size: tableParams.count(),
            sort: tableParams.sorting(),
            fromDate: tableParams.fromDate,
            toDate: tableParams.toDate
        };
        InvoiceService.getAllInvoices(pageable, function (successCallback) {
            if (successCallback.data.status) {
                $scope.invoices = successCallback.data.data;
                tableParams.total(successCallback.totalElements);
                tableParams.data = $scope.invoices;
            }
        }, function (errorCallback) {});
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
                if ($scope.fromDate && $scope.toDate) {
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
        InvoiceService.getCount(params, function (successCallback) {
            if (successCallback.data.status) {
                $scope.count = successCallback.data.data;
                $scope.init();
            }
        }, function (errorCallback) {});
    };
    $scope.goToEditPage = function (id) {
        $state.go('invoiceEdit', {
            id: id
        });
    };
    $scope.getCount();
    // $scope.getAllInvoices();
    $scope.generatePdf = function (invoiceId) {
        window.open('/v1/invoices/generatePDF/' + invoiceId);
    }

    // PartyService.getAllPartiesForFilter(function (success) {
    //     if (success.data.status) {
    //         $scope.partiesList = success.data.parties;
    //     } else {
    //         success.data.messages.forEach(function (message) {
    //             Notification.error({
    //                 message: message
    //             });
    //         });
    //     }
    // }, function (error) {

    // })

    $scope.getParties = function () {
        PartyService.getAllPartiesForFilter(function (success) {
            if (success.data.status) {
                $scope.partiesList = success.data.parties;
            } else {
                success.data.messages.forEach(function (message) {
                    Notification.error({
                        message: message
                    });
                });
            }
        }, function (error) {

        });
    };
    $scope.getParties();

    $scope.downloadPartyDetails = function () {
        window.open('/v1/expense/downloadDetails');
    };
    $scope.partyId = null;
    $scope.
     = function (party) {
        $scope.partyId = party._id;
        // alert("hiii");
        console.log('partyyyyyyyyyyyyyyyyyy', party);
        var params = {};
        params.fromDate = $scope.fromDate;
        params.toDate = $scope.toDate;
        params._id = party._id;
        console.log(params, "paramasssssssss");
        InvoiceService.getInnvoiceByParty(params, function (success) {
                console.log("Success", success);
                if (success.data.status) {
                    console.log("success..........");
                    $scope.invoices = success.data.data;
                    console.log("invoices", success.data.data);

                } else {
                    console.log("error..........");

                }
            },

            function (error) {
                if (error) {
                    Notification.error({
                        message: message
                    });
                } else {}

            });

    };

    $scope.downloadDetails = function () {
        var params = {};
        params.fromDate = $scope.fromDate;
        params.toDate = $scope.toDate;
        params._id = $scope.partyId;
        // window.open(
        //     $http.get('/v1/invoices/downloadDetails', params).then(function(success,error){

        //     },function(error){

        //     }));
        console.log("Params", params);
        window.open('/v1/invoices/downloadDetails?start=' + params.fromDate + '&end=' + params.toDate + '&partyId=' + params._id);

        // window.open(InvoiceService.downloadInvoiceByParty);
        /*   InvoiceService.downloadInvoice(params, function (success) {
              if (success.data.status) {
                  console.log("successfully Downloaded");
              }
          }, function (error) {
              if (error) {
                  console.log("error while downloading the data");
              }
          }) */

    };

    $scope.printArea = function () {
        var w = window.open();
        w.document.write(document.getElementsByClassName('report_left_inner')[0].innerHTML);
        w.print();
        w.close();
    }

}]);