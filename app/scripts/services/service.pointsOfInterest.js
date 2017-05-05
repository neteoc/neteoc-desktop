(function() {
    'use strict';
    angular.module('neteoc').service('pointsOfInterest', pointsOfInterest);
    pointsOfInterest.$inject = [];

    function pointsOfInterest() {
        this.getAll = function() {
            return [];
        }
    };
})();