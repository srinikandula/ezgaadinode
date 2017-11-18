app.directive('leftNavigation', function () {
    return {
        restrict: 'E',
        template: ' <div class="left-nav">\n' +
        '        <ul class="list-unstyled">\n' +
        '            \n' +
        '            <account-directive></account-directive>\n' +
        '            <group-directive></group-directive>\n' +
        '            <driver-directive></driver-directive>\n' +
        '            <truck-directive></truck-directive>\n' +
        '            <trip-directive></trip-directive>\n' +
        '            <party-directive></party-directive>\n' +
        '            <expense-master-directive></expense-master-directive>\n' +
        '            <expenses-directive></expenses-directive>\n' +
        '            <payments-directive></payments-directive>\n'+
        '            <pending-balance-directive></pending-balance-directive>\n' +
        '            <expiry-directive></expiry-directive>\n' +
        '        </ul>\n' +
        '    </div>'
    };
});

app.directive('accountDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'accounts\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="accounts">Accounts</a>\n' +
        '          </li>'
    };
});
app.directive('groupDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'groups\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="groups">Groups</a>\n' +
        '          </li>'
    };
});
app.directive('driverDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'drivers\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="drivers">Drivers</a>\n' +
        '          </li>'
    };
});

app.directive('rolesDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'roles\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="roles">Roles</a>\n' +
        '          </li>'
    };
});

app.directive('truckDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'trucks\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="trucks">Trucks</a>\n' +
        '          </li>'
    };
});

app.directive('tripDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'trips\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="trips">Trips</a>\n' +
        '          </li>'
    };
});

app.directive('partyDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'party\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="party">Party</a>\n' +
        '          </li>'
    };
});


app.directive('expenseMasterDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'expenseMaster\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="expenseMaster">Expense Master</a>\n' +
        '          </li>'
    };
});


app.directive('expensesDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'expenses\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="expenses">Expenses</a>\n' +
        '          </li>'
    };
});

app.directive('paymentsDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'paymentsReceived\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="paymentsReceived">Payments Received</a>\n' +
        '          </li>'
    };
});

app.directive('pendingBalanceDirective', function () {
    return {
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'pendingBalance\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="pendingBalance">Pending Balance</a>\n' +
        '          </li>'
    };
});

app.directive('expiryDirective',function () {
    return{
        restrict: 'E',
        template: '<li ng-class="{selected: activeTab === \'expiry\'}" class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="expiry">Expiry</a>\n' +
        '          </li>'
    } ;
});


