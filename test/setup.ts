import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
    lastError: null,
  },
  idle: {
    onStateChanged: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    onHighlighted: {
      addListener: vi.fn(),
    },
    query: vi.fn(),
    create: vi.fn(),
    captureVisibleTab: vi.fn(),
  },
  alarms: {
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    create: vi.fn(),
    clearAll: vi.fn(),
  },
  notifications: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
    getAll: vi.fn(),
    clear: vi.fn(),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn(),
  },
  identity: {
    getAuthToken: vi.fn(),
  },
} as any;

// Make chrome available globally
(global as any).chrome = mockChrome;

// Mock Buffer for browser environment
global.Buffer = Buffer;

// Mock IndexedDB
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  readyState: 'done',
};

// Mock IDB Database (available for tests that need it)
(global as any).mockIDBDatabase = {
  close: vi.fn(),
  createObjectStore: vi.fn(),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn(),
  version: 1,
  name: 'test-db',
  objectStoreNames: [],
};

global.indexedDB = {
  open: vi.fn().mockReturnValue(mockIDBRequest),
  deleteDatabase: vi.fn().mockReturnValue(mockIDBRequest),
  databases: vi.fn(),
  cmp: vi.fn(),
};

// Mock window.location for React Router
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});
