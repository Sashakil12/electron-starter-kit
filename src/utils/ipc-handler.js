import { ipcMain } from "electron";
import { logger } from "./logger.js";

// Cache to prevent excessive logging of the same request
const requestCache = new Map();

// Channels that should never be logged to prevent feedback loops
const NEVER_LOG_CHANNELS = ['get-logs'];

/**
 * Registers an IPC handler with error handling and logging
 * @param {string} channel - The IPC channel to handle
 * @param {Function} handler - The handler function
 * @param {Object} options - Options for the handler
 * @param {boolean} [options.notifyRenderer=true] - Whether to notify the renderer of the result
 * @param {string} [options.notificationChannel] - The channel to send notifications on (defaults to channel + '-status')
 * @param {boolean} [options.logRequests=true] - Whether to log each request
 */
export function registerIpcHandler(channel, handler, options = {}) {
  const notifyRenderer = options.notifyRenderer !== false;
  const notificationChannel = options.notificationChannel || `${channel}-status`;
  const logRequests = options.logRequests !== false && !NEVER_LOG_CHANNELS.includes(channel);

  // Only log registration if it's not a special channel
  if (!NEVER_LOG_CHANNELS.includes(channel)) {
    logger.info(`Registering IPC handler for channel: ${channel}`);
  }
  
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      // Only log if enabled and not a frequent request
      if (logRequests) {
        const cacheKey = `${channel}:${JSON.stringify(args)}`;
        const now = Date.now();
        const lastLog = requestCache.get(cacheKey) || 0;
        
        // Only log if it's been more than 5 seconds since the last identical request
        if (now - lastLog > 5000) {
          logger.info(`Handling IPC request: ${channel}`, { args });
          requestCache.set(cacheKey, now);
          
          // Clean up old cache entries
          if (requestCache.size > 100) {
            const oldEntries = [...requestCache.entries()]
              .filter(([_, timestamp]) => now - timestamp > 60000)
              .map(([key]) => key);
            
            oldEntries.forEach(key => requestCache.delete(key));
          }
        }
      }
      
      const result = await handler(event, ...args);
      
      if (notifyRenderer) {
        event.sender.send(notificationChannel, {
          success: true,
          message: `Operation ${channel} completed successfully`,
          data: result
        });
      }
      
      return { success: true, data: result };
    } catch (error) {
      // Only log errors if it's not a special channel
      if (!NEVER_LOG_CHANNELS.includes(channel)) {
        logger.error(`Error handling IPC request: ${channel}`, {
          error: error.message,
          stack: error.stack
        });
      }
      
      if (notifyRenderer) {
        event.sender.send(notificationChannel, {
          success: false,
          message: error.message
        });
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  });
}

/**
 * Unregisters an IPC handler
 * @param {string} channel - The IPC channel to unregister
 */
export function unregisterIpcHandler(channel) {
  if (!NEVER_LOG_CHANNELS.includes(channel)) {
    logger.info(`Unregistering IPC handler for channel: ${channel}`);
  }
  ipcMain.removeHandler(channel);
}
