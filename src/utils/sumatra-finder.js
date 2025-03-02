import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { logger } from './logger.js';

/**
 * Finds the SumatraPDF executable in various locations
 * @param {Object} options - Options for finding SumatraPDF
 * @param {string} [options.projectRoot] - The root directory of the project (for development)
 * @returns {string} The path to the SumatraPDF executable
 * @throws {Error} If SumatraPDF is not found
 */
export function findSumatraPDF(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  
  // First check in node_modules (for development)
  const pdfPrinterDistDir = path.join(projectRoot, 'node_modules', 'pdf-to-printer', 'dist');
  
  if (fs.existsSync(pdfPrinterDistDir)) {
    try {
      const files = fs.readdirSync(pdfPrinterDistDir);
      const sumatraFile = files.find(file => /^SumatraPDF-.*\.exe$/i.test(file));
      
      if (sumatraFile) {
        const sumatraPath = path.join(pdfPrinterDistDir, sumatraFile);
        logger?.info?.("Found SumatraPDF in pdf-to-printer dist directory:", sumatraPath);
        return sumatraPath;
      }
    } catch (error) {
      logger?.warn?.(`Error reading directory ${pdfPrinterDistDir}:`, error);
    }
  }
  
  // Look for any SumatraPDF-*.exe file in resources directory
  const resourcesDir = process.resourcesPath || path.join(projectRoot, "resources");
  
  // Check the resources directory
  if (fs.existsSync(resourcesDir)) {
    try {
      const files = fs.readdirSync(resourcesDir);
      const sumatraFile = files.find(file => /^SumatraPDF-.*\.exe$/i.test(file));
      
      if (sumatraFile) {
        const sumatraPath = path.join(resourcesDir, sumatraFile);
        logger?.info?.("Found SumatraPDF in resources directory:", sumatraPath);
        return sumatraPath;
      }
    } catch (error) {
      logger?.warn?.(`Error reading directory ${resourcesDir}:`, error);
    }
  }
  
  // Check alternative locations
  const alternativePaths = [
    // Development path - resources directory
    path.join(projectRoot, "resources"),
    // Production paths
    process.resourcesPath,
    // Fallback paths
    path.join(app?.getAppPath?.() || projectRoot, "..", "resources"),
    path.join(path.dirname(app?.getPath?.("exe") || projectRoot), "resources"),
  ];
  
  logger?.info?.("Searching for SumatraPDF in alternative paths");
  
  for (const dirPath of alternativePaths) {
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        const sumatraFile = files.find(file => /^SumatraPDF-.*\.exe$/i.test(file));
        
        if (sumatraFile) {
          const sumatraPath = path.join(dirPath, sumatraFile);
          logger?.info?.("Found SumatraPDF at:", sumatraPath);
          return sumatraPath;
        }
      } catch (error) {
        logger?.warn?.(`Error reading directory ${dirPath}:`, error);
      }
    }
  }

  throw new Error("SumatraPDF not found in any of the expected locations");
}
