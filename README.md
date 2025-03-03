# Electron React Starter Kit

A modern Electron starter kit with React integration, featuring a clean UI and built-in logging system.

## Template Usage

This repository is set up as a GitHub template. To use it:

1. Click the "Use this template" button at the top of the repository page
2. Choose a name for your new repository
3. Select whether to make it public or private
4. Click "Create repository from template"

Your new repository will be created with all the code from this template, but without the commit history, allowing you to start fresh.

## Features

- 🚀 Electron with React integration
- 📊 Enhanced logging system with in-memory caching and React hooks
- 🖨️ PDF generation and printing capabilities
- 🔄 Hot reloading during development
- 🎨 Modern UI components
- 🛠️ Reusable utilities for common Electron tasks

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- SumatraPDF (for PDF printing on Windows)

### Installation

1. Create a new repository from this template (see Template Usage above)

2. Clone your new repository
```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo
```

3. Install dependencies
```bash
npm install
```

4. Start the development server
```bash
npm run start
```

### Customization

After creating your project from this template, you should:

1. Update the `package.json` with your project details
2. Modify the README.md to reflect your project
3. Customize the application name and branding
4. Add your own components and functionality

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── renderer/         # Renderer process code
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Logging utility with in-memory caching
│   │   ├── pdf-generator.js # PDF generation utility
│   │   ├── printer.js    # PDF printing utility
│   │   ├── ipc-handler.js # IPC communication handler
│   │   ├── electron-hooks.js # React hooks for Electron integration
│   │   └── sumatra-finder.js # Utility to locate SumatraPDF
│   ├── index.css         # Main CSS file
│   ├── index.jsx         # Main React entry point
│   ├── main.js           # Main process entry point
│   └── preload.js        # Preload script
├── tools/                # Development tools
└── resources/            # Application resources
```

## Utilities

### Logger

The application includes a powerful logging system with:
- In-memory log caching for improved performance
- Log level filtering (INFO, WARN, ERROR)
- Automatic timestamp management
- React hook integration via `useLogs()`

### PDF Generation and Printing

Generate and print PDF documents with:
- Centralized PDF creation via `pdf-generator.js`
- SumatraPDF integration for silent printing
- Flexible file management options

### IPC Communication

Streamlined IPC communication with:
- Standardized error handling
- Request caching to prevent excessive logging
- Automatic renderer notifications

### React Hooks

Custom React hooks for Electron integration:
- `useIpcInvoke`: For invoking IPC methods with state management
- `useIpcListener`: For listening to IPC events
- `useLogs`: Specialized hook for log management

## Building for Production

```bash
# Package the app
npm run package

# Create distributable
npm run make
```

## License

MIT
