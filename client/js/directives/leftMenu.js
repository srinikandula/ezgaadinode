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

