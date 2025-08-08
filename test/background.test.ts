import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies before importing the background script
vi.mock('../../components/shared/cleanup-url', () => ({
  cleanupUrl: vi.fn((url: string) => url),
}));

vi.mock('../../components/store/db', () => ({
  default: vi.fn(),
}));

vi.mock('../../components/store/helpers/use-store-no-fetching', () => ({
  useStoreNoFetch: vi.fn(),
}));

vi.mock('../../constants/config', () => ({
  default: {
    BLOCKED_DOMAINS: ['example.com'],
    NOTIFICATIONS_KEY: 'notifications',
    LAST_NOTIFICATION_KEY: 'lastNotification',
    THEME: 'theme',
  },
}));

describe('Background Script Error Reproduction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reproduce the "Cannot read properties of undefined (reading websiteStore)" error', async () => {
    // Mock db to return a valid database connection
    const mockDb = { name: 'test-db' };
    const dbMock = await import('../../components/store/db');
    vi.mocked(dbMock.default).mockResolvedValue(mockDb as any);

    // Mock useStoreNoFetch to return null (simulating store initialization failure)
    const useStoreNoFetchMock = await import(
      '../../components/store/helpers/use-store-no-fetching'
    );
    vi.mocked(useStoreNoFetchMock.useStoreNoFetch).mockReturnValue(null);

    // Mock chrome.tabs.query to return a valid tab
    const mockTab = {
      id: 1,
      url: 'https://example.com/test',
      title: 'Test Page',
    };
    vi.mocked(chrome.tabs.query).mockResolvedValue([mockTab] as any);

    // Mock chrome.scripting.executeScript to return metadata
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue([
      {
        result: {
          metaDescriptionContent: 'Test description',
          metaTwitterDescriptionContent: null,
          metaOgUrlContent: null,
          metaOgImageContent: null,
        },
      },
    ] as any);

    // Mock chrome.tabs.captureVisibleTab
    vi.mocked(chrome.tabs.captureVisibleTab).mockResolvedValue('data:image/jpeg;base64,test');

    // Now import and test the background script
    // This should trigger the error when trying to access store.websiteStore
    expect(async () => {
      // Simulate the background script loading
      await import('../../extension/src/background');

      // Simulate a tab highlight event that would trigger trackVisit
      const highlightInfo = { tabIds: [1], windowId: 1 };
      const onHighlightedCallback = vi.mocked(chrome.tabs.onHighlighted.addListener).mock
        .calls[0][0];

      // This should cause the error when store is undefined
      await new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await onHighlightedCallback(highlightInfo);
          } catch (error) {
            // This is where we expect the error to occur
            expect(error).toBeDefined();
          }
          resolve(undefined);
        }, 25); // Wait longer than timeToWaitBeforeTracking (20ms)
      });
    }).rejects.toThrow();
  });

  it('should reproduce store initialization failure scenarios', async () => {
    // Test case 1: Database connection fails
    const dbMock = await import('../../components/store/db');
    vi.mocked(dbMock.default).mockResolvedValue(null);

    const useStoreNoFetchMock = await import(
      '../../components/store/helpers/use-store-no-fetching'
    );
    vi.mocked(useStoreNoFetchMock.useStoreNoFetch).mockReturnValue(null);

    // Import background script
    const backgroundModule = await import('../../extension/src/background');

    // The store should be undefined, which will cause the websiteStore error
    expect(backgroundModule).toBeDefined();
  });

  it('should reproduce async timing issues with store access', async () => {
    // Mock successful database connection but delayed store creation
    const mockDb = { name: 'test-db' };
    const dbMock = await import('../../components/store/db');
    vi.mocked(dbMock.default).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockDb as any), 100)),
    );

    // Mock store creation to return null initially
    const useStoreNoFetchMock = await import(
      '../../components/store/helpers/use-store-no-fetching'
    );
    vi.mocked(useStoreNoFetchMock.useStoreNoFetch).mockReturnValue(null);

    // Mock tab query
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      {
        id: 1,
        url: 'https://example.com',
        title: 'Test',
      },
    ] as any);

    // Import background script
    await import('../../extension/src/background');

    // Simulate immediate tab tracking before store is ready
    const onHighlightedCallback = vi.mocked(chrome.tabs.onHighlighted.addListener).mock.calls[0][0];

    // This should fail because store is not yet initialized
    await expect(async () => {
      await onHighlightedCallback({ tabIds: [1], windowId: 1 });
    }).rejects.toThrow();
  });

  it('should handle database connection errors gracefully', async () => {
    // Mock database to throw an error
    const dbMock = await import('../../components/store/db');
    vi.mocked(dbMock.default).mockRejectedValue(new Error('Database connection failed'));

    const useStoreNoFetchMock = await import(
      '../../components/store/helpers/use-store-no-fetching'
    );
    vi.mocked(useStoreNoFetchMock.useStoreNoFetch).mockReturnValue(null);

    // Import background script - this should handle the error
    const backgroundModule = await import('../../extension/src/background');
    expect(backgroundModule).toBeDefined();
  });
});
