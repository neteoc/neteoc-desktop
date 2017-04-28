(function() {
    'use strict';
    angular.module("neteoc").controller('loginCtrl', loginCtrl);
    loginCtrl.$inject = ['$scope', '$location'];

    function loginCtrl($scope, $location) {

        $scope.init = function() {};

        $scope.login = function() {
            $location.path("/map");
        };

        $scope.init();
    }

})();