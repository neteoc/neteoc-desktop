(function() {
    'use strict';
    angular.module('neteoc').service('markerFiles', markerFiles);
    markerFiles.$inject = ['fs'];

    function markerFiles(fs) {

        var self = this;
        self.mapMarkersFileName = "mapMarkers.json";

        self.markersToFile = function(mapMarkers) {

            try {
                fs.writeFileSync(self.mapMarkersFileName,
                    angular.toJson(mapMarkers)
                );
            }
            catch(e) { 
                console.log("Couldn't save file.");
                console.log(e);
            }
        };

        self.markersFromFile = function() {            

            try {
                var text = fs.readFileSync(self.mapMarkersFileName, 'utf8');
                var result = JSON.parse(text) || [];
            } catch (ex) {
                if(ex.message.indexOf("no such file or directory") == -1) {
                    console.log(ex);
                }
            }

            if(!result || result.constructor !== Array) {   // Validation, of a kind ...
                result = [];
            }

            return result;
        };

        self.downloadFile = function(filename, filecontents) {

            var dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(filecontents);

            var downloadAnchor = document.createElement("a");
            downloadAnchor.style = "display: none";
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", filename);
            
            downloadAnchor.click();
            downloadAnchor.remove();
        }
    }

})();