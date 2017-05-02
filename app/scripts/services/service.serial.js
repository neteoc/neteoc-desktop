(function() {
    'use strict';
    angular.module('neteoc').service('serial', serial);
    serial.$inject = ['$rootScope', '$location'];

    function serial($rootScope, $location) {

        // this.list = function(callback){
        //     serialport.list(callback);
        // };
    };
})();