# Kelp - Claude Code Configuration

Kelp brings your data together in one place - a Next.js web application with a Chrome extension that helps users organize and find their information across meetings, documents, and contacts.

## Project Overview

- **Type**: Next.js + React web application with Chrome extension
- **Language**: TypeScript
- **UI Framework**: Material-UI (MUI) with Emotion styling
- **Testing**: Vitest with React Testing Library
- **Build**: Webpack for extension, Next.js for website
- **Package Manager**: npm

## Key Commands

### Development
```bash
# Start website development server
npm run dev

# Start extension development with hot reload
npm run dev:extension

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

### Code Quality
```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix

# Check for unused exports
npm run lint:exports

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run typecheck
```

### Build & Production
```bash
# Build website
npm run build

# Build Chrome extension
npm run build-extension

# Build Safari extension
npm run build-extension:safari

# Start production server
npm start
```

### CSS Analysis
```bash
# Analyze CSS usage
npm run css:analyze

# Watch for CSS changes and analyze
npm run css:analyze:watch

# Generate CSS stats report
npm run css:stats
```

## Project Structure

- `/pages/` - Next.js pages (website)
- `/components/` - Shared React components for website
- `/extension/` - Chrome extension source code
  - `/extension/src/` - Extension TypeScript/React code
  - `/extension/dist/` - Built extension files
- `/constants/` - Configuration and constants
- `/test/` - Test files and setup
- `/public/` - Static assets
- `/@types/` - TypeScript type definitions

## Development Guidelines

### Code Quality Standards
- TypeScript with strict type checking
- ESLint with security and React plugins
- Prettier for consistent formatting
- Vitest for unit and integration testing
- 70% minimum test coverage requirement

### Key Technologies
- **Frontend**: React 19, Next.js 15, Material-UI 7
- **State Management**: React hooks + IndexedDB (via idb)
- **Extension APIs**: Chrome APIs, Google APIs, Microsoft Graph
- **Authentication**: Google OAuth, Microsoft MSAL
- **Build Tools**: Webpack 5, Babel, TypeScript

### Testing Strategy
- Unit tests for utility functions and models
- Component tests for React components
- Integration tests for store functionality
- Browser extension testing setup included
- Coverage thresholds: 70% lines, 60% branches/functions

## Working with the Extension

The Chrome extension integrates with:
- Google Calendar, Drive, Contacts APIs
- Microsoft Graph API
- Chrome browsing history
- IndexedDB for local storage

Key extension components:
- Background scripts for API integration
- Content scripts for web page interaction
- Popup and dashboard interfaces
- Safari version support

## Important Notes

- Uses ES modules throughout (type: "module" in package.json)
- Node.js 22+ required
- Both development and production webpack configurations
- CSS analysis tools for optimization
- Comprehensive TypeScript configuration
- Security-focused ESLint rules

## Quick Start

1. Install dependencies: `npm install`
2. Set up Google OAuth credentials (see README.md)
3. Start website: `npm run dev`
4. Start extension development: `npm run dev:extension`
5. Load extension in Chrome from `extension/dist/`

For detailed setup instructions, see the main README.md file.