(function() {
    'use strict';
    angular.module('neteoc').service('logger', logger);
    logger.$inject = [];

    function logger() {
        this.log = function(entry) {
            console.log(entry);
        }
    };
})();