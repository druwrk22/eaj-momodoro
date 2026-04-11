const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressServer = require('./app'); 

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true 
    });

    mainWindow.loadURL('http://localhost:8080');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});