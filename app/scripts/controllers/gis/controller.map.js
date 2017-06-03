(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl).directive('customOnChange', customOnChange);
    mapCtrl.$inject = ['$scope', '$uibModal', 'exif', '$uibModalStack', 'leafletData', 'kml'];

    function mapCtrl($scope, uibModal, exif, $uibModalStack, leafletData, kmlService) {

        $scope.init = function() {

            // TODO: Fix ... 
            $scope.mapCenter = {
                lat: 32.837,
                lng: -83.632,
                zoom: 10
            };

            // TODO: load from API ...
            $scope.mapMarkers = JSON.parse(localStorage.getItem("mapMarkers")) || [];

            if($scope.mapMarkers.length == 0) {
                $scope.addMapMarker(32.837, -83.632, "Maconga", "Welcome to Macon!", false);
            }
        };
    
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
            $scope.mapCenter = {
                lat: lat,
                lng: lng,
                zoom: zoom
            };
        };

        // TODO: There needs to be an 'add' function to add the object,
        // and the map (leaflet) specific data (like click and drag) should be separate ...
        $scope.addMapMarker = function(lat, lng, name, description, draggable) {
            $scope.mapMarkers.push({
                id: $scope.generateUUID(),
                lat: lat,
                lng: lng,
                name: name,
                description: description,
                draggable: draggable,
                uploaded: false,
                created: $scope.getCurrentUnixTime(),
                fields: { },
                attachments: {}
            });

            localStorage.setItem("mapMarkers", angular.toJson($scope.mapMarkers));
        }
    
        $scope.deleteMapMarker = function(mapMarker) {

            for(var index in $scope.mapMarkers) {
                console.log(index);

                if($scope.mapMarkers[index].id == mapMarker.id) {
                    $scope.mapMarkers.splice(index, 1);
                }
            }
            
            localStorage.setItem("mapMarkers", angular.toJson($scope.mapMarkers));
            $uibModalStack.dismissAll("");
        }

        $scope.getCurrentUnixTime = function() {

            return (new Date()).getTime()/1000|0;
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
                    "name of point", "description of point", false);
                pointOfInterest = $scope.mapMarkers[$scope.mapMarkers.length - 1];
            }

            $scope.editingPoi = pointOfInterest;

            uibModal.open({
                templateUrl: "views/gis/poiEdit.modal.html",         
                scope: $scope
            });
        }

        $scope.savePoi = function(pointOfInterest) {

            // TODO: When edit is made, save / upload the edit ...
            localStorage.setItem("mapMarkers", angular.toJson($scope.mapMarkers));

            $uibModalStack.dismissAll("");
        }

        $scope.addNewPinField = function() {

            $scope.editingPoi.fields[Object.keys($scope.editingPoi.fields).length + 1] = "change me";
        }

        $scope.deletePinField = function(fieldKey) {

            delete $scope.editingPoi.fields[fieldKey];
        }
        
        $scope.attachmentAdded = function(event) {
            
            var files = event.target.files;

            if(files.length == 0) {
                return;
            }

            var reader = new FileReader();
            var fileName = files[0].name;

            // TODO: So, for extracting this out to a service, how can I convert a promise to an asynchronous return?
            reader.onload = function(frEvent) {

                console.log(frEvent);
                // console.log(frEvent.target.result);
                document.getElementById("imagePreview").innerHTML = '<img width="100px" height="100px" src="'+frEvent.target.result+'" />';
                // document.getElementById("imagePreview").style.backgroundImage = 'url("'+frEvent.target.result+'")';

                $scope.editingPoi.attachments[fileName] = frEvent.target.result;
            }
            reader.readAsDataURL(files[0]);
            
            // if has geo data, allow to set lat long from image

            // TODO: Convert to promise or something
            exif.getData(files[0], function() {

                var geoData = exif.getGeoData(this);

                if(geoData[0] == 0) {
                    return;
                }

                console.log(geoData);

/*
                vm.hasLatLongFromImage = true;
                vm.imageLatLong = {

                    "name" :  this.name,
                    "latitude" : geoData[0],
                    "longitude" : geoData[1],
                    "set" : function () {
                        vm.newPin.position.latitude = vm.imageLatLong.latitude;
                        vm.newPin.position.longitude = vm.imageLatLong.longitude;
                    }
                }
*/

                $scope.$digest();
            });
        }

        // $scope.$on('leafletDirectiveMap.click', $scope.mapClick);

        $scope.markerClick = function(event, args) {
            
            $scope.editPoi(args.leafletObject.options);
            console.log(args.leafletObject.options);
        }
        $scope.$on('leafletDirectiveMarker.click', $scope.markerClick);
        
        $scope.saveKml = function() {

            leafletData.getMarkers().then(function(arg1) {
                
                console.log(arg1);
                console.log($scope.mapMarkers);

                var kmlDoc = kmlService.toKml($scope.mapMarkers);

                // TODO: KML Mappings (timestamp, etc.)
                // TODO: KML Properties (document name, should probably be like the name of the incident)

                // var kmlDoc = tokml($scope.geojson.data);

                var dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(kmlDoc);
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "neteoc.kml");
                dlAnchorElem.click();
            });
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