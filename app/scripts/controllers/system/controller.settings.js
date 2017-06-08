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

        $scope.maxReads = 32;
        $scope.gpsReads = 0;

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

        $scope.openPort = function() {

            if($scope.openSerialPorts() && $scope.openSerialPorts().length > 0) {
                // TODO
                alert("Sorry, right now we can't cleanly handle multiple open attempts ...");
            }

            $scope.clearPort();

            gpsService.onRead(function(data) {

                if(gpsService.guessGPSState(data).isWorking) {

                    $scope.serialConfigurationWorks = true;

                    // TODO: unsubscribe self instead of clear all
                    gpsService.clearEvents();
                } else {
                    if($scope.gpsReads >= $scope.maxReads) {

                        gpsService.clearEvents();

                        console.log("Unable to establish working GPS connection after " +
                            $scope.gpsReads + " attempts. Last packet received: ");
                        console.log(data);
                    } else {
                        $scope.gpsReads++;
                    }
                }

                // TODO: close port ...
            })

            gpsService.setPort($scope.selectedPort, $scope.baudRate);
        };

        $scope.clearPort = function() {

            // TODO: close port if open ...

            // TODO: unsub rather than clear all ...
            gpsService.clearEvents();
            $scope.gpsReads = 0;
        }

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

            // loop through serial ports
            // try assumed baud rate 
        }

        $scope.openSerialPorts = function() {
            return gpsService.openSerialPorts;
        }

        $scope.init();
    }

})();