import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to invoke an Electron IPC method and manage its state
 * @param {string} channel - The IPC channel to invoke
 * @param {any} initialData - Initial data state
 * @returns {Array} - [data, loading, error, invokeMethod]
 */
export function useIpcInvoke(channel, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const invokeMethod = useCallback(async (args = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.invoke(channel, args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error(`Error invoking ${channel}:`, err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [channel]);

  return [data, loading, error, invokeMethod];
}

/**
 * Hook to listen for Electron IPC events
 * @param {string} channel - The IPC channel to listen on
 * @param {Function} callback - Callback function when event is received
 */
export function useIpcListener(channel, callback) {
  // Use a ref to store the callback to avoid unnecessary re-registrations
  const savedCallback = useRef(callback);
  
  // Update the ref whenever the callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the actual listener only once
  useEffect(() => {
    // Create a stable wrapper function that calls the current callback
    const listener = (...args) => savedCallback.current(...args);
    
    // Register the listener
    window.electron.receive(channel, listener);
    
    // Clean up on unmount
    return () => {
      window.electron.removeListener(channel, listener);
    };
  }, [channel]); // Only re-run if the channel changes
}

/**
 * Hook to fetch and listen for log updates
 * @returns {Array} - [logs, fetchLogs]
 */
export function useLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const fetchLogs = useCallback(async () => {
    // Prevent multiple simultaneous requests using a ref
    // This is more reliable than using state for this purpose
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setIsLoading(true);
      const logData = await window.electron.invoke('get-logs');
      setLogs(Array.isArray(logData?.data) ? logData.data : 
              Array.isArray(logData) ? logData : []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Set up event listener for log updates
  useIpcListener('log-update', () => {
    fetchLogs();
  });

  // Initial fetch on mount only
  useEffect(() => {
    fetchLogs();
  }, []); // Empty dependency array means this runs once on mount

  return [logs, fetchLogs];
}
