(function() {
    'use strict';

    angular.module("neteoc").controller('settingsCtrl', settingsCtrl);
    settingsCtrl.$inject = ['$scope', 'serialPorts', 'gpsService', '$timeout', '$location'];

    function settingsCtrl($scope, serialPorts, gpsService, $timeout, $location) {

        // TOOD: ... device lists ...
        $scope.ports;
        $scope.selectedSerialPort;
        $scope.baudRate = 4800;
        $scope.reads = [];
        $scope.addingSerialDevice = false;
        $scope.serialConfigurationWorks = false;
        $scope.testingSerialDevice = false;
        
        $scope.addingTCPDevice = false;
        $scope.selectedTCPAddress = "192.168.0.1";
        $scope.selectTCPPort = 50000;

        $scope.maxReads = 32;
        $scope.gpsReads = 0;

        $scope.init = function() {

            $scope.ports = [];
            var openPortNames = Object.keys($scope.openSerialPorts());

            serialPorts.list(function(err, ports) {

                $timeout(function() {   // ask angular kindly to re-digest after this

                    for(var port in ports) {

                        var portAlreadyOpen = jQuery.inArray(ports[port].comName, openPortNames) != -1;

                        if(!portAlreadyOpen) $scope.ports.push(ports[port]);
                    }

                    if($scope.ports && $scope.ports.length > 0) {
                        jQuery( document ).ready(function() {
                            $scope.selectedSerialPort = jQuery("#serialConfiguration select option:last").val();
                        });
                    }
                }, 1);
            });
        };

        $scope.testPort = function() {

            if($scope.openSerialPorts() && Object.keys($scope.openSerialPorts()).length > 0) {
                // TODO
                alert("Sorry, right now we can't cleanly handle multiple open attempts ...");
            }

            $scope.clearPort();

            $scope.testingSerialDevice = true;

            gpsService.onRead(function(data) {

                if(gpsService.gpsState().serialParseable) {
                        
                    $timeout(function() {   // this is getting really annoying
                        $scope.serialConfigurationWorks = true;
                    }, 1);

                    $scope.clearPort();
                } else {

                    $scope.gpsReads++;

                    if($scope.gpsReads >= $scope.maxReads) {

                        $scope.clearPort();

                        console.log("Unable to establish working GPS connection after " +
                            $scope.gpsReads + " attempts. Last packet received: ");
                        console.log(data);
                    }
                }
            });

            gpsService.setPort($scope.selectedSerialPort, $scope.baudRate);
        };

        $scope.clearPort = function() {

            $scope.testingSerialDevice = false;

            gpsService.closeSerialPort($scope.selectedSerialPort);

            // TODO: unsub rather than clear all ...
            gpsService.clearEvents();
            $scope.gpsReads = 0;
            $scope.serialConfigurationWorks = false;
        }

        $scope.setSerialPort = function() {

            gpsService.setPort($scope.selectedSerialPort, $scope.baudRate);

            // multiple entries ... won't work ...
            localStorage.setItem("gpsSerialConfiguration", JSON.stringify({
                selectedSerialPort: $scope.selectedSerialPort,
                baudRate: $scope.baudRate
            }));

            var goToMap = confirm("Device configuration saved! It will remain connected through application restarts.\n"
            + " Would you like to go back to the map page?");

            if(goToMap) {
                $location.path("/gis");
            } else {
                $scope.init();
            }
        }

        $scope.addSerialDevice = function() {

            $scope.addingSerialDevice = true;
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

            alert("Not tonight, my friend.");

            // loop through serial ports
            // try assumed baud rate 
        }

        $scope.troubleshoot = function(serialDevice) {

            console.log(serialDevice);
        }

        $scope.removeSerialDevice = function(serialDevice) {

            gpsService.closeSerialPort(serialDevice.path);

            // TODO: handle multiple devices ...
            localStorage.removeItem("gpsSerialConfiguration");
        }

        $scope.openSerialPorts = function() {
            return gpsService.openSerialPorts;
        }

        $scope.init();
    }

})();