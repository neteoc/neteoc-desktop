(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl);
    mapCtrl.$inject = ['$scope', 'leafletData'];

    function mapCtrl($scope, leaflet) {

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
        };

        $scope.$on('leafletDirectiveMap.click', $scope.mapClick);

        $scope.init();
    }

})();