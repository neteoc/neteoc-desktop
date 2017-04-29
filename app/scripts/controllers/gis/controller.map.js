(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl);
    mapCtrl.$inject = ['$scope', 'leafletData', '$uibModal'];

    function mapCtrl($scope, leaflet, uibModal) {

        $scope.mapMarkers = [{
            lat: 32.837,
            lng: -83.632,
            message: "<a href='#!/'>Hello</a>",
            draggable: false
        }];

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

        $scope.addMapMarker = function(lat, lng, message, draggable) {
            $scope.mapMarkers.push({
                lat: lat,
                lng: lng,
                message: message,
                draggable: draggable
            });
        }

        $scope.mapClick = function(event, args) {
            $scope.addMapMarker(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, "<a href='#!/'>Hello</a>", false);

            $scope.editPoi($scope.mapMarkers[$scope.mapMarkers.length - 1]);
        };

        /**
         * Functions that need to go in the pointsofinterest service
         */
        $scope.editPoi = function(pointOfInterest) {

            $scope.editingPoi = pointOfInterest;

            uibModal.open({
                templateUrl: "views/gis/poiEdit.modal.html",         
                scope: $scope
            });
        }

        $scope.$on('leafletDirectiveMap.click', $scope.mapClick);

        $scope.init();
    }

})();