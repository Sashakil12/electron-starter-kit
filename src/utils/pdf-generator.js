import pdfMake from "pdfmake/build/pdfmake.js";
import { FONTS } from "../../fonts/custom_fonts.js";
import fs from "fs";
import os from "os";
import path from "path";
import { logger } from "./logger.js";

// Set up pdfMake virtual file system with our fonts
pdfMake.vfs = FONTS;

// Define the fonts globally for pdfMake
pdfMake.fonts = {
  Li_Ador_Noirrit: {
    normal: 'Li Ador Noirrit Regular.ttf',
    bold: 'Li Ador Noirrit Bold.ttf',
    italics: 'Li Ador Noirrit Italic.ttf',
    bolditalics: 'Li Ador Noirrit Bold Italic.ttf'
  }
};

/**
 * Generates a PDF file with the given document definition
 * @param {Object} docDefinition - The pdfmake document definition
 * @param {Object} options - Options for PDF generation
 * @param {string} [options.filename] - Custom filename (without extension)
 * @param {string} [options.directory] - Custom directory to save the PDF
 * @returns {Promise<string>} - Path to the generated PDF file
 */
export async function generatePDF(docDefinition, options = {}) {
  try {
    // Create temp directory if it doesn't exist
    const directory = options.directory || path.join(os.tmpdir(), "electron-app");
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = options.filename ? `${options.filename}-${timestamp}.pdf` : `document-${timestamp}.pdf`;
    const filepath = path.join(directory, filename);
    
    logger.info("Creating PDF file", { filepath });

    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filepath);
      
      // Create a PDF document with the document definition
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      
      pdfDocGenerator.getBuffer((buffer) => {
        stream.write(buffer);
        stream.end();
        logger.info("PDF created successfully", { filepath });
        resolve(filepath);
      });

      stream.on('error', (error) => {
        logger.error("Error creating PDF", error);
        reject(error);
      });
    });
  } catch (error) {
    logger.error("PDF generation failed", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Cleans up a temporary PDF file
 * @param {string} filepath - Path to the PDF file to clean up
 */
export function cleanupPDF(filepath) {
  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) {
        logger.warn("Error cleaning up temp file:", {
          error: err.message,
          filepath
        });
      } else {
        logger.info("Temporary PDF file cleaned up", { filepath });
      }
    });
  }
}
