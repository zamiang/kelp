# Phase 1 Implementation Guide

## Overview

This document provides detailed technical implementation steps for Phase 1 of the Kelp modernization project. Phase 1 focuses on immediate high-impact improvements with relatively low risk.

**Timeline**: 2 weeks (January 8-22, 2025)
**Priority**: Highest impact, lowest risk improvements

## Task 1: Bundle Optimization & Code Splitting

### Day 1: Analysis & Setup

#### 1.1 Bundle Analysis

```bash
# Install webpack-bundle-analyzer if not present
npm install --save-dev webpack-bundle-analyzer

# Run analysis
npm run analyze

# Document baseline metrics
```

**Metrics to Document:**

- Total bundle size
- Largest chunks
- Duplicate modules
- Unused exports
- Initial load size
- Route-specific sizes

#### 1.2 Identify Optimization Targets

**Heavy Dependencies to Review:**

- `@azure/msal-browser` (authentication)
- `@microsoft/microsoft-graph-client`
- `@mui/material` components
- `lodash` (utility library)
- `react-beautiful-dnd` (drag and drop)

**Components for Code Splitting:**

- `/components/dashboard/` - Main dashboard views
- `/components/meeting/` - Meeting-related components
- `/components/documents/` - Document views
- `/components/website/` - Website management
- Authentication flows (Google/Microsoft login)

### Day 2-3: Route-Based Code Splitting

#### 2.1 Next.js Dynamic Imports

**Convert Heavy Pages:**

```typescript
// Before
import Dashboard from '../components/dashboard/desktop-dashboard';

// After
import dynamic from 'next/dynamic';
const Dashboard = dynamic(
  () => import('../components/dashboard/desktop-dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // if client-only
  }
);
```

**Priority Pages for Dynamic Import:**

1. `pages/index.tsx` - Dashboard components
2. Authentication components
3. Meeting views
4. Document views
5. Settings/profile pages

#### 2.2 Component-Level Splitting

**Heavy Components to Lazy Load:**

```typescript
// Charts and visualizations
const LineCalendar = dynamic(() => import('./line-calendar'));
const BarChart = dynamic(() => import('./bar-chart'));

// Authentication
const GoogleLogin = dynamic(() => import('./google-login'));
const MicrosoftLogin = dynamic(() => import('./microsoft-login'));

// Complex UI components
const DraggableWebsiteHighlights = dynamic(() => import('./draggable-website-highlights'));
```

### Day 4-5: Webpack Optimization

#### 4.1 Tree Shaking Configuration

**Update next.config.js:**

```javascript
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
};
```

#### 4.2 Dependency Optimization

**Lodash Optimization:**

```typescript
// Before
import _ from 'lodash';

// After
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

**Material-UI Optimization:**

```typescript
// Before
import { Button, TextField, Dialog } from '@mui/material';

