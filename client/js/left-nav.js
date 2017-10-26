app.directive('leftNavigation', function () {
    return {
        restrict: 'E',
        template: ' <div class="left-nav">\n' +
        '        <ul class="list-unstyled">\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="accounts">Accounts</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="users">Users</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="drivers">Drivers</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="trucks">Trucks</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="trips">Trips</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="party">Party</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="maintenance">Maintenance Cost</a>\n' +
        '            </li>\n' +
        '            <li class="left-nav-li">\n' +
        '                <a class="left-nav-anchor" ui-sref="tripsLane">Trip Lane</a>\n' +
        '            </li>\n' +
        '        </ul>\n' +
        '    </div>',
        link: function(scope){
                scope.navigate = function (x) {
                    console.log('eroor',x);
                    $state.go('drivers')
                }
        }
    };
});
