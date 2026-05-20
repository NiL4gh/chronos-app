const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 520,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: 'Chronos',
    autoHideMenuBar: true,
  });

  // check if packaged to decide dev / prod url
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/desktop-helper');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'desktop-helper' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Alt+Shift+T global hotkey to trigger timer
  globalShortcut.register('Alt+Shift+T', () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-shortcut', 'toggle-timer');
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
