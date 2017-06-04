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

        self.setPort = function(port) {
            serialPorts.open(port, 4800, self.readSerial);
        };

        self.onRead = function(callback){
            self.readCallbacks.push(callback);
        };

        self.clearEvents = function(){
            self.readCallbacks = [];
        };

        self.readSerial = function(data){
            $scope.GPS.update(data);
        };

        self.readGPS = function(data){
            self.triggerCallbacks(self.GPS.state);
        };
        $scope.GPS.on('data', self.readGPS);

        self.triggerCallbacks = function(data){
            for(var i = 0; i < readCallbacks.length; i++){
                readCallbacks[i](data);
            }
        };
        self.init();
    };
})();