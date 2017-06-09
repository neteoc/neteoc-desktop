(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl).directive('customOnChange', customOnChange);
    mapCtrl.$inject = ['$scope', '$uibModal', 'fs', '$uibModalStack', 'leafletData', 'net', '$timeout',
        'kml', 'exif', 'gpsService'];

    function mapCtrl($scope, uibModal, fs, $uibModalStack, leafletData, net, $timeout,
            kmlService, exif, gpsService) {

        $scope.mapMarkersFileName = "mapMarkers.json";
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

                    $timeout(function() {   // ask angular kindly to re-digest after this
                        $scope.userMarker.lat = data.lat;
                        $scope.userMarker.lng = data.lon;
                    }, 1);
                }
            });
        }

        $scope.loadMapMarkers = function() {

            // TODO: load from API ...
            $scope.mapMarkers = [];

            try {
                var text = fs.readFileSync($scope.mapMarkersFileName, 'utf8');
                $scope.mapMarkers = JSON.parse(text) || [];
            } catch (ex) {
                if(ex.message.indexOf("no such file or directory") == -1) {
                    console.log(ex);
                }
            }

            if($scope.mapMarkers.constructor !== Array) {   // Validation, of a kind ...
                $scope.mapMarkers = [];
            }

            if($scope.mapMarkers.length == 0) {
                $scope.addMapMarker(32.837, -83.632, "Maconga", "Welcome to Macon!", true);
            }
        }

        $scope.saveMapMarkers = function() {

            var markersToSave = [];

            for(var markerIndex in $scope.mapMarkers) {
                
                if($scope.mapMarkers[markerIndex] != $scope.userMarker) {
                    markersToSave.push($scope.mapMarkers[markerIndex]);
                }
            }

            try {
                fs.writeFileSync($scope.mapMarkersFileName,
                    angular.toJson(markersToSave)
                );
            }
            catch(e) { 
                console.log("Couldn't save file.");
                console.log(e);
            }
        }
    
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

        $scope.setMapCenter = function(lat, lng, zoom) {
            if(!zoom) zoom = $scope.mapCenter;
            $scope.mapCenter = {
                lat: lat,
                lng: lng,
                zoom: zoom
            };
        };

        $scope.centerOnPoint = function(point) {
            
            $scope.setMapCenter(point.lat, point.lng, 10);
        }

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

        $scope.locationFromTCPServer = function() {

            var ip = "192.168.0.107";
            var port = 50000;
            var myConnection = net.connect(port, ip);
            myConnection.on("data", $scope.umLikeDataReceivedOrWhatever);
        }

        $scope.umLikeDataReceivedOrWhatever = function(data) {

            data = data.toString('utf8');
            console.log(data);
        }

        $scope.editPoi = function(pointOfInterest) {

            // TODO: Default values shouldn't be added to map marker list until the user saves the marker?
            if(pointOfInterest == null) {
                console.log("I don't think we should be here.");
                $scope.addMapMarker($scope.mapCenter.lat, $scope.mapCenter.lng, 
                    "name of point", "description of point", true);
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
        }

        $scope.savePoi = function(pointOfInterest) {

            if(pointOfInterest == null) pointOfInterest = $scope.editingPoi;
            if($scope.editingPoi == null) return;

            pointOfInterest.modified = $scope.getCurrentUnixTime();

            // TODO: When edit is made, save / upload the edit ...

            $scope.saveMapMarkers();

            $uibModalStack.dismissAll("");
        }
    
        $scope.deleteMapMarker = function(mapMarker) {

            for(var index in $scope.mapMarkers) {

                if($scope.mapMarkers[index].id == mapMarker.id) {
                    $scope.mapMarkers.splice(index, 1);
                }
            }
            
            $scope.saveMapMarkers();
            $uibModalStack.dismissAll("");
        }

        $scope.markerClick = function(event, args) {
            
            $scope.editPoi(args.leafletObject.options);
            console.log(args.leafletObject.options);
        }
        $scope.$on('leafletDirectiveMarker.click', $scope.markerClick);

        $scope.mapClick = function(event, args) {

            // TODO: ng-click no work :(
            var popup = L.popup()
                .setContent(args.leafletEvent.latlng.lat + ", " + args.leafletEvent.latlng.lng + "<hr />"
                + '<a onClick="alert(\'hi\');">New marker here</a>'
                + '<br /><a ng-click="centerOnPoint({lat: \'' 
                    + args.leafletEvent.latlng.lat + '\',lng: \''
                    + args.leafletEvent.latlng.lng + '\'})">Center on this position</a>')
                .setLatLng([args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng]);
            
            leafletData.getMap().then(function(map) {
                map.openPopup(popup);
                $scope.$digest;
            });
        };
        $scope.$on('leafletDirectiveMap.contextmenu', $scope.mapClick);

        $scope.dragEnd = function(event, args) {

            $scope.saveMapMarkers();
        }

        $scope.$on('leafletDirectiveMarker.dragend', $scope.dragEnd);
        
        $scope.saveKml = function() {

            var markersToSave = [];

            for(var markerIndex in $scope.mapMarkers) {
                
                if($scope.mapMarkers[markerIndex] != $scope.userMarker) {
                    markersToSave.push($scope.mapMarkers[markerIndex]);
                }
            }

            var kmlDoc = kmlService.toKml(markersToSave);

            // TODO: KML Mappings (timestamp, etc.)
            // TODO: KML Properties (document name, should probably be like the name of the incident)

            // TODO: I'll bet we can extract this to a file downloader service
            var dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(kmlDoc);
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "neteoc.kml");
            dlAnchorElem.click();
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
