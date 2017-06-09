(function() {
    'use strict';

    angular.module("neteoc").controller('settingsCtrl', settingsCtrl);
    settingsCtrl.$inject = ['$scope', 'serialPorts', 'gpsService', '$timeout'];

    function settingsCtrl($scope, serialPorts, gpsService, $timeout) {

        // TOOD: ... device lists ...
        $scope.ports;
        $scope.selectedSerialPort;
        $scope.baudRate = 4800;
        $scope.reads = [];
        $scope.addingSerialDevice = false;
        $scope.serialConfigurationWorks = true;
        
        $scope.addingTCPDevice = false;
        $scope.selectedTCPAddress = "192.168.0.1";
        $scope.selectTCPPort = 50000;

        $scope.maxReads = 32;
        $scope.gpsReads = 0;

        $scope.init = function() {
            serialPorts.list(function(err, ports) { 

                $timeout(function() {   // ask angular kindly to re-digest after this
                    $scope.ports = ports;
                    if(!$scope.ports) $scope.ports = [];
                }, 1);
            });
        };

        $scope.openPort = function() {

            if($scope.openSerialPorts() && Object.keys($scope.openSerialPorts()).length > 0) {
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

            gpsService.setPort($scope.selectedSerialPort, $scope.baudRate);
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
                selectedSerialPort: $scope.selectedSerialPort,
                baudRate: $scope.baudRate
            }));

            alert("You did a save! Go use your thingy now!");
        }

        $scope.addSerialDevice = function() {

            $scope.addingSerialDevice = true;
        }

        $scope.troubleshoot = function(serialDevice) {

            console.log(serialDevice);
        }

        $scope.addTCPDevice = function() {

            $scope.addingTCPDevice = true;
        }

        $scope.connectToTCPServer = function() {

            var myConnection = net.connect($scope.selectTCPPort, $scope.selectedTCPAddress);
            myConnection.on("data", $scope.tcpDataReceived);
        };

        $scope.tcpDataReceived = function(data) {

            data = data.toString('utf8');
            console.log(data);
        };

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