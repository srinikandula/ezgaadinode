app.directive('scrollDetector', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            console.log(scope,element,)
            var raw = element[0];
            element.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {

                    scope.$apply(attrs.scrollDetector);
                }
            });
        }
    };
});