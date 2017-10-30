app.directive('datePicker', function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: "="
        },
        template: '<div class="input-group">\n' +
        '          <input type="text" readonly class="form-control" datepicker-options="options" show-button-bar="false" uib-datepicker-popup="{{dateFormat}}" ng-model="ngModel" is-open="opened" ng-required="true"  />\n' +
        '          <span class="input-group-btn">\n' +
        '            <button type="button" class="btn btn-default" ng-click="open($event)">' +
        '<i class="glyphicon glyphicon-calendar"></i></button>\n' +
        '          </span>\n' +
        '        </div>\n',
        require: 'ngModel',
        link: function (scope) {
            scope.opened=false;
            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                if(scope.opened){
                    scope.opened=!scope.opened;
                }else{
                    scope.opened = !scope.opened;
                }
            };

            scope.options = {
                minDate: new Date(),
                showWeeks: false
            }

        }
    };
});