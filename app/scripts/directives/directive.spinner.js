(function() {
    'use strict';
    angular.module('neteoc')
        .directive('spinner', function() {
            return {
                restrict: 'A',
                transclude: true,
                link: function(scope, element, attrs, controller, transcludeFn) {
                    //observe the swap on value and show and hide as necessary
                    scope.$watch(attrs.spinnerOn, function(value) {
                        var isSwapped = !!value;
                        if (isSwapped) {
                            element.empty();
                            element.append('<div style="text-align: center; margin-top: 50px; margin-bottom: 50px;" class="loading-spinner-container"><i class="fa fa-4x fa-circle-o-notch fa-spin loading-spinner"></i></div>');
                        } else {
                            //this will guarantee the scope remains the same for the transcluded markup
                            transcludeFn(scope, function(clone, scope) {
                                element.empty();
                                element.append(clone);
                            });
                        }
                    });
                },
            };
        });
})();