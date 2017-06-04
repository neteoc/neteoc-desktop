(function() {
    'use strict';

    angular.module("neteoc").controller('serialPortsCtrl', serialPortsCtrl);
    serialPortsCtrl.$inject = ['$scope', '$location', 'serialPorts', 'gps'];

    function serialPortsCtrl($scope, $location, serialPorts, gps) {

        $scope.ports = null;
        $scope.selectedPort = "COM1";
        $scope.baudRate = "4800";
        $scope.reads = [];


        $scope.init = function() {
            serialPorts.list(function(err, ports) { 
                $scope.ports = ports;
                if(!$scope.ports) $scope.ports = [];
            });
        };

        $scope.openPort = function(){
            serialPorts.open($scope.selectedPort, $scope.baudRate, function(data){
                gps.update(data);
                //$scope.reads.push(data);
            });
        };

        gps.on('data', function(data) {
            console.log(data, gps.state);
        });

        $scope.init();
    }

})();