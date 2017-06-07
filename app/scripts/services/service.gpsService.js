(function() {
    'use strict';
    angular.module('neteoc').service('gpsService', gpsService);
    gpsService.$inject = ['$rootScope', '$location', 'serialPorts', 'gps'];

    function gpsService($rootScope, $location, serialPorts, gps) {
        var self = this;
        self.GPS = new gps;
        self.readCallbacks = [];

        self.init = function() {

        };

        self.setPort = function(port, baud) {
            if(!baud) baud = 4800;
            serialPorts.open(port, baud, self.readSerial);
        };

        self.onRead = function(callback){
            self.readCallbacks.push(callback);
        };

        self.clearEvents = function(){
            self.readCallbacks = [];
        };

        // TODO: usubscribe individual event

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
        self.init();
    };
})();