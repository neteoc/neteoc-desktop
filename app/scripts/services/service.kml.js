(function() {
    'use strict';
    angular.module('neteoc').service('kml', kml);
    kml.$inject = [];

    function kml() {
        this.toKml = function(mapMarkers) {
            
            console.log(mapMarkers);

            // TODO: This should really be more of like a builder with a string output ...

            var kmlString = this.buildHeader();

            kmlString = this.buildEntries(kmlString, mapMarkers);

            kmlString = this.buildFooter(kmlString);

            return kmlString;
        }

        this.buildEntries = function(kmlString, mapMarkers) {

            for(var index in mapMarkers) {

                kmlString += this.buildEntry(mapMarkers[index]);
            }

            return kmlString;
        }

        this.buildEntry = function(mapMarker) {

            // TODO: If property is empty, skip it ...

            return '<Placemark>\n' +
                '   <name>' + mapMarker.name + '</name>\n' +
                '   <description>' + mapMarker.description + '</description>\n' +
                //style url? (is probably marker icon)
                '   <Point>\n' +
                '       <coordinates>\n' +
                '           ' + mapMarker.lng + ',' + mapMarker.lat + '\n' +
                '       </coordinates>' +
                '   </Point>\n' +
            '</Placemark>\n';
        }

        this.buildHeader = function() {

            // TODO: Get name from ... something
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                    '<kml xmlns="http://www.opengis.net/kml/2.2">\n' + 
                    '   <Document>\n' + 
                    '       <name>NetEOC</name>\n' + 
                    '       <description/>\n';
        }

        this.buildFooter = function(kmlString) {

            return kmlString + 
                '   </Document>\n' +
                '</kml>';
        }
    };

})();