(function() {
    'use strict';
    angular.module('neteoc').service('serialPort', serialPort);
    serialPort.$inject = ['$rootScope', '$location', 'Serial'];

    function serialPort($rootScope, $location, Serial) {

        // this.list = function(callback){
        //     serialport.list(callback);
        // };
    };
})();