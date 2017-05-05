(function() {
    'use strict';
    angular.module("neteoc").controller('serialPortsCtrl', serialPortsCtrl);
    serialPortsCtrl.$inject = ['$scope', '$location', 'serialService'];

    function serialPortsCtrl($scope, $location, serialService) {

        $scope.ports = null;

        $scope.init = function() {
            $scope.ports = serialService.ports;
        };

        $scope.init();
    }

})();