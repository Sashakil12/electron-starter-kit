# Implementing Robust PDF Printing in Electron: A Journey Through Error Handling and Resource Management

## Introduction

In this blog post, we'll explore how to implement reliable PDF printing in an Electron application, complete with proper error handling, logging, and resource management. We'll focus on using pdfmake and pdf-to-printer for Windows printing and handle both development and production environments effectively. I you have tried previpous to inytegrate pdfmake and pdf-to-printer previously, you know how painful if could be setting them up to work properly.

## The Challenge

Our task was to create a robust PDF printing system that could:
1. Generate PDFs using pdfmake
2. Print them using pdf-to-printer
3. Handle errors gracefully
4. Provide meaningful feedback to users
5. Work consistently in both development and production environments

## Implementation Steps

### 1. Setting Up the Logger

First, we implemented a logging system to track operations and errors:

```javascript
import { logger } from './utils/logger.js';

// Example log usage
logger.info("Print summary operation started");
logger.error("Print job failed", { error: error.message });
```

### 2. Resource Management

One of the key challenges was managing the SumatraPDF executable that pdf-to-printer uses underneith in both development and production environments. We solved this by:

1. Creating a smart path resolution system:
```javascript
const findSumatraPDF = () => {
  const fileName = "SumatraPDF-3.4.6-32.exe";
  const possiblePaths = [
    // Development path
    path.join(process.cwd(), "resources", fileName),
    // Production paths
    path.join(process.resourcesPath, fileName),
    path.join(app.getAppPath(), "..", "resources", fileName),
    path.join(path.dirname(app.getPath("exe")), "resources", fileName),
  ];
  // Search through paths...
};

```

2. Configuring Electron Forge to package resources correctly:
```javascript
module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [sumatraSource]
  }
};
```

### 3. Error Handling and User Feedback

We implemented comprehensive error handling:

1. Checking for prerequisites:
   - SumatraPDF availability
   - Default printer existence
   - File system access

2. IPC communication for status updates:
```javascript
ipcMain.handle("print-summary", async (event) => {
  try {
    await printSummary();
    event.sender.send("print-status", {
      success: true,
      message: "Document printed successfully!"
    });
  } catch (error) {
    event.sender.send("print-status", {
      success: false,
      message: error.message
    });
  }
});
```

### 4. Frontend Integration

We created a clean UI for user interaction:

1. Toast notifications for success/error messages
2. A log viewer for debugging
3. Simple print controls

```html
<button id="printButton" class="button">Print Summary</button>
<button id="viewLogsButton" class="button button-secondary">View Logs</button>
```

## Key Learnings

1. **Resource Path Management**: Different environments (development vs. production) require different approaches to resource path resolution.

2. **Error Handling Strategy**: Implement error handling at multiple levels:
   - Resource availability checks
   - Operation execution monitoring
   - User feedback
   - Logging for debugging

3. **Logging Importance**: A good logging system is crucial for debugging production issues.

4. **Clean Architecture**: Separating concerns between:
   - PDF generation
   - Print management
   - Error handling
   - User interface

## Step-by-Step Guide: Implementing PDF Printing in Electron with Error Handling

This guide walks through implementing a robust PDF printing system in an Electron application, with comprehensive error handling and logging. We'll use `pdfmake` for PDF generation and `SumatraPDF` for printing on Windows.

## Prerequisites

- Node.js and npm installed
- Electron Forge project set up
- Windows environment (for SumatraPDF)

## Step 1: Setting Up Dependencies

First, install the required packages:

```bash
npm install pdfmake pdf-to-printer
```

## Step 2: Creating the Logger Utility

Create `src/utils/logger.js`:

