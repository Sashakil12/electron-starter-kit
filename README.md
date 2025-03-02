# Electron React Starter Kit

A modern Electron starter kit with React integration, featuring a clean UI and built-in logging system.

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

1. Clone this repository
```bash
git clone https://github.com/yourusername/electron-react-starter.git
cd electron-react-starter
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run start
```

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
