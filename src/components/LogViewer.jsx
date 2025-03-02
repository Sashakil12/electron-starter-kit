import React, { useState, useEffect } from 'react';
import { useLogs } from '../utils/electron-hooks';
import './LogViewer.css';

const LogViewer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, fetchLogs] = useLogs();
  
  const toggleLogs = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    
    // Fetch logs when becoming visible
    if (newVisibility) {
      fetchLogs();
    }
  };

  return (
    <div className="log-viewer-container">
      <button 
        className="button button-secondary" 
        onClick={toggleLogs}
      >
        {isVisible ? 'Hide Logs' : 'View Logs'}
      </button>
      
      {isVisible && (
        <div className="logs-container">
          {logs.length === 0 ? (
            <div className="log-empty">No logs available</div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={`log-entry log-${(log.level || 'info').toLowerCase()}`}
              >
                <div className="log-header">
                  <span className="log-timestamp">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}
                  </span>
                  <span className="log-level">[{log.level || 'INFO'}]</span>
                </div>
                <div className="log-message">{log.message || 'No message'}</div>
                {log.details && (
                  <pre className="log-details">
                    {typeof log.details === 'string' 
                      ? log.details 
                      : JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
