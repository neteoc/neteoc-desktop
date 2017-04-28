(function() {
    'use strict';
    angular.module("neteoc").controller('mainCtrl', mainCtrl);
    mainCtrl.$inject = ['$scope'];

    function mainCtrl($scope) {

        $scope.openStreetMapTiles = {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        };

        $scope.init = function() {}

        $scope.init();
    }

})();