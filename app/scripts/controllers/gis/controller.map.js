(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl);
    mapCtrl.$inject = ['$scope', 'leafletData', '$uibModal'];

    function mapCtrl($scope, leaflet, uibModal) {
    
        $scope.generateUUID = function() {
            var d = new Date().getTime();
            if(window.performance && typeof window.performance.now === "function"){
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        }

        // TODO: addMapMarker instead. Or don't. Also load from data source. Or don't.
        /*
        $scope.mapMarkers = [{
            lat: 32.837,
            lng: -83.632,
            message: "<a href='#!/'>Hello</a>",
            draggable: false,
            fields: {
                "1": "change me"
            }
        }];
        */

        $scope.mapCenter = {
            lat: 32.837,
            lng: -83.632,
            zoom: 10
        };

        $scope.init = function() {};

        $scope.setMapCenter = function(lat, lng, zoom) {
            $scope.mapCenter = {
                lat: lat,
                lng: lng,
                zoom: zoom
            };
        };

        $scope.mapMarkers = [];

        $scope.addMapMarker = function(lat, lng, message, draggable) {
            $scope.mapMarkers.push({
                id: $scope.generateUUID(),
                lat: lat,
                lng: lng,
                message: message,
                draggable: draggable,
                fields: {
                    "first thing": "change me"
                }
            });
        }

        $scope.deleteMapMarker = function(mapMarker) {

            for(var index in $scope.mapMarkers) {
                console.log(index);

                if($scope.mapMarkers[index].id == mapMarker.id) {
                    $scope.mapMarkers.splice(index, 1);
                }
            }
        }

        $scope.mapClick = function(event, args) {
            $scope.addMapMarker(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, "<a href='#!/'>Hello</a>", false);

            $scope.editPoi($scope.mapMarkers[$scope.mapMarkers.length - 1]);
        };

        /**
         * Functions that need to go in the pointsofinterest service
         */
        $scope.editPoi = function(pointOfInterest) {

            // TODO: Fix when not sleepy ...
            if(pointOfInterest == null) {
                $scope.addMapMarker(0, 0, "<a href='#!/'>Hello</a>", false);
                pointOfInterest = $scope.mapMarkers[$scope.mapMarkers.length - 1];
            }

            $scope.editingPoi = pointOfInterest;

            uibModal.open({
                templateUrl: "views/gis/poiEdit.modal.html",         
                scope: $scope
            });
        }

        $scope.addNewPinField = function() {

            $scope.editingPoi.fields[Object.keys($scope.editingPoi.fields).length + 1] = "change me";
        }

        $scope.$on('leafletDirectiveMap.click', $scope.mapClick);

        $scope.addMapMarker(32.837, -83.632, "Welcome to Macon!", false);

        $scope.init();
    }

})();