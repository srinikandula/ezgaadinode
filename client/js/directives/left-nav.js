app.directive('leftNavigation', function () {
    return {
        restrict: 'E',
        template: ' <div class="left-nav">\n' +
        '        <ul class="list-unstyled">\n' +
        '            \n' +
        '            <account-directive></account-directive>\n' +
        '            <user-directive></user-directive>\n' +
        '            <driver-directive></driver-directive>\n' +
        '            <truck-directive></truck-directive>\n' +
        '            <trip-directive></trip-directive>\n' +
        '            <party-directive></party-directive>\n' +
        '            <maintenance-directive></maintenance-directive>\n' +
        '            <lane-directive></lane-directive>\n' +
        '        </ul>\n' +
        '    </div>'
    };
});

app.directive('accountDirective',function () {
   return{
       restrict: 'E',
       template: '<li class="left-nav-li"> \n' +
       '             <a class="left-nav-anchor" ui-sref="accounts">Accounts</a>\n' +
       '          </li>'
   } ;
});

app.directive('userDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="users">Users</a>\n' +
        '          </li>'
    } ;
});

app.directive('driverDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="drivers">Drivers</a>\n' +
        '          </li>'
    } ;
});

app.directive('truckDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="trucks">Trucks</a>\n' +
        '          </li>'
    } ;
});

app.directive('tripDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="trips">Trips</a>\n' +
        '          </li>'
    } ;
});

app.directive('partyDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="party">Party</a>\n' +
        '          </li>'
    } ;
});

app.directive('maintenanceDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="maintenance">Maintenance</a>\n' +
        '          </li>'
    } ;
});

app.directive('laneDirective',function () {
    return{
        restrict: 'E',
        template: '<li class="left-nav-li"> \n' +
        '             <a class="left-nav-anchor" ui-sref="tripsLane">Trip Lane</a>\n' +
        '          </li>'
    } ;
});
