console.log('Version: ' + process.versions.node);

const electron = require('electron')
    // Module to control application life.
const app = electron.app
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
    //module for the menu
const Menu = electron.Menu

const path = require('path')
const url = require('url')

// The following does not work. Best explanation found is: https://github.com/electron/electron/issues/8647
const NG_INSPECTOR = 'aadgmnobpdmgmigaicncghmmoeflnamj';

// const { default: installExtension, ANGULARJS_BATARANG } = require('electron-devtools-installer');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {

    /*
    installExtension(ANGULARJS_BATARANG)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    */

        // from https://github.com/electron/electron/blob/master/docs/api/environment-variables.md
    process.env.GOOGLE_API_KEY = "AIzaSyAQI1ROikSRhdOJusM9R-hFbTmFULxfEns";

    var menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        icon: path.join(__dirname, 'app/icons/png/64x64.png')
    });
    // mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    /*
    for(var index in process.env) {

        console.log(index);
        // console.log(process.env[index]);
    }
    */

    var localUserName = process.env["USER"] || process.env["USERNAME"];

    console.log("Local user is " + localUserName);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.