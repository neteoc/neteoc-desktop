(function () {
    'use strict';
    angular.module('neteoc').service('menu', menu);
    menu.$inject = ['$rootScope', '$location', 'Menu', 'currentWindow'];

    function menu($rootScope, $location, Menu, currentWindow) {
        this.init = function () {

            var menu = Menu.buildFromTemplate([{
                label: 'Devices',
                submenu: [{
                    label: 'GPS',
                    submenu: [{
                        label: "Serial Ports",
                        click: function () {
                            $location.path("/serialports");
                            $rootScope.$apply();
                        }
                    }, {
                        label: "Fake Device 2",
                        click: function () {
                            alert('Now Connected To Fake Device 2');
                        }
                    }]
                }]
            },
            {
                label: 'Dev Tools',
                click: function () { currentWindow.webContents.openDevTools(); }
            }
            ]);
            Menu.setApplicationMenu(menu);
        }
    };
})();