(function() {
    'use strict';
    angular.module('neteoc').service('api', api);
    api.$inject = ['$rootScope', '$resource', '$http', 'config', 'logger'];

    function api($rootScope, $resource, $http, config, logger) {

        this.get = function(location, query) {
            var queryString = this.prepareQueryString(query);
            var endpoint = config.apihost + location + "?" + queryString;
            return $http.get(endpoint, this.getConfig())
                .then(function(response) {
                    return response.data;
                }, logger.log);
        };

        this.post = function(location, data, query) {
            var queryString = this.prepareQueryString(query);
            var endpoint = config.apihost + location + "?" + queryString;
            return $http.post(endpoint, data, this.getConfig())
                .then(function(response) {
                    return response.data;
                }, logger.log);
        };

        this.delete = function(location, query) {

            var queryString = this.prepareQueryString(query);
            var endpoint = config.apihost + location + "?" + queryString;

            return $http.delete(endpoint, this.getConfig())
                .then(function(response) {
                    return response.data;
                }, logger.log);
        }

        this.prepareQueryString = function(query) {
            if (!query) query = {};
            var qs = "";
            for (var key in query) {
                if (query[key]) {
                    if (qs != "") qs += "&";
                    qs += key.toString() + "=" + query[key].toString();
                }
            }
            return qs;
        };

        this.getConfig = function() {
            if ($rootScope.token) {
                return {
                    headers: {
                        'Authorization': $rootScope.token.token
                    }
                }
            } else {
                return {}
            }
        }
    };
})();