(function() {
    'use strict';
    var SerialPort = require('serialport');
    angular.module('neteoc').service('serialPorts', serialPorts);
    serialPorts.$inject = ['$rootScope', '$location', 'serialport'];

    function serialPorts($rootScope, $location, serialport) {
        var self = this;

        self.ports = null;

        self.init = function() {
            self.list(function(err, ports) {
                self.ports = ports;
            });
        };

        self.list = function(callback) {
            serialport.list(callback);
        };

        self.open = function(port, baudRate, callback) {
            var p = new SerialPort(port, {
                baudrate: 4800,
                parser: SerialPort.parsers.readline('\n')
            });
            p.on('data', callback);
            return p;
        };

        self.init();
    };
})();