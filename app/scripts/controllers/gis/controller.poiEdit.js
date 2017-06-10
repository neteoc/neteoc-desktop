(function() {
    'use strict';

    angular.module("neteoc").controller('poiEditController', poiEditController);
    poiEditController.$inject = ['$scope', 'serialPorts', 'gpsService', '$timeout', 'exif'];

    function poiEditController($scope, serialPorts, gpsService, $timeout, exif) {

        $scope.addNewPinField = function() {

            var newFieldNumber = Object.keys($scope.editingPoi.fields).length + 1;

            $scope.editingPoi.fields["field " + newFieldNumber]  = "value " + newFieldNumber;
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
    }

})();