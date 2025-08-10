import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';

// Ensure global is available as an alias to globalThis
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Polyfill for TextEncoder/TextDecoder
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Comprehensive process polyfill for browser environment
const mockProcess = {
  env: { NODE_ENV: 'test' },
  version: 'v18.0.0',
  versions: {
    node: '18.0.0',
    v8: '10.0.0',
    uv: '1.0.0',
    zlib: '1.0.0',
    brotli: '1.0.0',
    ares: '1.0.0',
    modules: '108',
    nghttp2: '1.0.0',
    napi: '8',
    llhttp: '6.0.0',
    openssl: '3.0.0',
    cldr: '41.0',
    icu: '71.1',
    tz: '2022a',
    unicode: '14.0',
  },
  platform: 'linux',
  arch: 'x64',
  pid: 1234,
  ppid: 1233,
  title: 'vitest',
  argv: ['node', 'vitest'],
  argv0: 'node',
  execArgv: [],
  execPath: '/usr/bin/node',
  cwd: vi.fn(() => '/test'),
  chdir: vi.fn(),
  umask: vi.fn(() => 0o022),
  uptime: vi.fn(() => 100),
  hrtime: vi.fn(() => [1000, 0]),
  memoryUsage: vi.fn(() => ({
    rss: 1000000,
    heapTotal: 1000000,
    heapUsed: 500000,
    external: 100000,
    arrayBuffers: 50000,
  })),
  cpuUsage: vi.fn(() => ({ user: 1000, system: 500 })),
  nextTick: vi.fn((callback: Function, ...args: any[]) => {
    setImmediate(() => callback(...args));
  }),
  exit: vi.fn(),
  abort: vi.fn(),
  kill: vi.fn(),
  getuid: vi.fn(() => 1000),
  getgid: vi.fn(() => 1000),
  geteuid: vi.fn(() => 1000),
  getegid: vi.fn(() => 1000),
  getgroups: vi.fn(() => [1000]),
  setuid: vi.fn(),
  setgid: vi.fn(),
  seteuid: vi.fn(),
  setegid: vi.fn(),
  setgroups: vi.fn(),
  // Event emitter methods
  listeners: vi.fn(() => []),
  listenerCount: vi.fn(() => 0),
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
  emit: vi.fn(),
  addListener: vi.fn(),
  prependListener: vi.fn(),
  prependOnceListener: vi.fn(),
  eventNames: vi.fn(() => []),
  getMaxListeners: vi.fn(() => 10),
  setMaxListeners: vi.fn(),
  rawListeners: vi.fn(() => []),
  // Standard streams (mocked)
  stdin: {
    readable: true,
    writable: false,
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    read: vi.fn(),
    pipe: vi.fn(),
    unpipe: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setEncoding: vi.fn(),
    destroy: vi.fn(),
    isTTY: false,
  },
  stdout: {
    readable: false,
    writable: true,
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    destroy: vi.fn(),
    isTTY: false,
    columns: 80,
    rows: 24,
  },
  stderr: {
    readable: false,
    writable: true,
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    destroy: vi.fn(),
    isTTY: false,
    columns: 80,
    rows: 24,
  },
  // Additional properties that might be accessed
  binding: vi.fn(),
  _getActiveHandles: vi.fn(() => []),
  _getActiveRequests: vi.fn(() => []),
  _kill: vi.fn(),
  dlopen: vi.fn(),
  reallyExit: vi.fn(),
  _debugProcess: vi.fn(),
  _debugEnd: vi.fn(),
  _startProfilerIdleNotifier: vi.fn(),
  _stopProfilerIdleNotifier: vi.fn(),
  moduleLoadList: [],
  report: {
    writeReport: vi.fn(),
    getReport: vi.fn(() => ({})),
  },
};

