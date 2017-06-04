(function() {
    'use strict';
    var SerialPort = require('serialport');
    angular.module('neteoc').service('serialPorts', serialPorts);
    serialPorts.$inject = ['$rootScope', '$location', 'serialport'];

    function serialPorts($rootScope, $location, serialport) {
        var self = this;

        self.init = function() {
            
        };

        self.list = function(callback) {
            serialport.list(callback);
        };

        self.open = function(port, baudRate, callback) {
            var p = new SerialPort(port, {
                baudrate: baudRate,
                parser: SerialPort.parsers.readline('\n')
            });
            p.on('data', callback);
            return p;
        };

        self.init();
    };
})();