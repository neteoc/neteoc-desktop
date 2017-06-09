(function() {
    'use strict';
    angular.module('neteoc').service('gpsService', gpsService);
    gpsService.$inject = ['$rootScope', '$location', 'serialPorts', 'gps'];

    function gpsService($rootScope, $location, serialPorts, gps) {
        var self = this;
        self.GPS = new gps;
        self.readCallbacks = [];
        self.openSerialPorts = {};

        self.init = function() {
            
            var savedConfig = JSON.parse(localStorage.getItem("gpsSerialConfiguration")) || null;

            if(savedConfig) {

                self.setPort(savedConfig.selectedPort, savedConfig.baudRate);
            }
        };

        self.setPort = function(port, baud) {
            if(!baud) baud = 4800;
            self.openSerialPorts[port] = serialPorts.open(port, baud, self.readSerial);
        };

        self.onRead = function(callback){
            self.readCallbacks.push(callback);
        };

        self.clearEvents = function(){
            self.readCallbacks = [];
        };

        // TODO: usubscribe individual event (may be easier if callbacks were an object with keys ...)

        self.readSerial = function(data){
            self.GPS.update(data);
        };

        self.readGPS = function(data){
            self.triggerCallbacks(self.GPS.state);
        };
        self.GPS.on('data', self.readGPS);

        self.triggerCallbacks = function(data){
            for(var i = 0; i < self.readCallbacks.length; i++){
                self.readCallbacks[i](data);
            }
        };

        // TODO: perhaps onRead could allow a parameter that would process this in the resposne ...
        self.guessGPSState = function(data) {

            var gpsState = { isWorking: false };

            if(data.lat) {
                gpsState.isWorking = true;
                gpsState.hasSignal = true;
                gpsState.formatUnderstandable = true;
            } else if(data) {
                
                // ...
            }

            return gpsState;
        };

        self.init();
    };
})();