(function () {
    'use strict';
    angular.module('neteoc').service('menu', menu);
    menu.$inject = ['$rootScope', '$location', 'Menu', 'currentWindow', 'os'];

    function menu($rootScope, $location, Menu, currentWindow, os) {
        this.init = function () {

            // var os = require('os');

            var mapMenu = {
                label: 'Map',
                click: function () {
                    $location.path("/gis");
                    $rootScope.$apply();
                }
            };

            var settingsMenu = {
                label: 'Settings',
                click: function () {
                    $location.path("/settings");
                    $rootScope.$apply();
                }
            };

            var mapMenuLinux = {
                label: 'Settings',
                submenu: [{
                    label: 'Mandatory extra Linux button',
                    click: function () {
                        $location.path("/gis");
                        $rootScope.$apply();
                    }
                }]
            };

            var settingsMenuLinux = {
                label: 'Settings',
                submenu: [{
                    label: 'Linux is broken so here\'s an unneccessary submenu',
                    click: function () {
                        $location.path("/settings");
                        $rootScope.$apply();
                    }
                }]
            };

            if(os.platform() == "linux") {
                var menuTemplate = [
                    mapMenuLinux,
                {
                    label: 'Dev Tools',
                    click: function () { currentWindow.webContents.openDevTools(); }
                },
                settingsMenuLinux
                ];

            } else {
                var menuTemplate = [
                    mapMenu,
                {
                    label: 'Dev Tools',
                    click: function () { currentWindow.webContents.openDevTools(); }
                },
                settingsMenu
                ];
            }

            Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
        }
    };
})();