// Make process available globally
if (typeof process === 'undefined') {
  (globalThis as any).process = mockProcess;
}

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
    lastError: null,
    id: 'test-extension-id',
    getURL: vi.fn((path) => `chrome-extension://test-extension-id/${path}`),
  },
  idle: {
    onStateChanged: {
      addListener: vi.fn(),
    },
    setDetectionInterval: vi.fn(),
  },
  tabs: {
    onHighlighted: {
      addListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
    },
    query: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    captureVisibleTab: vi.fn().mockResolvedValue('data:image/png;base64,'),
    get: vi.fn().mockResolvedValue({ id: 1, url: 'https://example.com' }),
  },
  alarms: {
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    create: vi.fn(),
    clear: vi.fn(),
    clearAll: vi.fn(),
    get: vi.fn().mockResolvedValue(null),
    getAll: vi.fn().mockResolvedValue([]),
  },
  notifications: {
    create: vi.fn().mockImplementation((id, options, callback) => {
      if (callback) callback(id || 'notification-id');
      return Promise.resolve(id || 'notification-id');
    }),
    onClicked: {
      addListener: vi.fn(),
    },
    onClosed: {
      addListener: vi.fn(),
    },
    getAll: vi.fn().mockResolvedValue({}),
    clear: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(true),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    setIcon: vi.fn(),
    setTitle: vi.fn(),
  },
  storage: {
    sync: {
      get: vi.fn().mockImplementation((keys, callback) => {
        const result = {};
        if (callback) callback(result);
        return Promise.resolve(result);
      }),
      set: vi.fn().mockImplementation((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: vi.fn().mockImplementation((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      clear: vi.fn().mockImplementation((callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    local: {
      get: vi.fn().mockImplementation((keys, callback) => {
        const result = {};
        if (callback) callback(result);
        return Promise.resolve(result);
      }),
      set: vi.fn().mockImplementation((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: vi.fn().mockImplementation((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      clear: vi.fn().mockImplementation((callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: true }]),
    insertCSS: vi.fn().mockImplementation((injection, callback) => {
      if (typeof callback === 'function') callback();
      return Promise.resolve();
    }),
    removeCSS: vi.fn().mockImplementation((injection, callback) => {
      if (typeof callback === 'function') callback();
      return Promise.resolve();
    }),
  },
  identity: {
    getAuthToken: vi.fn().mockImplementation((options, callback) => {
      const token = 'mock-auth-token';
      if (typeof callback === 'function') callback(token);
      return Promise.resolve(token);
    }),
    removeCachedAuthToken: vi.fn().mockImplementation((details, callback) => {
      if (typeof callback === 'function') callback(undefined);
      return Promise.resolve();
    }),
    launchWebAuthFlow: vi.fn().mockImplementation((details, callback) => {
      const url = 'https://test-extension-id.chromiumapp.org/auth?token=mock-token';
      if (typeof callback === 'function') callback(url);
      return Promise.resolve(url);
    }),
    getRedirectURL: vi.fn(
      (path?: string) => `https://test-extension-id.chromiumapp.org/${path || ''}`,
    ),
  },
  windows: {
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
    getAll: vi.fn().mockResolvedValue([]),
  },
  contextMenus: {
    create: vi.fn().mockImplementation((createProperties, callback) => {
      if (typeof callback === 'function') callback(undefined);
    }),
    update: vi.fn().mockImplementation((id, updateProperties, callback) => {
      if (typeof callback === 'function') callback(undefined);
    }),
    remove: vi.fn().mockImplementation((menuItemId, callback) => {
      if (typeof callback === 'function') callback(undefined);
    }),
    removeAll: vi.fn().mockImplementation((callback) => {
      if (typeof callback === 'function') callback(undefined);
    }),
    onClicked: {
      addListener: vi.fn(),
    },
  },
} as any;

// Make chrome available globally
(globalThis as any).chrome = mockChrome;

// Mock Buffer for browser environment
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

// Mock IndexedDB with more complete implementation
class MockIDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  readyState: string = 'done';
  source: any = null;
  transaction: any = null;

  constructor(result?: any) {
    this.result = result;
  }

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

class MockIDBObjectStore {
  name: string;
  keyPath: string | string[] | null;
  indexNames: string[] = [];
  transaction: any;
  autoIncrement: boolean = false;

  constructor(name: string) {
    this.name = name;
    this.keyPath = 'id';
  }

  add = vi.fn().mockReturnValue(new MockIDBRequest());
  clear = vi.fn().mockReturnValue(new MockIDBRequest());
  count = vi.fn().mockReturnValue(new MockIDBRequest(0));
  createIndex = vi.fn();
  delete = vi.fn().mockReturnValue(new MockIDBRequest());
  deleteIndex = vi.fn();
  get = vi.fn().mockReturnValue(new MockIDBRequest());
  getAll = vi.fn().mockReturnValue(new MockIDBRequest([]));
  getAllKeys = vi.fn().mockReturnValue(new MockIDBRequest([]));
  getKey = vi.fn().mockReturnValue(new MockIDBRequest());
  index = vi.fn();
  openCursor = vi.fn().mockReturnValue(new MockIDBRequest());
  openKeyCursor = vi.fn().mockReturnValue(new MockIDBRequest());
  put = vi.fn().mockReturnValue(new MockIDBRequest());
}

class MockIDBTransaction {
  db: any;
  error: any = null;
  mode: string;
  objectStoreNames: string[] = [];
  onabort: ((event: any) => void) | null = null;
  oncomplete: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(db: any, storeNames: string[], mode: string) {
    this.db = db;
    this.objectStoreNames = storeNames;
    this.mode = mode;
  }

  abort = vi.fn();
  objectStore = vi.fn((name: string) => new MockIDBObjectStore(name));
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
  commit = vi.fn();
}

class MockIDBDatabase {
  name: string;
  version: number;
  objectStoreNames: string[] = [];
  onabort: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onversionchange: ((event: any) => void) | null = null;

  constructor(name: string, version: number = 1) {
    this.name = name;
    this.version = version;
  }

  close = vi.fn();
  createObjectStore = vi.fn((name: string) => {
    this.objectStoreNames.push(name);
    return new MockIDBObjectStore(name);
  });
  deleteObjectStore = vi.fn((name: string) => {
    this.objectStoreNames = this.objectStoreNames.filter((n) => n !== name);
  });
  transaction = vi.fn((storeNames: string | string[], mode?: string) => {
    const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
    return new MockIDBTransaction(this, stores, mode || 'readonly');
  });
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

// Mock IDB Database (available for tests that need it)
(globalThis as any).mockIDBDatabase = new MockIDBDatabase('test-db');

const mockIDBOpenRequest = new MockIDBRequest((globalThis as any).mockIDBDatabase);

globalThis.indexedDB = {
  open: vi.fn().mockReturnValue(mockIDBOpenRequest),
  deleteDatabase: vi.fn().mockReturnValue(new MockIDBRequest()),
  databases: vi.fn().mockResolvedValue([]),
  cmp: vi.fn((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
} as any;

// Mock window.location for React Router - handled by custom environment
// Object.defineProperty(window, 'location', {
//   value: {
//     href: 'http://localhost:3000',
//     origin: 'http://localhost:3000',
//     protocol: 'http:',
//     host: 'localhost:3000',
//     hostname: 'localhost',
//     port: '3000',
//     pathname: '/',
//     search: '',
//     hash: '',
//     assign: vi.fn(),
//     reload: vi.fn(),
//     replace: vi.fn(),
//   },
//   writable: true,
// });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
  root: null,
  rootMargin: '',
  thresholds: [],
})) as any;

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock fetch
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  blob: vi.fn().mockResolvedValue(new Blob()),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  headers: new Headers(),
}) as any;

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
globalThis.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Restore console for debugging when needed
(globalThis as any).restoreConsole = () => {
  globalThis.console = originalConsole;
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Handle expected unhandled rejections in tests
const originalUnhandledRejection = process.listeners('unhandledRejection');
process.removeAllListeners('unhandledRejection');
process.on('unhandledRejection', (reason, promise) => {
  // Check if this is an expected test error (StoreError with RETRY_EXHAUSTED)
  if (
    reason &&
    typeof reason === 'object' &&
    'name' in reason &&
    reason.name === 'StoreError' &&
    'code' in reason &&
    reason.code === 'RETRY_EXHAUSTED'
  ) {
    // This is an expected error from retry tests, suppress it
    return;
  }

  // For any other unhandled rejections, call the original handlers
  originalUnhandledRejection.forEach((handler) => {
    if (typeof handler === 'function') {
      handler(reason, promise);
    }
  });
});
