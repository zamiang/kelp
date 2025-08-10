# Technical Context

## Development Environment & Tooling

This document outlines the technical stack, tooling, and development practices for the Kelp project.

**Last Updated**: August 9, 2025

## Core Technology Stack

### Runtime & Framework

- **Node.js**: ES Modules (`"type": "module"` in package.json)
- **Next.js**: 15.4.6 with Pages Router
- **React**: 18.x with modern hooks and patterns
- **TypeScript**: 5.9.0 with gradual strict mode adoption

### UI & Styling

- **Material-UI**: v7 (latest) for component library
- **Radix UI**: Optional components for advanced UI patterns
- **CSS**: CSS Modules and inline styles
- **Theming**: Material-UI theme system in `constants/theme.ts`

### State Management & Data

- **Custom Store**: React Context + hooks in `components/store/`
- **Database**: IndexedDB for web app, Chrome Storage API for extension
- **Search**: Custom full-text search implementation
- **API Integration**: Google Calendar API, Microsoft Graph API

### Testing & Quality

- **Test Runner**: Vitest with jsdom environment
- **Testing Library**: React Testing Library for component tests
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with project-specific configuration
- **Type Checking**: TypeScript compiler with modern flags

## Development Scripts

### Primary Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Build production web app and extension
npm run start        # Start production server
npm run lint         # Run ESLint on all TypeScript files
npm run prettier     # Format code with Prettier
npm test             # Run test suite with Vitest
```

### Extension-Specific Commands

```bash
# Extension builds handled by webpack configs in extension/
npm run build        # Builds both web app and extension
```

## Configuration Files

### TypeScript Configuration

- **Primary**: `tsconfig.json` - Main TypeScript configuration
- **Extended**: `tsconfig-all.json` - Comprehensive project-wide config
- **Extension**: `extension/tsconfig.json` - Extension-specific settings
- **Web + Extension**: `tsconfig-website-and-extension.json` - Shared config

### Build Configuration

- **Next.js**: `next.config.js` - Web application build settings
- **Extension Dev**: `extension/webpack.dev.js` - Development builds
- **Extension Prod**: `extension/webpack.config.js` - Production builds
- **Safari Extension**: `extension/webpack-safari.config.js` - Safari-specific builds

### Code Quality

- **ESLint**: `eslint.config.js` - Modern flat config format
- **Prettier**: `.prettierrc` - Code formatting rules
- **Git**: `.gitignore` - Version control exclusions

### Testing

- **Vitest**: `vitest.config.ts` - Test runner configuration
- **Test Setup**: `test/setup.ts` - Global test setup
- **Environment**: `test/vitest-environment-jsdom.ts` - Custom jsdom setup

## Development Environment Setup

### Prerequisites

- **Node.js**: Version specified in `.nvmrc`
- **npm**: Package manager (preferred over yarn)
- **Git**: Version control
- **Chrome/Safari**: For extension testing

### Installation

```bash
# Clone repository
git clone git@github.com:zamiang/kelp.git
cd kelp

# Install dependencies
npm install

# Start development
npm run dev
```

### Environment Variables

- **Development**: `.env.local` (not committed)
- **Configuration**: `constants/config.ts` for runtime config
- **Feature Flags**: Environment-based feature toggles

## Browser Extension Development

### Manifest Configuration

- **Chrome**: `extension/src/manifest.json` - Manifest V3
- **Safari**: `extension/src/manifest-safari.json` - Safari-specific manifest

### Build System

- **Webpack**: Multiple configurations for different targets
- **Polyfills**: Node.js modules polyfilled for browser environment
- **Code Splitting**: Vendor chunks separated from application code

### Extension Architecture

- **Service Worker**: `extension/src/background.ts`
- **Popup**: `extension/src/popup.tsx`
- **Calendar Integration**: `extension/src/calendar.ts`
- **Styling**: `extension/src/popup.css`

### Safari Extension

- **Xcode Project**: `extension/safari/extension.xcodeproj/`
- **Assets**: `extension/safari/Assets.xcassets/`
- **Native Extension**: `extension/safari/extension/`

## Repository Structure

### Git Configuration

- **Remote Origins**:
  - `origin`: git@github.com:zamiang/kelp.git
  - `heroku`: https://git.heroku.com/kelp-production.git
- **Branching**: Feature branches for development
- **CI/CD**: GitHub Actions for linting (`.github/workflows/lint.yml`)

### Dependency Management

- **Dependabot**: Automated dependency updates (`dependabot.yml`)
- **Lock File**: `package-lock.json` committed to repository
- **Security**: `SECURITY.md` for security policy

## Testing Infrastructure

### Test Organization

```
test/
├── setup.ts                    # Global test configuration
├── vitest-environment-jsdom.ts # Custom jsdom environment
├── background.test.ts          # Extension background script tests
├── popup.test.tsx             # Extension popup tests
├── integration.test.ts        # Integration tests
├── components/                # Component-specific tests
└── README.md                  # Testing documentation
```

### Testing Patterns

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API and service integration testing
- **Extension Tests**: Chrome API mocking and extension-specific testing
- **Mock Strategy**: External APIs mocked for reliable testing

### Test Configuration

- **Environment**: jsdom for DOM simulation
- **Globals**: React Testing Library utilities
- **Coverage**: Code coverage reporting enabled
- **Watch Mode**: File watching for development

## Build & Deployment

### Web Application

- **Platform**: Heroku for production deployment
- **Build Process**: Next.js production build
- **Static Assets**: Automatic optimization and CDN
- **API Routes**: Serverless functions

### Extension Distribution

- **Chrome Web Store**: Manual upload process
- **Safari App Store**: Xcode build and submission
- **Version Synchronization**: Manual coordination between platforms

## Development Constraints

### Performance Requirements

- **Bundle Size**: < 200KB initial load
- **Build Time**: < 2 minutes for full build
- **Development Server**: < 5 seconds startup
- **Extension Memory**: < 50MB runtime usage

### Browser Compatibility

- **Chrome**: 88+ (Manifest V3 requirement)
- **Safari**: 14+ (extension support)
- **Web App**: Modern browsers with ES2020 support

### Security Constraints

- **Extension Permissions**: Minimal required permissions
- **Content Security Policy**: Strict CSP for extension
- **API Security**: OAuth2 flows for external services
- **Data Privacy**: Local-only data processing

## Troubleshooting

### Common Issues

- **Build Failures**: Check Node.js version matches `.nvmrc`
- **Extension Loading**: Verify manifest.json syntax
- **Type Errors**: Run `npm run lint` for TypeScript issues
- **Test Failures**: Check test setup and mocks

### Debug Tools

- **Chrome DevTools**: Extension debugging
- **Next.js Debug**: Built-in debugging capabilities
- **TypeScript**: Compiler diagnostics
- **Webpack**: Bundle analysis tools

## Future Technical Improvements

### Planned Upgrades

- **TypeScript**: Full strict mode adoption
- **Testing**: Playwright for E2E testing
- **Build System**: Evaluate Vite for development
- **CI/CD**: Automated deployment pipeline

### Architecture Evolution

- **State Management**: Consider Zustand or TanStack Query
- **Routing**: Evaluate Next.js App Router migration
- **Styling**: Standardize on single CSS solution
- **Monitoring**: Add performance and error monitoring

This technical context provides the foundation for all development work on the Kelp project. Any changes to tooling, dependencies, or development practices should be reflected in updates to this document.
