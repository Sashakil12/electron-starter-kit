const fs = require('fs');
const path = require('path');

/**
 * Finds the SumatraPDF executable in various locations
 * @param {Object} options - Options for finding SumatraPDF
 * @param {string} [options.projectRoot] - The root directory of the project (for development)
 * @returns {string} The path to the SumatraPDF executable
 * @throws {Error} If SumatraPDF is not found
 */
function findSumatraPDF(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  
  // First check in node_modules (for development)
  const pdfPrinterDistDir = path.join(projectRoot, 'node_modules', 'pdf-to-printer', 'dist');
  
  if (fs.existsSync(pdfPrinterDistDir)) {
    try {
      const files = fs.readdirSync(pdfPrinterDistDir);
      const sumatraFile = files.find(file => /^SumatraPDF-.*\.exe$/i.test(file));
      
      if (sumatraFile) {
        const sumatraPath = path.join(pdfPrinterDistDir, sumatraFile);
        console.log(`Found SumatraPDF in pdf-to-printer dist directory: ${sumatraPath}`);
        return sumatraPath;
      }
    } catch (error) {
      console.warn(`Error reading directory ${pdfPrinterDistDir}:`, error);
    }
  }
  
  // Look for any SumatraPDF-*.exe file in resources directory
  const resourcesDir = path.join(projectRoot, "resources");
  
  // Check the resources directory
  if (fs.existsSync(resourcesDir)) {
    try {
      const files = fs.readdirSync(resourcesDir);
      const sumatraFile = files.find(file => /^SumatraPDF-.*\.exe$/i.test(file));
      
      if (sumatraFile) {
        const sumatraPath = path.join(resourcesDir, sumatraFile);
        console.log(`Found SumatraPDF in resources directory: ${sumatraPath}`);
        return sumatraPath;
      }
    } catch (error) {
      console.warn(`Error reading directory ${resourcesDir}:`, error);
    }
  }
  
  throw new Error("SumatraPDF not found in any of the expected locations");
}

module.exports = { findSumatraPDF };
