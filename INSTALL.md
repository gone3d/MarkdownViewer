# MarkdownViewer Installation Guide

## Prerequisites

Before installing MarkdownViewer, ensure you have the following requirements:

### Required Software

#### Node.js (v18 or higher)
Node.js is required to run the development server and build process.

**Install Node.js:**

- **macOS**: Download from [nodejs.org](https://nodejs.org/) or use Homebrew:
  ```bash
  brew install node
  ```

- **Windows**: Download the installer from [nodejs.org](https://nodejs.org/)

- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

- **Linux (CentOS/RHEL)**:
  ```bash
  sudo yum install nodejs npm
  ```

**Verify Installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

### Browser Requirements

MarkdownViewer uses modern web APIs and requires a recent browser:

- **Chrome/Edge**: Version 86+ (recommended for File System Access API)
- **Firefox**: Version 78+
- **Safari**: Version 14+

> **Note**: File System Access API (for direct file saving) works best in Chrome/Edge. Other browsers will fall back to download behavior.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MarkdownViewer.git
cd MarkdownViewer
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Markdown (markdown rendering)
- Lucide React (icons)
- Highlight.js (code syntax highlighting)

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### 4. Build for Production (Optional)

To create a production build:

```bash
npm run build
```

Built files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |

## Troubleshooting

### Common Issues

#### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.).

#### Node Version Issues
If you encounter errors related to Node.js version:
```bash
node --version  # Check your version
npm install -g n  # Install Node version manager
n latest  # Install latest Node.js
```

#### Permission Errors (Linux/macOS)
If you get permission errors during `npm install`:
```bash
sudo chown -R $(whoami) ~/.npm
```

#### Build Errors
Clear cache and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### File System Access API

For the best experience with file operations:
- Use **Chrome** or **Edge** browsers
- Ensure you're running on **HTTPS** or **localhost**
- Some file operations may require user permission prompts

## System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0+
- **npm**: v8.0.0+
- **RAM**: 2GB available
- **Storage**: 500MB for dependencies
- **Browser**: Modern browser with ES2020+ support

### Recommended Requirements
- **Node.js**: v20.0.0+
- **npm**: v10.0.0+
- **RAM**: 4GB available
- **Storage**: 1GB for development
- **Browser**: Chrome/Edge latest version

## Additional Tools (Optional)

### VS Code Extensions
For the best development experience:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**

### Git Configuration
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Getting Started

After installation:

1. **Open the application** at `http://localhost:5173`
2. **Click "File" → "Open File"** to load a markdown file
3. **Try the editor** by clicking "File" → "New File"
4. **Explore features** like File Info, syntax highlighting, and theme toggle
5. **Test file operations** like save, rename, duplicate, and delete

## Support

If you encounter issues:

1. Check this installation guide
2. Review the troubleshooting section
3. Check the [project README](./README.md)
4. Search existing [GitHub issues](https://github.com/your-username/MarkdownViewer/issues)
5. Create a new issue with details about your environment

## Next Steps

- Read the [README.md](./README.md) for feature overview
- Check [TASKS.md](./TASKS.md) for development roadmap
- Explore the codebase structure in `/src`

---

**Version**: 1.1.1  
**Last Updated**: September 4, 2025