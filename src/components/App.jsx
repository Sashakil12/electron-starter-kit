import React, { useEffect } from 'react';
import LogViewer from './LogViewer';
import { setupPrintStatusListener } from '../utils/toast';
import { useIpcInvoke } from '../utils/electron-hooks';
import './App.css';

const App = () => {
  const [printResult, printLoading, printError, invokePrint] = useIpcInvoke('print-summary');

  useEffect(() => {
    // Set up the print status listener when the component mounts
    setupPrintStatusListener();
  }, []);

  const handlePrint = async () => {
    await invokePrint();
    if (printError) {
      console.error('Print error:', printError);
    }
  };

  return (
    <div className="app-container">
      <h1>💖 Hello World!</h1>
      <p>Welcome to your Electron application.</p>
      
      <div className="button-container">
        <button 
          onClick={handlePrint} 
          className="button"
          disabled={printLoading}
        >
          {printLoading ? 'Printing...' : 'Print Summary'}
        </button>
      </div>
      
      <LogViewer />
    </div>
  );
};

export default App;
