"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
let mainWindow;
const mainMenuTpl = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Create AR-App',
                click() {
                    changeMainWindowContent('CreateAR');
                },
            },
            {
                label: 'Create PhoneGap-App',
                click() {
                    changeMainWindowContent('CreatePhoneGapApp');
                },
            },
            {
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                label: 'Quit',
                click() {
                    electron_1.app.quit();
                },
            },
        ],
    },
];
initializeApp();
// add dev tools when not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTpl.push({
        label: 'DevTools',
        submenu: [{
                accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
                label: 'Toggle DevTools',
                click() {
                    mainWindow.toggleDevTools();
                },
            }],
    });
}
function initializeApp() {
    electron_1.app.on('ready', () => {
        createMainWindow();
        // xrSession = new XRSession();
    });
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
}
function changeMainWindowContent(content) {
    let file = '';
    switch (content) {
        case 'CreateAR':
            file = 'ar/ar.html';
            break;
        case 'CreatePhoneGapApp':
            file = 'phonegap/phonegap-create.html';
            break;
        default:
            break;
    }
    mainWindow.loadFile(path.join(__dirname, '../templates/' + file));
}
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        height: 900,
        webPreferences: {
            experimentalCanvasFeatures: true,
            experimentalFeatures: true,
            nodeIntegration: true,
            plugins: true,
            webSecurity: false,
        },
        width: 1200,
    });
    // app.commandLine.appendSwitch('--enable-webxr');
    // app.commandLine.appendSwitch('--enable-webxr-hit-test');
    const mainMenu = electron_1.Menu.buildFromTemplate(mainMenuTpl);
    electron_1.Menu.setApplicationMenu(mainMenu);
    mainWindow.loadFile(path.join(__dirname, '../templates/index.html'));
    mainWindow.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
//# sourceMappingURL=index.js.map