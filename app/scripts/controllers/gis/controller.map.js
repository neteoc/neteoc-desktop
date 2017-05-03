(function() {
    'use strict';
    angular.module("neteoc").controller('mapCtrl', mapCtrl).directive('customOnChange', customOnChange);
    mapCtrl.$inject = ['$scope', 'leafletData', '$uibModal', 'exif'];

    function mapCtrl($scope, leaflet, uibModal, exif) {
    
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
                $scope.addMapMarker(32.837, -83.632, "Welcome to Macon!", false);
            }
        };

        $scope.setMapCenter = function(lat, lng, zoom) {
            $scope.mapCenter = {
                lat: lat,
                lng: lng,
                zoom: zoom
            };
        };

        $scope.addMapMarker = function(lat, lng, message, draggable) {
            $scope.mapMarkers.push({
                id: $scope.generateUUID(),
                lat: lat,
                lng: lng,
                message: message,
                draggable: draggable,
                uploaded: false,
                created: $scope.getCurrentUnixTime(),
                fields: {
                    "first thing": "change me"
                },
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
        }

        $scope.getCurrentUnixTime = function() {

            return (new Date()).getTime()/1000|0;
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
                console.log("I don't think we should be here.");
                $scope.addMapMarker(0, 0, "<a href='#!/'>Hello</a>", false);
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
        }

        $scope.addNewPinField = function() {

            $scope.editingPoi.fields[Object.keys($scope.editingPoi.fields).length + 1] = "change me";
        }

        
        $scope.attachmentAdded = function(event) {
            
            var files = event.target.files;

            if(files.length == 0) {
                return;
            }

            var reader = new FileReader();
            var fileName = files[0].name;

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

        $scope.$on('leafletDirectiveMap.click', $scope.mapClick);

        $scope.init();
    }

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