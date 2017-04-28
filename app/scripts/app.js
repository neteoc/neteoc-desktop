(function() {
    'use strict';
    angular.module('neteoc', [
        'ngRoute',
        'angular-electron',
        'ui.bootstrap',
        'ngAnimate',
        'ngTouch',
        "LocalStorageModule",
        "ngAnimate",
    ]);

    angular.module('neteoc').config(['$locationProvider', '$routeProvider', 'localStorageServiceProvider',
        function($locationProvider, $routeProvider, localStorageServiceProvider) {
            $routeProvider.
            when('/', {
                templateUrl: 'views/start.html'
            }).
            when('/map', {
                templateUrl: 'views/map/map.html'
            }).
            otherwise({
                redirectTo: '/'
            });

            $locationProvider.hashPrefix('!');
            $locationProvider.html5Mode({ enabled: false, requireBase: false });
            localStorageServiceProvider.setPrefix('neteoc');
        }
    ]);

    angular.module('neteoc').run(['$rootScope', function($rootScope) {
        $rootScope.stateIsLoading = false;
        $rootScope.stateIsBusy = false;
        $rootScope.$on('$routeChangeStart', function() {
            $rootScope.stateIsLoading = true;
        });
        $rootScope.$on('$routeChangeSuccess', function() {
            $rootScope.stateIsLoading = false;
        });
        $rootScope.$on('$routeChangeError', function() {
            //catch error
        });
    }]);
})();