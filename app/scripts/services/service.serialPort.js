(function() {
    'use strict';
    angular.module('neteoc').service('serialPort', serialPort);
    serialPort.$inject = ['$rootScope', '$location', 'SerialPort'];

    function serialPort($rootScope, $location, SerialPort) {

        this.list = function(callback) {
            SerialPort.list(callback);
        };
    };
})();