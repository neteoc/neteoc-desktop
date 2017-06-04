(function() {
    'use strict';

    angular.module("neteoc").controller('serialPortsCtrl', serialPortsCtrl);
    serialPortsCtrl.$inject = ['$scope', '$location', 'serialPorts', 'gps'];

    function serialPortsCtrl($scope, $location, serialPorts, gps) {

        $scope.ports = null;
        $scope.selectedPort = "COM1";
        $scope.baudRate = "4800";
        $scope.reads = [];

        $scope.GPS = new gps;


        $scope.init = function() {
            serialPorts.list(function(err, ports) { 
                $scope.ports = ports;
                if(!$scope.ports) $scope.ports = [];
            });
        };

        $scope.openPort = function(){
            serialPorts.open($scope.selectedPort, $scope.baudRate, function(data){
                $scope.GPS.update(data);
                //$scope.reads.push(data);
            });
        };

        $scope.GPS.on('data', function(data) {
            console.log(data, $scope.GPS.state);
        });

        $scope.init();
    }

})();