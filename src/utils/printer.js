import ptp from "pdf-to-printer";
import fs from "fs";
import { logger } from "./logger.js";
import { findSumatraPDF } from "./sumatra-finder.js";
import { cleanupPDF } from "./pdf-generator.js";

// Cache the SumatraPDF path
let sumatraPath;
try {
  sumatraPath = findSumatraPDF();
} catch (error) {
  logger.error("Failed to locate SumatraPDF:", error);
}

/**
 * Prints a PDF file using the default printer
 * @param {string} filepath - Path to the PDF file to print
 * @param {Object} options - Printing options
 * @param {boolean} [options.silent=true] - Whether to print silently (no UI)
 * @param {boolean} [options.cleanup=true] - Whether to clean up the PDF file after printing
 * @param {string} [options.printer] - Specific printer to use (defaults to system default)
 * @returns {Promise<Object>} - Result of the print operation
 */
export async function printPDF(filepath, options = {}) {
  try {
    logger.info("Print operation started", { filepath });

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    // Check SumatraPDF availability
    if (!sumatraPath || !fs.existsSync(sumatraPath)) {
      throw new Error(`SumatraPDF not found at: ${sumatraPath || 'unknown location'}`);
    }

    // Get printer
    const printer = options.printer || (await ptp.getDefaultPrinter());
    if (!printer && !options.printer) {
      throw new Error("No default printer found");
    }
    
    const printerName = options.printer || printer.name;
    logger.info("Using printer", { printerName });

    // Print the document
    await ptp.print(filepath, {
      printer: printerName,
      sumatraPdfPath: sumatraPath,
      silent: options.silent !== false,
    });

    logger.info("Print job completed successfully");
    
    // Clean up the temporary file if requested
    if (options.cleanup !== false) {
      cleanupPDF(filepath);
    }
    
    return { success: true };
  } catch (error) {
    logger.error("Print operation failed", {
      error: error.message,
      stack: error.stack,
    });
    
    // Clean up the temporary file if requested
    if (options.cleanup !== false) {
      cleanupPDF(filepath);
    }
    
    throw new Error(`Print operation failed: ${error.message}`);
  }
}