```javascript
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import os from 'os';

class Logger {
  constructor() {
    // Log to app data in production, local in development
    const logDir = process.env.NODE_ENV === 'development'
      ? path.join(process.cwd(), 'logs')
      : path.join(app.getPath('userData'), 'logs');

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.recentLogs = [];
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      details,
      os: {
        platform: os.platform(),
        release: os.release()
      }
    };

    // Keep recent logs in memory
    this.recentLogs.push(logEntry);
    if (this.recentLogs.length > 100) {
      this.recentLogs.shift();
    }

    // Write to file
    const logLine = `${timestamp} [${level}] ${message}\n${
      details ? JSON.stringify(details, null, 2) + '\n' : ''
    }`;
    
    fs.appendFileSync(this.logFile, logLine);
  }

  info(message, details = null) {
    this.log('INFO', message, details);
  }

  error(message, details = null) {
    this.log('ERROR', message, details);
  }

  warn(message, details = null) {
    this.log('WARN', message, details);
  }

  getRecentLogs() {
    return this.recentLogs;
  }
}

export const logger = new Logger();
```

## Step 3: Configuring Resource Management

Update `forge.config.js` to handle SumatraPDF packaging:

```javascript
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { DependenciesPlugin } = require('electron-forge-plugin-dependencies');
const fs = require('fs');
const path = require('path');

// First ensure SumatraPDF exists
const sumatraSource = path.join(__dirname, 'node_modules', 'pdf-to-printer', 'dist', 'SumatraPDF-3.4.6-32.exe');
if (!fs.existsSync(sumatraSource)) {
  throw new Error(`SumatraPDF not found at: ${sumatraSource}`);
}

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [sumatraSource]
  },
  // ... rest of your forge config
};
```

## Step 4: Implementing the Print Function

Create `src/summary.js`:

```javascript
import pdfPrinter from "pdfmake/build/pdfmake.js";
import os from "os";
import fs from "fs";
import path from "path";
import ptp from "pdf-to-printer";
import { fileURLToPath } from "url";
import { ipcMain, app } from "electron";
import { logger } from "./utils/logger.js";
import pdfFonts from "pdfmake/build/vfs_fonts";

const findSumatraPDF = () => {
  const fileName = "SumatraPDF-3.4.6-32.exe";
  const possiblePaths = [
    path.join(process.cwd(), "resources", fileName),
    path.join(process.resourcesPath, fileName),
    path.join(app.getAppPath(), "..", "resources", fileName),
    path.join(path.dirname(app.getPath("exe")), "resources", fileName),
  ];

  logger.info("Searching for SumatraPDF in paths:", possiblePaths);

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      logger.info("Found SumatraPDF at:", possiblePath);
      return possiblePath;
    }
    logger.info("SumatraPDF not found at:", possiblePath);
  }

  throw new Error(
    `SumatraPDF not found in any of the expected locations: ${possiblePaths.join(", ")}`
  );
};

// Initialize PDF printer and path
const sumatraPath = findSumatraPDF();
pdfMake.vfs = pdfFonts.vfs;

const printSummary = async () => {
  try {
    logger.info("Print summary operation started");

    // Check for default printer
    const printer = await ptp.getDefaultPrinter();
    if (!printer) {
      throw new Error("No default printer found");
    }
    logger.info("Using printer:", { printerName: printer.name });

    // Create PDF definition
    const docDefinition = {
      content: [
        { text: "Sample PDF Document", style: "header" },
        { text: "Generated at: " + new Date().toLocaleString(), style: "subheader" },
        // Add your PDF content here
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: false,
          margin: [0, 0, 0, 20]
        }
      }
    };

    // Create temp directory
    const appDir = path.join(os.tmpdir(), "mango-erp");
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    // Generate PDF
    const filepath = path.join(appDir, `summary-${Date.now()}.pdf`);
    logger.info("Creating PDF file", { filepath });

    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filepath);
      const pdfDoc = pdfPrinter.createPdf(docDefinition);

      pdfDoc.getBuffer((buffer) => {
        stream.write(buffer);
        stream.end();
        logger.info("PDF created successfully, starting print job");

        ptp.print(filepath, {
          printer: printer.name,
          sumatraPdfPath: sumatraPath,
          silent: true
        })
        .then(() => {
          fs.unlink(filepath, (err) => {
            if (err) {
              logger.warn("Error cleaning up temp file:", { error: err.message });
            }
          });
          logger.info("Print job completed successfully");
          resolve({ success: true });
        })
        .catch((error) => {
          fs.unlink(filepath, (err) => {
            if (err) {
              logger.warn("Error cleaning up temp file:", { error: err.message });
            }
          });
          logger.error("Print job failed", { error: error.message });
          reject(new Error(`Printing failed: ${error.message}`));
        });
      });
    });
  } catch (error) {
    logger.error("Print summary operation failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Set up IPC handlers
ipcMain.handle("print-summary", async (event) => {
  try {
    await printSummary();
    event.sender.send("print-status", {
      success: true,
      message: "Document printed successfully!",
    });
    return { success: true };
  } catch (error) {
    event.sender.send("print-status", {
      success: false,
      message: error.message,
    });
    return {
      success: false,
      error: error.message,
    };
  }
});

// Handler for viewing logs
ipcMain.handle("get-logs", async () => {
  return logger.getRecentLogs();
});
```