// After
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
```

## Task 2: TypeScript Strict Mode & Modern Patterns

### Day 1: Configuration & Assessment

#### 1.1 Enable Strict Mode Gradually

**Update tsconfig.json:**

```json
{
  "compilerOptions": {
    // Phase 1: Basic strict checks
    "strict": false, // Will enable after fixing issues
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,

    // Phase 2: Additional checks
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional helpful flags
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### 1.2 Type Audit Script

Create `scripts/type-audit.js`:

```javascript
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function findAnyTypes(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      findAnyTypes(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(filePath, 'utf8');
      const anyMatches = content.match(/:\s*any/g);
      if (anyMatches) {
        fileList.push({
          file: filePath,
          count: anyMatches.length,
        });
      }
    }
  });

  return fileList;
}

const results = findAnyTypes('./');
console.log('Files with "any" types:', results);
console.log(
  'Total "any" types:',
  results.reduce((sum, r) => sum + r.count, 0),
);
```

### Day 2-3: Core Type Definitions

#### 2.1 API Response Types

**Create @types/google-api.ts:**

```typescript
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  // ... additional fields
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  // ... additional fields
}
```

**Create @types/microsoft-api.ts:**

```typescript
export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  body?: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: string;
  }>;
  // ... additional fields
}
```

#### 2.2 Store & State Types

**Update store types:**

```typescript
// components/store/data-types.ts
export interface Website {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  lastVisited: Date;
  visitCount: number;
  tags: string[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: Attendee[];
  documents: Document[];
  websites: Website[];
}

export interface StoreState {
  websites: Website[];
  meetings: Meeting[];
  documents: Document[];
  isLoading: boolean;
  error: Error | null;
}
```

### Day 4-5: Component & Utility Types

#### 4.1 Component Props Types

**Example component with proper types:**

```typescript
interface DashboardProps {
  user: User;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, meetings, onMeetingClick, className }) => {
  // Component implementation
};
```

#### 4.2 Modern TypeScript Patterns

**Const Assertions:**

```typescript
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
} as const;

type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];
```

**Template Literal Types:**

```typescript
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint = `/api/${string}`;

type APIRoute = `${HTTPMethod} ${APIEndpoint}`;
```

## Task 3: Chrome Extension Manifest V3 Optimization

### Week 1: Service Worker Optimization

#### Day 1-2: Service Worker Lifecycle

**Update extension/src/background.ts:**

```typescript
// Event-driven service worker pattern
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started');
  initializeExtension();
});

// Use chrome.action instead of browserAction
chrome.action.onClicked.addListener((tab) => {
  // Handle extension icon click
});

// Efficient tab tracking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    trackVisit(tab.url, tab.title);
  }
});

// Service worker lifecycle management
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});
```

#### Day 3-4: Storage Optimization

**Migrate to chrome.storage:**

```typescript
// Before (IndexedDB)
const db = await openDB('kelp', 1);
await db.put('websites', websiteData);

// After (chrome.storage)
await chrome.storage.local.set({ websites: websiteData });

// Efficient batch operations
const batchData = {
  websites: websiteData,
  meetings: meetingData,
  settings: userSettings,
};
await chrome.storage.local.set(batchData);

// Storage quota management
chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
  const quotaUsed = bytesInUse / chrome.storage.local.QUOTA_BYTES;
  if (quotaUsed > 0.9) {
    cleanupOldData();
  }
});
```

#### Day 5: Alarm API Implementation

**Replace timers with alarms:**

```typescript
// Before
setInterval(
  () => {
    syncData();
  },
  30 * 60 * 1000,
); // 30 minutes

// After
chrome.alarms.create('syncData', {
  periodInMinutes: 30,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncData();
  }
});

// One-time alarm
chrome.alarms.create('dailyCleanup', {
  when: Date.now() + 24 * 60 * 60 * 1000,
});
```

### Week 2: Advanced Optimizations

#### Day 1-2: Permission Optimization

**Update manifest.json:**

```json
{
  "permissions": ["storage", "alarms", "tabs"],
  "optional_permissions": ["notifications", "history"],
  "host_permissions": ["https://*.google.com/*", "https://*.microsoft.com/*"]
}
```

**Request optional permissions:**

```typescript
async function requestNotificationPermission() {
  const granted = await chrome.permissions.request({
    permissions: ['notifications'],
  });

  if (granted) {
    enableNotifications();
  }
}
```

#### Day 3-5: Testing & Validation

**Performance Testing Checklist:**

- [ ] Service worker startup time < 500ms
- [ ] Memory usage < 50MB
- [ ] No memory leaks after 1 hour of use
- [ ] Tab tracking works across all scenarios
- [ ] Storage sync works reliably
- [ ] Alarms fire on schedule
- [ ] Extension works after browser restart

## Validation & Success Metrics

### Performance Benchmarks

| Metric              | Current | Target  | Status |
| ------------------- | ------- | ------- | ------ |
| Initial Bundle Size | TBD     | < 200KB | ⏳     |
| FCP                 | TBD     | < 2s    | ⏳     |
| TTI                 | TBD     | < 3s    | ⏳     |
| Lighthouse Score    | TBD     | > 85    | ⏳     |
| Extension Memory    | TBD     | < 50MB  | ⏳     |
| Extension Startup   | TBD     | < 500ms | ⏳     |

### Code Quality Metrics

| Metric                 | Current | Target | Status |
| ---------------------- | ------- | ------ | ------ |
| TypeScript `any` types | TBD     | 0      | ⏳     |
| TypeScript Coverage    | Partial | 100%   | ⏳     |
| ESLint Errors          | TBD     | 0      | ⏳     |
| Test Coverage          | TBD     | > 80%  | ⏳     |

## Rollback Strategy

### Git Branch Strategy

```bash
# Create feature branches for each task
git checkout -b feature/bundle-optimization
git checkout -b feature/typescript-strict
git checkout -b feature/extension-mv3

# Tag stable points
git tag -a v1.0-pre-modernization -m "Before Phase 1"
git tag -a v1.1-bundle-optimized -m "After bundle optimization"
```

### Feature Flags

```typescript
// constants/features.ts
export const FEATURES = {
  DYNAMIC_IMPORTS: process.env.NEXT_PUBLIC_DYNAMIC_IMPORTS === 'true',
  STRICT_TYPES: process.env.NEXT_PUBLIC_STRICT_TYPES === 'true',
  MV3_OPTIMIZATIONS: process.env.NEXT_PUBLIC_MV3_OPT === 'true',
};
```

## Testing Plan

### Automated Tests

```bash
# Run after each change
npm run typecheck
npm run lint
npm run test
npm run build
```

### Manual Testing

1. Test all major user flows
2. Verify lazy loading works correctly
3. Check extension functionality
4. Test on different devices/browsers
5. Validate performance improvements

## Documentation Updates

### Files to Update

- [ ] README.md - New build process
- [ ] CONTRIBUTING.md - TypeScript guidelines
- [ ] extension/readme.md - MV3 changes
- [ ] API documentation - New type definitions

## Next Steps After Phase 1

Upon successful completion of Phase 1:

1. Document lessons learned
2. Update metrics in progress.md
3. Prepare for Phase 2 implementation
4. Schedule review meeting
5. Plan Phase 2 kickoff
