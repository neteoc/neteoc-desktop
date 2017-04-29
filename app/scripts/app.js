(function() {
    'use strict';
    angular.module('neteoc', [
        'ngRoute',
        'angular-electron',
        'nemLogging',
        'ui.bootstrap',
        'ngAnimate',
        'ngTouch',
        "LocalStorageModule",
        'leaflet-directive',
        "datatables"
    ]);

    angular.module('neteoc').config(['$locationProvider', '$routeProvider', 'localStorageServiceProvider',
        function($locationProvider, $routeProvider, localStorageServiceProvider) {
            $routeProvider.
            when('/', {
                templateUrl: 'views/dashboard.html'
            }).
            when('/gis', {
                templateUrl: 'views/gis/map.html'
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

        //set leaflet image path and tiles
        L.Icon.Default.imagePath = 'vendor/leaflet/dist/images/';
        $rootScope.openStreetMapTiles = {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        };
    }]);
})();