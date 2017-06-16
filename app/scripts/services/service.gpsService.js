(function() {
    'use strict';
    angular.module('neteoc').service('gpsService', gpsService);
    gpsService.$inject = ['$rootScope', '$location', 'serialPorts', 'gps'];

    function gpsService($rootScope, $location, serialPorts, gps) {

        var self = this;
        self.GPS = new gps;
        self.readCallbacks = [];
        self.openSerialPorts = {};

        self.state = {};

        self.init = function() {

            self.state.hasSerial = false;
            self.state.serialParseable = false;
            self.state.hasLat = false;
            
            var savedConfig = JSON.parse(localStorage.getItem("gpsSerialConfiguration")) || null;

            if(savedConfig) {

                self.setPort(savedConfig.selectedSerialPort, savedConfig.baudRate);
            }
        };

        self.setPort = function(port, baud) {
            
            if(!baud) baud = 4800;

            var openPort = serialPorts.open(port, baud, self.readSerial);

            if(openPort != null) self.openSerialPorts[port] = openPort;
        };

        self.onRead = function(callback){
            self.readCallbacks.push(callback);
        };

        self.clearEvents = function(){
            self.readCallbacks = [];
        };

        self.closeSerialPort = function(port) {

            serialPorts.close(self.openSerialPorts[port]);

            delete self.openSerialPorts[port];
        };

        // TODO: usubscribe individual event (may be easier if callbacks were an object with keys ...)

        self.readSerial = function(data) {

            self.state.hasSerial = true;

            var updateSucceeded = self.GPS.update(data);

            if(updateSucceeded) self.state.serialParseable = true;
        };

        self.readGPS = function(data) {

            if(data.lat) self.state.hasLat = true;

            self.triggerCallbacks(self.GPS.state);
        };
        self.GPS.on('data', self.readGPS);

        self.triggerCallbacks = function(data){
            for(var i = 0; i < self.readCallbacks.length; i++){
                self.readCallbacks[i](data);
            }
        };

        self.gpsState = function() {

            return self.state;
        }

        self.init();
    };
})();