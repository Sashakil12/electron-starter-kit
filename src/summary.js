import { ipcMain } from "electron";
import { logger } from "./utils/logger.js";
import { generatePDF } from "./utils/pdf-generator.js";
import { printPDF } from "./utils/printer.js";
import { registerIpcHandler } from "./utils/ipc-handler.js";

// Function to print the summary
const printSummary = async () => {
  try {
    logger.info("Print summary operation started");

    // Format debt transactions
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 120, 40, 60],
      pageOrientation: "portrait",
      content: [
        {
          alignment: "center",
          stack: [
            {
              text: "সার্বিক হিসাব",
              style: "title",
              fontSize: 14,
            },
          ],
        },
        {
          stack: [{ text: `প্রিন্ট তাংঃ ${new Date()}` }],
          style: "sub-head",
        },
        {
          text: "ঋণ লেনদেনের হিসাব:",
          style: "sectionHeader",
          margin: [0, 10, 0, 5],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        title: {
          fontSize: 14,
          margin: [0, 0, 0, 10],
        },
        sectionHeader: {
          fontSize: 12,
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: "black",
          alignment: "center",
        },
        tableCell: {
          fontSize: 10,
        },
        footer: {
          fontSize: 10,
          italics: true,
        },
        subHead: {
          fontSize: 12,
          alignment: "center",
        },
      },
    };

    // Generate the PDF
    const pdfPath = await generatePDF(docDefinition, {
      filename: "summary",
      directory: null // Use default temp directory
    });

    // Print the PDF
    await printPDF(pdfPath, {
      silent: true,
      cleanup: true
    });

    return { success: true };
  } catch (error) {
    logger.error("Print summary operation failed", {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Print summary failed: ${error.message}`);
  }
};

// Register IPC handlers
registerIpcHandler("print-summary", async () => {
  await printSummary();
  return { success: true };
});

// Handler for viewing logs - disable request logging to prevent infinite loops
registerIpcHandler("get-logs", async () => {
  try {
    const logs = logger.getRecentLogs();
    // Ensure we're returning an array
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    logger.error("Error fetching logs", error);
    return [];
  }
}, { logRequests: false });

export default printSummary;
