(function() {
    'use strict';

    angular.module("neteoc").controller('settingsCtrl', settingsCtrl);
    settingsCtrl.$inject = ['$scope', 'serialPorts', 'gps', 'gpsService', '$timeout'];

    function settingsCtrl($scope, serialPorts, gps, gpsService, $timeout) {

        // TOOD: ... device lists ...
        $scope.ports;
        $scope.selectedPort;
        $scope.baudRate = 4800;
        $scope.reads = [];
        $scope.addingSerialDevice = false;
        $scope.serialConfigurationWorks = true;

        $scope.GPS = new gps;

        $scope.init = function() {
            serialPorts.list(function(err, ports) { 

                $timeout(function() {   // ask angular kindly to re-digest after this
                    $scope.ports = ports;
                    if(!$scope.ports) $scope.ports = [];
                }, 1);
            });

            // TODO: this should be global, not in this controller ...
            var savedConfig = JSON.parse(localStorage.getItem("gpsSerialConfiguration")) || null;

            // TODO: add to device list ...
            if(savedConfig) {
                $scope.selectedPort = savedConfig.selectedPort;
                $scope.baudRate = savedConfig.baudRate;

                gpsService.setPort($scope.selectedPort, $scope.baudRate);
            }
        };

        $scope.openPort = function(){

            gpsService.setPort($scope.selectedPort, $scope.baudRate);

            /*
            serialPorts.open($scope.selectedPort, $scope.baudRate, function(data){
                $scope.GPS.update(data);
                // $scope.reads.push(data);
            });
            */
        };

        gpsService.onRead(function(data) {

            // TODO: we may want to give this a few tries ...
            if(data.lat) {
                console.log("Got lat");
                $scope.serialConfigurationWorks = true;
            } else {
                console.log(data.lat);
                console.log(data.lat());
                console.log(data);
            }

            // TODO: unsubscribe self instead of clear all
            gpsService.clearEvents();

            // TODO: close port ...
        })

        // TODO: Close port

        $scope.setPort = function() {

            // multiple entries ... won't work ...
            localStorage.setItem("gpsSerialConfiguration", {
                selectedPort: $scope.selectedPort,
                baudRate: $scope.baudRate
            });

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