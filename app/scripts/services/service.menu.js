(function() {
    'use strict';
    angular.module('neteoc').service('menu', menu);
    menu.$inject = ['$rootScope', '$location', 'Menu', 'currentWindow', 'serialService'];

    function menu($rootScope, $location, Menu, currentWindow, serialService) {
        this.init = function() {

            var menu = Menu.buildFromTemplate([{
                    label: 'Devices',
                    submenu: [{
                        label: 'GPS',
                        submenu: [{
                            label: "Fake Device 1",
                            click: function() {
                                alert('Now Connected To Fake Device 1');
                            }
                        }, {
                            label: "Fake Device 2",
                            click: function() {
                                alert('Now Connected To Fake Device 2');
                            }
                        }]
                    }]
                },
                {
                    label: 'Dev Tools',
                    click: function() { currentWindow.webContents.openDevTools(); }
                },
                {
                    label: 'Serial Ports',
                    click: function() {
                        $location.path("/serialports");
                        $rootScope.$apply();
                    }
                }
            ]);
            Menu.setApplicationMenu(menu);
        }
    };
})();