## Step 5: Creating the User Interface

Create handlers in your renderer code:

```javascript
// Function to show toast/notification
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Set up print status listener
window.electron.receive('print-status', (status) => {
    if (status.success) {
        showNotification(status.message, 'success');
    } else {
        showNotification(status.message, 'error');
    }
});

// Function to handle print request
export async function handlePrint() {
    try {
        const result = await window.electron.invoke('print-summary');
        if (!result.success) {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        showNotification('Failed to print document', 'error');
    }
}

// Function to view logs
export async function viewLogs() {
    try {
        const logs = await window.electron.invoke('get-logs');
        console.log('Recent logs:', logs);
        return logs;
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return [];
    }
}
```

Add CSS for notifications:

```css
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease-in-out;
}

.toast-success {
    background-color: #4caf50;
}

.toast-error {
    background-color: #f44336;
}

.toast-info {
    background-color: #2196f3;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

## Key Features of This Implementation

1. **Robust Error Handling**
   - Checks for SumatraPDF availability
   - Validates printer existence
   - Handles file system operations safely
   - Provides user feedback for all error cases

2. **Comprehensive Logging**
   - Logs all operations with timestamps
   - Maintains recent logs in memory
   - Writes to rotating log files
   - Includes system information in logs

3. **Resource Management**
   - Smart path resolution for different environments
   - Proper cleanup of temporary files
   - Efficient packaging of required executables

4. **User Experience**
   - Toast notifications for operation status
   - Log viewer for debugging
   - Clean error messages
   - Responsive UI feedback

## Testing Your Implementation

1. Development Testing:
```bash
npm start
```

2. Production Testing:
```bash
npm run make
```

Check the logs at:
- Development: `./logs/app-YYYY-MM-DD.log`
- Production: `%APPDATA%/your-app-name/logs/app-YYYY-MM-DD.log`

## Common Issues and Solutions

1. **SumatraPDF Not Found**
   - Verify the path in forge.config.js
   - Check if the file is properly packaged
   - Ensure proper path resolution in findSumatraPDF()

2. **Print Job Fails**
   - Check default printer availability
   - Verify SumatraPDF permissions
   - Check temporary directory access

3. **Logging Issues**
   - Ensure write permissions to log directory
   - Check available disk space
   - Verify log rotation is working

## Conclusion

This implementation provides a robust foundation for PDF printing in Electron applications. The error handling and logging systems ensure that issues can be quickly identified and resolved, while the user interface provides clear feedback about the printing process.

Remember to adapt the PDF content and styling to match your application's needs, and consider adding additional features like print preview or printer selection in future iterations.

## Future Improvements

1. Add print queue management
2. Implement print preview
3. Add support for print settings customization
4. Enhance log analysis tools
5. Add automated testing for error scenarios

Remember, robust error handling and good logging practices are not just nice-to-have features – they're essential for building production-ready applications that users can rely on.