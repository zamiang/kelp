# System Patterns

## Architecture Overview

Kelp follows a dual-architecture pattern with a Next.js web application and a Chrome/Safari browser extension, both sharing common TypeScript patterns and data structures.

**Last Updated**: August 9, 2025

## Web Application Architecture

### Framework & Routing

- **Next.js 15.x** with Pages Router (`pages/` directory)
- **TypeScript 5.9** with modern ES modules (`"type": "module"`)
- **Material-UI v7** for component library
- **Custom routing** via Next.js file-based routing

### Component Organization

```
components/
├── dashboard/          # Dashboard-specific UI
├── documents/          # Document management
├── error-tracking/     # Error boundaries & tracking
├── fetch/             # Data fetching logic
├── homepage/          # Marketing site components
├── meeting/           # Meeting-related UI
├── nav/               # Navigation components
├── person/            # People/contacts UI
├── shared/            # Reusable utilities & components
├── store/             # State management & data models
├── summary/           # Summary views
├── user-profile/      # User settings
└── website/           # Website management UI
```

### State Management Pattern

- **Custom Store**: `components/store/use-store.tsx`
- **Data Types**: Centralized in `components/store/data-types.ts`
- **Database Layer**: IndexedDB wrapper in `components/store/db.ts`
- **Search Index**: Full-text search in `components/store/search-index.ts`

### Data Flow Pattern

```
User Action → Component → Store Hook → Database Layer → IndexedDB
                ↓
            UI Update ← State Change ← Data Persistence
```

## Extension Architecture

### Manifest V3 Service Worker Pattern

- **Event-driven architecture**: Service worker responds to browser events
- **Lifecycle management**: Proper startup, install, and activation handling
- **Background processing**: Uses `chrome.alarms` for scheduled tasks

### Storage Strategy

- **Primary**: `chrome.storage.local` for extension data
- **Fallback**: IndexedDB for complex queries
- **Sync**: `chrome.storage.sync` for user preferences (when needed)

### Message Passing Pattern

```
Content Script ↔ Background Script ↔ Popup
       ↓              ↓              ↓
   DOM Events    Chrome APIs    User Interface
```

### Build System

- **Webpack configurations**: Separate configs for dev, prod, and Safari
- **Polyfills**: Node.js modules polyfilled for browser environment
- **Code splitting**: Vendor chunks separated from application code

## Error Handling Patterns

### React Error Boundaries

- **Global boundary**: `components/error-tracking/error-boundary.tsx`
- **Catch component**: `components/error-tracking/catch.tsx`
- **Error tracking**: `components/error-tracking/error-tracking.ts`

### Extension Error Handling

- **Service worker**: Comprehensive try-catch with retry logic
- **Storage errors**: Graceful degradation when storage fails
- **API errors**: Exponential backoff for external API calls

### Error Recovery Strategy

```
Error Detected → Log Error → Attempt Recovery → Fallback → User Notification
```

## Data Patterns

### Type System

- **API Types**: Separate files for each external API
  - `@types/google-api.ts` - Google Calendar/Drive types
  - `@types/microsoft-api.ts` - Microsoft Graph types
- **Component Types**: Props interfaces co-located with components
- **Utility Types**: Generic types in `@types/` directory

### API Integration Pattern

```
Component → Fetch Helper → API Client → External Service
    ↓           ↓            ↓
UI Update ← Store Update ← Response Processing
```

### Data Persistence

- **Web App**: IndexedDB via custom database wrapper
- **Extension**: Chrome storage API with quota management
- **Sync Strategy**: Event-driven updates between contexts

## Performance Patterns

### Bundle Optimization

- **Dynamic imports**: Heavy components loaded on demand
- **Tree shaking**: `sideEffects: false` in package.json
- **Code splitting**: Vendor and common chunks separated
- **Lazy loading**: Authentication and dashboard components

### Caching Strategy

- **Component level**: React.memo for expensive renders
- **Data level**: Store-based caching with TTL
- **Asset level**: Next.js automatic static optimization

### Memory Management

- **Extension**: Service worker lifecycle management
- **Web app**: Cleanup in useEffect hooks
- **Storage**: Periodic cleanup of old data

## Security Patterns

### Extension Security

- **Minimal permissions**: Only request necessary permissions
- **Content Security Policy**: Strict CSP in manifest
- **Message validation**: All inter-context messages validated
- **Input sanitization**: User input sanitized before storage

### Web Application Security

- **API routes**: Input validation on all endpoints
- **Authentication**: OAuth2 flows for Google/Microsoft
- **CSRF protection**: Built-in Next.js CSRF handling
- **XSS prevention**: React's built-in XSS protection

## Testing Patterns

### Unit Testing

- **Vitest**: Test runner with jsdom environment
- **React Testing Library**: Component testing utilities
- **Mock strategy**: External APIs mocked in tests
- **Test location**: `test/` directory with co-located tests

### Integration Testing

- **API integration**: Mock external services
- **Extension testing**: Chrome API mocks
- **E2E testing**: Planned with Playwright

## Build & Development Patterns

### Development Workflow

```
npm run dev → Next.js dev server + Extension dev build
npm run build → Production builds for both web and extension
npm run test → Vitest test runner
npm run lint → ESLint + TypeScript checking
```

### Configuration Management

- **Environment variables**: `.env.local` for development
- **Feature flags**: Runtime configuration in `constants/config.ts`
- **Build variants**: Separate webpack configs for different targets

### Code Quality

- **ESLint**: Modern TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled (in progress)
- **Git hooks**: Pre-commit linting and testing

## Deployment Patterns

### Web Application

- **Heroku**: Production deployment
- **Static assets**: Next.js automatic optimization
- **API routes**: Serverless functions

### Extension Distribution

- **Chrome Web Store**: Automated builds and uploads
- **Safari App Store**: Xcode project in `extension/safari/`
- **Version management**: Synchronized across platforms

## Key Design Decisions

### Technology Choices

- **Next.js Pages Router**: Chosen for stability over App Router
- **Material-UI**: Provides consistent design system
- **Custom store**: Lightweight alternative to Redux/Zustand
- **TypeScript**: Gradual adoption with strict mode as goal

### Architecture Principles

- **Privacy-first**: All processing happens locally
- **Performance-focused**: Bundle size and runtime performance prioritized
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Modular architecture for future features

### Trade-offs Made

- **Bundle size vs features**: Dynamic imports to balance functionality and performance
- **Type safety vs development speed**: Gradual TypeScript adoption
- **Extension complexity vs capability**: MV3 constraints accepted for future compatibility

## Evolution Strategy

### Current State (Phase 1)

- Bundle optimization implemented
- TypeScript modernization in progress
- Extension architecture verified as MV3-compliant

### Future Improvements

- **State management**: Consider migration to Zustand or TanStack Query
- **Routing**: Evaluate Next.js App Router migration
- **Testing**: Expand coverage with E2E tests
- **Performance**: Implement monitoring and alerting

This system architecture provides a solid foundation for the current application while allowing for future growth and modernization.
