app.directive('topNavigation', function () {
    return {
        restrict: 'E',
        template: '<div class="container-fluid">\n' +
        '    <div class="row">\n' +
        '        <div class="col-xs-12">\n' +
        '            <div class="col-sm-push-2 col-sm-10">\n' +
        '                <div class="body-nav">\n' +
        '                    <ul class="list-inline">\n' +
        '                        <li class="active" ui-sref="accounts"><a href="#" style="color: #fff;" >FMS</a></li>\n' +
        '                        <li><a href="#">GPS Listing</a></li>\n' +
        '                        <li><a href="#">Group Map</a></li>\n' +
        '                        <li><a href="#">Track Map</a></li>\n' +
        '                        <li><a href="#">Create Group</a></li>\n' +
        '                        <li><a href="#">Trips</a></li>\n' +
        '                        <li><a href="#">Reports</a></li>\n' +
        '                        <li><a href="#">Loads</a></li>\n' +
        '                    </ul>          \n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>'
    };
});