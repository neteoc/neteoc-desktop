(function() {
    'use strict';
    angular.module('neteoc').service('serialService', serialService);
    serialService.$inject = ['$rootScope', '$location', 'serialport'];

    function serialService($rootScope, $location, serialport) {
        var self = this;

        self.ports = null;

        self.init = function() {
            self.list(function(err, ports) { self.ports = ports; })
        };

        self.list = function(callback) {
            serialport.list(callback);
        };

        self.init();
    };
})();