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
        template: '<div class="pos-relative">\n' +
        '                <span class="date-pick" ng-click="open($event)">' +
        '                  <img src="images/date-icon.png" width="30" height="24" /> </span>\n' +
        '          <input type="text"  readonly class="form-control {{class}}" datepicker-options="options"                                show-button-bar="false" uib-datepicker-popup="{{dateFormat}}" ng-model="ngModel" is-open="opened"                           ng-required="true"/>\n' +
        '<label class="focus-effect-for-input" aria-hidden="true">{{placeholder}}</label> \n' +
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