import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import os from 'os';

class Logger {
  constructor() {
    // Set up log directory in user's app data
    this.logDir = process.env.NODE_ENV === 'development'
      ? path.join(process.cwd(), 'logs')
      : path.join(app.getPath('userData'), 'logs');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    
    // In-memory cache of recent logs for quick access
    this.recentLogs = [];
    this.maxRecentLogs = 100;
    
    // Track when logs were last requested to avoid unnecessary processing
    this.lastLogRequest = 0;
    this.logUpdateCount = 0;
  }

  _writeLog(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      details,
      os: {
        platform: os.platform(),
        release: os.release()
      },
      process: {
        pid: process.pid,
        env: process.env.NODE_ENV
      }
    };

    // Add to in-memory cache
    this.recentLogs.unshift(logEntry);
    if (this.recentLogs.length > this.maxRecentLogs) {
      this.recentLogs.pop();
    }

    // Increment update counter
    this.logUpdateCount++;

    const logString = `${JSON.stringify(logEntry)}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logString);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level}] ${message}`, details || '');
    }
  }

  info(message, details = null) {
    this._writeLog('INFO', message, details);
  }

  error(message, error = null) {
    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    this._writeLog('ERROR', message, errorDetails);
  }

  warn(message, details = null) {
    this._writeLog('WARN', message, details);
  }

  // Get recent logs (last n lines)
  getRecentLogs(lines = 100) {
    // Update the last request timestamp
    this.lastLogRequest = Date.now();
    // Reset update counter
    this.logUpdateCount = 0;
    
    try {
      // First try to return from in-memory cache
      if (this.recentLogs.length > 0) {
        return this.recentLogs.slice(0, Math.min(lines, this.recentLogs.length));
      }
      
      // Fall back to reading from file if needed
      if (!fs.existsSync(this.logFile)) {
        return [];
      }
      
      const logs = fs.readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return { level: 'ERROR', message: 'Failed to parse log entry', details: line };
          }
        });
      
      // Update in-memory cache
      this.recentLogs = logs.slice(0, this.maxRecentLogs);
      
      return logs.slice(0, Math.min(lines, logs.length));
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }
  
  // Check if logs have been updated since last request
  haveLogsUpdated() {
    return this.logUpdateCount > 0;
  }
  
  // Get time since last log request in milliseconds
  getTimeSinceLastRequest() {
    return Date.now() - this.lastLogRequest;
  }
}

export const logger = new Logger();
