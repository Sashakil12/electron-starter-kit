/**
 * Reusable styles for PDF generation
 * Contains font definitions, common styles, and theme settings
 */

// Define font families
export const FONT_FAMILIES = {
  HEADER: 'Li_Ador_Noirrit',
  BODY: 'Hasan_Jolchobi'
};

// Define font sizes
export const FONT_SIZES = {
  TITLE: 16,
  SUBTITLE: 14,
  HEADING: 12,
  SUBHEADING: 11,
  NORMAL: 10,
  SMALL: 8
};

// Define colors
export const COLORS = {
  PRIMARY: '#000000',
  SECONDARY: '#333333',
  ACCENT: '#0066cc',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  LIGHT: '#f8f9fa',
  DARK: '#343a40'
};

// Define margins and spacing
export const SPACING = {
  PAGE_MARGIN: [40, 60, 40, 60],
  SECTION_MARGIN: [0, 10, 0, 10],
  PARAGRAPH_MARGIN: [0, 5, 0, 5]
};

// Define common text styles
export const TEXT_STYLES = {
  title: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.TITLE,
    bold: true,
    margin: [0, 0, 0, 10],
    alignment: 'center'
  },
  subtitle: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.SUBTITLE,
    bold: true,
    margin: [0, 5, 0, 15],
    alignment: 'center'
  },
  sectionHeader: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.HEADING,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  subSectionHeader: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.SUBHEADING,
    bold: true,
    margin: [0, 5, 0, 3]
  },
  normal: {
    font: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.NORMAL
  },
  small: {
    font: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.SMALL
  },
  footer: {
    font: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.SMALL,
    italics: true,
    alignment: 'center'
  }
};

// Define table styles
export const TABLE_STYLES = {
  tableHeader: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.SMALL,
    bold: true,
    fillColor: COLORS.LIGHT,
    color: COLORS.DARK,
    alignment: 'center'
  },
  tableCell: {
    font: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.NORMAL
  },
  tableCellSmall: {
    font: FONT_FAMILIES.BODY,
    fontSize: FONT_SIZES.SMALL
  },
  tableFooter: {
    font: FONT_FAMILIES.HEADER,
    fontSize: FONT_SIZES.SMALL,
    bold: true,
    fillColor: COLORS.LIGHT
  }
};

// Default page settings
export const DEFAULT_PAGE_SETTINGS = {
  pageSize: 'A4',
  pageMargins: SPACING.PAGE_MARGIN,
  pageOrientation: 'portrait'
};

// Default style settings
export const DEFAULT_STYLE = {
  font: FONT_FAMILIES.BODY,
  fontSize: FONT_SIZES.NORMAL
};

// Create a complete styles object that combines all styles
export const PDF_STYLES = {
  ...TEXT_STYLES,
  ...TABLE_STYLES
};

/**
 * Creates a document definition with default styles
 * @param {Object} content - The content for the PDF
 * @param {Object} options - Additional options for the document
 * @returns {Object} - The complete document definition
 */
export function createStyledDocDefinition(content, options = {}) {
  return {
    ...DEFAULT_PAGE_SETTINGS,
    ...options,
    defaultStyle: DEFAULT_STYLE,
    content,
    styles: PDF_STYLES
  };
}
