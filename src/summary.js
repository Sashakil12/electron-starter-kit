import { ipcMain } from "electron";
import { logger } from "./utils/logger.js";
import { generatePDF } from "./utils/pdf-generator.js";
import { printPDF } from "./utils/printer.js";
import { 
  createStyledDocDefinition, 
  FONT_FAMILIES, 
  FONT_SIZES, 
  SPACING 
} from "./utils/pdf-styles.js";

// Function to print the summary
const printSummary = async () => {
  try {
    logger.info("Print summary operation started");

    // Define the content for the PDF
    const content = [
      {
        alignment: "center",
        stack: [
          {
            text: "সার্বিক হিসাব",
            style: "title",
            fontSize: FONT_SIZES.TITLE,
          },
        ],
      },
      {
        stack: [{ 
          text: `প্রিন্ট তাংঃ ${new Date().toLocaleDateString('bn-BD')}`,
          font: FONT_FAMILIES.BODY
        }],
        style: "subtitle",
      },
      {
        text: "ঋণ লেনদেনের হিসাব:",
        style: "sectionHeader",
        margin: SPACING.SECTION_MARGIN,
      },
      // Sample table with both fonts
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'তারিখ', style: 'tableHeader' },
              { text: 'বিবরণ', style: 'tableHeader' },
              { text: 'জমা', style: 'tableHeader' },
              { text: 'খরচ', style: 'tableHeader' }
            ],
            [
              { text: '০১/০১/২০২৫', style: 'tableCell' },
              { text: 'প্রারম্ভিক জমা', style: 'tableCell' },
              { text: '১০,০০০', style: 'tableCell' },
              { text: '-', style: 'tableCell' }
            ],
            [
              { text: '১৫/০১/২০২৫', style: 'tableCell' },
              { text: 'মাসিক কিস্তি', style: 'tableCell' },
              { text: '২,০০০', style: 'tableCell' },
              { text: '-', style: 'tableCell' }
            ],
            [
              { text: '৩০/০১/২০২৫', style: 'tableCell' },
              { text: 'অগ্রিম প্রদান', style: 'tableCell' },
              { text: '-', style: 'tableCell' },
              { text: '৫,০০০', style: 'tableCell' }
            ]
          ]
        },
        margin: [0, 10, 0, 15]
      },
      {
        text: "মোট হিসাবঃ",
        style: "subSectionHeader",
        margin: [0, 10, 0, 5],
      },
      {
        text: "মোট জমাঃ ১২,০০০ টাকা",
        style: "normal",
        margin: [10, 2, 0, 2],
      },
      {
        text: "মোট খরচঃ ৫,০০০ টাকা",
        style: "normal",
        margin: [10, 2, 0, 2],
      },
      {
        text: "অবশিষ্ট বাকিঃ ৭,০০০ টাকা",
        style: "normal",
        bold: true,
        margin: [10, 2, 0, 10],
      },
      {
        text: " ২০২৫ - সর্বস্বত্ব সংরক্ষিত",
        style: "footer",
        margin: [0, 30, 0, 0],
      }
    ];

    // Create a styled document definition
    const docDefinition = createStyledDocDefinition(content, {
      pageSize: "A4",
      pageMargins: [40, 120, 40, 60],
      pageOrientation: "portrait",
      // Additional custom options can be added here
      info: {
        title: 'সার্বিক হিসাব',
        author: 'Bengali PDF Generator',
        subject: 'হিসাব রিপোর্ট',
        keywords: 'হিসাব, রিপোর্ট, বাংলা',
      },
    });

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

export default printSummary;
