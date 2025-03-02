# Electron React Starter Kit

A modern Electron starter kit with React integration, featuring a clean UI and built-in logging system.

## Features

- 🚀 Electron with React integration
- 📊 Built-in logging system with React-based log viewer
- 🖨️ PDF generation and printing capabilities
- 🔄 Hot reloading during development
- 🎨 Modern UI components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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
│   ├── index.css         # Main CSS file
│   ├── index.jsx         # Main React entry point
│   ├── main.js           # Main process entry point
│   └── preload.js        # Preload script
├── tools/                # Development tools
└── resources/            # Application resources
```

## Building for Production

```bash
# Package the app
npm run package

# Create distributable
npm run make
```

## License

MIT
