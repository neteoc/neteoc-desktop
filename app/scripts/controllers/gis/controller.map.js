(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl).directive('customOnChange', customOnChange);
    mapCtrl.$inject = ['$scope', '$uibModal', 'exif', '$uibModalStack', 'leafletData', 'kml', 'fs', 'net', 'gpsService'];

    function mapCtrl($scope, uibModal, exif, $uibModalStack, leafletData, kmlService, fs, net, gpsService) {

        $scope.mapMarkersFileName = "mapMarkers.json";

        $scope.init = function() {

            // TODO: Fix ... ?
            $scope.mapCenter = {
                lat: 32.837,
                lng: -83.632,
                zoom: 10
            };

            $scope.loadMapMarkers();

            if(gpsService.openSerialPorts && Object.keys(gpsService.openSerialPorts).length > 0) {

                // TODO: differentiate user marker
                // TODO: don't show until we get a lat / long
                $scope.userMarker = $scope.addMapMarker(0, 0, "You", "Your last known location", false);
                
                gpsService.onRead(function(data) {
                    if(data.lat && data.lon) {
                        $scope.userMarker.lat = data.lat;
                        $scope.userMarker.lng = data.lon;
                    }
                });
            }
        };

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

            try {
                fs.writeFileSync($scope.mapMarkersFileName,
                    angular.toJson($scope.mapMarkers)
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
            // TODO: creating user

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
    
        $scope.deleteMapMarker = function(mapMarker) {

            for(var index in $scope.mapMarkers) {
                console.log(index);

                if($scope.mapMarkers[index].id == mapMarker.id) {
                    $scope.mapMarkers.splice(index, 1);
                }
            }
            
            $scope.saveMapMarkers();
            $uibModalStack.dismissAll("");
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

        $scope.locationFromDevice = function() {

            // TODO: Flag as 'enabled' or not for UI ...
            // No connection = no can do :(   (this should ideally be improved / resolved ...)

            // TODO: cache location so that API isn't choked
            // https://github.com/electron/electron/issues/7861

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function success(position) {

                    console.log(position);
                    // TODO: if accuracy is above ... something ...

                    // TODO: this doesn't seem to refresh the digest :(
                    $scope.editingPoi.lng = position.coords.longitude;
                    $scope.editingPoi.lat = position.coords.latitude;

                    $scope.$digest();
                    
                }, function error(error) {

                    console.log(error);
                });
            }
        }

        /**
         * Functions that need to go in the pointsofinterest service
         */
        $scope.editPoi = function(pointOfInterest) {

            // TODO: Default values shouldn't be added to map marker list until the user saves the marker?
            if(pointOfInterest == null) {
                console.log("I don't think we should be here.");
                $scope.addMapMarker($scope.mapCenter.lat, $scope.mapCenter.lng, 
                    "name of point", "description of point", true);
                pointOfInterest = $scope.mapMarkers[$scope.mapMarkers.length - 1];
            }

            $scope.editingPoi = pointOfInterest;

            var modelo = uibModal.open({
                templateUrl: "views/gis/poiEdit.modal.html",         
                scope: $scope
            });
            modelo.result.then(function(result){
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

        $scope.addNewPinField = function() {

            $scope.editingPoi.fields[Object.keys($scope.editingPoi.fields).length + 1] = "change me";
        }

        $scope.deletePinField = function(fieldKey) {

            delete $scope.editingPoi.fields[fieldKey];
        }
        
        $scope.attachmentAdded = function(event) {

            if(!$scope.editingPoi || $scope.editingPoi == null) return;
            
            var files = event.target.files;

            if(files.length == 0) return;

            var reader = new FileReader();
            var fileName = files[0].name;
            // TODO: If this guy contains spaces, we're going to have a bad time ...
            $scope.editingPoi.attachments[fileName] = {};

            // TODO: So, for extracting this out to a service, how can I convert a promise to an asynchronous return?
            reader.onload = function(frEvent) {

                var imageSource = frEvent.target.result;

                $scope.editingPoi.attachments[fileName].imageSrc = imageSource;

                $scope.$digest();
            }
            reader.readAsDataURL(files[0]);

            // TODO: Convert to promise or something
            exif.getData(files[0], function() {

                var geoData = exif.getGeoData(this);

                if(geoData[0] == 0) return;

                $scope.editingPoi.attachments[fileName].lat = geoData[0];
                $scope.editingPoi.attachments[fileName].lng = geoData[1];
            });
        }

        $scope.deleteAttachment = function(attachmentName) {

            if(!$scope.editingPoi || $scope.editingPoi == null) return;

            delete $scope.editingPoi.attachments[attachmentName];
        }

        $scope.latLongFromAttachment = function(attachmentName) {

            $scope.editingPoi.lng = $scope.editingPoi.attachments[attachmentName].lng;
            $scope.editingPoi.lat = $scope.editingPoi.attachments[attachmentName].lat;
        }

        $scope.markerClick = function(event, args) {
            
            $scope.editPoi(args.leafletObject.options);
            console.log(args.leafletObject.options);
        }
        $scope.$on('leafletDirectiveMarker.click', $scope.markerClick);

        $scope.centerOnPoint = function(point) {
            
            $scope.setMapCenter(point.lat, point.lng, 10);
        }

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

            var kmlDoc = kmlService.toKml($scope.mapMarkers);

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
