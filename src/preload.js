// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

// Define all valid channels in one place for better maintenance
const VALID_SEND_CHANNELS = [
  "toMain",
  "ui:reload",
  "app:nav",
  "app:error",
  "print:debt-acc-trans",
  "print:cash-acc-trans",
  "print:cust-balance",
  "print:cust-trans",
  "print:supp-trans",
  "print:prof-loss",
  "print:summary",
  "print:supplier-balance",
  "print:stock-transaction",
  "print:invoices",
  "print:sales-list",
  "print:invoice",
  "print:cash-transactions",
  "print-pdf"  
];

const VALID_RECEIVE_CHANNELS = [
  "fromMain",
  "app:nav",
  "app:error",
  "print:debt-acc-trans",
  "print:cash-acc-trans",
  "print:cust-balance",
  "print:cust-trans",
  "print:supp-trans",
  "print:prof-loss",
  "print:summary",
  "print:supplier-balance",
  "print:stock-transaction",
  "print:invoices",
  "print:sales-list",
  "print:invoice",
  "print:cash-transactions",
  "print-pdf",
  "print-status", 
  "log-update"    
];

const VALID_INVOKE_CHANNELS = [
  'print-summary', 
  'get-logs'
];

// Store active listeners to support proper cleanup
const activeListeners = new Map();

contextBridge.exposeInMainWorld("electron", {
  notifyAppLoaded: () => {
    ipcRenderer.send('app-loaded');
  },
  
  // Send a message to the main process
  send: (channel, data) => {
    if (VALID_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Set up a listener for messages from the main process
  receive: (channel, func) => {
    if (VALID_RECEIVE_CHANNELS.includes(channel) && typeof func === 'function') {
      // Create a wrapper function that we can keep track of
      const wrappedFunc = (event, ...args) => func(...args);
      
      // Store the mapping between the original function and wrapper
      if (!activeListeners.has(channel)) {
        activeListeners.set(channel, new Map());
      }
      activeListeners.get(channel).set(func, wrappedFunc);
      
      // Add the actual listener
      ipcRenderer.on(channel, wrappedFunc);
    }
  },
  
  // Invoke a method in the main process and wait for the result
  invoke: async (channel, data) => {
    if (VALID_INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return { success: false, error: 'Invalid channel' };
  },
  
  // Remove all listeners for a channel
  removeAllListeners: (channel) => {
    if (VALID_RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      // Clear our tracking for this channel
      if (activeListeners.has(channel)) {
        activeListeners.delete(channel);
      }
    }
  },
  
  // Remove a specific listener from a channel
  removeListener: (channel, listener) => {
    if (VALID_RECEIVE_CHANNELS.includes(channel) && typeof listener === 'function') {
      // Get the wrapped function from our map
      const listenerMap = activeListeners.get(channel);
      if (listenerMap && listenerMap.has(listener)) {
        const wrappedFunc = listenerMap.get(listener);
        // Remove the actual listener
        ipcRenderer.removeListener(channel, wrappedFunc);
        // Clean up our tracking
        listenerMap.delete(listener);
        if (listenerMap.size === 0) {
          activeListeners.delete(channel);
        }
      }
    }
  },
  
  // Update related APIs
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates');
  },
  
  onUpdateStatus: (callback) => {
    if (typeof callback === 'function') {
      ipcRenderer.on('update-status', (event, status) => {
        callback(status);
      });
    }
  },
  
  getFontData: (fontName) => {
    return ipcRenderer.invoke('get-font-data', fontName);
  }
});
