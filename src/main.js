import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import printSummary from "./summary.js"
import { logger } from './utils/logger.js';
import { registerIpcHandler } from './utils/ipc-handler.js';

console.log("main file run>>>>>>>>>>>>>>>>>>>>>>>>")
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow

const createWindow = () => {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Debounce function to limit log updates
let logUpdateTimeout = null;
function debounceLogUpdate(callback, delay = 500) {
  if (logUpdateTimeout) {
    clearTimeout(logUpdateTimeout);
  }
  logUpdateTimeout = setTimeout(() => {
    callback();
    logUpdateTimeout = null;
  }, delay);
};

// Wrap the original logger methods to emit events when logs are added
const originalInfo = logger.info;
const originalError = logger.error;
const originalWarn = logger.warn;

logger.info = function(message, details = null) {
  originalInfo.call(this, message, details);
  if (mainWindow && mainWindow.webContents) {
    // Only send log-update if it's been at least 1 second since the last log request
    // or if this is the first log since the last request
    if (logger.getTimeSinceLastRequest() > 1000 || logger.logUpdateCount === 1) {
      debounceLogUpdate(() => {
        mainWindow.webContents.send('log-update');
      });
    }
  }
};

logger.error = function(message, error = null) {
  originalError.call(this, message, error);
  if (mainWindow && mainWindow.webContents) {
    // Always notify immediately for errors
    debounceLogUpdate(() => {
      mainWindow.webContents.send('log-update');
    }, 100); // Use a shorter delay for errors
  }
};

logger.warn = function(message, details = null) {
  originalWarn.call(this, message, details);
  if (mainWindow && mainWindow.webContents) {
    // Only send log-update if it's been at least 1 second since the last log request
    // or if this is the first log since the last request
    if (logger.getTimeSinceLastRequest() > 1000 || logger.logUpdateCount === 1) {
      debounceLogUpdate(() => {
        mainWindow.webContents.send('log-update');
      });
    }
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  // Register IPC handlers
  registerIpcHandler('get-logs', () => {
    return logger.getRecentLogs();
  }, { logRequests: false });
  
  registerIpcHandler('print-summary', async () => {
    return await printSummary();
  });
  
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
