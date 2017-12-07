app.directive('topNavigation', function () {
    return {
        restrict: 'E',
        template: '<div class="container-fluid">\n' +
        '    <div class="row">\n' +
        '        <div class="col-xs-12">\n' +
        '            <div class="col-sm-push-2 col-sm-10">\n' +
        '                <div class="body-nav">\n' +
        '                    <ul class="list-inline">\n' +
<<<<<<< e718be0b4c1860274409936403077615bafe4a3f
        '                        <li ng-class="{selected: activeTab === \'dashboard\'}" ui-sref="dashboard">                                                          <a href="#" >FMS</a></li>\n' +
        '                        <li><a href="#">GPS Listing</a></li>\n' +
        '                        <li ng-class="{selected: activeTab === \'groupMap\'}" ui-sref="groupMap">                                                            <a href="#">Group Map</a></li>\n' +
        '                            <li ng-class="{selected: activeTab === \'trackMap\'}" ui-sref="trackMap">                                                        <a href="#">Track Map</a></li>\n' +
=======
        '                        <li ng-class="{selected: activeTab === \'dashboard\'}" ui-sref="dashboard">                                <a href="#" >FMS</a></li>\n' +
        '                        <li><a href="#">GPS Listing</a></li>\n' +
        '                        <li ng-class="{selected: activeTab === \'groupMap\'}" ui-sref="groupMap">                                  <a href="#">Group Map</a></li>\n' +
        '                            <li ng-class="{selected: activeTab === \'trackMap\'}" ui-sref="trackMap">                                     <a href="#">Track Map</a></li>\n' +
>>>>>>> pull request
        '                        <li><a href="#">Create Group</a></li>\n' +
        '                        <li><a href="#">Trips</a></li>\n' +
        '                        <li><a href="#">Reports</a></li>\n' +
        '                        <li><a href="#">Loads</a></li>\n' +
        '                    </ul> \n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>'
    };
});