(function() {
    'use strict';

    angular.module("neteoc").controller('settingsCtrl', settingsCtrl);
    settingsCtrl.$inject = ['$scope', 'serialPorts', 'gps', 'gpsService', '$timeout'];

    function settingsCtrl($scope, serialPorts, gps, gpsService, $timeout) {

        $scope.ports;
        $scope.selectedPort = "COM1";
        $scope.baudRate = 4800;
        $scope.reads = [];

        $scope.GPS = new gps;

        $scope.init = function() {
            serialPorts.list(function(err, ports) { 

                $timeout(function() {   // ask angular kindly to re-digest after this
                    $scope.ports = ports;
                    if(!$scope.ports) $scope.ports = [];
                }, 1);
            });

            // $scope.mapMarkers = JSON.parse(localStorage.getItem("mapMarkers")) || [];
        };

        $scope.openPort = function(){
            serialPorts.open($scope.selectedPort, $scope.baudRate, function(data){
                $scope.GPS.update(data);
                $scope.reads.push(data);
            });
        };

        // TODO: Close port

        $scope.setPort = function() {

            gpsService.setPort($scope.selectedPort, $scope.baudRate);

            // localStorage.setItem("mapMarkers", angular.toJson($scope.mapMarkers));
        }

        $scope.init();
    }

})();