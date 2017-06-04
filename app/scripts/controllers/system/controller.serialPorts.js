(function() {
    'use strict';
    angular.module("neteoc").controller('serialPortsCtrl', serialPortsCtrl);
    serialPortsCtrl.$inject = ['$scope', '$location', 'serialPorts'];

    function serialPortsCtrl($scope, $location, serialPorts) {

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
                $scope.reads.push(data);
            });
        };

        $scope.init();
    }

})();