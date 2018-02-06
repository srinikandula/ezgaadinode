var app = angular.module('EasyGaadi', ['ui.router', 'ngTable', 'paginationService', 'ngCookies', 'ui.bootstrap', 'ui-notification', 'ngImgCrop', 'ngFileUpload', 'ngSanitize', 'ui.select']);

<<<<<<< HEAD
app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider',function ($stateProvider, $locationProvider, $urlRouterProvider) {
=======
app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
>>>>>>> gulp tasks,dependency changes,gitignore
    $locationProvider.html5Mode(true);

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'views/partials/login.html',
        data: {activeTab: 'import-students'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'home',
        url: '/home',
        templateUrl: 'views/partials/home.html',
        params: {
            access: 'open'
        }
    }).state({
        name: 'forgotPassword',
        url: '/forgotPassword',
        templateUrl: 'views/partials/forgotPassword.html',
        data: {activeTab: 'null'},
        params: {
            access: 'null'
        }
    }).state({
        name: 'myProfile',
        url: '/myProfile',
        templateUrl: 'views/partials/userProfile/myProfile.html',
        data: {activeTab: 'myProfile'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'myGroup',
        url: '/myGroup',
        templateUrl: 'views/partials/userProfile/myGroup.html',
        data: {activeTab: 'myGroup'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'addGroup',
        url: '/addGroup',
        templateUrl: 'views/partials/userProfile/addingGroup.html',
        data: {activeTab: 'addGroup'},
        params: {
            access: 'auth',
            accountGroupId: null
        }
    }).state({
        name: 'accounts',
        url: '/accounts',
        templateUrl: 'views/partials/accounts/accountsList.html',
        data: {activeTab: 'accounts',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'accountsEdit',
        url: '/accountsEdit/:accountId',
        templateUrl: 'views/partials/accounts/edit-account.html',
        data: {activeTab: 'accounts',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            accountId: null
        }
    }).state({
        name: 'groups',
        url: '/groups',
        templateUrl: 'views/partials/groups/show-groups.html',
        data: {activeTab: 'groups'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'groupsEdit',
        url: '/groupsEdit/:groupId',
        templateUrl: 'views/partials/groups/groupsEdit.html',
        data: {activeTab: 'groups'},
        params: {
            access: 'open',
            groupId: null
        }
    }).state({
        name: 'drivers',
        url: '/drivers',
        templateUrl: 'views/partials/drivers/driversList.html',
        data: {
            activeTab: 'drivers',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'driversEdit',
        url: '/driversEdit/:driverId',
        templateUrl: 'views/partials/drivers/edit-driver.html',
        data: {
            activeTab: 'drivers',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            driverId: null
        }
    }).state({
        name: 'trucks',
        url: '/trucks',
        templateUrl: 'views/partials/trucks/trucks-list.html',
        data: {
            activeTab: 'trucks',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'trucksEdit',
        url: '/trucksEdit/:truckId',
        templateUrl: 'views/partials/trucks/trucks-edit.html',
        data: {
            activeTab: 'trucks',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            truckId: null
        }
    }).state({
        name: 'trips',
        url: '/trips',
        templateUrl: 'views/partials/trips/tripsList.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'tripsEdit',
        url: '/tripsEdit/:tripId',
        templateUrl: 'views/partials/trips/tripsEdit.html',
        data: {
            activeTab: 'trips',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            tripId: null
        }
    }).state({
        name: 'parties',
        url: '/parties',
        templateUrl: 'views/partials/party/party-list.html',
        data: {
            activeTab: 'parties',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'editParty',
        url: '/editParty/:partyId',
        templateUrl: 'views/partials/party/edit-party.html',
        data: {
            activeTab: 'parties',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            partyId: null
        }
    }).state({
        name: 'trackMap',
        url: '/trackMap',
        templateUrl: 'views/partials/trackMap.html',
        data: {activeTab: 'trackMap'},
        params: {
            access: 'open'
        }
    }).state({
        name: 'expenses',
        url: '/expenses',
        templateUrl: 'views/partials/expenses/expenses.html',
        data: {
            activeTab: 'expenses',
            subTab: 'ERP'
        },
        params: {
            access: 'open'
        }
    }).state({
        name: 'expensesEdit',
        url: '/expensesEdit/:expenseId',
        templateUrl: 'views/partials/expenses/expensesEdit.html',
        data: {
            activeTab: 'expenses',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            expenseId: null
        }
    }).state({
        name: 'payments',
        url: '/payments',
        templateUrl: 'views/partials/payments/paymentsReceived.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'paymentsEdit',
        url: '/paymentsEdit/:paymentsId',
        templateUrl: 'views/partials/payments/paymentsEdit.html',
        data: {
            activeTab: 'payments',
            subTab: 'ERP'
        },
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'gpsReports',
        url: '/gps/gpsReports',
        templateUrl: 'views/partials/gps/gpsReports.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'gpsSettings',
        url: '/gpsSettings',
        templateUrl: 'views/partials/settings/gpsSettings.html',
        data: {activeTab: 'settings'},
        params: {
            access: 'open',
        }
    }).state({
        name: 'reportsSettings',
        url: '/reportsSettings',
        templateUrl: 'views/partials/settings/reportsSettings.html',
        data: {activeTab: 'settings'},
        params: {
            access: 'open',
        }
    }).state({
        name: 'mapView',
        url: '/gps/mapView',
        templateUrl: 'views/partials/gps/mapView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'listView',
        url: '/gps/listView',
        templateUrl: 'views/partials/gps/listView.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'open',
            paymentsId: null
        }
    }).state({
        name: 'groupMap',
        url: '/groupMap',
        templateUrl: 'views/partials/groupMap.html',
        data: {activeTab: 'gpsReports'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'reports',
        url: '/reports/revenueByVehicles',
        templateUrl: 'views/partials/reports/revenueByVehicles.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },

        params: {
            access: 'auth'
        }
    }).state({
        name: 'revenueByvehicleId',
        url: '/reports/revenueByvehicleId/:vehicleId/:id',
        templateUrl: 'views/partials/reports/revenueByvehicleId.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            vehicleId: null, id: null
        }
    }).state({
        name: 'expenseByVehicles',
        url: '/reports/expenseByVehicles',
        templateUrl: 'views/partials/reports/expenseByVehicles.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'expenseByVehicleId',
        url: '/reports/expenseByVehicleId/:vehicleId/:id',
        templateUrl: 'views/partials/reports/expenseByVehicleId.html',
        data: {
            activeTab: 'reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth',
            vehicleId: null, id: null
        }
    }).state({
        name: 'receivableByParty',
        url: '/reports/receivableByParty',
        templateUrl: 'views/partials/reports/receivableByParties.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'receivableByPartyName',
        url: '/reports/receivableByPartyName/:partyId/:name',
        templateUrl: 'views/partials/reports/receivableByPartyName.html',
        data: {activeTab: 'ERP', subTab: 'ERP'},
        params: {
            access: 'auth',
            partyId: null, name: null
        }
    }).state({
        name: 'payableByParty',
        url: '/reports/payableByParty',
        templateUrl: 'views/partials/reports/payableByParty.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'payableByPartyName',
        url: '/reports/payableByPartyName/:partyId/:name',
        templateUrl: 'views/partials/reports/payableByPartyName.html',
        data: {activeTab: 'ERP', subTab: 'ERP'},
        params: {
            access: 'auth',
            partyId: null, name: null
        }
    }).state({
        name: 'listOfExpireTrucks',
        url: '/reports/listOfExpireTrucks',
        templateUrl: 'views/partials/reports/expiryTrucks.html',
        data: {
            activeTab: 'Reports',
            subTab: 'ERP'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'secretKeys',
        url: '/settings/secretKeys',
        templateUrl: 'views/partials/settings/SecretKeys.html',
        data: {activeTab: 'secret',
            subTab: 'GPS'},
        params: {
            access: 'auth'
        }
    }).state({
        name: 'devices',
        url: '/gps/devices',
        templateUrl: 'views/partials/gps/devices.html',
        data: {activeTab: 'gpsReports'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'analyticsReports',
        url: '/analytics/dashboard',
        templateUrl: 'views/partials/analyticsReports/reports.html',
        data: {activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'actionReports',
        url: '/reports/lastLogin',
        templateUrl: 'views/partials/analyticsReports/loginAnalytics.html',
        data: {activeTab: 'Analytics'
        },
        params: {
            access: 'auth'
        }
    }).state({
        name: 'agentReports',
        url: '/reports/agentReports',
        templateUrl: 'views/partials/analyticsReports/agentReports.html',
        data: {activeTab: 'Analytics',
        },
        params: {
            access: 'auth'
        }
    });
    // agentReports
    $urlRouterProvider.otherwise('/login');
<<<<<<< HEAD
}]);

app.config(['NotificationProvider', '$httpProvider',function (NotificationProvider, $httpProvider) {
=======
});

app.config(function (NotificationProvider, $httpProvider) {
>>>>>>> gulp tasks,dependency changes,gitignore
    NotificationProvider.setOptions({
        delay: 3000,
        startTop: 150,
        startRight: 500,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'center',
        positionY: 'bottom'
    });
    // Interceptor for redirecting to login page if not logged in
<<<<<<< HEAD
    $httpProvider.interceptors.push(['$q', '$location', '$rootScope', '$cookies',function ($q, $location, $rootScope, $cookies) {
=======
    $httpProvider.interceptors.push(function ($q, $location, $rootScope, $cookies) {
>>>>>>> gulp tasks,dependency changes,gitignore
        return {
            'request': function (config) {

                $rootScope.reqloading = true;
                return config;
            },
            'response': function (config) {
                $rootScope.reqloading = false;
                return config;
            },
            'responseError': function (response) {
                if ([400, 401, 402, 403].indexOf(response.status) > -1) {
                    $cookies.remove('token');
                    $location.path('/login');
                    return $q.reject(response);
                }
            }
        };
<<<<<<< HEAD
    }]);
}]);

app.run(['$transitions', '$rootScope', '$cookies',function ($transitions, $rootScope, $cookies) {
=======
    });
});

app.run(function ($transitions, $rootScope, $cookies) {
>>>>>>> gulp tasks,dependency changes,gitignore

    $transitions.onSuccess({to: '*'}, function (to) {
        $rootScope.profilePic = $cookies.get('profilePic');
        $rootScope.type = $cookies.get('type');
        $rootScope.activeTab = to.promise.$$state.value.data.activeTab;
        $rootScope.subTab = to.promise.$$state.value.data.subTab;

    });
<<<<<<< HEAD
}]);
=======
});
>>>>>>> gulp tasks,dependency changes,gitignore

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});


angular.module('paginationService', ['ngTable'])

    .factory('paginationService', function () {
        return {
            pagination: function (tableParams, callback) {
                var sortingProps = tableParams.sorting();
                // for (var prop in sortingProps) {
                //     if(sortingProps[prop] == "asc"){
                //         sortingProps[prop] = 1;
                //     }else if (sortingProps[prop] == "desc"){
                //         sortingProps[prop] = -1;
                //     }
                // }
                console.log("Sorting options are "+ sortingProps);
                callback(sortingProps);
            }
        }
    });
<<<<<<< HEAD
app.directive('adminDatePicker', function () {
=======
app.directive('datePicker', function () {
>>>>>>> gulp tasks,dependency changes,gitignore
    return {
        restrict: 'E',
        scope: {
            ngModel: "=",
            banFuture: "=",
            pastPresent: "=",
            placeholder: "=placeholder",
            class: "=class"
        },
        template: '<div class="pos-relative">\n' +
        '                <span class="date-pick" ng-click="open($event)">' +
        '                  <img src="images/date-icon.png" width="30" height="24" /> </span>\n' +
        '          <input type="text"  readonly class="form-control {{class}}" datepicker-options="options"                                show-button-bar="false" uib-datepicker-popup="{{dateFormat}}" ng-model="ngModel" is-open="opened"                           ng-required="true" ng-click="open($event)" placeholder="{{placeholder}}" />\n' +
        '        </div>\n',
        require: 'ngModel',
        link: function (scope, element, attributes) {
            scope.opened = false;
            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                if (scope.opened) {
                    scope.opened = !scope.opened;
                } else {
                    scope.opened = !scope.opened;
                }
            };
            if (scope.banFuture) {
                scope.options = {
                    showWeeks: false,
                    maxDate: new Date()
                }
            } else if (scope.pastPresent) {
                scope.options = {
                    showWeeks: false
                }
            } else {
                scope.options = {
                    minDate: new Date(),
                    showWeeks: false
                }
            }
        }
    };

});
app.directive('adminleftMenu', function () {
    return {
        restrict: 'E',
        template: '<div class="left-menu"> \n' +
        '        <ul class="list-unstyled">\n' +
        '           <li class="left-menu-li" ui-sref-active="active">' +
        '               <a  ui-sref="{{label | lowercase}}" class="left-menu-anchor" >{{label}}</a> \n' +
        '           </li> \n'+
        '        </ul>\n' +
        '    </div>',
        scope: {label: '@', noSecond: '='},
        link: function() {
            //console.log($state.includes(label | lowercase));
        }
    };
});


app.directive('checkList', function() {
    return {
        scope: {
            list: '=checkList',
            value: '@'
        },
        link: function(scope, elem, attrs) {
            var handler = function(setup) {
                var checked = elem.prop('checked');
                var index = scope.list.indexOf(scope.value);

                if (checked && index == -1) {
                    if (setup) elem.prop('checked', false);
                    else scope.list.push(scope.value);
                } else if (!checked && index != -1) {
                    if (setup) elem.prop('checked', true);
                    else scope.list.splice(index, 1);
                }
            };

            var setupHandler = handler.bind(null, true);
            var changeHandler = handler.bind(null, false);

            elem.bind('change', function() {
                scope.$apply(changeHandler);
            });
            scope.$watch('list', setupHandler, true);
        }
    };
});

app.directive('datePicker', function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: "=",
            banFuture: "=",
            pastPresent: "=",
            placeholder: "=placeholder",
            class: "=class"
        },
        template: '<div class="pos-relative  styling-input-list-trucks">\n' +
        '                <span class="date-pick" ng-click="open($event)">' +
        '                  <img src="images/date-icon.png" width="30" height="24" /> </span>\n' +
        '          <input type="text"  readonly class="form-control {{class}}" datepicker-options="options"                                show-button-bar="false" uib-datepicker-popup="{{dateFormat}}" ng-model="ngModel" is-open="opened"                           ng-required="true" ng-click="open($event)"/>\n' +
        '<label class="focus-effect-for-input-trucks" aria-hidden="true">{{placeholder}}</label> \n' +
        '        </div>\n',
        require: 'ngModel',
        link: function (scope, element, attributes) {
            scope.opened = false;
            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                if (scope.opened) {
                    scope.opened = !scope.opened;
                } else {
                    scope.opened = !scope.opened;
                }
            };
            if (scope.banFuture) {
                scope.options = {
                    showWeeks: false,
                    maxDate: new Date()
                }
            } else if (scope.pastPresent) {
                scope.options = {
                    showWeeks: false
                }
            } else {
                scope.options = {
                    minDate: new Date(),
                    showWeeks: false
                }
            }
        }
    };

});
app.directive('leftMenu', function () {
    return {
        restrict: 'E',
        template: '<div class="left-menu"> \n' +
        '        <ul class="list-unstyled">\n' +
        '           <li  ui-sref-active="active" class="left-menu-li">' +
        '               <a  ui-sref="{{label | lowercase}}" class="left-menu-anchor" >' +
        '               <img src="images/{{label | lowercase}}.png" width="55" height="40">{{label}}</a> \n' +
        '           </li> \n'+
        '        </ul>\n' +
        '    </div>',
        scope: {label: '@', noSecond: '='},
        link: function() {
            //console.log($state.includes(label | lowercase));
        }
    };
});


app.factory('Utils', ['$http', '$cookies',function ($http, $cookies) {
    return {
        isValidEmail: function (email) {
            return _.isString(email) && /^[a-zA-Z]\S*@\S+.\S+/.test(email)
        },
        isValidPassword: function (password) {
            password = password.trim();
            return _.isString(password) && (password.length > 7)
        },
        isLoggedIn: function () {
            return !!$cookies.get('token');
        },
        logout: function () {
            $cookies.remove('token');
            $cookies.remove('editAccounts');
            $cookies.remove('role');
            $cookies.remove('userName');
        },
        isValidPhoneNumber: function(phNumber) {
            return phNumber && /^[1-9]\d{9}$/.test(phNumber);
        }
    }
}]);

app.factory('CommonServices',['$http', function ($http) {
    return {
        login: function (loginData, success, error) {
            $http({
                url: '/v1/group/login',
                method: "POST",
                data: loginData
            }).then(success, error)
        }
    }
}]);