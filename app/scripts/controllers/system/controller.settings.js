(function() {
    'use strict';

    angular.module("neteoc").controller('settingsCtrl', settingsCtrl);
    settingsCtrl.$inject = ['$scope', 'serialPorts', 'gpsService', '$timeout'];

    function settingsCtrl($scope, serialPorts, gpsService, $timeout) {

        // TOOD: ... device lists ...
        $scope.ports;
        $scope.selectedPort;
        $scope.baudRate = 4800;
        $scope.reads = [];
        $scope.addingSerialDevice = false;
        $scope.serialConfigurationWorks = true;

        $scope.init = function() {
            serialPorts.list(function(err, ports) { 

                $timeout(function() {   // ask angular kindly to re-digest after this
                    $scope.ports = ports;
                    if(!$scope.ports) $scope.ports = [];
                }, 1);
            });

            // TODO: this should be global, not in this controller ...
            var savedConfig = JSON.parse(localStorage.getItem("gpsSerialConfiguration")) || null;

            if(savedConfig) {
                $scope.selectedPort = savedConfig.selectedPort;
                $scope.baudRate = savedConfig.baudRate;

                $scope.openPort();
            }
        };

        $scope.openPort = function(){

            // TODO: Still doesn't get angular to friggin digest right. Guh, Tina!
            $timeout(function() {   // ask angular kindly to re-digest after this
                gpsService.setPort($scope.selectedPort, $scope.baudRate);
            }, 1);
        };

        $scope.maxReads = 32;
        $scope.gpsReads = 0;

        gpsService.onRead(function(data) {

            // TODO: we may want to give this a few tries ...
            if(data.lat) {
                $scope.serialConfigurationWorks = true;

                // TODO: unsubscribe self instead of clear all
                gpsService.clearEvents();
            } else {
                console.log(data);

                if($scope.gpsReads == $scope.maxReads) {
                    gpsService.clearEvents();
                } else {
                    $scope.gpsReads++;
                }
            }

            // TODO: close port ...
        })

        // TODO: Close port

        $scope.setPort = function() {

            // multiple entries ... won't work ...
            localStorage.setItem("gpsSerialConfiguration", JSON.stringify({
                selectedPort: $scope.selectedPort,
                baudRate: $scope.baudRate
            }));

            alert("You did a save! Go use your thingy now!");
        }

        $scope.addSerialDevice = function() {

            $scope.addingSerialDevice = true;
        }

        $scope.addTCPDevice = function() {

            alert("TODO: Coming soon");
        }

        $scope.autoConfigure = function() {

        }

        $scope.init();
    }

})();