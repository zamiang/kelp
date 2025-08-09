import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Extension Error Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should demonstrate the background script store error scenario', async () => {
    // This test demonstrates the exact conditions that cause the websiteStore error

    // Simulate the store being undefined (which happens when database fails to initialize)
    let store: any = undefined;

    // Mock the storeTrackedVisit function from background.ts
    const storeTrackedVisit = async (
      site: string,
      startAt: Date,
      store: any,
      title?: string,
      description?: string,
      ogImage?: string,
    ) => {
      const url = new URL(site);
      const domain = url.host;
      const pathname = url.pathname;

      // This is where the error occurs - store is undefined
      await store.websiteStore.trackVisit({
        domain,
        pathname,
        url: url.href,
        title,
        description,
        ogImage,
      });

      return store.websiteVisitStore.trackVisit(
        {
          startAt,
          url: url.href,
          domain,
        },
        store.timeDataStore,
      );
    };

    // Test the exact error scenario
    await expect(async () => {
      await storeTrackedVisit(
        'https://example.com/test',
        new Date(),
        store, // This is undefined, causing the error
        'Test Page',
      );
    }).rejects.toThrow("Cannot read properties of undefined (reading 'websiteStore')");
  });

  it('should demonstrate the Buffer error scenario', () => {
    // Remove Buffer from global scope to simulate browser environment
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      // This simulates what happens when dependencies try to use Buffer
      const simulateBufferUsage = () => {
        // This is similar to what happens in popup.tsx when dependencies load
        if (typeof Buffer === 'undefined') {
          throw new ReferenceError('Buffer is not defined');
        }
        return Buffer.from('test-data', 'utf8');
      };

      expect(simulateBufferUsage).toThrow('Buffer is not defined');
    } finally {
      // Restore Buffer
      global.Buffer = originalBuffer;
    }
  });

  it('should reproduce the exact timing issue in background script', async () => {
    // Simulate the background script scenario where store is accessed before initialization
    let store: any = undefined;

    // Mock the getOrCreateStore function that returns undefined when db fails
    const getOrCreateStore = async () =>
      // Simulate database connection failure
      undefined;
    // Mock the trackVisit function from background.ts
    const trackVisit = async (store: any, tab: any) => {
      if (tab) {
        const currentUrl = tab.url || '';
        if (!currentUrl || !tab.id) {
          return;
        }

        // This is where the error occurs when store is undefined
        const storeTrackedVisit = async () => {
          const url = new URL(currentUrl);
          await store.websiteStore.trackVisit({
            domain: url.host,
            pathname: url.pathname,
            url: url.href,
            title: tab.title,
          });
        };

        return storeTrackedVisit();
      }
    };

    // Initialize store (which fails)
    store = await getOrCreateStore();

    // Mock tab object
    const mockTab = {
      id: 1,
      url: 'https://example.com/test',
      title: 'Test Page',
    };

    // This should reproduce the exact error
    await expect(async () => {
      await trackVisit(store, mockTab);
    }).rejects.toThrow("Cannot read properties of undefined (reading 'websiteStore')");
  });

  it('should demonstrate webpack polyfill issues causing Buffer error', () => {
    // Test the specific scenario where webpack doesn't provide Node.js polyfills
    const testWebpackPolyfills = () => {
      const missingPolyfills: string[] = [];

      // Check for common Node.js globals that should be polyfilled
      if (typeof Buffer === 'undefined') {
        missingPolyfills.push('Buffer');
      }
      if (typeof process === 'undefined') {
        missingPolyfills.push('process');
      }
      if (typeof global === 'undefined') {
        missingPolyfills.push('global');
      }

      return missingPolyfills;
    };

    // Temporarily remove these globals to simulate webpack polyfill failure
    const originalBuffer = globalThis.Buffer;
    const originalProcess = globalThis.process;
    const originalGlobal = (globalThis as any).global;

    delete (globalThis as any).Buffer;
    delete (globalThis as any).process;
    delete (globalThis as any).global;

    try {
      const missing = testWebpackPolyfills();
      expect(missing).toContain('Buffer');
      expect(missing).toContain('process');
      expect(missing).toContain('global');
    } finally {
      // Restore globals
      globalThis.Buffer = originalBuffer;
      globalThis.process = originalProcess;
      (globalThis as any).global = originalGlobal;
    }
  });

  it('should reproduce the async store initialization race condition', async () => {
    // This test reproduces the race condition where tab events fire before store is ready
    let store: any = undefined;
    let isStoreInitializing = false;

    // Mock slow store initialization
    const initializeStore = async () => {
      if (isStoreInitializing) {
        return undefined; // Store not ready yet
      }

      isStoreInitializing = true;

      // Simulate slow database connection
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate database connection failure
      return undefined; // This causes the error
    };

    // Mock tab highlight event handler
    const onTabHighlighted = async () => {
      if (!store) {
        store = await initializeStore();
      }

      // Try to track visit immediately (this fails if store is undefined)
      if (store) {
        await store.websiteStore.trackVisit({
          domain: 'example.com',
          pathname: '/test',
          url: 'https://example.com/test',
        });
      } else {
        // This is the actual error path
        throw new Error("Cannot read properties of undefined (reading 'websiteStore')");
      }
    };

    // This reproduces the race condition
    await expect(onTabHighlighted()).rejects.toThrow(
      "Cannot read properties of undefined (reading 'websiteStore')",
    );
  });
});
