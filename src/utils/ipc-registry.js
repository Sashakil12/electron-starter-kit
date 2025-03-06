/**
 * Centralized IPC handler registration
 * This file manages all IPC handler registrations to prevent duplicate handlers
 */
import { logger } from './logger.js';
import { registerIpcHandler, unregisterIpcHandler } from './ipc-handler.js';
import printSummary from '../summary.js';

// Track registered handlers
const registeredHandlers = new Set();

/**
 * Register an IPC handler if not already registered
 * @param {string} channel - The IPC channel name
 * @param {Function} handler - The handler function
 * @param {Object} options - Options for the handler
 * @returns {boolean} - Whether the handler was registered
 */
export function registerHandler(channel, handler, options = {}) {
  if (registeredHandlers.has(channel)) {
    logger.info(`IPC handler for '${channel}' already registered, skipping`);
    return false;
  }

  registerIpcHandler(channel, handler, options);
  registeredHandlers.add(channel);
  logger.info(`Registered IPC handler for channel: ${channel}`);
  return true;
}

/**
 * Unregister an IPC handler
 * @param {string} channel - The IPC channel name
 */
export function unregisterHandler(channel) {
  try {
    if (registeredHandlers.has(channel)) {
      unregisterIpcHandler(channel);
      registeredHandlers.delete(channel);
      // Don't log here to avoid potential issues during shutdown
    }
  } catch (error) {
    // Silent catch - during shutdown some objects may already be destroyed
    console.error(`Error unregistering handler for ${channel}:`, error);
  }
}

/**
 * Unregister all handlers - useful for cleanup
 */
export function unregisterAllHandlers() {
  try {
    const handlersToUnregister = [...registeredHandlers];
    for (const channel of handlersToUnregister) {
      try {
        unregisterIpcHandler(channel);
      } catch (error) {
        // Silent catch - during shutdown some objects may already be destroyed
        console.error(`Error unregistering handler for ${channel}:`, error);
      }
    }
    registeredHandlers.clear();
  } catch (error) {
    // Silent catch - during shutdown some objects may already be destroyed
    console.error('Error unregistering all handlers:', error);
  }
}

/**
 * Register all application IPC handlers
 */
export function registerAllHandlers() {
  // Register 'get-logs' handler
  registerHandler('get-logs', async () => {
    try {
      const logs = logger.getRecentLogs();
      // Ensure we're returning an array
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      logger.error("Error fetching logs", error);
      return [];
    }
  }, { logRequests: false });

  // Register 'print-summary' handler
  registerHandler('print-summary', async () => {
    return await printSummary();
  });
}

// Setup cleanup on process exit
process.on('exit', () => {
  try {
    unregisterAllHandlers();
  } catch (error) {
    // Silent catch - during shutdown some objects may already be destroyed
    console.error('Error during exit cleanup:', error);
  }
});
