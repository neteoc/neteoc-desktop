(function() {
    'use strict';
    angular.module('neteoc').service('kml', kml);
    kml.$inject = [];

    function kml() {
        this.toKml = function(mapMarkers) {
            
            console.log(mapMarkers);

            var kmlString = buildHeader();

            kmlString = buildEntries(kmlString, mapMarkers);

            kmlString = buildFooter(kmlString);

            return kmlString;
        }

        this.buildEntries = function(kmlString, mapMarkers) {

            for(var index in mapMarkers) {

                kmlString += this.buildEntry(mapmarkers[index]);
            }
        }

        this.buildEntry = function(mapMarker) {

            return '<Placemark>\n' +
            // name
            //style url? (is probably marker icon)
            // point
                //coordinates
            '</Placemark>';
        }

        this.buildHeader = function() {

            // TODO: Get name from ... something
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                    '<kml xmlns="http://www.opengis.net/kml/2.2">\n' + 
                    '   <Document>\n' + 
                    '       <name>NetEOC</name>\n' + 
                    '       <description/>\n';
        }

        this.buildHeader = function(kmlString) {

            return kmlString + 
                '   </Document>\n' +
                '</kml>';
        }
    };

})();