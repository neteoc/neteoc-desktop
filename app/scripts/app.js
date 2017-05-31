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
        "datatables",
        "xeditable"
    ]);

    angular.module('neteoc').config(['$locationProvider', '$routeProvider', '$logProvider', 'localStorageServiceProvider', 'remoteProvider',
        function($locationProvider, $routeProvider, $logProvider, localStorageServiceProvider, remoteProvider) {

            // TODO: It would be nice to figure out self-registration if possible
            $routeProvider.
            when('/', {
                templateUrl: 'views/dashboard.html'
            }).
            when('/gis', {
                templateUrl: 'views/gis/map.html'
            }).
            when('/serialports', {
                templateUrl: 'views/system/serialPorts.html'
            }).
            otherwise({
                redirectTo: '/'
            });

            $locationProvider.hashPrefix('!');
            $locationProvider.html5Mode({ enabled: false, requireBase: false });
            localStorageServiceProvider.setPrefix('neteoc');

            // disable annoying leaflet debug logging
            $logProvider.debugEnabled(false);

            //register node modules as angular modules
            // remoteProvider.register("serialport");
        }
    ]);

    angular.module('neteoc').run(['$rootScope', 'editableOptions', 'menu', function($rootScope, editableOptions, menu) {
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
        editableOptions.theme = 'bs3';

        //set leaflet image path and tiles
        L.Icon.Default.imagePath = 'vendor/leaflet/dist/images/';
        $rootScope.openStreetMapTiles = {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        };

        //set up menu
        menu.init();
    }]);
})();