(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl).directive('customOnChange', customOnChange);
    mapCtrl.$inject = ['$scope', '$uibModal', '$uibModalStack', 'leafletData',
        'kml', 'exif', 'gpsService', 'markerFiles'];

    function mapCtrl($scope, uibModal, $uibModalStack, leafletData,
            kmlService, exif, gpsService, markerFiles) {

        $scope.userMarker = null;

        $scope.init = function() {

            // TODO: Save last center on exit ...
            // TODO: Fix ... ?
            $scope.mapCenter = {
                lat: 32.837,
                lng: -83.632,
                zoom: 10
            };

            $scope.loadMapMarkers();

            if(gpsService.openSerialPorts && Object.keys(gpsService.openSerialPorts).length > 0) {

                $scope.registerGPSListener();
            }
        };

        $scope.registerGPSListener = function() {
                
            gpsService.onRead(function(data) {
                if(data.lat && data.lon) {

                    if($scope.userMarker == null) {
                        $scope.userMarker = $scope.addMapMarker(0, 0, "You", "Your last known location", false);
                    }

                    $scope.userMarker.lat = data.lat;
                    $scope.userMarker.lng = data.lon;
                }
            });
        };

        $scope.loadMapMarkers = function() {

            // TODO: load from API ...

            $scope.mapMarkers = markerFiles.markersFromFile();

            if($scope.mapMarkers.length == 0) {
                $scope.addMapMarker(32.837, -83.632, "Maconga", "Welcome to Macon!", true);
            }
        };

        $scope.setMapCenter = function(lat, lng, zoom) {

            if(!zoom) zoom = $scope.mapCenter.zoom;

            $scope.mapCenter = {
                lat: lat,
                lng: lng,
                zoom: zoom
            };
        };

        // TODO: There needs to be an 'add' function to add the object,
        // and the map (leaflet) specific data (like click and drag) should be separate ...
        $scope.addMapMarker = function(lat, lng, name, description, draggable) {

            var newMapMarker = {
                id: $scope.generateUUID(),
                lat: lat,
                lng: lng,
                name: name,
                description: description,
                draggable: draggable,
                uploaded: false,
                created: $scope.getCurrentUnixTime(),
                modified: $scope.getCurrentUnixTime(),
                fields: { },
                attachments: {}
            };
            $scope.mapMarkers.push(newMapMarker);

            return newMapMarker;
        };

        $scope.editPoi = function(pointOfInterest) {

            // TODO: Default values shouldn't be added to map marker list until the user saves the marker?
            if(pointOfInterest == null) {
                $scope.addMapMarker($scope.mapCenter.lat, $scope.mapCenter.lng, 
                    "new map marker", "description of point", true);
                pointOfInterest = $scope.mapMarkers[$scope.mapMarkers.length - 1];
            }

            $scope.editingPoi = pointOfInterest;

            uibModal.open({
                templateUrl: "views/gis/poiEdit.modal.html",
                controller: "poiEditController",
                scope: $scope
            }).result.then(function(result){
                // TODO: if editing a POI and the values are not the defaults, are you sure you want to cancel?
            }, function(err){});
        };

        $scope.savePoi = function(pointOfInterest) {

            if(pointOfInterest == null) pointOfInterest = $scope.editingPoi;
            if($scope.editingPoi == null) return;

            pointOfInterest.modified = $scope.getCurrentUnixTime();

            // TODO: When edit is made, save / upload the edit ...

            markerFiles.markersToFile($scope.getMarkersToSave());

            $uibModalStack.dismissAll("");
        };
    
        $scope.deleteMapMarker = function(mapMarker) {

            for(var index in $scope.mapMarkers) {

                if($scope.mapMarkers[index].id == mapMarker.id) {
                    $scope.mapMarkers.splice(index, 1);
                }
            }
            
            markerFiles.markersToFile($scope.getMarkersToSave());
            $uibModalStack.dismissAll("");
        };

        /**
         * Leaflet functions
         */

         // Yes, this sucks, but nothing else worked
        window.sillyCenterAlias = function(lat, lng) {

            $scope.setMapCenter(lat, lng);
        }

        window.sillyAddMarkerAlias = function(lat, lng) {

            $scope.editPoi($scope.addMapMarker(lat, lng, "new map marker", "description of point", true));
        }

        $scope.mapContextMenu = function(event, args) {

            console.log("test");

            // TODO: ng-click no work :(
            var popup = L.popup()
                .setContent(args.leafletEvent.latlng.lat + ", " + args.leafletEvent.latlng.lng + "<hr />"
                + '<a ng-click="" onClick="sillyAddMarkerAlias(' 
                    + args.leafletEvent.latlng.lat + ', '
                    + args.leafletEvent.latlng.lng + ')">New marker here</a>'
                + '<br /><a ng-click="" onClick="sillyCenterAlias(' 
                    + args.leafletEvent.latlng.lat + ', '
                    + args.leafletEvent.latlng.lng + ')">Center on this position</a>')
                .setLatLng([args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng]);

            leafletData.getMap().then(function(map) {
                map.openPopup(popup);
            });
        };
        $scope.$on('leafletDirectiveMap.contextmenu', $scope.mapContextMenu);

        $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {

            markerFiles.markersToFile($scope.getMarkersToSave());
        });

        $scope.$on('leafletDirectiveMarker.click', function(event, args) {

            $scope.editPoi(args.leafletObject.options);
        });

        /**
         * File functions
         */
        
        $scope.saveKml = function() {

            markerFiles.downloadFile("neteoc.kml", 
                kmlService.toKml($scope.getMarkersToSave()));
        }

        $scope.getMarkersToSave = function() {

            var markersToSave = [];

            for(var markerIndex in $scope.mapMarkers) {
                
                if($scope.mapMarkers[markerIndex] != $scope.userMarker) {
                    markersToSave.push($scope.mapMarkers[markerIndex]);
                }
            }

            return markersToSave;
        }

        /**
         * Helper functions
         */    
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

        $scope.militaryDateFormat = function(date) {

            if(!date) return "";

            var newDate = new Date();
            newDate.setTime(date);
            
            return newDate.getDay() + "-"
                + newDate.getMonth() + " "
                + newDate.getHours()
                + newDate.getMinutes();
        }

        $scope.getCurrentUnixTime = function() {

            return (new Date()).getTime()/1000|0;
        }

        $scope.init();
    }

// TODO: Darrell says input / file should support ng-change (but it didn't work with a quick test)
    function customOnChange() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        }
    }

})();
