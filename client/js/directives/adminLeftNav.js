app.directive('adminleftMenu', function () {
    return {
        restrict: 'E',
        template: '<div class="left-menu"> \n' +
        '        <ul class="list-unstyled">\n' +
        '           <li class="left-menu-li">' +
        '               <a  ui-sref="{{label | lowercase}}" class="left-menu-anchor" ui-sref-active="active">{{label}}</a> \n' +
        '           </li> \n'+
        '        </ul>\n' +
        '    </div>',
        scope: {label: '@', noSecond: '='},
        link: function() {
            //console.log($state.includes(label | lowercase));
        }
    };
});

