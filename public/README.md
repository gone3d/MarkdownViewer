# MarkdownViewer

A modern, local/server application for viewing, editing, and organizing markdown files with advanced features like automatic table of contents generation and media asset management. Future development will integrate AI(s) to aid in content and editing.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Build Local](#build-local)
- [Build Prod](#build-prod)
- [Architecture](#architecture)
- [Development](#development)

## Overview

MarkdownViewer is designed to be the definitive solution for markdown file management, bridging the gap between simple text editors and complex IDEs. It provides a seamless experience for viewing, editing, and organizing markdown content with an intuitive interface that makes complex markdown management feel effortless.

### 🚀 Recent Major Updates

- **🎨 Advanced Syntax Highlighting**: VS Code-authentic editor colors with two-layer architecture
- **💾 Smart Save Operations**: Files save to original location using File System Access API
- **🧠 Intelligent Code Parsing**: TOC excludes `#` characters inside code blocks and fenced regions
- **⚡ Performance Optimizations**: Memoized components prevent duplicate processing
- **🎯 Enhanced Navigation**: Improved header anchor generation with clean URL-friendly IDs

### Core Vision

- **Effortless Markdown Management**: Make working with markdown files as simple as possible
- **Professional Quality**: Senior-level code suitable for portfolio demonstration
- **Extensible Architecture**: Built to grow from basic viewing to advanced organization features
- **Universal Access**: Works as both local desktop app and web server application

## Features

### Core Viewing Features

- Render markdown files with proper styling
- Support for standard GitHub Flavored Markdown syntax
- Real-time preview capabilities
- Responsive design for various screen sizes

### Editing Features

- **Advanced Syntax Highlighting**: Custom two-layer editor with VS Code-authentic colors
- **Smart File Operations**: Save directly to original file location (no more downloads!)
- **Intelligent Parsing**: TOC generation that properly ignores code blocks
- Live preview while editing with synchronized scrolling
- Auto-save functionality (configurable)
- File management (create, rename, delete)

### Organization Features

- File browser with tree-view folder navigation
- Automatic table of contents generation for headers
- Image, animation, and video asset management
- Full-text search functionality across markdown files
- Tag and category system for organization

## Technology Stack

### Frontend

- **React 18** with TypeScript for robust UI development
- **Vite 6** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom theme system
- **Custom Markdown Parser** with advanced tokenization for syntax highlighting
- **File System Access API** integration for native file operations

### Markdown Processing

- **react-markdown** with remark/rehype plugin ecosystem
- **remark-gfm** for GitHub Flavored Markdown support
- **rehype-highlight** for syntax highlighting
- **Prism.js** for code block highlighting

### File System & Search

- **File System Access API** for native file operations (with fallbacks)
- **Fuse.js** for fuzzy search capabilities
- **Web Workers** for background search indexing

## Build Local

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd MarkdownViewer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Scripts

```bash
# Start dev server with hot reload
npm run dev

# Build production version
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check

# Type check TypeScript
npm run type-check
```

The development server will start at `http://localhost:5173` with hot module replacement enabled.

## Build Prod

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output

- Optimized bundle with tree-shaking and code splitting
- Static assets with hashed filenames for caching
- Built files output to `dist/` directory
- Ready for deployment to static hosting services

### Deployment Options

```bash
# Deploy to Netlify
npm run build && npx netlify deploy --prod --dir=dist

# Deploy to Vercel
npm run build && npx vercel --prod

# Serve locally with any static server
npx serve dist
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MarkdownViewer App                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ├── Components (Viewer, Editor, Browser, TOC)              │
│  ├── State Management (Context/useReducer)                  │
│  ├── Routing (React Router)                                 │
│  └── Styling (Tailwind CSS)                                 │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                              │
│  ├── File System Service (Local/Server)                     │
│  ├── Markdown Parser Service                                │
│  ├── Search & Index Service                                 │
│  └── Media Asset Service                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── File System (Local Files)                              │
│  ├── Index Database (Search/Metadata)                       │
│  └── Configuration Storage                                  │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

- **MarkdownViewer**: Advanced rendering with custom header components and anchor linking
- **SyntaxHighlightedEditor**: Two-layer transparent textarea with VS Code color themes
- **FileBrowser**: Tree-view navigation with File System Access API integration
- **TableOfContents**: Smart TOC generation that excludes code block headers
- **Header**: Unified navigation with Save File button and theme toggle
- **SearchInterface**: Full-text search across markdown files (planned)
- **MediaManager**: Handle images, videos, animations (planned)

## Development

### Development Philosophy

Focus on creating an intuitive user experience that makes viewing, editing, and organizing markdown files effortless. Emphasize the "Easy Button" approach - making complex markdown management feel simple through thoughtful architecture and clean implementation.

### Getting Started

1. Read the project documentation files for context
2. Follow the [Build Local](#build-local) instructions
3. Start with the first milestone tasks in the development roadmap
4. Maintain test coverage and code quality standards

### Project Structure

```
src/
├── components/          # React components
├── services/           # Core business logic
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles and themes
```

### Contributing

- Follow TypeScript strict mode guidelines
- Maintain comprehensive test coverage
- Use conventional commit messages
- Ensure accessibility compliance
- Document architectural decisions

---

_MarkdownViewer - Making markdown management effortless._
